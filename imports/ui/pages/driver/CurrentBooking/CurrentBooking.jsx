import React, { Component } from "react";
import config from "../../../../modules/config/client";
import { Link, withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";

class CurrentBooking extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.pubnub = new PubNubReact({
            publishKey: config.PUBNUB.pubKey,
            subscribeKey: config.PUBNUB.subKey,
            secretKey: config.PUBNUB.secret
        });
        this.pubnub.init(this);

        this.state = {};
        this._mounted = false;
    }

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
        this.pubnub.subscribe({
            channels: [this.state.userId],
            withPresence: true
        });
        const driverDoc = {
            name: "saikat",
            phone: "+918918815688"
        };
        navigator.geolocation.watchPosition(pos => {
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

            this.pubnub
                .publish({
                    message: {
                        bookingId: this.state.bookingId,
                        driverCoords: this.state.currentPosition,
                        time: Date.now(),
                        carModel: "indica",
                        carNumber: "8978"
                    },
                    channel: this.state.userId,
                    sendByPost: false, // true to send via post
                    storeInHistory: false, //override default storage options
                    meta: {
                        type: "driverLoc"
                    }
                })
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.log(error);
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
                    this.props.history.push("/app/driver/newreqs");
                    return;
                } else {
                    this.setState(currentRide);
                    return currentRide;
                }
            }
        );
    };

    navigateToRider = () => {
        open(
            "http://maps.google.com/maps?q=loc:" +
                this.state.boardingPoint.lat +
                "," +
                this.state.boardingPoint.lng,
            "_blank"
        );
    };

    startRide = () => {
        Meteor.call(
            "onStartRide",
            this.state.bookingId,
            this.state.currentPosition,
            async (error, response) => {
                if (error) {
                    console.log(error);
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to start the ride!",
                        "error"
                    );
                }
                await this.pubnub.publish({
                    message: {
                        bookingId: this.state.bookingId,
                        rideStarted: true
                    },
                    channel: this.state.userId,
                    sendByPost: false, // true to send via post
                    storeInHistory: false, //override default storage options
                    meta: {
                        type: "status"
                    }
                });

                open = ("http://maps.google.com/maps?q=loc:" +
                    this.state.droppingPoint.lat +
                    "," +
                    this.state.droppingPoint.lng,
                "_blank");
            }
        );
    };
    finishRide = () => {
        const userId = Meteor.userId();
        Meteor.call(
            "onStopRide",
            userId,
            this.state.bookingId,
            this.state.currentPosition,
            async (error, response) => {
                if (error) {
                    console.log(error);
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to Finish the ride!",
                        "error"
                    );
                }
                await this.pubnub.publish({
                    message: {
                        bookingId: this.state.bookingId,
                        rideFinished: true
                    },
                    channel: this.state.userId,
                    sendByPost: false, // true to send via post
                    storeInHistory: false, //override default storage options
                    meta: {
                        type: "status"
                    }
                });
                notify.show("Ride completed", "success");
            }
        );
    };
    paymentReceived = () => {
        Meteor.call(
            "onConfirmPayment",
            this.state.bookingId,
            null,
            this.state.totalFare,
            async (error, response) => {
                if (error) {
                    console.log(error);
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to mark payment for the ride!",
                        "error"
                    );
                }
                await this.pubnub.publish({
                    message: {
                        bookingId: this.state.bookingId,
                        paymentReceived: true
                    },
                    channel: this.state.userId,
                    sendByPost: false, // true to send via post
                    storeInHistory: false, //override default storage options
                    meta: {
                        type: "status"
                    }
                });
                notify.show("Payment Marked", "success");
            }
        );
    };

    render() {
        return (
            <div>
                <div className="list" style={{ marginBottom: "0px" }}>
                    <a className="item item-icon-left" href="#">
                        {/* <i className="icon fa fa-clock-o" /> */}
                        Saikat Ch.
                        <span className="item-note">Name</span>
                    </a>
                    <a className="item item-icon-left" href="#">
                        {/* <i className="icon fa fa-clock-o" /> */}
                        +918918815688
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

                        {this.state.payementMethod}
                        <span className="item-note">Payment Method</span>
                    </a>
                    <button
                        className="button button-block button-energized activated"
                        onClick={this.navigateToRider}
                        disabled={
                            this.state.status == "accepted" ? false : true
                        }
                    >
                        Navigate to Rider
                    </button>
                    <button
                        className="button button-block button-energized activated"
                        onClick={this.startRide}
                        disabled={
                            this.state.status == "accepted" ? false : true
                        }
                    >
                        Start Ride
                    </button>

                    <button
                        className="button button-block button-energized activated"
                        onClick={this.finishRide}
                        disabled={this.state.status == "started" ? false : true}
                    >
                        Finish Ride
                    </button>
                    <button
                        className="button button-block button-energized activated"
                        onClick={this.paymentReceived}
                        disabled={
                            this.state.payementMetho == "cash" ? false : true
                        }
                    >
                        Payment Received
                    </button>
                </div>
            </div>
        );
    }
}

export default withRouter(CurrentBooking);
