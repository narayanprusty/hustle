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
import CarLoader from "../../components/CarLoader/CarLoader";

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
    deleteInput = e => {
        const indexOfElem = this.state.inputs.indexOf(e.target.name);
        if (indexOfElem > -1) {
            const { inputs } = this.state;
            inputs.splice(indexOfElem, 1);
            this.setState(inputs);
        } else {
            return false;
        }
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
            const numbersArr = allData.econtacts;
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
            return notify.show("contacts updated", "success");
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
                {this.state.load_existing && <CarLoader />}
                {!this.state.load_existing && (
                    <div>
                        {this.state.inputs.map(input => (
                            <div
                                className="padding-left padding-right"
                                style={{
                                    marginBottom: "10px"
                                }}
                            >
                                {this.state.inputs[0] == input && (
                                    <span className="item item-input item-stacked-label">
                                        <span className="input-label">
                                            Phone Number
                                        </span>
                                        <PhoneInput
                                            key={input}
                                            name={input}
                                            inputComponent={SmartInput}
                                            placeholder="Enter phone number"
                                            value={this.state[input]}
                                            onChange={phone =>
                                                this.setState({
                                                    [input]: phone
                                                })
                                            }
                                        />
                                    </span>
                                )}

                                {this.state.inputs[0] !== input && (
                                    <div
                                        className="row"
                                        style={{
                                            padding: "0px"
                                        }}
                                    >
                                        <div
                                            className="col col-75"
                                            style={{
                                                padding: "0px"
                                            }}
                                        >
                                            <span className="item item-input item-stacked-label">
                                                <span className="input-label">
                                                    Phone Number
                                                </span>
                                                <PhoneInput
                                                    key={input}
                                                    name={input}
                                                    inputComponent={SmartInput}
                                                    placeholder="Enter phone number"
                                                    value={this.state[input]}
                                                    onChange={phone =>
                                                        this.setState({
                                                            [input]: phone
                                                        })
                                                    }
                                                />
                                            </span>
                                        </div>
                                        <div
                                            className="col"
                                            style={{
                                                padding: "0px"
                                            }}
                                        >
                                            <button
                                                name={input}
                                                className="button button-block button-assertive"
                                                onClick={this.deleteInput}
                                                style={{
                                                    height: "100%",
                                                    margin: "0",
                                                    border: "0",
                                                    borderRadius: "0"
                                                }}
                                            >
                                                {" "}
                                                <i
                                                    className="fa fa-times"
                                                    aria-hidden="true"
                                                />{" "}
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {this.state.inputs.length < this.state.maxNumbers && (
                            <div className="padding-left padding-right">
                                <button
                                    className="ladda-button button button-block button-calm activated"
                                    onClick={this.appendInput}
                                >
                                    <i
                                        className="fa fa-plus"
                                        aria-hidden="true"
                                    />{" "}
                                    Add More Numbers
                                </button>
                            </div>
                        )}
                        {!this.state.load_existing && (
                            <div className="padding-left padding-right">
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
                                    <i
                                        className="fa fa-floppy-o"
                                        aria-hidden="true"
                                    />{" "}
                                    Save Numbers
                                </LaddaButton>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
export default withRouter(EmergencyContact);
