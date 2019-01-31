import React, { Component, Fragment } from "react";
import isEmpty from "lodash.isempty";
import { Link, withRouter } from "react-router-dom";
import SearchBox from "./SearchBox";
import mapStyle from "./MapStyle"; //https://mapstyle.withgoogle.com/ you can build yours from
import config from "../../../modules/config/client/";
import GoogleMapReact from "google-map-react";
import Geocode from "react-geocode";
import { notify } from "react-notify-toast";

Geocode.setApiKey(config.GAPIKEY);

import "./Bookings_client.scss";

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
class Bookings extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
    }
    state = {
        listnToDriver: false,
        paymentMethod: "cash",
        fields: {
            location: {
                lat: 0,
                lng: 0
            }
        },
        currentLocation: {
            lat: 0,
            lng: 0
        },
        boardingPoint: {
            lat: 0,
            lng: 0
        },
        zoom: 18,
        mapApiLoaded: false,
        mapInstance: null,
        mapApi: null,
        droppingPlace: {},
        boardingPlace: {}
    };

    componentWillMount = async () => {
        await this.fetchCurrentRide();
    };

    componentDidMount = async () => {
        const { lat, lng } = await this.getcurrentLocation();
        this._isMounted = true;
        this.state = {};

        Geocode.fromLatLng(lat, lng).then(
            response => {
                this.setState(prev => ({
                    fields: {
                        ...prev.fields,
                        location: {
                            lat,
                            lng
                        }
                    },
                    currentLocation: {
                        lat,
                        lng
                    },
                    boardingPoint: {
                        lat: lat,
                        lng: lng
                    },
                    boardingPlace: response.results[0]
                }));
            },
            error => {
                this.setState(prev => ({
                    fields: {
                        ...prev.fields,
                        location: {
                            lat,
                            lng
                        }
                    },
                    currentLocation: {
                        lat,
                        lng
                    },
                    boardingPoint: {
                        lat: lat,
                        lng: lng
                    },
                    boardingPlace: "" //unable to get because api call fails here
                }));
                console.error(error);
            }
        );

        Meteor.call(
            "getDriversWithin",
            { lat: lat, lng: lng },
            (err, result) => {
                if (err) {
                    notify.show("unable to fetch drivers nearby", "warning");
                }
                this.setState({
                    allDrivers: result
                });
            }
        );

        // this.pubnub.subscribe({
        //   channels: [Meteor.userId()],
        //   withPresence: true
        // });
    };

    fetchCurrentRide = async () => {
        return Meteor.call(
            "currentBookingRider",
            Meteor.userId(),
            (err, currentRide) => {
                console.log(err, currentRide);
                if (currentRide) {
                    this.props.history.push("/app/currentBooking");
                    return;
                }
            }
        );
    };

    // componentWillUnmount() {
    //     if (this._isMounted) {
    //     }
    // }

    getcurrentLocation() {
        if (navigator && navigator.geolocation) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    async (pos, err) => {
                        const coords = pos.coords;
                        console.log(coords, err);
                        resolve({
                            lat: coords.latitude,
                            lng: coords.longitude
                        });
                    },
                    err => {
                        notify.show(
                            "Unable to fetch your current location",
                            "error"
                        );
                        resolve({
                            lat: 25.11102,
                            lng: 55.19514
                        });
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            });
        }
        return {
            lat: 0,
            lng: 0
        };
    }

    inputHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    changeRoute = () => {
        if (this.state.poly) {
            this.state.poly.setMap(null);
        }

        const {
            mapInstance,
            mapApi,
            droppingPoint,
            boardingPoint
        } = this.state;

        const latlng = [
            new mapApi.LatLng(droppingPoint.lat, droppingPoint.lng),
            new mapApi.LatLng(boardingPoint.lat, boardingPoint.lng)
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
                origin:
                    this.state.boardingPoint.lat +
                    "," +
                    this.state.boardingPoint.lng,
                destination:
                    this.state.droppingPoint.lat +
                    "," +
                    this.state.droppingPoint.lng,
                travelMode: "DRIVING",
                unitSystem: mapApi.UnitSystem.METRIC,
                drivingOptions: {
                    departureTime: new Date() //add drivers arriving time here
                }
            },
            (response, status) => {
                if (status === "OK") {
                    const bookingDetails = response.routes[0].legs[0];
                    const dataObj = {
                        end_address: bookingDetails.end_address,
                        start_address: bookingDetails.start_address,
                        reachAfter: bookingDetails.duration.text,
                        distance: bookingDetails.distance.text,
                        reachAfterIfTraffic:
                            bookingDetails.duration_in_traffic.text
                    };
                    this.setState({
                        rideStatGen: true,
                        distance_in_meter: bookingDetails.distance.value,
                        timeTaken_in_secoend: bookingDetails.duration.value,
                        timeTakenTraffic_in_secoend:
                            bookingDetails.duration_in_traffic.value,
                        start_latLng: {
                            lat: bookingDetails.start_location.lat(),
                            lng: bookingDetails.start_location.lng()
                        },
                        end_latLng: {
                            lat: bookingDetails.end_location.lat(),
                            lng: bookingDetails.end_location.lng()
                        },
                        ...dataObj
                    });
                    directionsDisplay.setDirections(response);
                    const routePolyline = new mapApi.Polyline({
                        path: response.routes[0].overview_path
                    });
                    this.setState({
                        poly: routePolyline
                    });
                    routePolyline.setMap(mapInstance);
                } else {
                    //Add localization support
                    notify.show(
                        "Directions request failed due to " + status,
                        "error"
                    );
                }
            }
        );
    };

    addDroppingPlace = place => {
        this.setState({
            droppingPlace: place[0],
            droppingPoint: {
                lat: place[0].geometry.location.lat(),
                lng: place[0].geometry.location.lng()
            }
        });

        //call the change route function
        this.changeRoute();
    };

    addBoardingPlace = place => {
        this.setState({
            boardingPlace: place[0],
            boardingPoint: {
                lat: place[0].geometry.location.lat(),
                lng: place[0].geometry.location.lng()
            }
        });
    };

    onChangeBoarding = t => {
        Geocode.fromLatLng(t.lat, t.lng).then(response => {
            const address = response.results[0];

            this.setState({
                boardingPoint: {
                    lat: t.lat,
                    lng: t.lng
                },
                boardingPlace: address
            });
            if (this.state.droppingPoint) {
                this.changeRoute();
            }
        });
    };

    apiHasLoaded = (map, maps) => {
        this.setState({
            mapApiLoaded: true,
            mapInstance: map,
            mapApi: maps
        });
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

    raiseBookingReq = e => {
        this.setState({
            submitted: true
        });

        e.preventDefault();
        const data = {
            userId: Meteor.userId(),
            boardingPoint: this.state.boardingPoint,
            droppingPoint: this.state.droppingPoint,
            paymentMethod: this.state.paymentMethod,
            distance: this.state.distance,
            reachAfter: this.state.reachAfter,
            currentLocation: this.state.currentLocation,
            reachAfterIfTraffic: this.state.reachAfterIfTraffic,
            timeTakenTraffic_in_secoend: this.state.timeTakenTraffic_in_secoend,
            timeTaken_in_secoend: this.state.timeTaken_in_secoend,
            end_address: this.state.end_address,
            start_address: this.state.start_address,
            distance_in_meter: this.state.distance_in_meter
        };
        Meteor.call("newBookingReq", data, (error, response) => {
            if (error) {
                this.setState({
                    submitted: false
                });
                console.log(error);
                //Add localization support
                notify.show(
                    error.reason ? error.reason : "Unable to create request!",
                    "error"
                );
            }
            this.setState({
                listnToDriver: true,
                submitted: false
            });
            //show a loader here
            console.log(response);
            this.props.history.push("/app/currentBooking");
        });
    };

    render() {
        const { mapApiLoaded, mapInstance, mapApi, listnToDriver } = this.state;

        // if (listnToDriver) {
        //   const messages = this.pubnub.getMessage(Meteor.userId());
        //   const latestMsg = messages[messages.length - 1];
        //   if(latestMsg.userMetadata.type=="driverAccept"){
        //     notify.show("Driver assigned",'success');
        //     this.props.history.push("/app/currentBooking");
        //   }

        //     {actualChannel: null
        // channel: "RRt8iYvYeSDDN8QaX"
        // message: {such: "luls"}
        // publisher: "pn-612e2f1f-fe27-4c72-a96a-064680f93b7a"
        // subscribedChannel: "RRt8iYvYeSDDN8QaX"
        // subscription: null
        // timetoken: "15471134919707428"
        // userMetadata: {cool: "meta"}}
        //check above for specific metadata or message item and take the steps accordingly
        // }

        let conatinerClass = "list";

        if (!this.state.rideStatGen) {
            conatinerClass += " padding-bottom";
        }

        return (
            <div style={{ height: "100%" }}>
                <Fragment>
                    <div className="padding">
                        <h3 className="padding">
                            <i className="fa fa-car" aria-hidden="true" /> Book
                            Ride
                        </h3>
                    </div>
                    <div className={conatinerClass}>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">
                                {" "}
                                Boarding Point:{" "}
                            </span>
                            {mapApiLoaded && (
                                <SearchBox
                                    map={mapInstance}
                                    mapApi={mapApi}
                                    value={
                                        this.state.boardingPlace
                                            ? this.state.boardingPlace
                                                  .formatted_address
                                            : ""
                                    }
                                    addplace={this.addBoardingPlace}
                                />
                            )}
                        </label>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">
                                {" "}
                                Dropping Point:{" "}
                            </span>
                            {mapApiLoaded && (
                                <SearchBox
                                    map={mapInstance}
                                    mapApi={mapApi}
                                    addplace={this.addDroppingPlace}
                                />
                            )}
                        </label>
                        {this.state.rideStatGen && (
                            <div>
                                <div
                                    className="list"
                                    style={{ marginBottom: "0px" }}
                                >
                                    <a className="item item-icon-left" href="#">
                                        <i className="icon fa fa-clock-o" />
                                        {this.state.reachAfter}
                                        <span className="item-note">Time</span>
                                    </a>

                                    <a className="item item-icon-left" href="#">
                                        <i className="icon fa fa-road" />
                                        {this.state.distance}
                                        <span className="item-note">
                                            Distance
                                        </span>
                                    </a>

                                    <a className="item item-icon-left" href="#">
                                        <i className="icon fa fa-money" />
                                        {Math.round(
                                            this.state.distance_in_meter *
                                                config.farePerMeter
                                        ) + config.fareUnit}{" "}
                                        at{" "}
                                        {config.farePerMeter + config.fareUnit}
                                        /M
                                        <span className="item-note">Fare</span>
                                    </a>
                                    <a className="item item-icon-left" href="#">
                                        <i className="icon fa fa-shopping-cart" />
                                        <select
                                            name="paymentMethod"
                                            value={this.state.paymentMethod}
                                            onChange={this.inputHandler}
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            <option value={"cash"}>Cash</option>
                                            <option value={"card 1"}>
                                                Card 1
                                            </option>
                                        </select>
                                        <i
                                            className="fa fa-sort-desc"
                                            style={{
                                                position: "relative",
                                                top: "-2px",
                                                left: "-12px"
                                            }}
                                        />
                                        <span className="item-note">
                                            Payment Method
                                        </span>
                                    </a>
                                </div>

                                <div className="padding-left padding-right padding-top">
                                    <button
                                        className="button button-block button-energized activated"
                                        onClick={this.raiseBookingReq}
                                        style={{
                                            paddingTop: this.state.submitted
                                                ? "14px"
                                                : "0px"
                                        }}
                                        disabled={
                                            this.state.paymentMethod
                                                ? false
                                                : true
                                        }
                                    >
                                        {this.state.submitted ? (
                                            <div id="loading" />
                                        ) : (
                                            "Book"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mapView padding-left padding-right padding-bottom">
                        {this._isMounted && (
                            <GoogleMapReact
                                options={this.createMapOptions}
                                bootstrapURLKeys={{
                                    key: config.GAPIKEY,
                                    libraries: ["places"]
                                }}
                                initialCenter={this.state.fields.location}
                                center={this.state.fields.location}
                                defaultZoom={18}
                                zoom={this.state.zoom}
                                layerTypes={["TrafficLayer", "TransitLayer"]}
                                heat={true}
                                gestureHandling="greedy"
                                onClick={t => this.onChangeBoarding(t)}
                                yesIWantToUseGoogleMapApiInternals
                                onGoogleApiLoaded={({ map, maps }) =>
                                    this.apiHasLoaded(map, maps)
                                }
                            >
                                {this.state.droppingPoint && (
                                    <Marker
                                        lat={this.state.droppingPoint.lat}
                                        lng={this.state.droppingPoint.lng}
                                        metaData="drop"
                                    />
                                )}
                                <Marker
                                    lat={
                                        this.state.currentLocation.lat
                                            ? this.state.currentLocation.lat
                                            : this.state.fields.lat
                                    }
                                    lng={
                                        this.state.currentLocation.lng
                                            ? this.state.currentLocation.lng
                                            : this.state.fields.lng
                                    }
                                    metaData="current"
                                />
                                <Marker
                                    lat={
                                        this.state.boardingPoint.lat
                                            ? this.state.boardingPoint.lat
                                            : this.state.currentLocation.lat
                                    }
                                    lng={
                                        this.state.boardingPoint.lng
                                            ? this.state.boardingPoint.lng
                                            : this.state.currentLocation.lng
                                    }
                                    metaData="board"
                                />

                                {this.state.allDrivers &&
                                    this.state.allDrivers.length &&
                                    this.state.allDrivers.map(e => {
                                        <Marker
                                            lat={e.currentLocation.lat}
                                            lng={e.currentLocation.lng}
                                            metaData="car"
                                        />;
                                    })}
                            </GoogleMapReact>
                        )}
                    </div>
                </Fragment>
            </div>
        );
    }
}

export default withRouter(Bookings);
