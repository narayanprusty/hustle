import React, { Component } from "react";
import { Link, withRouter, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import lodash from "lodash";
import rp from "request-promise";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";
import Rating from "react-rating";
import { Widget, addResponseMessage, addUserMessage } from "react-chat-widget";
import LaddaButton, { S, M, L, SLIDE_UP } from "react-ladda";

import config from "../../../../modules/config/client";
import localizationManager from "../../../localization";

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
                channels: [this.state.bookingId]
            });
        }
    }

    componentDidMount = () => {
        this.fetchCurrentRide();
        this.pubnub.addListener({
            message: message => {
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
                                heading: coords.heading,
                                time: Date.now()
                            },
                            channel: this.state.bookingId,
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
                        lng: coords.longitude,
                        heading: coords.heading
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
            this.handleSocket(message);
        }
    };
    handleSocket = message => {
        console.log(message);
        //on driver connect make showmMap to true

        //this.state.timeArr.indexOf(message.message.time) == "-1"
        if (
            message.userMetadata.type == "chat" &&
            this.state.bookingId == message.message.bookingId &&
            message.message.message
        ) {
            let {
                // timeArr,
                badge
            } = this.state;
            // timeArr.push(message.message.time);
            if (message.message.user == Meteor.userId()) {
                return false;
            }
            function notifyMe(message) {
                if (!("Notification" in window)) {
                    if (localizationManager.getLanguage() == "en") {
                        alert(
                            localizationManager.strings.messageFromDriver +
                                " " +
                                message
                        );
                    } else {
                        alert(
                            message +
                                " " +
                                localizationManager.strings.messageFromDriver
                        );
                    }
                } else if (Notification.permission === "granted") {
                    var notification = new Notification(
                        localizationManager.strings.messageFromDriver +
                            ": " +
                            message
                    );
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission(function(permission) {
                        if (permission === "granted") {
                            var notification = new Notification(
                                localizationManager.strings.messageFromDriver +
                                    ": " +
                                    message
                            );
                        }
                    });
                }
            }

            if (window.cordova) {
                cordova.plugins.notification.local.schedule({
                    id: 1,
                    title: localizationManager.strings.newMessage,
                    message: message.message.message,
                    at: new Date()
                });
            } else {
                notifyMe(message.message.message);
            }
            this.setState({
                // timeArr: timeArr,
                badge: badge + 1
            });
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
                        channels: [currentRide.bookingId],
                        withPresence: true
                    });

                    this.pubnub.history(
                        { channel: currentRide.bookingId },
                        (status, response) => {
                            console.log(response, "$$$$$$$$$$$$$$$$$$");
                            if (response) {
                                this.processOldChats(response);
                            }
                        }
                    );

                    return Meteor.call(
                        "riderDetails",
                        currentRide.userId.toString(),
                        (err, data) => {
                            if (err) {
                                notify.show(
                                    err.reason ||
                                        localizationManager.strings
                                            .unknownError,
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
    processOldChats = messagesHistory => {
        const user = Meteor.userId();
        const allMessageEntities = messagesHistory.messages;
        if (!allMessageEntities.length) {
            return false;
        }
        const sortedMessage = lodash.sortBy(
            allMessageEntities,
            ["timetoken"],
            ["asc"]
        );
        sortedMessage.forEach(messageEntity => {
            if (messageEntity.entry.user && messageEntity.entry.user == user) {
                addUserMessage(messageEntity.entry.message);
            } else if (messageEntity.entry.user) {
                addResponseMessage(messageEntity.entry.message);
            }
        });
    };
    navigateToRider = () => {
        this.setState({
            navigateToRider_loader: true
        });
        console.log(this.isIphone(), this.isAndroid());
        // if (this.isIphone()) {
        //     open(
        //         "maps://?ll=" +
        //             +this.state.boardingPoint.coordinates[1] +
        //             "," +
        //             this.state.boardingPoint.coordinates[0],
        //         "_system"
        //     );
        // } else
        if (this.isAndroid()) {
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
                            : localizationManager.strings.unableToStartTheRide,
                        "error"
                    );
                }
                this.setState({
                    status: "started",
                    startRide_loader: false
                });
                this.pubnub.deleteMessages(
                    {
                        channel: this.state.bookingId
                    },
                    result => {
                        console.log(result);
                    }
                );
                return true;
            }
        );
    };

    navigateToDrop = () => {
        // if (this.isIphone()) {
        //     // incase not working try making it `q` instead of ll
        //     open(
        //         "maps://?ll=" +
        //             +this.state.droppingPoint.coordinates[1] +
        //             "," +
        //             this.state.droppingPoint.coordinates[0],
        //         "_system"
        //     );
        // } else
        if (this.isAndroid()) {
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
        const p1 = {
            lat: this.state.boardingPoint.coordinates[1],
            lng: this.state.boardingPoint.coordinates[0]
        };

        Meteor.call(
            "onStopRide",
            userId,
            this.state.bookingId,
            this.state.currentPosition,
            p1,
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
                            : localizationManager.strings.unableToFinishTheRide,
                        "error"
                    );
                }
                this.setState({
                    ...response,
                    status: "finished",
                    finishRide_loader: false
                });
                notify.show(
                    localizationManager.strings.rideCompleted,
                    "success"
                );
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
                            : localizationManager.strings
                                  .unableToMarkPaymentForTheRide,
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
                notify.show(
                    localizationManager.strings.paymentMarked,
                    "success"
                );
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
                message: this.state.reviewMessage,
                rateVal: this.state.rating
            },
            (err, updated) => {
                if (err) {
                    this.setState({
                        review_loader: false
                    });
                    notify.show(
                        err.reason ||
                            localizationManager.strings.failedToUpdateReview,
                        "error"
                    );
                }
                this.setState({
                    review_loader: false,
                    sendToNewReqs: true
                });
                notify.show(
                    localizationManager.strings.reviewSubmitted,
                    "success"
                );
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
                time: timestamp,
                user: Meteor.userId()
            },
            channel: this.state.bookingId,
            sendByPost: false, // true to send via post
            storeInHistory: true, //override default storage options
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
            <div
                style={{
                    height: "100%",
                    direction: localizationManager.strings.textDirection
                }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-car" aria-hidden="true" />{" "}
                        {localizationManager.strings.ongoingBooking}
                    </h3>
                </div>
                <div className="padding-left padding-right padding-bottom">
                    {this.state.status != "finished" && (
                        <div className="list" style={{ marginBottom: "0px" }}>
                            <a className="item item-icon-left" href="#">
                                <i className="icon fa fa-user-o" />
                                {this.state.name || "-"}
                                <span className="item-note">
                                    {localizationManager.strings.name}
                                </span>
                            </a>
                            <a
                                className="item item-icon-left"
                                href={"tel:" + this.state.phone}
                            >
                                <i className="icon fa fa-phone" />
                                {this.state.phone || "-"}{" "}
                                <span className="item-note">
                                    {" "}
                                    {localizationManager.strings.phone}
                                </span>
                            </a>
                            <a className="item item-icon-left" href="#">
                                <i className="icon fa fa-clock-o" />
                                {this.state.totalDuration}
                                <span className="item-note">
                                    {localizationManager.strings.Time}
                                </span>
                            </a>

                            <a className="item item-icon-left" href="#">
                                <i className="icon fa fa-road" />
                                {this.state.totalDistance}
                                <span className="item-note">
                                    {localizationManager.strings.distance}
                                </span>
                            </a>

                            <a className="item item-icon-left" href="#">
                                <i className="icon fa fa-money" />
                                {Math.round(this.state.totalFare) +
                                    config.fareUnit}{" "}
                                <span className="item-note">
                                    {localizationManager.strings.fare}
                                </span>
                            </a>
                            <a className="item item-icon-left" href="#">
                                <i
                                    className="icon fa fa-map-marker"
                                    style={{ color: "green" }}
                                />
                                {this.state.start_address || "Unknown"}
                                <span className="item-note">
                                    {localizationManager.strings.From}
                                </span>
                            </a>
                            <a className="item item-icon-left" href="#">
                                <i
                                    className="icon fa fa-map-marker"
                                    style={{ color: "red" }}
                                />
                                {this.state.end_address || "Unknown"}
                                <span className="item-note">
                                    {localizationManager.strings.To}
                                </span>
                            </a>
                            <a className="item item-icon-left" href="#">
                                <i className="icon fa fa-shopping-cart" />

                                {this.state.paymentMethod}
                                <span className="item-note">
                                    {localizationManager.strings.paymentMethod}
                                </span>
                            </a>
                        </div>
                    )}
                    {this.state.status == "accepted" && (
                        <button
                            className="button button-block button-calm"
                            onClick={() => {
                                this.setState({ badge: 0 });
                                this.toggleChatBox();
                            }}
                        >
                            <i className="fa fa-comments" aria-hidden="true" />{" "}
                            {localizationManager.strings.chatWithRider}{" "}
                            {this.state.badge !== 0 && (
                                <span
                                    style={{
                                        padding: "6px",
                                        paddingTop: "2px",
                                        paddingBottom: "3px",
                                        backgroundColor: "red",
                                        color: "white",
                                        borderRadius: "16px"
                                    }}
                                >
                                    {this.state.badge}
                                </span>
                            )}
                        </button>
                    )}
                    {this.state.status == "accepted" && (
                        <LaddaButton
                            className="button button-block button-royal activated"
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
                            {localizationManager.strings.navigateToRider}
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
                            <i className="fa fa-car" aria-hidden="true" />{" "}
                            {localizationManager.strings.startRide}
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
                            {localizationManager.strings.navigateToDrop}
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
                            disabled={
                                !this.state.currentPosition
                            }
                        >
                            <i className="fa fa-check" aria-hidden="true" />{" "}
                            {localizationManager.strings.finishRide}
                        </LaddaButton>
                    )}
                    {this.state.status == "finished" && (
                        <div>
                            <div
                                className="card padding-bottom card"
                                style={{
                                    marginLeft: "0px",
                                    marginRight: "0px"
                                }}
                            >
                                <div className="item item-divider">
                                    {localizationManager.strings.rateRider}
                                </div>
                                <div className="item item-text-wrap">
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
                                    <div className="padding-top padding-left padding-right">
                                        <textarea
                                            style={{
                                                borderWidth: "2px",
                                                textAlign: "center",
                                                width: "100%",
                                                borderStyle: "solid",
                                                borderColor: "#e6e6e6",
                                                padding: "14px",
                                                borderRadius: "6px"
                                            }}
                                            name="reviewMessage"
                                            placeholder={
                                                localizationManager.strings
                                                    .feedbackPlaceHolder
                                            }
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                </div>
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
                                {localizationManager.strings.submitReview}
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
                                {localizationManager.strings.skip}
                            </LaddaButton>
                        </div>
                    )}
                    {this.state.status == "accepted" && (
                        <Widget
                            badge={this.state.badge}
                            handleNewUserMessage={this.handleNewUserMessage}
                            subtitle={this.state.name}
                            launcher={handleToggle =>
                                (this.toggleChatBox = handleToggle)
                            }
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
