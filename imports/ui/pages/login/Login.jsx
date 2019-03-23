import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import Notifications from "react-notify-toast";
import { Redirect } from "react-router-dom";
import { notify } from "react-notify-toast";
import PhoneInput from "react-phone-number-input";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";

import SmartInput from "react-phone-number-input/smart-input";
import "react-phone-number-input/style.css";
import "./Login_client.scss";

export default class Login extends Component {
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

    inputHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    loginHandler = e => {
        e.preventDefault();
        this.setState(
            {
                login_formloading: true
            },
            () => {
                Meteor.loginWithPassword(
                    { email: this.state.phone },
                    this.state.password,
                    error => {
                        if (error && error.reason) {
                            //Add localization support
                            notify.show(error.reason, "error");
                            this.setState({
                                login_formloading: false,
                                formSubmitError: error.reason
                            });
                        } else if (error && !error.reason) {
                            notify.show("Some Error Occured!", "error");
                            this.setState({
                                login_formloading: false,
                                formSubmitError:
                                    "An error occured.please try again."
                            });
                        } else {
                            notify.show("Login successful!", "success");
                            this.setState({
                                login_formloading: false,
                                formSubmitError: ""
                            });

                            open("/", "_self");
                        }
                    }
                );
            }
        );
    };

    render() {
        return (
            <div
                style={{
                    backgroundSize: "contain",
                    backgroundImage: "url(" + "/images/bg.png)",
                    height: "100%",
                    backgroundPositionY: "bottom",
                    backgroundRepeat: "repeat-x",
                    backgroundRepeatX: "repeat",
                    overflow: "scroll"
                }}
            >
                <Notifications />
                <div className="padding">
                    <div className="list padding">
                        <div
                            style={{
                                textAlign: "center",
                                paddingBottom: "30px"
                            }}
                            className="padding-bottom padding-top"
                        >
                            <img
                                src="/images/logo.png"
                                style={{
                                    width: "40%"
                                }}
                            />
                        </div>
                        <span className="item item-input item-stacked-label">
                            <span className="input-label">Phone</span>
                            <PhoneInput
                                inputComponent={SmartInput}
                                placeholder="Enter phone number"
                                value={this.state.phone}
                                onChange={phone => this.setState({ phone })}
                            />
                        </span>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">Password</span>
                            <input
                                type="password"
                                placeholder="password"
                                name="password"
                                onChange={this.inputHandler.bind(this)}
                            />
                        </label>
                        <div className="padding-top">
                            <LaddaButton
                                className="button button-block button-dark activated"
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                                loading={this.state.login_formloading}
                                onClick={this.loginHandler.bind(this)}
                                disabled={
                                    this.state.phone && this.state.password
                                        ? false
                                        : true
                                }
                                className="button button-block button-energized activated"
                            >
                                Login
                            </LaddaButton>
                        </div>
                    </div>
                    <span className="seperator padding-left padding-right padding-bottom">
                        &nbsp;&nbsp;OR&nbsp;&nbsp;
                    </span>
                    <div className="row">
                        <div className="col col-60">
                            <button
                                onClick={() => {
                                    this.setState({ toForgot: true });
                                }}
                                className="button button-block button-light activated"
                            >
                                <i className="fa fa-key" aria-hidden="true" />{" "}
                                Forgot Password{" "}
                            </button>
                        </div>
                        <div className="col col-40">
                            <button
                                onClick={() => {
                                    this.setState({ toRegister: true });
                                }}
                                className="button button-block button-dark activated"
                            >
                                <i
                                    className="fa fa-user-plus"
                                    aria-hidden="true"
                                />{" "}
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>

                <Notifications />
                {this.state.toRegister && <Redirect to="/signup" />}
                {this.state.toForgot && <Redirect to="/forgotPassword" />}
            </div>
        );
    }
}
