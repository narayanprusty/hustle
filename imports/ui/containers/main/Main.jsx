import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Route, Link } from "react-router-dom";
import Settings from "../../pages/settings/Settings";
import Notifications from "react-notify-toast";
import Bookings from "../../pages/bookings/Bookings";
import Rides from "../../pages/Rides/Rides";
import Bookingreq from "../../pages/driver/Bookingreq/Bookingreq";
import CurrentBooking from "../../pages/driver/CurrentBooking/CurrentBooking";
import CurrentBookingRider from "../../pages/currentBookingRider/CurrentBookingRider";
import RidePayment from "../../pages/driver/RidePayment/RidePayment";
import Subscriptions from "../../pages/Subscriptions/Subscriptions";
import MyCards from "../../pages/MyCards/MyCards";
import AddCard from "../../pages/AddCard/AddCard";
import Wallet from "../../pages/Wallet/Wallet";
import pricingConfig from "../../pages/driver/pricingConfig/pricingConfig";

import { notify } from "react-notify-toast";
// import pubnub from "../../notifications/index";
import DriverRideHistory from "../../pages/DriverRideHistory/DriverRideHistory";
import EmergencyContact from "../../pages/EmergencyContacts/EmergencyContact";
import Profile from "../../pages/Profile/Profile";
import BecomeDriver from "../../pages/BecomeDriver/BecomeDriver";
import localizationManager from "../../localization";

const menuColStyles = {
    padding: "0px"
};

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openMenu: false
        };
        // this.pubnub = pubnub;

        // this.pubnub.init(this);
    }

    componentDidMount() {
        this.setState({
            height:
                document.body.scrollHeight -
                document.getElementsByClassName("footer")[0].offsetHeight +
                "px"
        });

        this._isMounted = true;

        // this.pubnub.subscribe({
        //     channel: Meteor.userId().toString(),
        //     triggerEvents: true,
        //     withPresence: true,
        //     autoload: 100,
        //     message: msg => {
        //         // console.log("got msg", msg);
        //         //Add localization support
        //         if (msg.data) notify.show(msg.data, msg.type);
        //     }
        // });
    }

    componentWillUnmount() {
        if (this._isMounted == true) {
            const userId = Meteor.userId();
            // this.pubnub.unsubscribe({
            //     channels: [userId]
            // });
            this._isMounted = false;
        }
    }

    // if user not loggedIn dont show sideMenu
    render() {
        const driverMode = localStorage.getItem("driverMode");
        return (
            <div style={{ height: "100%", position: "relative" }}>
                <Notifications />

                <div
                    className="content"
                    style={{
                        height: this.state.height,
                        backgroundSize: "contain",
                        backgroundImage: "url(" + "/images/bg.png)",
                        backgroundPositionY: "bottom",
                        backgroundRepeat: "repeat-x",
                        backgroundRepeatX: "repeat",
                        overflow: "scroll",
                        WebkitOverflowScrolling: "touch"
                    }}
                >
                    <Route path="/app/settings" component={Settings} />
                    <Route
                        path="/app/subscriptions"
                        component={Subscriptions}
                    />
                    <Route path="/app/myCards" component={MyCards} />
                    <Route path="/app/addCards" component={AddCard} />
                    <Route path="/app/home" component={Bookings} />
                    <Route path="/app/rides" component={Rides} />
                    <Route path="/app/econtacts" component={EmergencyContact} />
                    <Route path="/app/profile" component={Profile} />
                    <Route path="/app/wallet" component={Wallet} />
                    <Route
                        path="/app/applyForDriver"
                        component={BecomeDriver}
                    />
                    <Route
                        path="/app/currentBooking"
                        component={CurrentBookingRider}
                    />
                    <Route path="/app/driver/newreqs" component={Bookingreq} />
                    <Route
                        path="/app/driver/currentBooking"
                        component={CurrentBooking}
                    />
                    <Route
                        path="/app/driver/ride/payment/:id"
                        component={RidePayment}
                    />
                    <Route
                        path="/app/driver/pricingConfig"
                        component={pricingConfig}
                    />
                    <Route
                        path="/app/driver/rides"
                        component={DriverRideHistory}
                    />
                </div>

                {!driverMode && (
                    <div
                        className="tabs tabs-icon-top footer"
                        style={{
                            backgroundColor: "rgb(232, 187, 10)",
                            color: "white"
                        }}
                    >
                        <Link to="/app/home" className="tab-item">
                            <i className="icon ion-home" />
                            {localizationManager.strings.Home}
                        </Link>
                        <Link to="/app/rides" className="tab-item">
                            <i className="icon ion-navicon-round" />
                            {localizationManager.strings.Rides}
                        </Link>
                        <Link to="/app/settings" className="tab-item">
                            <i className="icon ion-gear-a" />
                            {localizationManager.strings.Settings}
                        </Link>
                    </div>
                )}
                {driverMode && (
                    <div
                        className="tabs tabs-icon-top footer"
                        style={{
                            backgroundColor: "black",
                            color: "white"
                        }}
                    >
                        <Link to="/app/driver/newreqs" className="tab-item">
                            <i className="icon ion-home" />
                            {localizationManager.strings.Home}
                        </Link>
                        <Link to="/app/driver/rides" className="tab-item">
                            <i className="icon ion-navicon-round" />
                            {localizationManager.strings.Rides}
                        </Link>
                        <Link to="/app/settings" className="tab-item">
                            <i className="icon ion-gear-a" />
                            {localizationManager.strings.Settings}
                        </Link>
                    </div>
                )}

                <Notifications />
            </div>
        );
    }
}
