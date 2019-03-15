import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Redirect, Link } from "react-router-dom";
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
                    error.reason ||
                        localizationManager.strings.unableToFetchUserDetails,
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
        this.props.history.push("/app/driver/newreqs");
    };
    setUserMode = () => {
        this.setState({
            driverMode: false
        });
        localStorage.removeItem("driverMode");
        this.props.history.push("/app/home");
    };
    // if user not loggedIn dont show sideMenu
    render() {
        const driverMode = localStorage.getItem("driverMode");
        return (
            <div
                className=""
                style={{
                    height: "100%",
                    direction: localizationManager.strings.textDirection
                }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-cog" aria-hidden="true" />{" "}
                        {localizationManager.strings.Settings}
                    </h3>
                </div>
                <div className="list">
                    <Link to="/app/profile" className="item item-icon-left">
                        <i className="icon fa fa-user" />
                        {localizationManager.strings.editProfile}
                    </Link>
                    {driverMode && (
                        <Link
                            to="/app/subscriptions"
                            className="item item-icon-left"
                        >
                            <i className="icon fa fa-diamond" />
                            {localizationManager.strings.subscriptions}
                        </Link>
                    )}
                    {!driverMode && (
                        <Link to="/app/wallet" className="item item-icon-left">
                            <i className="icon fa fa-money" />
                            {localizationManager.strings.wallet}
                        </Link>
                    )}
                    <Link to="/app/myCards" className="item item-icon-left">
                        <i className="icon fa fa-credit-card" />
                        {localizationManager.strings.myCards}
                    </Link>

                    <a
                        className="item item-icon-left item-icon-right"
                        href="tel:+966-54-961-1069"
                    >
                        <i className="icon ion-chatbubble-working" />
                        {localizationManager.strings.callSupport}
                        <i className="icon ion-ios-telephone-outline" />
                    </a>
                    <Link to="/app/econtacts" className="item item-icon-left">
                        <i className="icon fa fa-phone" />
                        {localizationManager.strings.emergencyContacts}
                    </Link>
                    <div className="item item-divider">
                        {localizationManager.strings.others}
                    </div>
                    {this.state.isDriver ? (
                        <li className="item item-icon-left item-toggle">
                            <i className="icon fa fa-car" />
                            <span
                                style={{
                                    color: "#000"
                                }}
                            >
                                {localizationManager.strings.driverMode}
                            </span>
                            <label className="toggle toggle-dark">
                                <input
                                    type="checkbox"
                                    checked={this.state.driverMode}
                                    onChange={e =>
                                        e.target.checked
                                            ? this.setDriverMode()
                                            : this.setUserMode()
                                    }
                                />
                                <div className="track">
                                    <div className="handle" />
                                </div>
                            </label>
                        </li>
                    ) : (
                        ""
                    )}
                    {!this.state.isDriver && (
                        <Link
                            to="/app/applyForDriver"
                            className="item item-icon-left"
                        >
                            <i className="icon fa fa-car" />
                            Become a partner
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
