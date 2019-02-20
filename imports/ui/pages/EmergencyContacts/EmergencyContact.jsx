import React, { Component, Fragment } from "react";
import config from "../../../modules/config/client";
import { Link, withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import PhoneInput from "react-phone-number-input";
import lodash from "lodash";
import SmartInput from "react-phone-number-input/smart-input";
import "react-phone-number-input/style.css";

class EmergencyContact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxNumbers: 5,
            inputs: ["input-0"]
        };
    }
    componentDidMount = () => {
        this.getNumbers();
    };
    appendInput = e => {
        var newInput = `input-${this.state.inputs.length}`;
        this.setState(prevState => ({
            inputs: prevState.inputs.concat([newInput])
        }));
    };
    getNumbers = e => {
        this.setState({
            load_existing: true
        });
        Meteor.call("getContacts", (error, allData) => {
            if (error) {
                console.log(error);
                this.setState({
                    load_existing: false
                });
                notify.show(error.reason || "Unable to get contacts", "error");
                return false;
            } else if (allData && !allData.econtacts) {
                this.setState({
                    load_existing: false,
                    maxNumbers: allData.count || 5
                });
                return notify.show("No existing contact found!", "warning");
            }
            console.log(allData);
            const numbersArr = allData.econtacts.split(",");
            let stateObj = {};
            let inputs = [];
            for (let i = 0; i < numbersArr.length; i++) {
                const key = `input-${i}`;
                stateObj[key] = numbersArr[i];
                inputs.push(key);
            }
            this.setState({
                load_existing: false,
                inputs: inputs,
                maxNumbers: allData.count || 5,
                ...stateObj
            });
        });
    };
    updateNumbers = e => {
        this.setState({ update_loader: true });
        let numberArr = [];
        for (let i of this.state.inputs) {
            if (this.state[i]) {
                numberArr.push(this.state[i]);
            }
        }
        Meteor.call("saveAndUpdate", lodash.uniq(numberArr), (error, saved) => {
            if (error) {
                console.log(error);
                this.setState({ update_loader: false });
                notify.show(error.reason || "Internal Error", "error");
                return false;
            }
            this.setState({ update_loader: false });
            return notify.show("Updated", "success");
        });
    };
    render() {
        return (
            <div style={{ height: "100%" }}>
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-phone" aria-hidden="true" />
                        &nbsp; Emergency Contacts
                    </h3>
                </div>
                {this.state.load_existing && (
                    <div className="card">
                        <div
                            className="item item-text-wrap"
                            style={{ textAlign: "center" }}
                        >
                            <div />
                            <div className="padding-top">
                                Please wait while we load your existing
                                contacts.
                            </div>
                        </div>
                    </div>
                )}
                {!this.state.load_existing &&
                    this.state.inputs.map(input => (
                        <div className="input" key={input}>
                            <PhoneInput
                                key={input}
                                name={input}
                                inputComponent={SmartInput}
                                placeholder="Enter phone number"
                                value={this.state[input]}
                                onChange={phone =>
                                    this.setState({ [input]: phone })
                                }
                            />
                            {this.state.inputs.length <
                                this.state.maxNumbers && (
                                <button
                                    className="button button-small"
                                    onClick={this.appendInput}
                                    style={{
                                        display: `${
                                            this.state.inputs[
                                                this.state.inputs.length - 1
                                            ] == input
                                                ? "block"
                                                : "none"
                                        }`
                                    }}
                                >
                                    +
                                </button>
                            )}
                        </div>
                    ))}
                {!this.state.load_existing && (
                    <LaddaButton
                        className="button button-block button-balanced activated"
                        loading={this.state.update_loader}
                        onClick={this.updateNumbers}
                        data-color="##FFFF00"
                        data-size={L}
                        data-style={SLIDE_UP}
                        data-spinner-size={30}
                        data-spinner-color="#ddd"
                        data-spinner-lines={12}
                    >
                        Update Numbers
                    </LaddaButton>
                )}
            </div>
        );
    }
}
export default withRouter(EmergencyContact);
