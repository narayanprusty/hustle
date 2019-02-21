import React, { Component } from "react";
import config from "../../../../modules/config/client";
import { Link, withRouter, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";
import Rating from "react-rating";
import { Widget, addResponseMessage } from "react-chat-widget";
import LaddaButton, { S, M, L, SLIDE_UP } from "react-ladda";

import "react-chat-widget/lib/styles.css";

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
        this.state = {
            messageList: [],
            rating: 0,
            badge: 0,
            timeArr: []
        };

        this.pubnub.init(this);

        this._mounted = false;
    }

    isIphone = () => {
        if (typeof device !== "undefined" && device.platform == "iOS") {
            return true;
        }
        return false;
    };
    isAndroid = () => {
        if (typeof device !== "undefined" && device.platform == "Android") {
            return true;
        }
        return false;
    };
    componentWillUnmount() {
        if (this._isMounted) {
            // clearInterval(this.state.ndIntvl);
            clearInterval(this.setState.intvlc);
            this.pubnub.unsubscribe({
                channels: [this.state.userId]
            });
        }
    }

    componentDidMount = () => {
        this.fetchCurrentRide();
        this.pubnub.addListener({
            message: message => {
                console.log(">>>>>>>>>>>>>>>>", message);
                this.callInsideRender(message);
            }
        });
        // const ndIntvl = setInterval(this.callInsideRender(), 3000);
        // this.setState({ ndIntvl: ndIntvl });
        const c = setInterval(() => {
            navigator.geolocation.getCurrentPosition(pos => {
                // this.callInsideRender();
                const coords = pos.coords;
                console.log(coords);
                this.setState({
                    currentPosition: {
                        lat: coords.latitude,
                        lng: coords.longitude
                    }
                });
                if (this._isMounted) {
                    this.pubnub
                        .publish({
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
                        })
                        .then(data => {
                            console.log(data);
                        });
                }
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
            });
        }, 2000);
        this.setState({ intvlc: c });
    };

    callInsideRender = message => {
        if (this._isMounted && this.state.userId) {
            // let messages;
            // try {
            //     messages = this.pubnub.getMessage(this.state.userId);
            // } catch (err) {
            //     console.log(err);
            // }
            // if (messages && messages.length) {
            //     this.handleSocket(messages[messages.length - 1]);
            // }
            this.handleSocket(message);
        }
    };
    handleSocket = message => {
        console.log(message);
        //on driver connect make showmMap to true
        if (
            message.userMetadata.type == "chat" &&
            this.state.bookingId == message.message.bookingId &&
            message.message.message &&
            this.state.timeArr.indexOf(message.message.time) == "-1"
        ) {
            let { timeArr, badge } = this.state;
            timeArr.push(message.message.time);
            this.setState({ timeArr: timeArr, badge: badge + 1 });
            addResponseMessage(message.message.message);
        }
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
                    this._isMounted = true;
                    return false;
                } else {
                    this.setState(currentRide);
                    this.pubnub.subscribe({
                        channels: [currentRide.userId],
                        withPresence: true
                    });
                    // await this.pubnub.deleteMessages({
                    //     channel: currentRide.userId
                    // });

                    return Meteor.call(
                        "riderDetails",
                        currentRide.userId.toString(),
                        (err, data) => {
                            if (err) {
                                notify.show(
                                    err.reason || "Unknown error occurred",
                                    "error"
                                );
                                return false;
                            }
                            this.setState(data);
                            // this.callInsideRender();
                            this._isMounted = true;
                            return currentRide;
                        }
                    );
                }
            }
        );
    };

    navigateToRider = () => {
        this.setState({
            navigateToRider_loader: true
        });
        console.log(this.isIphone(), this.isAndroid());
        if (this.isIphone()) {
            open(
                "maps://?ll=" +
                    +this.state.boardingPoint.coordinates[1] +
                    "," +
                    this.state.boardingPoint.coordinates[0],
                "_system"
            );
        } else if (this.isAndroid()) {
            open(
                "geo:0,0?q=" +
                    this.state.boardingPoint.coordinates[1] +
                    "," +
                    this.state.boardingPoint.coordinates[0],
                "_system"
            );
        } else {
            open(
                "http://maps.google.com/maps?q=loc:" +
                    this.state.boardingPoint.coordinates[1] +
                    "," +
                    this.state.boardingPoint.coordinates[0],
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
                return true;
            }
        );
    };

    navigateToDrop = () => {
        if (this.isIphone()) {
            // incase not working try making it `q` instead of ll
            open(
                "maps://?ll=" +
                    +this.state.droppingPoint.coordinates[1] +
                    "," +
                    this.state.droppingPoint.coordinates[0],
                "_system"
            );
        } else if (this.isAndroid()) {
            open(
                "geo:0,0?q=" +
                    this.state.droppingPoint.coordinates[1] +
                    "," +
                    this.state.droppingPoint.coordinates[0],
                "_system"
            );
        } else {
            open(
                "http://maps.google.com/maps?q=loc:" +
                    this.state.droppingPoint.coordinates[1] +
                    "," +
                    this.state.droppingPoint.coordinates[0],
                "_blank"
            );
        }
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
                    paymentReceived: true
                });
                notify.show("Payment Marked", "success");
            }
        );
    };
    onReviewSubmit = () => {
        this.setState({
            review_loader: true
        });
        Meteor.call(
            "rateRider",
            {
                riderId: this.state.userId,
                message: "",
                rateVal: this.state.rating
            },
            (err, updated) => {
                if (err) {
                    this.setState({
                        review_loader: false
                    });
                    notify.show(
                        err.reason || "failed to update the review",
                        "error"
                    );
                }
                this.setState({
                    review_loader: false,
                    sendToNewReqs: true
                });
                notify.show("Review submitted, Thank you.", "success");
            }
        );
    };
    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };
    onRate = value => {
        this.setState({
            rating: value
        });
    };
    handleNewUserMessage = async newMessage => {
        const timestamp = Date.now();
        await this.pubnub.publish({
            message: {
                bookingId: this.state.bookingId,
                message: newMessage,
                time: timestamp
            },
            channel: this.state.userId,
            sendByPost: false, // true to send via post
            storeInHistory: false, //override default storage options
            meta: {
                type: "chat"
            }
        });
        let { timeArr } = this.state;
        timeArr.push(timestamp);
        this.setState({ timeArr, badge: 0 });
        return true;
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
                    {this.state.status != "finished" && (
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
                                <i
                                    className="icon fa fa-map-marker"
                                    style={{ color: "green" }}
                                />
                                {this.state.start_address || "Unknown"}
                                <span className="item-note">From</span>
                            </a>
                            <a className="item item-icon-left" href="#">
                                <i
                                    className="icon fa fa-map-marker"
                                    style={{ color: "red" }}
                                />
                                {this.state.end_address || "Unknown"}
                                <span className="item-note">To</span>
                            </a>
                            <a className="item item-icon-left" href="#">
                                <i className="icon fa fa-shopping-cart" />

                                {this.state.paymentMethod}
                                <span className="item-note">
                                    Payment Method
                                </span>
                            </a>
                        </div>
                    )}
                    {this.state.status == "accepted" && (
                        <LaddaButton
                            className="button button-block button-calm activated"
                            loading={this.state.navigateToRider_loader}
                            onClick={this.navigateToRider}
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
                            Navigate to Rider
                        </LaddaButton>
                    )}
                    {this.state.status == "accepted" && (
                        <LaddaButton
                            className="button button-block button-balanced activated"
                            loading={this.state.startRide_loader}
                            onClick={this.startRide}
                            data-color="##FFFF00"
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            <i className="fa fa-car" aria-hidden="true" /> Start
                            Ride
                        </LaddaButton>
                    )}
                    {this.state.status == "started" && (
                        <LaddaButton
                            className="button button-block button-calm activated"
                            // loading={this.state.startRide_loader}
                            onClick={this.navigateToDrop}
                            data-color="##FFFF00"
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            <i
                                className="fa fa-map-marker"
                                aria-hidden="true"
                            />{" "}
                            Navigate to drop
                        </LaddaButton>
                    )}
                    {this.state.status == "started" && (
                        <LaddaButton
                            className="button button-block button-balanced activated"
                            loading={this.state.finishRide_loader}
                            onClick={this.finishRide}
                            data-color="##FFFF00"
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            <i className="fa fa-check" aria-hidden="true" />{" "}
                            Finish Ride
                        </LaddaButton>
                    )}
                    {/* {this.state.paymentMethod == "cash" &&
                        this.state.status == "finished" &&
                        !this.state.paymentReceived && (
                            <LaddaButton
                                className="button button-block button-balanced activated"
                                loading={this.state.paymentReceived_loader}
                                onClick={this.paymentReceived}
                                data-color="##FFFF00"
                                data-size={S}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                <i className="fa fa-money" aria-hidden="true" />{" "}
                                Payment Received
                            </LaddaButton>
                        )} */}
                    {this.state.status == "finished" && (
                        <div>
                            <div
                                className="card padding-top padding-bottom card"
                                style={{
                                    marginLeft: "0px",
                                    marginRight: "0px"
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center"
                                    }}
                                >
                                    <Rating
                                        name="rating"
                                        {...this.props}
                                        start={0}
                                        stop={5}
                                        initialRating={this.state.rating}
                                        emptySymbol="fa fa-star-o fa-2x empty"
                                        fullSymbol="fa fa-star fa-2x full"
                                        onChange={rate => this.onRate(rate)}
                                        style={{
                                            fontSize: "200%"
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        textAlign: "center"
                                    }}
                                >
                                    Rate Rider
                                </div>
                                {/*<div className="justified">
                                        <textarea
                                            name="reviewMessage"
                                            placeholder="Put some feedback of the ride"
                                            onChange={this.handleChange}
                                        />
                                    </div>*/}
                            </div>

                            <LaddaButton
                                className="button button-block button-balanced activated"
                                loading={this.state.review_loader}
                                onClick={this.onReviewSubmit}
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                {/* <i className="fa fa-times" aria-hidden="true" />{" "} */}
                                <i
                                    className="fa fa-paper-plane"
                                    aria-hidden="true"
                                />{" "}
                                Submit Review
                            </LaddaButton>
                            <LaddaButton
                                className="button button-block button-calm activated"
                                onClick={() => {
                                    this.setState({ sendToNewReqs: true });
                                }}
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                {/* <i className="fa fa-times" aria-hidden="true" />{" "} */}
                                <i
                                    className="fa fa-arrow-right"
                                    aria-hidden="true"
                                />{" "}
                                Skip
                            </LaddaButton>
                        </div>
                    )}
                    {this.state.status == "accepted" && (
                        <Widget
                            badge={this.state.badge}
                            handleNewUserMessage={this.handleNewUserMessage}
                            subtitle={this.state.name}
                        />
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
