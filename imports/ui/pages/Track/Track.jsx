import React, { Component, Fragment } from "react";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import { withRouter } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import queryString from "query-string";

import config from "../../../modules/config/client";
import "./Track_client.scss";
import mapStyle from "../bookings/MapStyle.json"; //https://mapstyle.withgoogle.com/ you can build yours from

const Marker = ({ metaData }) => (
    <div>
        {metaData == "current" && <span className="pulse_current" />}
        {metaData == "cartop" && (
            <div className="cartop cartop-red">
                <div className="cartop-front" />
                <div className="cartop-middle" />
                <div className="cartop-back" />
            </div>
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
        this.state = {
            bookingId: null,
            not_found: false,
            zoom: 15,
            driverLoc: false,
            location: {
                lat: 0,
                lng: 0
            }
        };
    }
    componentWillUnmount = () => {
        if (this._isMounted) {
            clearInterval(this.state.intvl);
            clearInterval(this.state.intvl1);
        }
    };
    componentDidMount = () => {
        const parsed = queryString.parse(this.props.location.search);
        if (!parsed.tid) {
            this.setState({
                not_found: true
            });
            notify.show("Invalid Tracking Id", "error");
        } else {
            this.fetchBooking(parsed.tid);
            //setinerval of getDriverLocation
            const invlT = setInterval(this.fetchDriverLoc, 3000);
            const intRecord = setInterval(this.watchRideStatus, 5000);
            this.setState({
                intvl: intRecord,
                intvl1: invlT
            });
        }
        this._isMounted = true;
    };
    fetchDriverLoc = () => {
        return Meteor.call(
            "getDriverLocation",
            this.state.driverId,
            (error, data) => {
                if (error) {
                    notify.show(
                        error.reason || "Unknown Error Occurred!",
                        "error"
                    );
                    return false;
                } else if (data) {
                    this.setState({
                        driverLoc: data
                    });
                    const { mapInstance, mapApi, driverLoc } = this.state;

                    const latlng = [
                        new mapApi.LatLng(driverLoc.lat, driverLoc.lng)
                    ];
                    let latlngbounds = new mapApi.LatLngBounds();
                    for (let i = 0; i < latlng.length; i++) {
                        latlngbounds.extend(latlng[i]);
                    }
                    mapInstance.fitBounds(latlngbounds);
                    mapInstance.setZoom(this.state.zoom);
                } else {
                    notify.show("Unable to fetch driver Location", "error");
                    return false;
                }
            }
        );
    };
    fetchBooking = bookingId => {
        return Meteor.call("getBookingFromDb", bookingId, (error, data) => {
            if (error) {
                notify.show(error.reason || "Unknown Error Occurred!", "error");
                return false;
            }
            if (Object.keys(data).length) {
                this.setState(data);
                return data.userId;
            } else {
                notify.show("Invalid Tracking Id", "error");
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

    createMapOptions = () => {
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
            fullscreenControl: true,
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

    render() {
        return (
            <div style={{ height: "100%" }}>
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-car" aria-hidden="true" />
                        &nbsp; Track Rider
                    </h3>
                </div>
                {this.state.not_found && (
                    <div className="card">No Tracking Data Found</div>
                )}
                <div className="mapView padding-left padding-right padding-bottom">
                    {this.state.bookingId && this.state.status == "started" && (
                        <GoogleMapReact
                            options={this.createMapOptions}
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
                                        this.state.driverLoc.lat
                                            ? this.state.driverLoc.lat
                                            : this.state.fields.lat
                                    }
                                    lng={
                                        this.state.driverLoc.lng
                                            ? this.state.driverLoc.lng
                                            : this.state.fields.lng
                                    }
                                    metaData="current"
                                />
                            )}
                        </GoogleMapReact>
                    )}
                </div>
                {this.state.status == "finished" && (
                    <div className="card">
                        The ride has ended, Thanks for using Hustle.
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(Track);
