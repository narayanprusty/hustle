import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Redirect, Link } from "react-router-dom";
import localizationManager from "../../localization/index";
import { notify } from "react-notify-toast";
import LaddaButton, { S, SLIDE_UP } from "react-ladda";
import rp from "request-promise";

import "./BecomeDriver_client.scss";

export default class BecomeDriver extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            msg: "",
            licence: "",
            contact: ""
        };
    }
    componentDidMount = () => {};
    applyForDriver = () => {};
    onChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };
    render() {
        return (
            <div>
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-car" aria-hidden="true" /> Become a
                        driver
                    </h3>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div
                        className="grey lighten-2 valign-wrapper"
                        style={{ height: "20vh" }}
                    >
                        <div id="opty_hands" className="valign">
                            <div id="left-arm">
                                <div className="left-hand">
                                    <span>...</span>
                                </div>
                                <div className="left-shake">
                                    <span>
                                        _<br />_
                                    </span>
                                </div>
                            </div>
                            <div id="right-arm">
                                <div className="right-hand">
                                    <span>...</span>
                                </div>
                                <div className="right-shake" />
                            </div>
                        </div>
                    </div>
                    Earn &amp; grow with hustle
                </div>
                <br />
                <div className="padding-left padding-right padding-bottom">
                    <div className="list">
                        <label className="item item-input item-stacked-label">
                            <span className="input-label"> Name</span>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g Saikat chakrabortty"
                                onChange={this.onChangeHandler}
                                value={this.state.name}
                            />
                        </label>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">Email</span>
                            <input
                                type="text"
                                placeholder="e.g saikat.chakrabortty@email.com"
                                name="email"
                                value={this.state.email}
                                onChange={this.onChangeHandler}
                            />
                        </label>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">Contact</span>
                            <input
                                type="text"
                                placeholder="+966-0123456789"
                                name="contact"
                                value={this.state.contact}
                                onChange={this.onChangeHandler}
                            />
                        </label>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">
                                Driving licence number
                            </span>
                            <input
                                type="text"
                                placeholder="driving lisence number"
                                name="licence"
                                value={this.state.licence}
                                onChange={this.onChangeHandler}
                            />
                        </label>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">Message</span>
                            <textarea
                                style={{
                                    borderWidth: "2px",
                                    width: "100%",
                                    borderStyle: "solid",
                                    borderColor: "#e6e6e6",
                                    padding: "14px",
                                    borderRadius: "6px"
                                }}
                                name="msg"
                                placeholder="Cover Letter"
                                value={this.state.msg}
                                onChange={this.onChangeHandler}
                            />
                        </label>
                    </div>
                    <LaddaButton
                        className="button button-block button-royal activated"
                        loading={this.state.becoming_driver}
                        onClick={this.applyForDriver}
                        data-color="##FFFF00"
                        data-size={S}
                        data-style={SLIDE_UP}
                        data-spinner-size={30}
                        data-spinner-color="#ddd"
                        data-spinner-lines={12}
                    >
                        <i
                            className="fa fa-location-arrow"
                            aria-hidden="true"
                        />{" "}
                        Apply
                    </LaddaButton>
                    Note:By applying you are accepting to the terms &amp;
                    conditions*
                </div>
            </div>
        );
    }
}
