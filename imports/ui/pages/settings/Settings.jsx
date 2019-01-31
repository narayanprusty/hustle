import React, { Component } from "react";
import { Meteor } from 'meteor/meteor'
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import localizationManager from '../../localization/index';
import { notify } from 'react-notify-toast';

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        console.log(localizationManager.getLanguage());
    }

    logout = () => {
        Meteor.logout((err, done) => {
            if (err) {
                notify.show(err.error, 'error');
                return false;
            } else {
                notify.show(localizationManager.strings.loggingOut, 'success');
                this.setState({
                    toLogin: true
                })
            }
        })
    }

    toggleLanguage = () => {
        localizationManager.toggle();
        this.setState({ localization: localizationManager.getLanguage() == "en" ? "ar" : "en" });
    }

    setDriverMode = () => {
        localStorage.setItem("driverMode", true);
    }
    setUserMode = () => {
        localStorage.removeItem("driverMode");
    }
    // if user not loggedIn dont show sideMenu
    render() {
        const driverMode = localStorage.getItem("driverMode");
        return (
            <div className='' style={{ height: '100%' }}>
                <div className='padding'>
                    <h3 className='padding'><i className="fa fa-cog" aria-hidden="true"></i> {localizationManager.strings.Settings}</h3>
                </div>
                <div className="list">
                    <a className="item item-icon-left" href="#">
                        <i className="icon ion-email"></i>
                        {localizationManager.strings.editEmail}
                    </a>
                    {!driverMode && (
                        <Link to="/app/subscriptions" className="item item-icon-left">
                            <i className="icon fa fa-diamond"></i>
                            {localizationManager.strings.subscriptions}
                        </Link>)}
                    <a className="item item-icon-left item-icon-right" href="#">
                        <i className="icon ion-chatbubble-working"></i>
                        {localizationManager.strings.callSupport}
                        <i className="icon ion-ios-telephone-outline"></i>
                    </a>
                    <div className="item item-divider">
                        {localizationManager.strings.others}
                    </div>
                    {!driverMode && (
                        <Link to="/app/driver/newreqs" className="item item-icon-left" onClick={this.setDriverMode}>
                            <i className="icon fa fa-car"></i>
                            {localizationManager.strings.driverMode}
                        </Link>)}
                    {driverMode && (
                        <Link to="/app/home" className="item item-icon-left" onClick={this.setUserMode}>
                            <i className="icon fa fa-user"></i>
                            {localizationManager.strings.userMode}
                        </Link>)}

                    <Link to="#" className="item item-icon-left" onClick={this.toggleLanguage}>
                        <i className="icon fa fa-language"></i>
                        {localizationManager.strings.changeLanguage} {this.state.localization == "en" ? localizationManager.strings.arabic : localizationManager.strings.english}
                    </Link>

                    <Link to="#" onClick={this.logout} className="item item-icon-left">
                        <i className="icon fa fa-sign-out"></i>
                        {localizationManager.strings.logout}
                    </Link>
                </div>

                {this.state.toLogin &&
                    <Redirect to="/login" />
                }
            </div>
        );
    }
}
