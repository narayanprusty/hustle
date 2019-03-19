import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

import { notify } from "react-notify-toast";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import SmartInput from "react-phone-number-input/smart-input";

import Notifications from "react-notify-toast";
import { Redirect } from "react-router-dom";
import "./ForgotPassword_client.scss";

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formSubmitError: "",
            formSubmitSuccess: false,
            userType: "Rider",
            phone: null
        };
    }

    componentDidMount = () => {
        //if user logged in redirect him/her
        const user = Meteor.userId();
        if (user) {
            location.href = "/";
        }
    };
    sendMessage = e => {
        const phoneParsed = parsePhoneNumberFromString(this.state.phone);
        Meteor.call(
            "verifyNumberAndSendMessage",
            {
                number: this.state.phone,
                country_code: phoneParsed.countryCallingCode
            },
            (err, res) => {
                if (err) {
                    console.log(err);
                    return notify.show(
                        err.reason || "Failed sending code.",
                        "error"
                    );
                }
                notify.show("Verification code sent!", "success");
                this.setState({
                    isSent: true,
                    sendable: true,
                    userId: res
                });
                setTimeout(() => this.setState({ sendable: false }), 5000);
            }
        );
    };
    resetPass = e => {
        e.preventDefault();
        this.setState(
            {
                register_formloading: true
            },
            () => {
                const phoneParsed = parsePhoneNumberFromString(
                    this.state.phone
                );
                Meteor.call(
                    "verifyCode",
                    {
                        number: this.state.phone,
                        country_code: phoneParsed.countryCallingCode,
                        verification_code: this.state.verification
                    },
                    (err, res) => {
                        if (err) {
                            console.log(err);
                            this.setState({
                                register_formloading: false
                            });
                            return notify.show(
                                err.error || "incorrect verification code!",
                                "error"
                            );
                        }

                        // register_formloading: false,
                        // formSubmitSuccess: true

                        Meteor.call(
                            "resetPass",
                            this.state.userId,
                            this.state.password,
                            error => {
                                if (error) {
                                    notify.show(
                                        error.reason || "Unknown error occured",
                                        "error"
                                    );
                                    this.setState({
                                        register_formloading: false
                                    });
                                } else {
                                    this.setState({
                                        register_formloading: false,
                                        toLogin: true
                                    });
                                    notify.show(
                                        "Password changed! please login.",
                                        "success"
                                    );
                                }
                            }
                        );
                    }
                );
            }
        );
    };

    inputHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        const {
            phone,
            first_name,
            password,
            verification,
            isSent,
            sendable
        } = this.state;
        return (
            <div
                style={{
                    backgroundSize: "contain",
                    backgroundImage: "url(" + "/images/bg.png)",
                    height: Meteor.userId() ? this.state.height : "100%",
                    backgroundPositionY: "bottom",
                    backgroundRepeat: "repeat-x",
                    backgroundRepeatX: "repeat",
                    overflow: "scroll"
                }}
            >
                <div className="padding">
                    <div className="list padding">
                        <h3 className="padding-bottom">
                            <i className="fa fa-user-plus" aria-hidden="true" />{" "}
                            Forgot Password
                        </h3>
                        <span className="item item-input item-stacked-label">
                            <span className="input-label">Phone</span>
                            <PhoneInput
                                placeholder="Enter phone number"
                                value={this.state.phone}
                                inputComponent={SmartInput}
                                onChange={phone => this.setState({ phone })}
                            />
                        </span>
                        <button
                            className="button button-block button-energized activated"
                            onClick={this.sendMessage.bind(this)}
                            disabled={
                                phone ? (isSent ? sendable : false) : true
                            }
                        >
                            {isSent ? "Resend" : "Verify"}
                        </button>
                        {isSent && (
                            <label className="item item-input item-stacked-label">
                                <span className="input-label">
                                    Verification Code
                                </span>
                                <input
                                    type="text"
                                    placeholder="####"
                                    name="verification"
                                    onChange={this.inputHandler.bind(this)}
                                />
                            </label>
                        )}
                        {isSent && (
                            <label className="item item-input item-stacked-label">
                                <span className="input-label">Password</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    onChange={this.inputHandler.bind(this)}
                                />
                            </label>
                        )}
                        {isSent && (
                            <LaddaButton
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                                loading={this.state.register_formloading}
                                onClick={this.resetPass.bind(this)}
                                disabled={
                                    phone && password && verification
                                        ? false
                                        : true
                                }
                                className="button button-block button-energized activated"
                            >
                                Reset Password
                            </LaddaButton>
                        )}
                    </div>
                    <span className="seperator padding-left padding-right padding-bottom">
                        &nbsp;&nbsp;OR&nbsp;&nbsp;
                    </span>
                    <div className="row">
                        <div className="col col-100">
                            <button
                                onClick={() => {
                                    this.setState({ toLogin: true });
                                }}
                                className="button button-block button-light activated"
                            >
                                <i
                                    className="fa fa-sign-in"
                                    aria-hidden="true"
                                />{" "}
                                Login{" "}
                            </button>
                        </div>
                    </div>
                </div>

                <Notifications />
                {this.state.toLogin && <Redirect to="/login" />}
            </div>
        );
    }
}
