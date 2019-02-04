import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import localizationManager from "../../localization/index";
import { notify } from "react-notify-toast";

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        Meteor.call(
            "getLangPref",
            {
                id: Meteor.userId()
            },
            (err, result) => {
                console.log(err, result);
                if (result) localizationManager.setLanguage(result);
                this.forceUpdate();
            }
        );
        console.log(localizationManager.getLanguage());
    }

    componentDidMount() {}

    logout = () => {
        Meteor.logout((err, done) => {
            if (err) {
                notify.show(err.error, "error");
                return false;
            } else {
                notify.show(localizationManager.strings.loggingOut, "success");
                this.setState({
                    toLogin: true
                });
            }
        });
    };

    toggleLanguage = () => {
        this.setState({
            localization:
                localizationManager.getLanguage() == "en" ? "ar" : "en"
        });
        localizationManager.toggle();
        this.forceUpdate();
    };

    setDriverMode = () => {
        localStorage.setItem("driverMode", true);
    };
    setUserMode = () => {
        localStorage.removeItem("driverMode");
    };
    // if user not loggedIn dont show sideMenu
    render() {
        const driverMode = localStorage.getItem("driverMode");
        return (
            <div className="" style={{ height: "100%" }}>
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-cog" aria-hidden="true" />{" "}
                        {localizationManager.strings.Settings}
                    </h3>
                </div>
                <div className="list">
                    <a className="item item-icon-left" href="#">
                        <i className="icon ion-email" />
                        {localizationManager.strings.editEmail}
                    </a>
                    {!driverMode && (
                        <Link
                            to="/app/subscriptions"
                            className="item item-icon-left"
                        >
                            <i className="icon fa fa-diamond" />
                            {localizationManager.strings.subscriptions}
                        </Link>
                    )}
                    {!driverMode && (
                        <Link to="/app/myCards" className="item item-icon-left">
                            <i className="icon fa fa-credit-card"></i>
                            {localizationManager.strings.myCards}
                        </Link>)}
                    <a className="item item-icon-left item-icon-right" href="#">
                        <i className="icon ion-chatbubble-working" />
                        {localizationManager.strings.callSupport}
                        <i className="icon ion-ios-telephone-outline" />
                    </a>
                    <div className="item item-divider">
                        {localizationManager.strings.others}
                    </div>
                    {!driverMode && (
                        <Link
                            to="/app/driver/newreqs"
                            className="item item-icon-left"
                            onClick={this.setDriverMode}
                        >
                            <i className="icon fa fa-car" />
                            {localizationManager.strings.driverMode}
                        </Link>
                    )}
                    {driverMode && (
                        <Link
                            to="/app/home"
                            className="item item-icon-left"
                            onClick={this.setUserMode}
                        >
                            <i className="icon fa fa-user" />
                            {localizationManager.strings.userMode}
                        </Link>
                    )}

                    <Link
                        to="#"
                        className="item item-icon-left"
                        onClick={this.toggleLanguage}
                    >
                        <i className="icon fa fa-language" />
                        {localizationManager.strings.changeLanguage}{" "}
                        {localizationManager.getLanguage() == "en"
                            ? localizationManager.strings.arabic
                            : localizationManager.strings.english}
                    </Link>

                    <Link
                        to="#"
                        onClick={this.logout}
                        className="item item-icon-left"
                    >
                        <i className="icon fa fa-sign-out" />
                        {localizationManager.strings.logout}
                    </Link>
                </div>

                {this.state.toLogin && <Redirect to="/login" />}
            </div>
        );
    }
}
