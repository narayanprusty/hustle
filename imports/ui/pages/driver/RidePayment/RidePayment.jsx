import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import "../../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";
import { Meteor } from "meteor/meteor";
import moment from "moment";
import LaddaButton, { S, SLIDE_UP } from "react-ladda";
import localizationManager from "../../../localization";

import "./RidePayment_client.scss";
import Reviews from "../../../components/ReviewComponent/Reviews";

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
                    this.setState({ booking: response.data });
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
        let fare = parseInt(this.state.booking.totalFare.toString());
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
        const loader = (
            <div className="loader" key={0}>
                <svg
                    className="car"
                    width="102"
                    height="40"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g
                        transform="translate(2 1)"
                        stroke="#002742"
                        fill="none"
                        fillRule="evenodd"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path
                            className="car__body"
                            d="M47.293 2.375C52.927.792 54.017.805 54.017.805c2.613-.445 6.838-.337 9.42.237l8.381 1.863c2.59.576 6.164 2.606 7.98 4.531l6.348 6.732 6.245 1.877c3.098.508 5.609 3.431 5.609 6.507v4.206c0 .29-2.536 4.189-5.687 4.189H36.808c-2.655 0-4.34-2.1-3.688-4.67 0 0 3.71-19.944 14.173-23.902zM36.5 15.5h54.01"
                            strokeWidth="3"
                        />
                        <ellipse
                            className="car__wheel--left"
                            strokeWidth="3.2"
                            fill="#FFF"
                            cx="83.493"
                            cy="30.25"
                            rx="6.922"
                            ry="6.808"
                        />
                        <ellipse
                            className="car__wheel--right"
                            strokeWidth="3.2"
                            fill="#FFF"
                            cx="46.511"
                            cy="30.25"
                            rx="6.922"
                            ry="6.808"
                        />
                        <path
                            className="car__line car__line--top"
                            d="M22.5 16.5H2.475"
                            strokeWidth="3"
                        />
                        <path
                            className="car__line car__line--middle"
                            d="M20.5 23.5H.4755"
                            strokeWidth="3"
                        />
                        <path
                            className="car__line car__line--bottom"
                            d="M25.5 9.5h-19"
                            strokeWidth="3"
                        />
                    </g>
                </svg>
            </div>
        );

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
                                        ? moment(
                                              this.state.booking.createdAt
                                          ).format("LLL")
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
                                                            defaultValue={
                                                                this.state
                                                                    .booking
                                                                    .totalFare
                                                            }
                                                            value={
                                                                this.state
                                                                    .amountReceived
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
                    loader
                )}
            </div>
        );
    }
}

export default withRouter(RidePayment);
