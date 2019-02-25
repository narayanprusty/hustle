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

    componentWillMount() {
        Meteor.call("getUserProfile", (error, user) => {
            if (error || !user) {
                notify.show(
                    error.reason || "Unable to fetch user details",
                    "warning"
                );
                return;
            }
            if (user && user.userType == "Driver") {
                this.setState({
                    isDriver: true,
                    driverMode: localStorage.getItem("driverMode")
                });
                return;
            }
        });
    }

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
        this.setState({
            driverMode: true
        });
        localStorage.setItem("driverMode", true);
        this.props.history.push('/app/driver/newreqs');
    };
    setUserMode = () => {
        this.setState({
            driverMode: false
        });
        localStorage.removeItem("driverMode");
        this.props.history.push('/app/home');
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
                            <i className="icon fa fa-credit-card" />
                            {localizationManager.strings.myCards}
                        </Link>
                    )}
                    <a className="item item-icon-left item-icon-right" href="#">
                        <i className="icon ion-chatbubble-working" />
                        {localizationManager.strings.callSupport}
                        <i className="icon ion-ios-telephone-outline" />
                    </a>
                    <Link to="/app/econtacts" className="item item-icon-left">
                        <i className="icon fa fa-phone" />
                        Emergency Contacts
                    </Link>
                    <div className="item item-divider">
                        {localizationManager.strings.others}
                    </div>
                    {this.state.isDriver ? (<li class="item item-icon-left item-toggle">
                        <i className="icon fa fa-car" />
                        {localizationManager.strings.driverMode}
                        <label class="toggle toggle-dark">
                        <input type="checkbox" checked={this.state.driverMode} onChange={(e)=> e.target.checked ? this.setDriverMode() : this.setUserMode()} />
                        <div class="track">
                            <div class="handle"></div>
                        </div>
                        </label>
                    </li>) : ""
                    }

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
