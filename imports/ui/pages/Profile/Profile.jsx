import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import Ratings from "react-rating";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import "./Profile_client.scss";
import { Meteor } from "meteor/meteor";
class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "" };
        this.isDriver = false;
    }
    componentDidMount = () => {
        Meteor.call("riderDetails", Meteor.userId(), (err, data) => {
            if (err) {
                return notify.show("unable to get details", "error");
            }
            if (data.userType == "Driver") {
                this.isDriver = true;
                Meteor.call(
                    "driverDetails",
                    Meteor.userId(),
                    (err, driverData) => {
                        if (err) {
                            return notify.show(
                                "unable to get details",
                                "error"
                            );
                        }
                        this.setState(driverData);
                    }
                );
            } else {
                this.setState(data);
            }
        });
    };

    handleClickAction = () => {
        this.setState({ update_loader: true });
        Meteor.call(
            "changeName",
            Meteor.userId(),
            this.state.name,
            (err, data) => {
                if (err) {
                    this.setState({ update_loader: false });

                    return notify.show("unable to update", "error");
                }
                this.setState({ update_loader: false });

                return notify.show("Updated successfully", "success");
            }
        );
    };
    render() {
        return (
            <div
                className=""
                style={{
                    height: "100%"
                }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-user" aria-hidden="true" /> Profile
                    </h3>
                </div>

                <div className="padding-left padding-bottom padding-right">
                    <div className="list">
                        <div class="item item-icon-left item-button-right">
                            <i className="icon fa fa-user" aria-hidden="true" />{" "}
                            Name
                            <span className="item-note">
                                {this.state.name || "Loading..."}
                            </span>
                            <button
                                className="button button-positive"
                                onClick={() => {
                                    if (this.state.isEdit) {
                                        this.setState({ isEdit: false });
                                    } else {
                                        this.setState({
                                            isEdit: true,
                                            placeholder: "name",
                                            name_input: "name",
                                            value: this.state.name
                                        });
                                    }
                                }}
                            >
                                <i className="fa fa-edit" aria-hidden="true" />
                            </button>
                        </div>
                        <div class="item item-icon-left">
                            <i
                                className="icon fa fa-phone"
                                aria-hidden="true"
                            />{" "}
                            Phone
                            <span className="item-note">
                                {this.state.phone || "Loading..."}
                            </span>
                        </div>
                        {this.isDriver && (
                            <div class="item item-icon-left">
                                <i
                                    className="icon fa fa-user"
                                    aria-hidden="true"
                                />{" "}
                                User Type
                                <span className="item-note">Driver</span>
                            </div>
                        )}
                        {this.isDriver && (
                            <div class="item item-icon-left">
                                <i
                                    className="icon fa fa-car"
                                    aria-hidden="true"
                                />{" "}
                                Car Model
                                <span className="item-note">
                                    {this.state.carModel || "Loading..."}
                                </span>
                            </div>
                        )}
                        {this.isDriver && (
                            <div class="item item-icon-left">
                                <i
                                    className="icon fa fa-text-width"
                                    aria-hidden="true"
                                />{" "}
                                Car Number
                                <span className="item-note">
                                    {this.state.carNumber || "Loading..."}
                                </span>
                            </div>
                        )}

                        {this.isDriver && (
                            <div class="item item-icon-left">
                                <i
                                    className="icon fa fa-star"
                                    aria-hidden="true"
                                />{" "}
                                Avg Ratings as Driver
                                <span className="item-note">
                                    <Ratings
                                        start={0}
                                        stop={5}
                                        emptySymbol="fa fa-star-o fa-2x empty"
                                        fullSymbol="fa fa-star fa-2x full"
                                        initialRating={this.state.avgUserRating}
                                        readonly
                                        style={{
                                            fontSize: "10px"
                                        }}
                                    />
                                </span>
                            </div>
                        )}

                        <div class="item item-icon-left">
                            <i className="icon fa fa-star" aria-hidden="true" />{" "}
                            Avg Ratings as User
                            <span className="item-note">
                                <Ratings
                                    start={0}
                                    stop={5}
                                    emptySymbol="fa fa-star-o fa-2x empty"
                                    fullSymbol="fa fa-star fa-2x full"
                                    initialRating={this.state.avgRating}
                                    readonly
                                    style={{
                                        fontSize: "10px"
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                    {this.state.isEdit && (
                        <div className="list">
                            <labl>{this.state.placeholder}</labl>
                            <span class="item item-input">
                                <input
                                    type="text"
                                    name={this.state.name_input}
                                    placeholder={this.state.placeholder}
                                    defaultValue={this.state.value}
                                    onChange={e => {
                                        if (e.target.value.length > 0) {
                                            this.setState({
                                                [e.target.name]: e.target.value
                                            });
                                        }
                                    }}
                                />
                            </span>
                            <LaddaButton
                                className="button button-block button-balanced"
                                loading={this.state.update_loader}
                                onClick={this.handleClickAction}
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                <i className="icon fa fa-check" /> Update
                            </LaddaButton>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
export default withRouter(Profile);
