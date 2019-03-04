import React, { Component, Fragment } from "react";
import { withRouter, Redirect } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import Geocode from "react-geocode";
import { notify } from "react-notify-toast";
import { Meteor } from "meteor/meteor";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import ReactGooglePlacesSuggest from "react-google-places-suggest";

import mapStyle from "./MapStyle"; //https://mapstyle.withgoogle.com/ you can build yours from
import config from "../../../modules/config/client/";
import localizationManager from "../../localization/index";

const cartTypes = [
    {
        name: "micro",
        value: "micro"
    },
    {
        name: "mini",
        value: "mini"
    },
    {
        name: "primeSedan",
        value: "sedan"
    },
    {
        name: "primeSUV",
        value: "suv"
    },
    {
        name: "primeExec",
        value: "exec"
    },
    {
        name: localizationManager.strings.primeLux,
        value: "lux"
    }
];
Geocode.setApiKey(config.GAPIKEY);

import "./Bookings_client.scss";
import MapControl from "../../components/MapControls/MapControls";
import CarLoader from "../../components/CarLoader/CarLoader";

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

class Bookings extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
    }
    state = {
        loading_cards: true,
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
        zoom: 15,
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
    componentWillUnmount = () => {
        clearInterval(this.state.intvl);
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

        Meteor.call("getCardsForPayment", (err, res) => {
            this.setState({
                loading_cards: false
            });
            if (err) {
                console.log(err);
                return notify.show(
                    localizationManager.strings.unableToLoadCards,
                    "error"
                );
            }
            if (res.message || !res.cards) {
                notify.show(
                    ex.message
                        ? ex.message
                        : localizationManager.strings.unableToLoadCards,
                    "error"
                );
            } else {
                let options = [
                    {
                        value: "cash",
                        text: localizationManager.strings.cash
                    }
                ];
                for (let i = 0; i < res.cards.length; i++) {
                    let cardText = "";
                    cardText = res.cards[i].cardNumber.substr(
                        res.cards[i].cardNumber.length - 4
                    );
                    options.push({
                        value: res.cards[i].hyperPayId,
                        text:
                            localizationManager.strings.Card +
                            ": ..." +
                            cardText
                    });
                }
                this.setState({
                    cards: options
                });

                console.log("cards loaded", this.state.cards);
            }
        });
        const intvl = setInterval(
            () => this.fetchNearByDrivers(lat, lng),
            2000
        );
        this.setState({ intvl: intvl });
    };

    fetchNearByDrivers = (lat, lng) => {
        if (this.state.currentLocation.lat || this.state.currentLocation.lng) {
            lat = this.state.currentLocation.lat;
            lng = this.state.currentLocation.lng;
        }
        Meteor.call(
            "getDriversWithin",
            {
                lat: lat,
                lng: lng
            },
            (err, result) => {
                if (err) {
                    notify.show(
                        localizationManager.strings.unableToFetchDriversNearby,
                        "warning"
                    );
                }
                this.setState({
                    allDrivers: result
                });
            }
        );
    };

    fetchCurrentRide = async () => {
        return Meteor.call(
            "currentBookingRider",
            Meteor.userId(),
            (err, currentRide) => {
                console.log(err, currentRide);
                if (currentRide) {
                    // this.props.history.push("/app/currentBooking");
                    clearInterval(this.state.intvl);
                    this.setState({
                        redirectToCurrentBooking: true
                    });
                    return;
                }
            }
        );
    };

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
                            localizationManager.strings
                                .unableToFetchYourCurrentLocation,
                            "error"
                        );
                        resolve({
                            lat: 21.54238,
                            lng: 39.19797
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
                    mapInstance.fitBounds(latlngbounds);
                    // mapInstance.setZoom(this.state.zoom); //dont set the zoom otherwise it wont fit to map properly
                    this.setState({
                        poly: routePolyline
                    });
                    routePolyline.setMap(mapInstance);
                } else if (status == "ZERO_RESULTS") {
                    notify.show("Cannot find path", "error");
                } else if (status == "OVER_QUERY_LIMIT") {
                    notify.show("Internal error", "error");
                } else {
                    //Add localization support
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
            mapInstance.setZoom(this.state.zoom);
        }
    };

    onChangeBoarding = t => {
        if (this.state.stopMapInput) {
            notify.show(
                localizationManager.strings.canNotChangeLocation,
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
                boardingPlace: address,
                boardvalue: address.formatted_address
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
                boardingPlace: address,
                boardvalue: address.formatted_address
            });
            if (this.state.droppingPoint) {
                this.changeRoute();
            } else {
                const { mapInstance, mapApi, boardingPoint } = this.state;

                const latlng = [
                    new mapApi.LatLng(boardingPoint.lat, boardingPoint.lng)
                ];
                let latlngbounds = new mapApi.LatLngBounds();
                for (let i = 0; i < latlng.length; i++) {
                    latlngbounds.extend(latlng[i]);
                }
                mapInstance.fitBounds(latlngbounds);
                mapInstance.setZoom(this.state.zoom);
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
        clearInterval(this.state.intvl);
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
                return notify.show(
                    error.reason
                        ? error.reason
                        : localizationManager.strings.unableToCreateRequest,
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
            clearInterval(this.state.intvl);
            this.setState({
                redirectToCurrentBooking: true
            });
        });
    };

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
        const { mapApiLoaded, mapApi } = this.state;

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
                    {this.state.loading_cards && <CarLoader />}

                    {!this.state.loading_cards && (
                        <div style={{ height: "100%" }}>
                            <div className={conatinerClass}>
                                <label className="item item-input item-stacked-label">
                                    <span className="input-label">
                                        {" "}
                                        {
                                            localizationManager.strings
                                                .boardingPoint
                                        }
                                        :{" "}
                                    </span>
                                    {mapApiLoaded && (
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
                                                placeholder={
                                                    localizationManager.strings
                                                        .defaultLocation
                                                }
                                                autoComplete="off"
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
                                            localizationManager.strings
                                                .droppingPoint
                                        }
                                        :{" "}
                                    </span>
                                    {mapApiLoaded && (
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
                                                placeholder={
                                                    localizationManager.strings
                                                        .selectLocation
                                                }
                                                autoComplete="off"
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
                                            <a
                                                className="item item-icon-left"
                                                href="#"
                                            >
                                                <i className="icon fa fa-clock-o" />
                                                {this.state.reachAfter}
                                                <span className="item-note">
                                                    {
                                                        localizationManager
                                                            .strings.Time
                                                    }
                                                </span>
                                            </a>

                                            <a
                                                className="item item-icon-left"
                                                href="#"
                                            >
                                                <i className="icon fa fa-road" />
                                                {this.state.distance}
                                                <span className="item-note">
                                                    {
                                                        localizationManager
                                                            .strings.distance
                                                    }
                                                </span>
                                            </a>

                                            <a
                                                className="item item-icon-left"
                                                href="#"
                                            >
                                                <i className="icon fa fa-money" />
                                                {Math.round(
                                                    this.state
                                                        .distance_in_meter *
                                                        config.farePerMeter
                                                ) + config.fareUnit}{" "}
                                                {localizationManager.strings.at}{" "}
                                                {config.farePerMeter +
                                                    config.fareUnit}
                                                /M
                                                <span className="item-note">
                                                    {
                                                        localizationManager
                                                            .strings.fare
                                                    }
                                                </span>
                                            </a>
                                            <div className="item item-icon-left">
                                                <i className="icon fa fa-shopping-cart" />
                                                <select
                                                    name="paymentMethod"
                                                    value={
                                                        localizationManager
                                                            .strings[
                                                            this.state
                                                                .paymentMethod
                                                        ]
                                                    }
                                                    onChange={this.inputHandler}
                                                    style={{
                                                        fontSize: "16px"
                                                    }}
                                                    disabled={
                                                        this.state.stopMapInput
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    {this.state.cards.map(
                                                        (card, i) => (
                                                            <option
                                                                value={
                                                                    card.value
                                                                }
                                                                key={i}
                                                            >
                                                                {" "}
                                                                {card.text}{" "}
                                                            </option>
                                                        )
                                                    )}
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
                                                        localizationManager
                                                            .strings
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
                                                    disabled={
                                                        this.state.stopMapInput
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    {cartTypes.map(
                                                        (cars, i) => (
                                                            <option
                                                                value={
                                                                    cars.value
                                                                }
                                                                key={i}
                                                            >
                                                                {" "}
                                                                {localizationManager.strings[cars.name]}{" "}
                                                            </option>
                                                        )
                                                    )}
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
                                                        localizationManager
                                                            .strings
                                                            .preferredCar
                                                    }
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
                                                disabled={
                                                    this.state.loading_cards
                                                }
                                            >
                                                <i
                                                    className="fa fa-car"
                                                    aria-hidden="true"
                                                />{" "}
                                                {
                                                    localizationManager.strings
                                                        .book
                                                }{" "}
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
                                        initialCenter={
                                            this.state.fields.location
                                        }
                                        center={this.state.fields.location}
                                        defaultZoom={15}
                                        zoom={this.state.zoom}
                                        layerTypes={[
                                            "TrafficLayer",
                                            "TransitLayer"
                                        ]}
                                        heat={true}
                                        gestureHandling="greedy"
                                        onClick={t => this.onChangeBoarding(t)}
                                        yesIWantToUseGoogleMapApiInternals
                                        onGoogleApiLoaded={({ map, maps }) =>
                                            this.apiHasLoaded(map, maps)
                                        }
                                    >
                                        {this.state.mapInstance && (
                                            <MapControl
                                                map={
                                                    this.state.mapInstance ||
                                                    null
                                                }
                                                controlPosition={
                                                    this.state.mapApi
                                                        ? this.state.mapApi
                                                              .ControlPosition
                                                              .RIGHT_CENTER
                                                        : null
                                                }
                                            >
                                                <button
                                                    className="centerIt"
                                                    onClick={
                                                        this
                                                            .changeBoardingToCurrent
                                                    }
                                                    disabled={
                                                        this.state.submitted
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    <i className="fa fa-location-arrow" />{" "}
                                                </button>
                                            </MapControl>
                                        )}

                                        {this.state.droppingPoint && (
                                            <Marker
                                                lat={
                                                    this.state.droppingPoint.lat
                                                }
                                                lng={
                                                    this.state.droppingPoint.lng
                                                }
                                                metaData="drop"
                                            />
                                        )}
                                        <Marker
                                            lat={
                                                this.state.currentLocation.lat
                                                    ? this.state.currentLocation
                                                          .lat
                                                    : this.state.fields.lat
                                            }
                                            lng={
                                                this.state.currentLocation.lng
                                                    ? this.state.currentLocation
                                                          .lng
                                                    : this.state.fields.lng
                                            }
                                            metaData="current"
                                        />
                                        <Marker
                                            lat={
                                                this.state.boardingPoint.lat
                                                    ? this.state.boardingPoint
                                                          .lat
                                                    : this.state.currentLocation
                                                          .lat
                                            }
                                            lng={
                                                this.state.boardingPoint.lng
                                                    ? this.state.boardingPoint
                                                          .lng
                                                    : this.state.currentLocation
                                                          .lng
                                            }
                                            metaData="board"
                                        />

                                        {this.state.allDrivers &&
                                            this.state.allDrivers.length &&
                                            this.state.allDrivers.map(
                                                (e, i) => {
                                                    return (
                                                        <Marker
                                                            lat={
                                                                e
                                                                    .currentLocation[1]
                                                            }
                                                            lng={
                                                                e
                                                                    .currentLocation[0]
                                                            }
                                                            metaData="cartop"
                                                            deg={e.heading}
                                                            key={i}
                                                        />
                                                    );
                                                }
                                            )}
                                    </GoogleMapReact>
                                )}
                            </div>
                        </div>
                    )}
                </Fragment>
                {this.state.redirectToCurrentBooking && (
                    <Redirect to="/app/currentBooking" />
                )}
            </div>
        );
    }
}

export default withRouter(Bookings);
