import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import "../../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";
import { Meteor } from "meteor/meteor";
import moment from "moment";
import "moment/locale/ar";

import LaddaButton, { S, SLIDE_UP } from "react-ladda";
import localizationManager from "../../../localization";

import "./RidePayment_client.scss";
import Reviews from "../../../components/ReviewComponent/Reviews";
import CarLoader from "../../../components/CarLoader/CarLoader";

class RidePayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rideId: "",
            booking: "",
            loading: false,
            paymentDone: false
        };
        this._isMounted = false;
        this.getBookingInfo = this.getBookingInfo.bind();
        this.paymentReceived = this.paymentReceived.bind(this);
    }

    componentDidMount = () => {
        this._isMounted = true;
        const driverMode = localStorage.getItem("driverMode");
        if (driverMode) {
            if (this.props.match.params.id) {
                console.log(this.props.match.params.id);
                this.setState({ rideId: this.props.match.params.id });
                this.getBookingInfo(this.props.match.params.id);
            } else {
                return <Redirect to="/app/currentBooking" />;
            }
        } else {
            this.props.history.push("/login");
        }
    };

    getBookingInfo = async rideId => {
        Meteor.call("getBookingById", rideId, (error, response) => {
            if (error) {
                console.log(error);
                notify.show(
                    error.reason
                        ? error.reason
                        : localizationManager.strings.unableToGetBooking,
                    "error"
                );
                this.props.history.push("/app/driver/newreqs");
            } else {
                if (response.data && !response.message) {
                    this.setState({
                        booking: response.data,
                        amountReceived: response.data.cashToBeCollected
                            ? response.data.cashToBeCollected
                            : response.data.totalFare,
                        cashToCollect: response.data.cashToBeCollected
                    });

                    if (response.data.paymentStatus == "completed") {
                        this.setState({
                            paymentDone: true
                        });
                    }
                    console.log(this.state.booking);
                } else {
                    if (response.message) {
                        notify.show(response.message, "error");
                        this.props.history.push("/app/driver/newreqs");
                    }
                }
            }
        });
    };

    handleChange = e => {
        var amount = parseInt(e.target.value);
        this.setState({
            amountReceived: amount
        });
    };

    paymentReceived = async () => {
        console.log(this.state.rideId);
        this.setState({ loading: true });
        let fare =
            this.state.cashToCollect > 0
                ? parseInt(this.state.cashToCollect.toString())
                : parseInt(this.state.booking.totalFare.toString());
        if (this.state.amountReceived >= fare) {
            if (this.state.amountReceived > fare) {
                Meteor.call(
                    "returnChangeToWallet",
                    fare,
                    this.state.amountReceived,
                    this.state.rideId,
                    (error, res) => {
                        if (error) {
                            this.setState({ loading: false });
                            console.log(error);
                            notify.show(
                                error.reason
                                    ? error.reason
                                    : localizationManager.strings
                                          .somethingWentWrong,
                                "error"
                            );
                        } else {
                            if (res && res.success) {
                            } else {
                                this.setState({ loading: false });

                                notify.show(res.message, "error");
                            }
                        }
                    }
                );
            }
            Meteor.call(
                "paymentReceived",
                this.state.rideId,
                (error, response) => {
                    if (error) {
                        this.setState({ loading: false });

                        console.log(error);
                        notify.show(
                            error.reason
                                ? error.reason
                                : localizationManager.strings
                                      .unableToGetBooking,
                            "error"
                        );
                    } else {
                        if (response.success && !response.message) {
                            notify.show(
                                localizationManager.strings.paymentMarked,
                                "success"
                            );
                            this.setState({
                                loading: false,
                                showReview: true
                            });
                            //this.props.history.push('/app/driver/newreqs');
                        } else {
                            if (response.message) {
                                this.setState({ loading: false });
                                notify.show(response.message, "error");
                            }
                        }
                    }
                    this.setState({ loading: false });
                }
            );
        } else {
            this.setState({ loading: false });
            notify.show(
                localizationManager.strings.amountLessThanFare,
                "error"
            );
        }
    };

    render() {
        return (
            <div
                style={{ direction: localizationManager.strings.textDirection }}
            >
                {this.state.booking ? (
                    <div>
                        {this.state.showReview && (
                            <Reviews
                                type="driver"
                                userId={this.state.booking.userId}
                                bookingId={this.state.booking.uniqueIdentifier}
                            />
                        )}
                        <div
                            style={{
                                display: this.state.showReview
                                    ? "none"
                                    : "block"
                            }}
                        >
                            <div className="item item-avatar">
                                <img src="/images/completed.png" />
                                <h2>
                                    {this.state.booking.totalFare +
                                        " " +
                                        this.state.booking.fareUnit}
                                </h2>
                                <p>
                                    {this.state.booking.createdAt
                                        ? moment(this.state.booking.createdAt)
                                              .locale(
                                                  localizationManager.getLanguage()
                                              )
                                              .format("LLL")
                                        : "-"}
                                </p>
                            </div>
                            <div className="item item-body">
                                <ul className="list">
                                    <li
                                        className="item"
                                        style={{ whiteSpace: "normal" }}
                                    >
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .bookingID
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>
                                            #
                                            {
                                                this.state.booking
                                                    .uniqueIdentifier
                                            }
                                        </div>
                                    </li>
                                    {this.state.paymentDone && (
                                        <li
                                            className="item"
                                            style={{ whiteSpace: "normal" }}
                                        >
                                            <div
                                                style={{ marginBottom: "10px" }}
                                            >
                                                <b>
                                                    {
                                                        localizationManager
                                                            .strings
                                                            .boardingPoint
                                                    }
                                                    :
                                                </b>
                                            </div>
                                            <div>
                                                {
                                                    this.state.booking
                                                        .start_address
                                                }
                                            </div>
                                        </li>
                                    )}
                                    {this.state.paymentDone && (
                                        <li
                                            className="item"
                                            style={{ whiteSpace: "normal" }}
                                        >
                                            <div
                                                style={{ marginBottom: "10px" }}
                                            >
                                                <b>
                                                    {
                                                        localizationManager
                                                            .strings
                                                            .droppingPoint
                                                    }
                                                    :
                                                </b>
                                            </div>
                                            <div>
                                                {this.state.booking.end_address}
                                            </div>
                                        </li>
                                    )}
                                    {!this.state.paymentDone &&
                                        this.state.booking.cashToBeCollected && (
                                            <li
                                                className="item"
                                                style={{ whiteSpace: "normal" }}
                                            >
                                                <div
                                                    style={{
                                                        marginBottom: "10px"
                                                    }}
                                                >
                                                    <b>
                                                        {
                                                            localizationManager
                                                                .strings
                                                                .cashToBeCollected
                                                        }
                                                        :
                                                    </b>
                                                </div>
                                                <div>
                                                    {
                                                        this.state.booking
                                                            .cashToBeCollected
                                                    }
                                                </div>
                                            </li>
                                        )}
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .duration
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>
                                            {this.state.booking.time_shown}
                                        </div>
                                    </li>
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .paymentMethod
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>
                                            {this.state.booking.paymentMethod}
                                        </div>
                                    </li>
                                    {this.state.paymentDone && (
                                        <li className="item">
                                            <div
                                                style={{ marginBottom: "10px" }}
                                            >
                                                <b>
                                                    {
                                                        localizationManager
                                                            .strings
                                                            .paymentStatus
                                                    }
                                                    :
                                                </b>
                                            </div>
                                            <div>
                                                {
                                                    this.state.booking
                                                        .paymentStatus
                                                }
                                            </div>
                                        </li>
                                    )}
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .totalDistance
                                                }
                                                :{" "}
                                            </b>
                                        </div>
                                        <div>
                                            {this.state.booking.totalDistance /
                                                1000}
                                            {
                                                localizationManager.strings
                                                    .kilimeterShort
                                            }
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                {this.state.booking.paymentMethod == "cash" &&
                                !this.state.paymentDone ? (
                                    <div>
                                        <div className="padding-left padding-right padding-top">
                                            <div style={{ marginTop: 10 }}>
                                                <div className="list">
                                                    <label className="item item-input item-stacked-label">
                                                        <span className="input-label">
                                                            {" "}
                                                            {
                                                                localizationManager
                                                                    .strings
                                                                    .amountReceived
                                                            }
                                                            :{" "}
                                                        </span>
                                                        <input
                                                            name="amountReceived"
                                                            type="number"
                                                            onChange={this.handleChange.bind(
                                                                this
                                                            )}
                                                            value={
                                                                this.state
                                                                    .booking
                                                                    .cashToBeCollected
                                                            }
                                                            placeholder={
                                                                localizationManager
                                                                    .strings
                                                                    .amountReceived
                                                            }
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <LaddaButton
                                                className="button button-block button-energized activated"
                                                loading={this.state.loading}
                                                data-color="##FFFF00"
                                                data-spinner-size={30}
                                                data-size={S}
                                                data-style={SLIDE_UP}
                                                data-spinner-color="#ddd"
                                                data-spinner-lines={12}
                                                onClick={this.paymentReceived}
                                                disabled={
                                                    this.state.showReview
                                                        ? true
                                                        : false
                                                }
                                            >
                                                <i
                                                    className="fa fa-check"
                                                    aria-hidden="true"
                                                />{" "}
                                                {
                                                    localizationManager.strings
                                                        .submit
                                                }
                                            </LaddaButton>
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <CarLoader />
                )}
            </div>
        );
    }
}

export default withRouter(RidePayment);
