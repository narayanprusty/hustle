import React, { Component, Fragment } from "react";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import { withRouter } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import queryString from "query-string";
import PubNubReact from "pubnub-react";

import localizationManager from "../../localization";

import config from "../../../modules/config/client";
import "./Track_client.scss";
// import mapStyle from "../bookings/MapStyle.json"; //https://mapstyle.withgoogle.com/ you can build yours from
import { mapOptions } from "../../../modules/config/client/mapOptions";
const Marker = ({ metaData, deg }) => (
    <div>
        {metaData == "current" && <span className="pulse_current" />}
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

class Track extends Component {
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
            bookingId: null,
            not_found: false,
            zoom: 15,
            driverLoc: false,
            fields: {
                lat: 0,
                lng: 0
            }
        };
        this.pubnub.init(this);
    }
    componentWillUnmount = () => {
        if (this._isMounted) {
            clearInterval(this.state.intvl);
            this.pubnub.unsubscribe({
                channels: [this.state.bookingId]
            });
        }
    };
    componentDidMount = async () => {
        this.pubnub.addListener({
            message: message => {
                this.callInsideRender(message);
            }
        });
        let parsed;
        try {
            parsed = queryString.parse(this.props.location.search);
        } catch (error) {
            return notify.show(
                localizationManager.strings.noTrackingRecordFound,
                "error"
            );
        }
        if (!parsed.tid) {
            this.setState({
                not_found: true
            });

            // notify.show("Invalid Tracking Id", "error");
        } else {
            this.fetchBooking(parsed.tid);
        }
        this._isMounted = true;
    };
    callInsideRender = message => {
        if (this._isMounted && this.state.userId) {
            this.handleSocket(message);
        }
    };
    handleSocket = message => {
        console.log(message);
        if (
            message.userMetadata.type == "driverLoc" &&
            this.state.bookingId == message.message.bookingId
        ) {
            if (
                this.state.driverLoc &&
                (this.state.driverLoc.lat == message.message.driverCoords.lat &&
                    this.state.driverLoc.lng ==
                        message.message.driverCoords.lng)
            ) {
                return false;
            }
            this.setState({
                showMap: true,
                accepted: true,
                driverLoc: message.message.driverCoords,
                heading: message.message.heading
            });
            this.changeRoute();
        }
    };
    changeRoute = () => {
        const { mapInstance, mapApi, driverLoc } = this.state;

        const latlng = [new mapApi.LatLng(driverLoc.lat, driverLoc.lng)];
        let latlngbounds = new mapApi.LatLngBounds();
        for (let i = 0; i < latlng.length; i++) {
            latlngbounds.extend(latlng[i]);
        }
        mapInstance.fitBounds(latlngbounds);
        mapInstance.setZoom(this.state.zoom);
    };
    fetchDriverLoc = () => {
        return Meteor.call(
            "getDriverLocation",
            this.state.driverId,
            (error, data) => {
                if (error) {
                    notify.show(
                        error.reason ||
                            localizationManager.strings.unknownError,
                        "error"
                    );
                    return false;
                } else if (data) {
                    this.setState({
                        driverLoc: data
                    });
                    const { mapInstance, mapApi, driverLoc } = this.state;

                    const latlng = [
                        new mapApi.LatLng(driverLoc[1], driverLoc[0])
                    ];
                    let latlngbounds = new mapApi.LatLngBounds();
                    for (let i = 0; i < latlng.length; i++) {
                        latlngbounds.extend(latlng[i]);
                    }
                    mapInstance.fitBounds(latlngbounds);
                    mapInstance.setZoom(this.state.zoom);
                } else {
                    notify.show(
                        localizationManager.strings.unableToFetchDriverLocation,
                        "error"
                    );
                    return false;
                }
            }
        );
    };

    fetchBooking = async bookingId => {
        Meteor.call("getBookingFromDb", bookingId, (error, data) => {
            if (error) {
                // notify.show(error.reason || "Unknown Error Occurred!", "error");
                this.setState({ not_found: true });
                return false;
            }
            if (Object.keys(data).length) {
                this.pubnub.subscribe({
                    channels: [bookingId],
                    withPresence: true
                });
                this.setState(data);
                const intRecord = setInterval(this.watchRideStatus, 5000);
                this.setState({
                    intvl: intRecord
                });
                return data.userId;
            } else {
                this.setState({ not_found: true });
                // notify.show("Invalid Tracking Id", "error");
                return false;
            }
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
                    this.setState({
                        status: "accepted"
                    });
                } else if (
                    bookingData &&
                    bookingData.data.rideStatus == "started"
                ) {
                    this.setState({
                        status: "started"
                    });
                } else if (
                    bookingData &&
                    bookingData.data.rideStatus == "finished"
                ) {
                    clearInterval(this.state.intvl);
                    clearInterval(this.state.intvl1);
                    this.setState({
                        status: "finished"
                    });
                }
            }
        );
    };

    apiHasLoaded = (map, maps) => {
        this.setState({
            mapApiLoaded: true,
            mapInstance: map,
            mapApi: maps
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
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-car" aria-hidden="true" />
                        &nbsp; {localizationManager.strings.trackRider}
                    </h3>
                </div>
                {this.state.not_found && (
                    <div className="card">
                        <div
                            className="item item-text-wrap"
                            style={{ textAlign: "center" }}
                        >
                            <div>
                                <img
                                    src={"/images/waiting.png"}
                                    style={{ width: "40px" }}
                                />
                            </div>
                            <div className="padding-top">
                                {localizationManager.strings.noDataFound}
                            </div>
                        </div>
                    </div>
                )}
                <div className="mapView padding-left padding-right padding-bottom">
                    {this.state.bookingId && this.state.status == "started" && (
                        <GoogleMapReact
                            options={mapOptions}
                            bootstrapURLKeys={{
                                key: config.GAPIKEY,
                                libraries: ["places"]
                            }}
                            initialCenter={
                                this.state.driverLoc || this.state.location
                            }
                            center={this.state.driverLoc || this.state.location}
                            defaultZoom={15}
                            zoom={this.state.zoom}
                            layerTypes={["TrafficLayer", "TransitLayer"]}
                            heat={true}
                            gestureHandling="greedy"
                            yesIWantToUseGoogleMapApiInternals
                            onGoogleApiLoaded={({ map, maps }) =>
                                this.apiHasLoaded(map, maps)
                            }
                        >
                            {this.state.driverLoc && (
                                <Marker
                                    lat={
                                        this.state.driverLoc &&
                                        this.state.driverLoc.lat
                                            ? this.state.driverLoc.lat
                                            : this.state.fields.lat
                                    }
                                    lng={
                                        this.state.driverLoc &&
                                        this.state.driverLoc.lng
                                            ? this.state.driverLoc.lng
                                            : this.state.fields.lng
                                    }
                                    metaData="cartop"
                                    deg={this.state.driverLoc.heading}
                                />
                            )}
                        </GoogleMapReact>
                    )}
                </div>
                {this.state.status == "finished" && (
                    <div className="card">
                        {localizationManager.strings.thankYouRideEnded}
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(Track);
