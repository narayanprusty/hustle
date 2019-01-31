import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter, Link } from "react-router-dom";
import { notify } from "react-notify-toast";

class Subscriptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: Meteor.userId(),
            showloader: true
        };
        const driverMode = localStorage.getItem("driverMode");
        if (driverMode) {
            this.props.history.push("/app/driver/newreqs");
        }
        this.getAllPlans = this.getAllPlans.bind(this);
        this.getUserSubscriptions = this.getUserSubscriptions.bind(this);
    }

    componentDidMount() {
        this.getUserSubscriptions();
        this.getAllPlans();
    }

    getUserSubscriptions = async () => {
        Meteor.call(
            "getUserSubscriptions",
            Meteor.userId(),
            (error, response) => {
                if (error) {
                    console.log(error);
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : "Unable to get subscriptions!",
                        "error"
                    );
                } else {
                    if (response.success && !response.message) {
                        this.setState({
                            userPlans: response.data ? response.data : []
                        });
                        if (this.state.userPlans.length > 0) {
                            this.setState({ userAlreadySubscribed: true });
                        }
                    } else {
                        if (response.message) {
                            //Add localization support
                            notify.show(response.message, "error");
                        }
                    }
                }
                this.setState({ showloader: false });
            }
        );
    };

    getAllPlans = async () => {
        this.setState({ gettingPlans: true });
        Meteor.call("getSubscriptionPlans", {}, (error, response) => {
            if (error) {
                console.log(error);
                //Add localization support
                notify.show(
                    error.reason ? error.reason : "Unable to get plans!",
                    "error"
                );
            } else {
                if (response.success && !response.message) {
                    this.setState({ subscriptionPlan: response.data[0] });
                } else {
                    if (response.message) {
                        //Add localization support
                        notify.show(response.message, "error");
                    }
                }
            }
            this.setState({ gettingPlans: false });
        });
    };

    subscribe = async planId => {
        try {
            this.setState({ userAlreadySubscribed: true, showloader: true });
            Meteor.call(
                "subscribePlan",
                { planId: planId, userId: Meteor.userId() },
                (error, response) => {
                    if (error) {
                        console.log(error);
                        //Add localization support
                        notify.show(
                            error.reason
                                ? error.reason
                                : "Unable to subscribe!",
                            "error"
                        );
                    } else {
                        if (!response.success) {
                            if (response.message) {
                                //Add localization support
                                notify.show(response.message, "error");
                            }
                        } else {
                            notify.show("Plan Subscribed!", "success");
                        }
                    }
                    this.setState({
                        userAlreadySubscribed: false,
                        showloader: false
                    });
                }
            );
        } catch (ex) {
            console.log(ex);
            this.setState({ loading: false });
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
            <div className="" style={{ height: "100%" }}>
                {!this.state.showloader && !this.state.gettingPlans ? (
                    <div>
                        <div className="padding">
                            <h3 className="padding">
                                <i className="fa fa-cog" aria-hidden="true" />{" "}
                                Subscription
                            </h3>
                        </div>
                        <div className="item item-body" style={{border: "none"}}>
                            <ul className="list">
                                <li
                                    className="item"
                                    style={{ whiteSpace: "normal" }}
                                >
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>Price</b>
                                    </div>
                                    <div>
                                        ${this.state.subscriptionPlan.price}
                                    </div>
                                </li>
                                <li
                                    className="item"
                                    style={{ whiteSpace: "normal" }}
                                >
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>Renewable</b>
                                    </div>
                                    <div>
                                        After {this.state.subscriptionPlan.validity}{" "}
                                        days
                                    </div>
                                </li>
                                <li
                                    className="item"
                                    style={{ whiteSpace: "normal" }}
                                >
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>Description</b>
                                    </div>
                                    <div>
                                        {
                                            this.state.subscriptionPlan
                                                .description
                                        }
                                    </div>
                                </li>
                            </ul>
                            <button
                                className="button button-block button-energized activated"
                                onClick={this.subscribe.bind(
                                    this,
                                    this.state.subscriptionPlan
                                        .uniqueIdentifier
                                )}
                                disabled={
                                    this.state.userAlreadySubscribed
                                        ? true
                                        : false
                                }
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                ) : (
                    loader
                )}
            </div>
        );
    }
}

export default withRouter(Subscriptions);
