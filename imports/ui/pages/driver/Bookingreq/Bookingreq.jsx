import React, { Component } from "react";
import lodash from "lodash";
import { Link, withRouter, Redirect } from "react-router-dom";
import { notify } from "react-notify-toast";
import InfiniteScroll from "react-infinite-scroller";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import PubNubReact from "pubnub-react";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import Ratings from "react-rating";
import config from "../../../../modules/config/client";
import CarLoader from "../../../components/CarLoader/CarLoader";
import localizationManager from "../../../localization";

class Bookingreq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datas: [],
            hasMoreItems: true
        };
        this._isMounted = false;
        this.pubnub = new PubNubReact({
            publishKey: config.PUBNUB.pubKey,
            subscribeKey: config.PUBNUB.subKey,
            secretKey: config.PUBNUB.secret,
            ssl: true
        });
        this.pubnub.init(this);
    }
    componentWillUnmount = () => {
        if (this.state.invl) {
            clearInterval(this.state.invl);
        }
    };

    componentDidMount = () => {
        this._isMounted = true;
        this.fetchDriverDetails();
        const intRecord = setInterval(() => {
            this.loadItems(1);
        }, 5000);
        this.setState({
            invl: intRecord
        });
    };
    componentWillMount = async () => {
        await this.fetchCurrentRide();
    };
    fetchDriverDetails = () => {
        return Meteor.call("getDriver", Meteor.userId(), (err, driverMeta) => {
            if (err) {
                notify.show(
                    err.reason ||
                        localizationManager.strings.unableToFetchDriverDetails,
                    "error"
                );
            }
            this.setState({
                carType: driverMeta.carType ? driverMeta.carType : "micro"
            });
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
                if (currentRide) {
                    // this.props.history.push("/app/driver/currentBooking");
                    // return;
                    this.setState({
                        redirectTocurrentBooking: true
                    });
                }
            }
        );
    };

    handleClickAction = data => {
        this.setState({
            accept_loader: true
        });
        clearInterval(this.state.invl);
        console.log("Accepting.....");
        Meteor.call(
            "onDriverAccept",
            data.bookingId,
            Meteor.userId(),
            async (error, response) => {
                if (error) {
                    console.log(error);
                    this.setState({
                        accept_loader: false
                    });
                    console.log(error);
                    //Add localization support
                    notify.show(
                        error.error
                            ? error.error
                            : localizationManager.strings.unabletoAcceptTheRide,
                        "error"
                    );
                }

                await this.pubnub.publish({
                    message: {
                        bookingId: data.bookingId,
                        driverLoc: this.state.current_pos
                    },
                    channel: data.bookingId,
                    meta: {
                        type: "driverAccept"
                    }
                });
                // this.props.history.push("/app/driver/currentBooking");
                this.setState({
                    redirectTocurrentBooking: true
                });
            }
        );
    };
    loadItems = page => {
        if (!page) {
            return false;
        }
        console.log("#1");
        navigator.geolocation.getCurrentPosition(
            (pos, err) => {
                console.log("#2");
                if (err) {
                    notify.show(
                        localizationManager.strings
                            .unableToFetchYourCurrentLocation,
                        "error"
                    );
                }
                const coords = pos.coords;
                this.setState({
                    current_pos: {
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
                        console.log("#3");

                        if (err) {
                            console.log(err);
                            //Add localization support
                            notify.show(err.reason, "error");
                        }
                    }
                );
                console.log("#4");
                console.log(page);
                Meteor.call(
                    "fetchBookingReq",
                    {
                        lat: coords.latitude,
                        lng: coords.longitude,
                        carType: this.state.carType,
                        page: page
                    },
                    (err, withingDistanceData) => {
                        console.log(withingDistanceData);
                        if (err) {
                            console.log(err);
                            //Add localization support
                            notify.show(err.reason, "error");
                        }
                        if (withingDistanceData && withingDistanceData.length) {
                            let datas = this.state.datas;
                            datas = datas.concat(withingDistanceData);
                            datas = lodash.uniqBy(datas, "_id");
                            this.setState({
                                datas: datas
                            });
                        } else {
                            this.setState({
                                hasMoreItems: false
                            });
                        }
                        return { data: withingDistanceData };
                    }
                );
            },
            err => {
                notify.show(
                    localizationManager.strings
                        .unableToFetchYourCurrentLocation,
                    "error"
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    };

    render() {
        const loader = <CarLoader />;

        let items = [];
        this.state.datas.map((data, i) => {
            console.log(data);
            items.push(
                <div key={data._id} className="list card">
                    <div className="item item-avatar">
                        <img src="/images/profile.png" />
                        <h2>{data.username || "unnamed"}</h2>
                        <Ratings
                            start={0}
                            stop={5}
                            emptySymbol="fa fa-star-o fa-2x empty"
                            fullSymbol="fa fa-star fa-2x full"
                            initialRating={data.riderRating}
                            readonly
                            style={{
                                fontSize: "10px"
                            }}
                        />
                        <p>
                            {data.createdAt
                                ? moment(data.createdAt).format("LLL")
                                : "-"}{" "}
                        </p>
                    </div>

                    <div className="item item-body">
                        <div>
                            <div className="list">
                                <a className="item item-icon-right" href="#">
                                    {data.totalFare} {config.fareUnit}
                                    <i className="icon fa fa-money" />
                                </a>

                                <a className="item item-icon-right" href="#">
                                    {data.totalDistance}
                                    <i className="icon fa fa-road" />
                                </a>

                                <a className="item item-icon-right" href="#">
                                    {data.totalDuration}
                                    <i className="icon fa fa-clock-o" />
                                </a>
                                <a className="item item-icon-right" href="#">
                                    {data.start_address || "Unknown"}
                                    <i
                                        className="icon fa fa-map-marker"
                                        style={{ color: "green" }}
                                    />
                                </a>
                                <a className="item item-icon-right" href="#">
                                    {data.end_address || "Unknown"}
                                    <i
                                        className="icon fa fa-map-marker"
                                        style={{ color: "red" }}
                                    />
                                </a>
                            </div>
                        </div>
                        <div>
                            <LaddaButton
                                className="button button-block button-balanced"
                                loading={this.state.accept_loader}
                                onClick={this.handleClickAction.bind(
                                    this,
                                    data
                                )}
                                data-color="##FFFF00"
                                data-size={L}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                            >
                                <i className="icon fa fa-check" />{" "}
                                {localizationManager.strings.accept}
                            </LaddaButton>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <InfiniteScroll
                    pageStart={0}
                    loadMore={this.loadItems}
                    hasMore={this.state.hasMoreItems}
                    loader={loader}
                    useWindow={false}
                >
                    <div className="padding">
                        <h3 className="padding">
                            <i className="fa fa-car" aria-hidden="true" />
                            {localizationManager.strings.rideRequests}
                        </h3>
                    </div>
                    {(!this.state.datas || !this.state.datas.length) && (
                        <div style={{ textAlign: "center" }}>
                            {localizationManager.strings.noRequests}
                        </div>
                    )}
                    <div className="padding-left padding-right">{items}</div>
                </InfiniteScroll>
                {this.state.redirectTocurrentBooking && (
                    <Redirect to="/app/driver/currentBooking" />
                )}
            </div>
        );
    }
}

export default withRouter(Bookingreq);
