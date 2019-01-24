import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import "../../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";
import { Meteor } from "meteor/meteor";
import moment from 'moment';

import "./RidePayment_client.scss";

class RidePayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rideId: "",
            booking: "",
            loading: false,
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
                return <Redirect to='/app/currentBooking' />;
            }
        }
        else {
            this.props.history.push("/login");
        }
    }

    getBookingInfo = async (rideId) => {
        Meteor.call("getBookingById", rideId, (error, response) => {
            if (error) {
                console.log(error);
                notify.show(
                    error.reason ? error.reason : "Unable to get booking!",
                    "error"
                );
                this.props.history.push('/app/driver/newreqs');
            } else {
                if (response.data && !response.message) {
                    this.setState({ booking: response.data });
                    if (response.data.rideStatus != "completed") {
                        notify.show(
                            "Ride not completed yet!",
                            "error"
                        );
                        this.props.history.push('/app/driver/newreqs');
                    }
                    console.log(this.state.booking);
                }
                else {
                    if (response.message) {
                        notify.show(
                            response.message,
                            "error"
                        );
                        this.props.history.push('/app/driver/newreqs');
                    }
                }
            }
        });
    }

    paymentReceived = async () => {
        console.log(this.state.rideId);
        this.setState({ loading: true });
        Meteor.call("paymentReceived", this.state.rideId, (error, response) => {
            if (error) {
                console.log(error);
                notify.show(
                    error.reason ? error.reason : "Unable to get booking!",
                    "error"
                );
            } else {
                if (response.success && !response.message) {
                    this.props.history.push('/app/driver/newreqs');
                }
                else {
                    if (response.message) {
                        notify.show(
                            response.message,
                            "error"
                        );
                    }
                }
            }
            this.setState({ loading: false });
        });
    }

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
            <div>
                {this.state.booking ? (
                    <div>
                        <div className="item item-avatar">
                            <img src='/images/completed.png' />
                            <h2>{this.state.booking.totalFare + " " + this.state.booking.fareUnit}</h2>
                            <p>{this.state.booking.createdAt ? moment(this.state.booking.createdAt).format("LLL") : "-"}</p>
                        </div>
                        <div className="item item-body">
                            <ul className="list">
                                <li className="item" style={{ whiteSpace: 'normal' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Booking ID:</b>
                                    </div>
                                    <div>
                                        #{this.state.booking.uniqueIdentifier}
                                    </div>
                                </li>
                                <li className="item" style={{ whiteSpace: 'normal' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Boarding Point:</b>
                                    </div>
                                    <div>
                                        {this.state.booking.start_address}
                                    </div>
                                </li>
                                <li className="item" style={{ whiteSpace: 'normal' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Dropping Point:</b>
                                    </div>
                                    <div>
                                        {this.state.booking.end_address}
                                    </div>
                                </li>
                                <li className="item">
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Duration:</b>
                                    </div>
                                    <div>
                                        {this.state.booking.time_shown}
                                    </div>
                                </li>
                                <li className="item">
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Payment Method:</b>
                                    </div>
                                    <div>
                                        {this.state.booking.paymentMethod}
                                    </div>
                                </li>
                                <li className="item">
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Payment Status:</b>
                                    </div>
                                    <div>
                                        {this.state.booking.paymentStatus}
                                    </div>
                                </li>
                                <li className="item">
                                    <div style={{ marginBottom: '10px' }}>
                                        <b>Total Distance: </b>
                                    </div>
                                    <div>
                                        {this.state.booking.totalDistance / 1000}KM
                                        </div>
                                </li>
                                {this.state.booking.paymentMethod == "cash" ? (<li className="item">
                                    <div>
                                        <div className="padding-left padding-right padding-top">
                                            <button
                                                className="button button-block button-energized activated"
                                                onClick={this.paymentReceived}
                                                disabled={this.state.booking.paymentStatus == "pending" && !this.state.loading ? false : true} >
                                                Payment Received
                                                    </button>
                                        </div>
                                    </div>
                                </li>) : ""}
                            </ul>
                        </div>
                    </div>) : loader}
            </div>
        );
    }
}


export default withRouter(RidePayment);