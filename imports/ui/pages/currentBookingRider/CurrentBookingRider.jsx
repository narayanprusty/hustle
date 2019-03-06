import React, { Component, Fragment } from "react";
import config from "../../../modules/config/client";
import { mapOptions } from "../../../modules/config/client/mapOptions";
import lodash from "lodash";
import { Link, withRouter } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import Rating from "react-rating";
import { Widget, addResponseMessage, addUserMessage } from "react-chat-widget";

import "./CurrentBooking_client.scss";
import localizationManager from "../../localization";

const Marker = ({ metaData, deg }) => (
    <div>
        {metaData == "current" && (
            <span className="pulse_current" style={{ zIndex: 2 }} />
        )}
        {metaData == "cartop" && (
            <svg
                width="100"
                height="100"
                id="Capa_1"
                transform={"rotate(" + (deg ? deg : 30) + ")"}
            >
                <g xmlns="http://www.w3.org/2000/svg">
                    <path d="M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759   c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z    M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713   v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336   h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805z" />
                </g>
            </svg>
        )}
        {metaData != "current" && metaData != "cartop" && (
            <div>
                <div className={"pin bounce " + metaData} />
                <div className="pulse" />
            </div>
        )}
    </div>
);

class CurrentBookingRider extends Component {
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
            showMap: false,
            accepted: false,
            rideStarted: false,
            rideFinished: false,
            zoom: 15,
            badge: 0,
            boardingPoint: { lat: 0, lng: 0 },
            driverLoc: {
                lat: 0,
                lng: 0
            },
            timeArr: [],
            loader: false
        };
        this.pubnub.init(this);
    }
    componentWillUnmount() {
        if (this._isMounted) {
            clearInterval(this.state.intvl);
            clearInterval(this.state.intvlc);
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
        this._isMounted = true;
        const c = setInterval(() => {
            navigator.geolocation.getCurrentPosition(pos => {
                const coords = pos.coords;
                // this.callInsideRender();
                this.setState({
                    currentPosition: {
                        lat: coords.latitude,
                        lng: coords.longitude
                    }
                });
            });
        }, 2000);
        const intRecord = setInterval(this.watchRideStatus, 5000);
        this.setState({
            intvl: intRecord,
            intvlc: c
        });
    };

    watchRideStatus = () => {
        Meteor.call(
            "getBookingById",
            this.state.bookingId,
            (error, bookingData) => {
                if (error) {
                    return false;
                }
                if (bookingData && bookingData.data.rideStatus == "accepted") {
                    this.getDriverDetails(bookingData.data.driverId);
                    this.setState({
                        showMap: true,
                        accepted: true,
                        status: "accepted"
                    });
                } else if (
                    bookingData &&
                    bookingData.data.rideStatus == "started"
                ) {
                    this.getDriverDetails(bookingData.data.driverId);

                    this.setState({
                        showTime: false,
                        showMap: true,
                        rideStarted: true,
                        status: "started"
                    });
                } else if (
                    bookingData &&
                    bookingData.data.rideStatus == "finished"
                ) {
                    clearInterval(this.state.intvl);
                    this.getDriverDetails(bookingData.data.driverId);

                    this.setState({
                        showTime: false,
                        showMap: false,
                        rideFinished: true,
                        status: "finished"
                    });
                }
            }
        );
    };

    getDriverDetails = driverId => {
        Meteor.call("driverDetails", driverId, (err, data) => {
            if (err) {
                notify.show(
                    err.reason || localizationManager.strings.someErrorOccured,
                    "error"
                );
                return;
            }
            this.setState(data);
        });
    };
    fetchCurrentRide = () => {
        return Meteor.call(
            "currentBookingRider",
            Meteor.userId(),
            (err, currentRide) => {
                if (!currentRide) {
                    this.props.history.push("/app");
                    return;
                } else {
                    this.setState(currentRide);
                    this.pubnub.subscribe({
                        channels: [currentRide.bookingId],
                        withPresence: true
                    });
                    if (currentRide.status == "accepted") {
                        this.pubnub.history(
                            { channel: currentRide.bookingId },
                            (status, response) => {
                                if (response) {
                                    this.processOldChats(response);
                                }
                            }
                        );
                    }
                    if (currentRide.status == "started") {
                        this.setState({
                            accepted: true
                        });
                    } else if (currentRide.status == "started") {
                        this.setState({
                            showMap: true,
                            rideStarted: true,
                            accepted: true
                        });
                    } else if (currentRide.status == "finished") {
                        this.setState({
                            rideFinished: true
                        });
                        // this.props.history.push("/app/home");
                    }

                    if (
                        currentRide.rideStatus != "pending" &&
                        currentRide.driverId
                    ) {
                        this.getDriverDetails(currentRide.driverId);
                    }
                    //at the begning when driver location is not there show normal route.

                    return true;
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

    apiHasLoaded = (map, maps) => {
        this.setState({
            mapApiLoaded: true,
            mapInstance: map,
            mapApi: maps
        });
        this.setState({
            currentPoint: {
                lat: this.state.boardingPoint.coordinates[1],
                lng: this.state.boardingPoint.coordinates[0]
            },
            destPoint: {
                lat: this.state.droppingPoint.coordinates[1],
                lng: this.state.droppingPoint.coordinates[0]
            }
        });
        this.changeRoute();
    };
    changeRoute = () => {
        if (this.state.poly) {
            this.state.poly.setMap(null);
        }

        let { mapInstance, mapApi, destPoint, currentPoint } = this.state;
        if (!currentPoint || !destPoint) {
            return false;
        }
        const latlng = [
            new mapApi.LatLng(currentPoint.lat, currentPoint.lng),
            new mapApi.LatLng(destPoint.lat, destPoint.lng)
        ];
        let latlngbounds = new mapApi.LatLngBounds();
        for (let i = 0; i < latlng.length; i++) {
            latlngbounds.extend(latlng[i]);
        }

        const directionsService = new mapApi.DirectionsService();
        const directionsDisplay = new mapApi.DirectionsRenderer();

        directionsService.route(
            {
                origin: currentPoint.lat + "," + currentPoint.lng,
                destination: destPoint.lat + "," + destPoint.lng,
                travelMode: "DRIVING",
                unitSystem: mapApi.UnitSystem.METRIC,
                drivingOptions: {
                    departureTime: new Date() //add drivers arriving time here
                }
            },
            (response, status) => {
                if (status === "OK") {
                    directionsDisplay.setDirections(response);
                    const routePolyline = new mapApi.Polyline({
                        path: response.routes[0].overview_path
                    });

                    routePolyline.setMap(mapInstance);
                    mapInstance.fitBounds(latlngbounds);
                    if (this.state.status == "accepted") {
                        try {
                            const time =
                                response.routes[0].legs[0].duration_in_traffic
                                    .text;
                            this.setState({
                                timeToArrive: time
                            });
                        } catch (err) {
                            console.log(err);
                        }
                        mapInstance.setZoom(this.state.zoom);
                    }
                    this.setState({
                        poly: routePolyline
                    });
                } else if (status == "ZERO_RESULTS") {
                    notify.show("Cannot find path", "error");
                } else if (status == "OVER_QUERY_LIMIT") {
                    notify.show("Internal error", "error");
                } else {
                    notify.show(
                        localizationManager.strings
                            .directionsRequestFailedDueTo +
                            " " +
                            status,
                        "error"
                    );
                }
            }
        );
    };

    handleSocket = message => {
        console.log(message);
        let changeRoute = true;
        if (
            message.userMetadata.type == "driverAccept" ||
            message.userMetadata.type == "driverLoc"
        ) {
            this.setState({
                showTime: true
            });
        }
        if (
            this.state.driverLoc &&
            (message.userMetadata.type == "driverAccept" ||
                message.userMetadata.type == "driverLoc") &&
            message.message.driverCoords &&
            (this.state.driverLoc.lat == message.message.driverCoords.lat &&
                this.state.driverLoc.lng == message.message.driverCoords.lng)
        ) {
            changeRoute = false;
        }
        //on driver connect make showmMap to true
        //            this.state.timeArr.indexOf(message.message.time) == "-1"

        if (
            message.userMetadata.type == "chat" &&
            this.state.bookingId == message.message.bookingId &&
            message.message.message
        ) {
            let {
                //  timeArr,
                badge
            } = this.state;
            // timeArr.push(message.message.time);
            if (message.message.user == Meteor.userId()) {
                return false;
            }
            function notifyMe(message) {
                if (!("Notification" in window)) {
                    alert(
                        localizationManager.strings.messageFromDriver +
                            ": " +
                            message
                    );
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
                    title: localizationManager.str.newMessage,
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
        } else if (
            message.userMetadata.type == "driverAccept" &&
            this.state.bookingId == message.message.bookingId
        ) {
            this.setState({
                showMap: true,
                accepted: true,
                driverLoc: message.message.driverCoords,
                heading: message.message.heading
            });
        }
        if (
            message.userMetadata.type == "driverLoc" &&
            this.state.bookingId == message.message.bookingId
        ) {
            this.setState({
                showMap: true,
                accepted: true,
                driverLoc: message.message.driverCoords,
                heading: message.message.heading
            });
        }

        if (
            this.state.rideStarted &&
            this.state.mapApiLoaded &&
            this.state.bookingId == message.message.bookingId &&
            changeRoute
        ) {
            this.setState({
                destPoint: {
                    lat: this.state.droppingPoint.coordinates[1],
                    lng: this.state.droppingPoint.coordinates[0]
                },
                currentPoint: message.message.driverCoords
            });
            this.changeRoute();
        } else if (
            this.state.accepted &&
            !this.state.rideStarted &&
            this.state.mapApiLoaded &&
            this.state.bookingId == message.message.bookingId &&
            changeRoute
        ) {
            this.setState({
                destPoint: {
                    lat: this.state.boardingPoint.coordinates[1],
                    lng: this.state.boardingPoint.coordinates[0]
                },
                currentPoint: message.message.driverCoords
            });
            this.changeRoute();
        }
    };

    callInsideRender = message => {
        if (this._isMounted) {
            this.handleSocket(message);
        }
    };

    onCancel = () => {
        this.setState({
            loader: true
        });
        Meteor.call(
            "onCancellation",
            this.state.bookingId,
            null,
            (err, currentRide) => {
                if (err) {
                    this.setState({
                        loader: false
                    });
                    notify.show(
                        err.reason ||
                            localizationManager.strings.unableToCancelRequest,
                        "error"
                    );
                    return;
                } else {
                    this.props.history.push("/app");
                    return;
                }
            }
        );
    };
    onReviewSubmit = () => {
        this.setState({
            loader: true
        });
        Meteor.call(
            "rateDriver",
            {
                driverId: this.state.driverId,
                message: this.state.reviewMessage,
                rateVal: this.state.rating
            },
            (err, updated) => {
                if (err) {
                    this.setState({
                        loader: false
                    });
                    notify.show(
                        err.reason ||
                            localizationManager.strings.failedToUpdateReview,
                        "error"
                    );
                }
                this.setState({
                    loader: false
                });

                notify.show(
                    localizationManager.strings.reviewSubmitted,
                    "success"
                );
                this.props.history.push("/app");
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
    copyToClipboard = str => {
        const el = document.createElement("textarea"); // Create a <textarea> element
        el.value = str; // Set its value to the string that you want copied
        el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
        el.style.position = "absolute";
        el.style.left = "-9999px"; // Move outside the screen to make it invisible
        document.body.appendChild(el); // Append the <textarea> element to the HTML document
        const selected =
            document.getSelection().rangeCount > 0 // Check if there is any content selected previously
                ? document.getSelection().getRangeAt(0) // Store selection if found
                : false; // Mark as false to know no selection existed before
        el.select(); // Select the <textarea> content
        document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
        document.body.removeChild(el); // Remove the <textarea> element
        if (selected) {
            // If a selection existed before copying
            document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
            document.getSelection().addRange(selected); // Restore the original selection
        }
    };
    shareLocation = () => {
        this.setState({ share_location: true });
        const uri = config.FRONTEND_HOST + "/track?tid=" + this.state.bookingId;
        if (navigator.share) {
            navigator
                .share({
                    title: "Live Location Hustle",
                    text: config.shareText,
                    url: uri
                })
                .then(() => this.setState({ share_location: false }))
                .catch(error => {
                    console.log("Error sharing", error);
                    this.setState({ share_location: false });
                });
        } else {
            this.copyToClipboard(uri);
            this.setState({ share_location: false });
            notify.show(localizationManager.strings.linkCopied, "success");
        }
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
    triggerSos = () => {
        this.setState({
            sos_loader: true
        });
        const messageElem = {
            username: this.state.username,
            userId: this.state.userId,
            carModel: this.state.carModel,
            carNumber: this.state.carNumber,
            currentLatlng: this.state.currentPosition,
            trackUrl:
                config.FRONTEND_HOST + "/track?tid=" + this.state.bookingId,
            bookingId: this.state.bookingId,
            driverId: this.state.driverId,
            start_address: this.state.start_address,
            end_address: this.state.end_address
        };
        Meteor.call("triggerSos", messageElem, (err, res) => {
            if (err) {
                this.setState({
                    sos_loader: false
                });
                return notify.show(
                    err.error && err.error != 500
                        ? err.error
                        : localizationManager.strings.unableToMakeRequest,
                    "error"
                );
            }
            this.setState({
                sos_loader: false
            });
            return notify.show(
                localizationManager.strings.sosSuccess,
                "success"
            );
        });
    };
    render() {
        return (
            <div
                style={{
                    height: "100%",
                    direction: localizationManager.strings.textDirection
                }}
            >
                <Fragment>
                    <div className="padding">
                        <h3 className="padding">
                            <i className="fa fa-car" aria-hidden="true" />
                            &nbsp; {localizationManager.strings.ongoingRide}
                        </h3>
                    </div>
                    {(this.state.status == "accepted" ||
                        this.state.status == "started") &&
                        this.state.bookingId && (
                            <div className="card">
                                <div
                                    className="item item-text-wrap"
                                    style={{ textAlign: "center" }}
                                >
                                    <div>
                                        <img
                                            src={"/images/riding.png"}
                                            style={{ width: "40px" }}
                                        />
                                    </div>
                                    <div className="padding-top">
                                        {this.state.rideStarted
                                            ? "You are on the ride"
                                            : localizationManager.strings
                                                  .driverAcceptedYourRideRequest}
                                        <br />
                                        {this.state.status == "accepted" &&
                                            this.state.timeToArrive &&
                                            this.state.showTime &&
                                            "Partner expected to arrive in " +
                                                this.state.timeToArrive}
                                    </div>
                                </div>
                            </div>
                        )}

                    {this.state.status == "pending" && this.state.bookingId && (
                        <div>
                            <div className="card">
                                <div
                                    className="item item-text-wrap"
                                    style={{ textAlign: "center" }}
                                >
                                    <div>
                                        <img
                                            src={"/images/pending.png"}
                                            style={{ width: "40px" }}
                                        />
                                    </div>
                                    <div className="padding-top">
                                        {
                                            localizationManager.strings
                                                .waitingForNearbyDriversToAcceptYourRideRequest
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="padding-left padding-right">
                                <LaddaButton
                                    className="button button-block button-assertive activated"
                                    loading={this.state.loader}
                                    onClick={this.onCancel}
                                    data-color="##FFFF00"
                                    data-size={L}
                                    data-style={SLIDE_UP}
                                    data-spinner-size={30}
                                    data-spinner-color="#ddd"
                                    data-spinner-lines={12}
                                >
                                    <i
                                        className="fa fa-times"
                                        aria-hidden="true"
                                    />{" "}
                                    {localizationManager.strings.cancelRequest}
                                </LaddaButton>
                            </div>
                        </div>
                    )}
                    {this.state.rideFinished && this.state.bookingId && (
                        <div
                            className="padding-left padding-right"
                            style={{ height: "55%" }}
                        >
                            <div className="card">
                                <div
                                    className="item item-text-wrap"
                                    style={{ textAlign: "center" }}
                                >
                                    <div>
                                        <img
                                            src={"/images/completed.png"}
                                            style={{ width: "40px" }}
                                        />
                                    </div>
                                    <div className="padding-top">
                                        {
                                            localizationManager.strings
                                                .rideCompleted
                                        }
                                    </div>
                                </div>
                            </div>
                            <div
                                className="list"
                                style={{ marginBottom: "0px" }}
                            >
                                <a className="item item-icon-left" href="#">
                                    <i className="icon fa fa-money" />
                                    {this.state.totalFare}
                                    <span className="item-note">
                                        {localizationManager.strings.totalFare}
                                    </span>
                                </a>
                                <a className="item item-icon-left" href="#">
                                    <i className="icon  fa fa-credit-card" />
                                    {this.state.paymentMethod || "Cash"}
                                    <span className="item-note">
                                        {
                                            localizationManager.strings
                                                .paymentMethod
                                        }
                                    </span>
                                </a>
                            </div>
                            <div
                                className="card padding-bottom card"
                                style={{
                                    marginLeft: "0px",
                                    marginRight: "0px"
                                }}
                            >
                                <div className="item item-divider">
                                    {localizationManager.strings.rateDriver}
                                </div>
                                <div
                                    className="item item-divider"
                                    style={{ textAlign: "center" }}
                                >
                                    Thank you for riding with Hustle
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
                                loading={this.state.loader}
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
                                    this.props.history.push("/app");
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
                    {this.state.accepted && !this.state.rideFinished && (
                        <div className="card">
                            <div
                                className="list"
                                style={{ marginBottom: "0px" }}
                            >
                                <a className="item item-icon-left" href="#">
                                    <i className="icon fa fa-user-o" />
                                    {this.state.name || "-"}
                                    <span className="item-note">
                                        {localizationManager.strings.name}
                                    </span>
                                </a>
                                <a className="item item-icon-left" href="#">
                                    <i className="icon fa fa-phone" />
                                    <a href={"tel:" + this.state.phone}>
                                        {" "}
                                        {this.state.phone || "-"}{" "}
                                    </a>
                                    <span className="item-note">
                                        {" "}
                                        {localizationManager.strings.phone}
                                    </span>
                                </a>
                                <a className="item item-icon-left" href="#">
                                    <i className="icon fa fa-car" />
                                    {this.state.carModel || "-"}
                                    <span className="item-note">
                                        {localizationManager.strings.carModel}
                                    </span>
                                </a>
                                <a className="item item-icon-left" href="#">
                                    <i className="icon fa fa-text-width" />
                                    {this.state.carNumber || "-"}
                                    <span className="item-note">
                                        {localizationManager.strings.carNumber}
                                    </span>
                                </a>
                                <a className="item item-icon-left" href="#">
                                    <i className="icon fa fa fa-smile-o" />
                                    <Rating
                                        name="rating"
                                        {...this.props}
                                        start={0}
                                        stop={5}
                                        readonly={true}
                                        initialRating={
                                            this.state.avgRating || 0
                                        }
                                        emptySymbol="fa fa-star-o fa-2x empty"
                                        fullSymbol="fa fa-star fa-2x full"
                                        onChange={rate => this.onRate(rate)}
                                        style={{
                                            fontSize: "10px"
                                        }}
                                    />
                                    <span className="item-note">
                                        {
                                            localizationManager.strings
                                                .driverReview
                                        }
                                    </span>
                                </a>
                            </div>
                        </div>
                    )}
                    {this.state.status == "accepted" && (
                        <div className="padding-left padding-right">
                            <button
                                className="button button-block button-calm"
                                onClick={() => {
                                    this.setState({ badge: 0 });
                                    this.toggleChatBox();

                                    Meteor.setTimeout(() => {
                                        document
                                            .getElementsByClassName(
                                                "rcw-close-button"
                                            )[0]
                                            .addEventListener(
                                                "click",
                                                e => {
                                                    window.scrollTo(0, 0);
                                                },
                                                false
                                            );
                                    }, 1000);
                                }}
                            >
                                <i
                                    className="fa fa-comments"
                                    aria-hidden="true"
                                />{" "}
                                {localizationManager.strings.chatWithDriver}{" "}
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
                        </div>
                    )}

                    {this.state.rideStarted && !this.state.rideFinished && (
                        <div className="padding-left padding-right">
                            <LaddaButton
                                className="button button-block button-dark activated"
                                loading={this.state.share_location}
                                onClick={this.shareLocation}
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                <i
                                    className="fa fa-share-alt"
                                    aria-hidden="true"
                                />{" "}
                                {localizationManager.strings.shareLiveLocation}
                            </LaddaButton>
                            <LaddaButton
                                className="button button-block button-assertive activated"
                                data-color="##FFFF00"
                                loading={this.state.sos_loader}
                                onClick={this.triggerSos}
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                <i
                                    className="fa fa-exclamation-triangle"
                                    aria-hidden="true"
                                />{" "}
                                {localizationManager.strings.sos}
                            </LaddaButton>
                        </div>
                    )}
                    <div
                        className="mapView padding-left padding-right padding-bottom"
                        style={{ height: "65%", paddingBottom: "2em" }}
                    >
                        {this._isMounted &&
                            this.state.showMap &&
                            !this.state.rideFinished && (
                                <GoogleMapReact
                                    options={mapOptions}
                                    bootstrapURLKeys={{
                                        key: config.GAPIKEY,
                                        libraries: ["places"]
                                    }}
                                    initialCenter={this.state.driverLoc}
                                    center={this.state.driverLoc}
                                    defaultZoom={15}
                                    zoom={this.state.zoom}
                                    layerTypes={[
                                        "TrafficLayer",
                                        "TransitLayer"
                                    ]}
                                    heat={true}
                                    gestureHandling="greedy"
                                    yesIWantToUseGoogleMapApiInternals
                                    onGoogleApiLoaded={({ map, maps }) =>
                                        this.apiHasLoaded(map, maps)
                                    }
                                >
                                    {this.state.currentPosition && (
                                        <Marker
                                            lat={
                                                this.state.currentPosition.lat
                                                    ? this.state.currentPosition
                                                          .lat
                                                    : this.state.currentPosition
                                                          .lat
                                            }
                                            lng={
                                                this.state.currentPosition.lng
                                                    ? this.state.currentPosition
                                                          .lng
                                                    : this.state.currentPosition
                                                          .lng
                                            }
                                            metaData="current"
                                        />
                                    )}
                                    {this.state.boardingPoint &&
                                        this.state.boardingPoint.coordinates
                                            .length && (
                                            <Marker
                                                lat={
                                                    this.state.boardingPoint
                                                        .coordinates[1]
                                                }
                                                lng={
                                                    this.state.boardingPoint
                                                        .coordinates[0]
                                                }
                                                metaData="board"
                                            />
                                        )}
                                    {this.state.droppingPoint &&
                                        this.state.droppingPoint
                                            .coordinates && (
                                            <Marker
                                                lat={
                                                    this.state.droppingPoint
                                                        .coordinates[1]
                                                }
                                                lng={
                                                    this.state.droppingPoint
                                                        .coordinates[0]
                                                }
                                                metaData="drop"
                                            />
                                        )}
                                    {this.state.driverLoc &&
                                        this.state.driverLoc.lat != 0 && (
                                            <Marker
                                                lat={
                                                    this.state.driverLoc.lat
                                                        ? this.state.driverLoc
                                                              .lat
                                                        : this.state.driverLoc
                                                              .lat
                                                }
                                                lng={
                                                    this.state.driverLoc.lng
                                                        ? this.state.driverLoc
                                                              .lng
                                                        : this.state.driverLoc
                                                              .lng
                                                }
                                                metaData="cartop"
                                                deg={
                                                    this.state.driverLoc.heading
                                                }
                                            />
                                        )}
                                </GoogleMapReact>
                            )}
                    </div>
                    {this.state.status == "accepted" && (
                        <Widget
                            badge={this.state.badge}
                            autofocus={false}
                            onClick={() => {
                                this.setState({ badge: 0 });
                            }}
                            handleNewUserMessage={this.handleNewUserMessage}
                            launcher={handleToggle =>
                                (this.toggleChatBox = handleToggle)
                            }
                            subtitle={this.state.name}
                        />
                    )}
                </Fragment>
            </div>
        );
    }
}
export default withRouter(CurrentBookingRider);
