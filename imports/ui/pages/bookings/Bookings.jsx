import React, { Component, Fragment } from "react";
import isEmpty from "lodash.isempty";
import { Link, withRouter, Redirect } from "react-router-dom";
import SearchBox from "./SearchBox";
import mapStyle from "./MapStyle"; //https://mapstyle.withgoogle.com/ you can build yours from
import config from "../../../modules/config/client/";
import GoogleMapReact from "google-map-react";
import Geocode from "react-geocode";
import { notify } from "react-notify-toast";
import { Meteor } from "meteor/meteor";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import ReactGooglePlacesSuggest from "react-google-places-suggest";
import ReactGoogleMapLoader from "react-google-maps-loader";
import localizationManager from "../../localization/index";
import sleep from 'await-sleep'

const cartTypes = [
    {
        name: "Micro",
        value: "micro"
    },
    {
        name: "Mini",
        value: "mini"
    },
    {
        name: "Prime sedan",
        value: "sedan"
    },
    {
        name: "prime SUV",
        value: "suv"
    },
    {
        name: "Prime Exec",
        value: "exec"
    },
    {
        name: "Prime Lux",
        value: "lux"
    }
];
Geocode.setApiKey(config.GAPIKEY);

import "./Bookings_client.scss";

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

class Bookings extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
    }
    state = {
        cards: [],
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
        boardingPlace: {},
        carType: "micro",
        boardsearch: "",
        boardvalue: "",
        dropsearch: "",
        dropvalue: ""
    };

    componentWillMount = async () => {
        await this.fetchCurrentRide();
    };

    componentDidMount = async () => {
        console.log(Meteor.userId());

        Meteor.call(
            "getLangPref",
            {
                id: Meteor.userId()
            },
            (err, result) => {
                console.log(err, result);
                if (result) localizationManager.setLanguage(result);
            }
        );
        const { lat, lng } = await this.getcurrentLocation();
        this._isMounted = true;
        // const username = Meteor.user().profile.name;
        // this.setState({
        //     username: username
        // });
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

        Meteor.call("getCardsForPayment", (err, res) => {
            if (err) {
                console.log(err);
                return notify.show("Failed adding card.", "error");
            }
            if (res.message || !res.cards) {
                notify.show(
                    ex.message ? ex.message : "Unable to load cards!",
                    "error"
                );
            } else {
                let options = [
                    {
                        value: "cash",
                        text: "Cash"
                    }
                ];
                for (let i = 0; i < res.cards.length; i++) {
                    options.push({
                        value: res.cards[i].hyperPayId,
                        text: res.cards[i].cardNumber
                    });
                }
                this.setState({
                    cards: options
                });

                console.log("cards loaded", this.state.cards);
            }
        });

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
                    // this.props.history.push("/app/currentBooking");
                    this.setState({
                        redirectToCurrentBooking: true
                    });
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
                        timeout: 30000,
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

    inputHandler = async e => {
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
                        reachAfterIfTraffic: bookingDetails.duration_in_traffic
                            ? bookingDetails.duration_in_traffic.text
                            : "UNKNOWN"
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
            droppingPlace: place,
            droppingPoint: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            dropsearch: "",
            dropvalue: place.formatted_address
        });

        //call the change route function
        this.changeRoute();
    };

    addBoardingPlace = place => {
        this.setState({
            boardingPlace: place,
            boardingPoint: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            boardsearch: "",
            boardvalue: place.formatted_address
        });

        //fit the map bounds
        const {
            mapInstance,
            mapApi,
            droppingPoint,
            boardingPoint
        } = this.state;

        let latlng = [new mapApi.LatLng(boardingPoint.lat, boardingPoint.lng)];
        if (droppingPoint && droppingPoint.lat) {
            this.changeRoute();
        } else {
            let latlngbounds = new mapApi.LatLngBounds();
            for (let i = 0; i < latlng.length; i++) {
                latlngbounds.extend(latlng[i]);
            }
            mapInstance.fitBounds(latlngbounds);
        }
    };

    onChangeBoarding = t => {
        if (this.state.stopMapInput) {
            notify.show(
                "Cant change location while rasing booking request.",
                "warning"
            );
            return false;
        }
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
    changeBoardingToCurrent = () => {
        Geocode.fromLatLng(
            this.state.currentLocation.lat,
            this.state.currentLocation.lng
        ).then(response => {
            const address = response.results[0];

            this.setState({
                boardingPoint: {
                    lat: this.state.currentLocation.lat,
                    lng: this.state.currentLocation.lng
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
            fullscreenControl: true,
            draggable: true,
            zoomControl: true,
            styles: mapStyle
        };
    };

    raiseBookingReq = e => {
        this.setState({
            submitted: true,
            stopMapInput: true
        });

        e.preventDefault();
        const data = {
            // username: this.state.username,
            userId: Meteor.userId(),
            preferredCar: this.state.carType,
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
            // this.props.history.push("/app/currentBooking");
            this.setState({
                redirectToCurrentBooking: true
            });
        });
    };

    // searchLoc = async keyWord => {
    //     if (!keyWord.length) {
    //         return;
    //     }
    //     this.setState({
    //         dropDownData: []
    //     });
    //     Meteor.call(
    //         "fetchLocationwithKeyword",
    //         { ...this.state.currentLocation, keyWord: keyWord },
    //         (error, data) => {
    //             if (error) {
    //                 return notify.show(
    //                     error.reason || "unable to search.",
    //                     "error"
    //                 );
    //             }
    //             if (data.results && data.results.length) {
    //                 const dropDownData = data.results.map((val, i) => {
    //                     return {
    //                         value: val.geometry.location,
    //                         label: val.formatted_address
    //                     };
    //                 });
    //                 this.setState({
    //                     dropDownData: dropDownData
    //                 });
    //                 return dropDownData;
    //             } else {
    //                 return [];
    //             }
    //         }
    //     );
    // };

    handleboardChange(e) {
        this.setState({
            boardsearch: e.target.value,
            boardvalue: e.target.value
        });
    }

    handledropChange(e) {
        this.setState({
            dropsearch: e.target.value,
            dropvalue: e.target.value
        });
    }

    // handleSelectSuggest(suggest) {
    //     console.log(suggest);
    //     this.setState({ search: "", value: suggest.formatted_address });
    // }

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
                            <i className="fa fa-car" aria-hidden="true" />{" "}
                            {localizationManager.strings.bookRide}
                        </h3>
                    </div>
                    <div className={conatinerClass}>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">
                                {" "}
                                {
                                    localizationManager.strings.boardingPoint
                                }:{" "}
                            </span>
                            {mapApiLoaded && (
                                // <SearchBox
                                //     placeholder="Default is Current Location"
                                //     map={mapInstance}
                                //     mapApi={mapApi}
                                //     value={
                                //         this.state.boardingPlace
                                //             ? this.state.boardingPlace
                                //                   .formatted_address
                                //             : ""
                                //     }
                                //     addplace={this.addBoardingPlace}
                                // />

                                <ReactGooglePlacesSuggest
                                    name="boardingPoint"
                                    autocompletionRequest={{
                                        input: this.state.boardsearch
                                    }}
                                    googleMaps={mapApi}
                                    onSelectSuggest={this.addBoardingPlace.bind(
                                        this
                                    )}
                                >
                                    <input
                                        type="text"
                                        name="boardingPointInput"
                                        value={this.state.boardvalue}
                                        placeholder="Default is current location"
                                        disabled={
                                            this.state.stopMapInput
                                                ? true
                                                : false
                                        }
                                        onChange={this.handleboardChange.bind(
                                            this
                                        )}
                                    />
                                </ReactGooglePlacesSuggest>
                            )}
                        </label>
                        <label className="item item-input item-stacked-label">
                            <span className="input-label">
                                {" "}
                                {
                                    localizationManager.strings.droppingPoint
                                }:{" "}
                            </span>
                            {mapApiLoaded && (
                                // <SearchBox
                                //     placeholder="Enter a location"
                                //     map={mapInstance}
                                //     mapApi={mapApi}
                                //     addplace={this.addDroppingPlace}
                                // />
                                <ReactGooglePlacesSuggest
                                    name="droppingPoint"
                                    autocompletionRequest={{
                                        input: this.state.dropsearch
                                    }}
                                    googleMaps={mapApi}
                                    onSelectSuggest={this.addDroppingPlace.bind(
                                        this
                                    )}
                                >
                                    <input
                                        type="text"
                                        name="droppingPointInput"
                                        value={this.state.dropvalue}
                                        placeholder="select location"
                                        disabled={
                                            this.state.stopMapInput
                                                ? true
                                                : false
                                        }
                                        onChange={this.handledropChange.bind(
                                            this
                                        )}
                                    />
                                </ReactGooglePlacesSuggest>
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
                                        <span className="item-note">
                                            {localizationManager.strings.Time}
                                        </span>
                                    </a>

                                    <a className="item item-icon-left" href="#">
                                        <i className="icon fa fa-road" />
                                        {this.state.distance}
                                        <span className="item-note">
                                            {
                                                localizationManager.strings
                                                    .distance
                                            }
                                        </span>
                                    </a>

                                    <a className="item item-icon-left" href="#">
                                        <i className="icon fa fa-money" />
                                        {Math.round(
                                            this.state.distance_in_meter *
                                                config.farePerMeter
                                        ) + config.fareUnit}{" "}
                                        {localizationManager.strings.at}{" "}
                                        {config.farePerMeter + config.fareUnit}
                                        /M
                                        <span className="item-note">
                                            {localizationManager.strings.fare}
                                        </span>
                                    </a>
                                    <div className="item item-icon-left">
                                        <i className="icon fa fa-shopping-cart" />
                                        <select
                                            name="paymentMethod"
                                            value={this.state.paymentMethod}
                                            onChange={this.inputHandler}
                                            onKeyUp={() => {alert("11")}}
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            {this.state.cards.map((card, i) => (
                                                <option
                                                    value={card.value}
                                                    key={i}
                                                >
                                                    {" "}
                                                    {card.text}{" "}
                                                </option>
                                            ))}
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
                                            {
                                                localizationManager.strings
                                                    .paymentMethod
                                            }
                                        </span>
                                    </div>
                                    <div className="item item-icon-left">
                                        <i className="icon fa fa-car" />
                                        <select
                                            name="carType"
                                            value={this.state.cartType}
                                            onChange={this.inputHandler}
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            {cartTypes.map((cars, i) => (
                                                <option
                                                    value={cars.value}
                                                    key={i}
                                                >
                                                    {" "}
                                                    {cars.name}{" "}
                                                </option>
                                            ))}
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
                                            Preferred Car
                                        </span>
                                    </div>
                                </div>

                                <div className="padding-left padding-right padding-top">
                                    <LaddaButton
                                        className="button button-block button-energized activated"
                                        loading={this.state.submitted}
                                        onClick={this.raiseBookingReq}
                                        data-color="##FFFF00"
                                        data-size={L}
                                        data-style={SLIDE_UP}
                                        data-spinner-size={30}
                                        data-spinner-color="#ddd"
                                        data-spinner-lines={12}
                                    >
                                        {localizationManager.strings.book}{" "}
                                    </LaddaButton>
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

                                {/* {this.state.allDrivers &&
                                    this.state.allDrivers.length &&
                                    this.state.allDrivers.map(e => {
                                        <Marker
                                            lat={e.currentLocation.lat}
                                            lng={e.currentLocation.lng}
                                            metaData="cartop"
                                        />;
                                    })} */}
                                {/* <LaddaButton
                                    className="floatMapButton"
                                    onClick={this.changeBoardingToCurrent}
                                    data-color="##FFFF00"
                                    data-size={L}
                                    data-style={SLIDE_UP}
                                    data-spinner-size={30}
                                    data-spinner-color="#ddd"
                                    data-spinner-lines={12}
                                >
                                    <i className="fa fa-map-marker" />
                                </LaddaButton> */}
                            </GoogleMapReact>
                        )}
                    </div>
                </Fragment>
                {this.state.redirectToCurrentBooking && (
                    <Redirect to="/app/currentBooking" />
                )}
            </div>
        );
    }
}

export default withRouter(Bookings);
