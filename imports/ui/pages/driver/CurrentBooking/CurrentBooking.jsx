import React, { Component } from "react";
import config from "../../../../modules/config/client";
import { Link, withRouter, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";
import LaddaButton, { S, M, L, SLIDE_UP } from "react-ladda";

class CurrentBooking extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.pubnub = new PubNubReact({
            publishKey: config.PUBNUB.pubKey,
            subscribeKey: config.PUBNUB.subKey,
            secretKey: config.PUBNUB.secret,
            ssl: true
        });
        this.pubnub.init(this);

        this.state = {};
        this._mounted = false;
    }

    isIphone = () => {
        return (
            (window.cordova || window.PhoneGap || window.phonegap) &&
            /^file:\/{3}[^\/]/i.test(window.location.href) &&
            /ios|iphone|ipod|ipad|/i.test(navigator.userAgent)
        );
    };
    isAndroid = () => {
        return (
            (window.cordova || window.PhoneGap || window.phonegap) &&
            /^file:\/{3}[^\/]/i.test(window.location.href) &&
            /android|/i.test(navigator.userAgent)
        );
    };
    componentWillUnmount() {
        if (this._isMounted) {
            this.pubnub.unsubscribe({
                channels: [this.state.userId]
            });
        }
    }

    componentDidMount = async () => {
        this.fetchCurrentRide();
        this._isMounted = true;

        const driverId = Meteor.userId();
        Meteor.call("riderDetails", driverId, (err, data) => {
            if (err) {
                notify.show(err.reason || "Unknown error occurred", "error");
                return;
            }
            this.setState(data);
        });
        navigator.geolocation.watchPosition(async pos => {
            const coords = pos.coords;
            console.log(coords);
            this.setState({
                currentPosition: {
                    lat: coords.latitude,
                    lng: coords.longitude
                }
            });
            Meteor.call(
                "updateDriverLocation",
                {
                    driverId: Meteor.userId(),
                    lat: coords.latitude,
                    lng: coords.longitude
                },
                (err, done) => {
                    if (err) {
                        console.log(err);
                        //Add localization support
                        notify.show(err.reason, "error");
                    }
                }
            );

            await this.pubnub.publish({
                message: {
                    bookingId: this.state.bookingId,
                    driverCoords: this.state.currentPosition,
                    time: Date.now()
                },
                channel: this.state.userId,
                sendByPost: false, // true to send via post
                storeInHistory: false, //override default storage options
                meta: {
                    type: "driverLoc"
                }
            });
            const userId = Meteor.userId();
            Meteor.call(
                "updateDriverLocation",
                {
                    driverId: userId,
                    lat: coords.latitude,
                    lng: coords.longitude
                },
                (err, done) => {
                    if (err) {
                        console.log(err);
                        //Add localization support
                        notify.show(err.reason, "error");
                    }
                }
            );
        });
    };

    fetchCurrentRide = () => {
        return Meteor.call(
            "currentBookingDriver",
            Meteor.userId(),
            (err, currentRide) => {
                if (err) {
                    console.log(err);
                }
                if (!currentRide) {
                    // this.props.history.push("/app/driver/newreqs");
                    // return;
                    this.setState({
                        sendToNewReqs: true
                    });
                } else {
                    this.setState(currentRide);
                    return currentRide;
                }
            }
        );
    };

    navigateToRider = () => {
        this.setState({
            navigateToRider_loader: true
        });
        if (isIphone()) {
            open(
                "maps://?ll=" +
                    +this.state.boardingPoint.lat +
                    "," +
                    this.state.boardingPoint.lng +
                    "_system"
            );
        } else if (isAndroid()) {
            open(
                "geo:0,0?q=" +
                    this.state.boardingPoint.lat +
                    "," +
                    this.state.boardingPoint.lng
            );
        } else {
            open(
                "http://maps.google.com/maps?q=loc:" +
                    this.state.boardingPoint.lat +
                    "," +
                    this.state.boardingPoint.lng,
                "_blank"
            );
        }
        this.setState({
            navigateToRider_loader: false
        });
    };

    startRide = () => {
        this.setState({
            startRide_loader: true
        });
        Meteor.call(
            "onStartRide",
            this.state.bookingId,
            this.state.currentPosition,
            async (error, response) => {
                if (error) {
                    console.log(error);
                    this.setState({
                        startRide_loader: false
                    });
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to start the ride!",
                        "error"
                    );
                }
                this.setState({
                    status: "started",
                    startRide_loader: false
                });
                if (isIphone()) {
                    // incase not working try making it `q` instead of ll
                    open(
                        "maps://?ll=" +
                            +this.state.droppingPoint.lat +
                            "," +
                            this.state.droppingPoint.lng +
                            "_system"
                    );
                } else if (isAndroid()) {
                    open(
                        "geo:0,0?q=" +
                            this.state.droppingPoint.lat +
                            "," +
                            this.state.droppingPoint.lng
                    );
                } else {
                    open(
                        "http://maps.google.com/maps?q=loc:" +
                            this.state.droppingPoint.lat +
                            "," +
                            this.state.droppingPoint.lng,
                        "_blank"
                    );
                }
            }
        );
    };
    finishRide = () => {
        this.setState({
            finishRide_loader: true
        });
        const userId = Meteor.userId();
        Meteor.call(
            "onStopRide",
            userId,
            this.state.bookingId,
            this.state.currentPosition,
            async (error, response) => {
                if (error) {
                    console.log(error);
                    this.setState({
                        finishRide_loader: false
                    });
                    //Add localization support

                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to Finish the ride!",
                        "error"
                    );
                }
                this.setState({
                    status: "finished",
                    finishRide_loader: false
                });
                notify.show("Ride completed", "success");
            }
        );
    };
    paymentReceived = () => {
        this.setState({
            paymentReceived_loader: true
        });
        Meteor.call(
            "onConfirmPayment",
            this.state.bookingId,
            null,
            this.state.totalFare,
            async (error, response) => {
                if (error) {
                    console.log(error);
                    this.setState({
                        paymentReceived_loader: false
                    });
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to mark payment for the ride!",
                        "error"
                    );
                }
                this.setState({
                    paymentReceived_loader: false
                });
                // this.props.history.push("/app/driver/newreqs");
                this.setState({
                    sendToNewReqs: true
                });
                notify.show("Payment Marked", "success");
            }
        );
    };

    render() {
        return (
            <div style={{ height: "100%" }}>
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-car" aria-hidden="true" /> Ongoing
                        Booking
                    </h3>
                </div>
                <div className="padding-left padding-right padding-bottom">
                    <div className="list" style={{ marginBottom: "0px" }}>
                        <a className="item item-icon-left" href="#">
                            <i className="icon fa fa-user-o" />
                            {this.state.name || "-"}
                            <span className="item-note">Name</span>
                        </a>
                        <a className="item item-icon-left" href="#">
                            <i className="icon fa fa-phone" />
                            {this.state.phone || "-"}
                            <span className="item-note">Phone</span>
                        </a>
                        <a className="item item-icon-left" href="#">
                            <i className="icon fa fa-clock-o" />
                            {this.state.totalDuration}
                            <span className="item-note">Time</span>
                        </a>

                        <a className="item item-icon-left" href="#">
                            <i className="icon fa fa-road" />
                            {this.state.totalDistance}
                            <span className="item-note">Distance</span>
                        </a>

                        <a className="item item-icon-left" href="#">
                            <i className="icon fa fa-money" />
                            {Math.round(this.state.totalFare) +
                                config.fareUnit}{" "}
                            <span className="item-note">Fare</span>
                        </a>
                        <a className="item item-icon-left" href="#">
                            <i className="icon fa fa-shopping-cart" />

                            {this.state.paymentMethod}
                            <span className="item-note">Payment Method</span>
                        </a>
                    </div>
                    {this.state.status == "accepted" && (
                        <LaddaButton
                            className="button button-block button-energized activated"
                            loading={this.state.navigateToRider_loader}
                            onClick={this.navigateToRider}
                            data-color="##FFFF00"
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            Navigate to Rider
                        </LaddaButton>
                    )}
                    {this.state.status == "accepted" && (
                        <LaddaButton
                            className="button button-block button-energized activated"
                            loading={this.state.startRide_loader}
                            onClick={this.startRide}
                            data-color="##FFFF00"
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            Start Ride
                        </LaddaButton>
                    )}
                    {this.state.status == "started" && (
                        <LaddaButton
                            className="button button-block button-energized activated"
                            loading={this.state.finishRide_loader}
                            onClick={this.finishRide}
                            data-color="##FFFF00"
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            Finish Ride
                        </LaddaButton>
                    )}
                    {this.state.paymentMethod == "cash" &&
                        this.state.status == "finished" && (
                            <LaddaButton
                                className="button button-block button-energized activated"
                                loading={this.state.paymentReceived_loader}
                                onClick={this.paymentReceived}
                                data-color="##FFFF00"
                                data-size={S}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                Payment Received
                            </LaddaButton>
                        )}
                </div>
                {this.state.sendToNewReqs && (
                    <Redirect to="/app/driver/newreqs" />
                )}
            </div>
        );
    }
}

export default withRouter(CurrentBooking);
