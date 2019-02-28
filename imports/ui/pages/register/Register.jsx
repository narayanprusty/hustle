import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Notifications from "react-notify-toast";
import { Redirect } from "react-router-dom";

import "./Register_client.scss";
export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formSubmitError: "",
            formSubmitSuccess: false,
            userType: "Rider",
            phone: null
        };
    }

    componentDidMount() {
        //if user logged in redirect him/her
        const user = Meteor.userId();
        if (user) {
            location.href = "/";
        }
    }
    sendMessage = e => {
        const phoneParsed = parsePhoneNumberFromString(this.state.phone);
        Meteor.call(
            "verificationMessage",
            {
                number: this.state.phone,
                country_code: phoneParsed.countryCallingCode
            },
            (err, res) => {
                if (err) {
                    console.log(err);
                    return notify.show("Failed sending code.", "error");
                }
                notify.show("Verification code sent!", "success");
                this.setState({
                    isSent: true,
                    sendable: true
                });
                setTimeout(() => this.setState({ sendable: false }), 5000);
            }
        );
    };
    createAccount = e => {
        e.preventDefault();
        const phoneParsed = parsePhoneNumberFromString(this.state.phone);
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
                    return notify.show(
                        err.error || "incorrect verification code!",
                        "error"
                    );
                }

                this.setState(
                    {
                        register_formloading: true
                    },
                    () => {
                        Accounts.createUser(
                            {
                                password: this.state.password,
                                email: this.state.phone,
                                profile: {
                                    name: this.state.first_name,
                                    userType: this.state.userType,
                                    phone: this.state.phone,
                                    langPref: "ar"
                                }
                            },
                            error => {
                                if (error) {
                                    if (error.error) {
                                        this.setState({
                                            register_formloading: false,
                                            formSubmitSuccess: true
                                        });
                                        //Add localization support
                                        notify.show(
                                            error.reason ==
                                                "Email already exists."
                                                ? "Phone already exists."
                                                : error.reason,
                                            "error"
                                        );
                                    } else {
                                        this.setState({
                                            register_formloading: false,
                                            formSubmitError: error.reason,
                                            formSubmitSuccess: false
                                        });
                                    }
                                } else {
                                    notify.show(
                                        "Account created successfully!",
                                        "success"
                                    );
                                    this.setState({
                                        register_formloading: false,
                                        formSubmitError: "",
                                        formSubmitSuccess: false
                                    });
                                    location.href = "/";
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
                            Create Account
                        </h3>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">Name</span>
                            <input
                                type="text"
                                placeholder="first name"
                                name="first_name"
                                onChange={this.inputHandler.bind(this)}
                            />
                        </label>
                        <span className="item item-input item-stacked-label">
                            <span className="input-label">Phone</span>
                            <PhoneInput
                                placeholder="Enter phone number"
                                value={this.state.phone}
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
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">Password</span>
                            <input
                                type="password"
                                placeholder="Password"
                                name="password"
                                onChange={this.inputHandler.bind(this)}
                            />
                        </label>
                        <button
                            onClick={this.createAccount.bind(this)}
                            disabled={
                                phone && first_name && password && verification
                                    ? false
                                    : true
                            }
                            className="button button-block button-energized activated"
                        >
                            Register
                        </button>
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
