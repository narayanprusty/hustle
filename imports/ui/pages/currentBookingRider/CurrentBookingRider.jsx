import React, { Component, Fragment } from "react";
import config from "../../../modules/config/client";
import { Link, withRouter } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";

import mapStyle from "../bookings/MapStyle.json";
import "./CurrentBooking_client.scss";

const Marker = ({ metaData }) => (
    <div>
        {metaData == "current" && <span className="pulse_current" />}
        {metaData == "car" && (
            <div className="car car-red">
                <div className="car-front" />
                <div className="car-middle" />
                <div className="car-back" />
            </div>
        )}
        {metaData != "current" && metaData != "car" && (
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
            secretKey: config.PUBNUB.secret
        });
        this.state = {
            showMap: false,
            accepted: false,
            rideStarted: false,
            rideFinished: false,
            zoom: 18,
            boardingPoint: { lat: 0, lng: 0 },
            driverLoc: {
                lat: 0,
                lng: 0
            },
            loader: false
        };
        this.pubnub.init(this);
    }
    componentWillUnmount() {
        if (this._isMounted) {
            clearInterval();
            this.pubnub.unsubscribe({
                channels: [Meteor.userId()]
            });
        }
    }

    componentDidMount = async () => {
        clearInterval();
        this.fetchCurrentRide();
        console.log(Meteor.userId());

        this.pubnub.subscribe({
            channels: [Meteor.userId()],
            withPresence: true
        });
        await this.pubnub.deleteMessages({
            channel: Meteor.userId()
        });

        this._isMounted = true;
        const userId = Meteor.userId();
        Meteor.call("driverDetails", userId, (err, data) => {
            if (err) {
                notify.show(err.reason || "Unknown error occurred", "error");
                return;
            }
            this.setState(data);
        });
        navigator.geolocation.watchPosition(async pos => {
            const coords = pos.coords;
            this.callInsideRender();
            this.setState({
                currentPosition: {
                    lat: coords.latitude,
                    lng: coords.longitude
                }
            });
        });
        setInterval(this.watchRideStatus, 5000);
    };
    watchRideStatus = () => {
        Meteor.call(
            "getBookingById",
            this.state.bookingId,
            (error, bookingData) => {
                if (error) {
                    return false;
                }
                if (bookingData && bookingData.rideStatus == "accepted") {
                    this.setState({
                        showMap: true,
                        accepted: true
                    });
                } else if (bookingData && bookingData.rideStatus == "started") {
                    this.setState({
                        showMap: true,
                        rideStarted: true
                    });
                } else if (
                    bookingData &&
                    bookingData.rideStatus == "finished"
                ) {
                    this.setState({
                        showMap: false,
                        rideFinished: true
                    });
                }
            }
        );
    };
    fetchCurrentRide = async () => {
        return Meteor.call(
            "currentBookingRider",
            Meteor.userId(),
            (err, currentRide) => {
                if (!currentRide) {
                    this.props.history.push("/app");
                    return;
                } else {
                    if (currentRide.status == "started") {
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
                    this.setState(currentRide);
                    return currentRide;
                }
            }
        );
    };

    createMapOptions = maps => {
        return {
            keyboardShortcuts: false,
            panControl: false,
            scaleControl: false,
            clickableIcons: false,
            disableDefaultUI: false,
            gestureHandling: "greedy",
            panControl: false,
            mapTypeControl: false,
            scrollwheel: false,
            fullscreenControl: false,
            draggable: true,
            zoomControl: true,
            styles: mapStyle
        };
    };
    apiHasLoaded = (map, maps) => {
        this.setState({
            mapApiLoaded: true,
            mapInstance: map,
            mapApi: maps
        });
    };
    changeRoute = (destPoint, currentPoint) => {
        if (this.state.poly) {
            this.state.poly.setMap(null);
        }

        const { mapInstance, mapApi } = this.state;

        const latlng = [
            new mapApi.LatLng(destPoint.lat, destPoint.lng),
            new mapApi.LatLng(currentPoint.lat, currentPoint.lng)
        ];
        let latlngbounds = new mapApi.LatLngBounds();
        for (let i = 0; i < latlng.length; i++) {
            latlngbounds.extend(latlng[i]);
        }
        mapInstance.fitBounds(latlngbounds);

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
                    this.setState({
                        poly: routePolyline
                    });
                } else {
                    notify.show(
                        "Directions request failed due to " + status,
                        "error"
                    );
                }
            }
        );
    };

    handleSocket = message => {
        console.log(message);
        //on driver connect make showmMap to true
        if (
            message.userMetadata.type == "driverAccept" &&
            this.state.bookingId == message.message.bookingId
        ) {
            this.setState({
                showMap: true,
                accepted: true,
                driverLoc: message.message.driverCoords
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
                driverName: message.message.driverName,
                driverPhone: message.message.driverPhone,
                carModel: message.message.carModel,
                carNumber: message.message.carNumber
            });
        }

        if (
            this.state.rideStarted &&
            this.state.mapApiLoaded &&
            this.state.bookingId == message.message.bookingId
        ) {
            this.changeRoute(
                this.state.droppingPoint,
                message.message.driverCoords
            );
        } else if (
            this.state.accepted &&
            !this.state.rideStarted &&
            this.state.mapApiLoaded &&
            this.state.bookingId == message.message.bookingId
        ) {
            this.changeRoute(
                this.state.boardingPoint,
                message.message.driverCoords
            );
        }
    };

    callInsideRender = () => {
        if (this._isMounted) {
            const messages = this.pubnub.getMessage(Meteor.userId());
            if (messages && messages.length) {
                this.handleSocket(messages[messages.length - 1]);
            }
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
                        err.reason || "unable to cancel request",
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

    render() {
        return (
            <div style={{ height: "100%" }}>
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-car" aria-hidden="true" />
                        &nbsp; Ride Booked
                    </h3>
                </div>
                {this.state.accepted && !this.state.rideFinished && (
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
                                    : "Driver accepted your ride request"}
                            </div>
                        </div>
                    </div>
                )}
                {this.state.accepted && !this.state.rideFinished && (
                    <div className="card">
                        Driver Name: {this.state.name || "-"} <br />
                        Driver Phone:{this.state.phone || "-"} <br />
                        Car Model:{this.state.carModel || "-"} <br />
                        Car Number:{this.state.carNumber || "-"} <br />
                    </div>
                )}
                {!this.state.accepted && (
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
                                    Waiting for nearby drivers to accept your
                                    ride request
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
                                <i className="fa fa-times" aria-hidden="true" />{" "}
                                Cancel Request
                            </LaddaButton>
                        </div>
                    </div>
                )}

                <div className="mapView padding-left padding-right padding-bottom">
                    {this._isMounted &&
                        this.state.showMap &&
                        !this.state.rideFinished && (
                            <GoogleMapReact
                                options={this.createMapOptions}
                                bootstrapURLKeys={{
                                    key: config.GAPIKEY,
                                    libraries: ["places"]
                                }}
                                initialCenter={this.state.driverLoc}
                                center={this.state.driverLoc}
                                defaultZoom={18}
                                zoom={this.state.zoom}
                                layerTypes={["TrafficLayer", "TransitLayer"]}
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
                                                ? this.state.currentPosition.lat
                                                : this.state.currentPosition.lat
                                        }
                                        lng={
                                            this.state.currentPosition.lng
                                                ? this.state.currentPosition.lng
                                                : this.state.currentPosition.lng
                                        }
                                        metaData="current"
                                    />
                                )}
                                {this.state.boardingPoint && (
                                    <Marker
                                        lat={
                                            this.state.boardingPoint.lat
                                                ? this.state.boardingPoint.lat
                                                : this.state.boardingPoint.lat
                                        }
                                        lng={
                                            this.state.boardingPoint.lng
                                                ? this.state.boardingPoint.lng
                                                : this.state.boardingPoint.lng
                                        }
                                        metaData="board"
                                    />
                                )}
                                {this.state.droppingPoint && (
                                    <Marker
                                        lat={
                                            this.state.droppingPoint.lat
                                                ? this.state.droppingPoint.lat
                                                : this.state.droppingPoint.lat
                                        }
                                        lng={
                                            this.state.droppingPoint.lng
                                                ? this.state.droppingPoint.lng
                                                : this.state.droppingPoint.lng
                                        }
                                        metaData="drop"
                                    />
                                )}
                                {/* {this.state.driverLoc && (
                                    <Marker
                                        lat={
                                            this.state.driverLoc.lat
                                                ? this.state.driverLoc.lat
                                                : this.state.driverLoc.lat
                                        }
                                        lng={
                                            this.state.driverLoc.lng
                                                ? this.state.driverLoc.lng
                                                : this.state.driverLoc.lng
                                        }
                                        metaData="car"
                                    />
                                )} */}
                            </GoogleMapReact>
                        )}
                    {this.state.rideFinished && (
                        <div className="card">
                            <div
                                className="item item-text-wrap"
                                style={{ textAlign: "center" }}
                            >
                                Total Fare: {this.state.totalFare}
                                <br />
                                Payment Method:
                                {this.state.paymentMethod || "cash"}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
export default withRouter(CurrentBookingRider);
