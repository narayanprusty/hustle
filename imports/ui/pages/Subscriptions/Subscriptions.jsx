import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter, Link } from "react-router-dom";
import { notify } from "react-notify-toast";
import LaddaButton, { S, SLIDE_UP } from "react-ladda";

class Subscriptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: Meteor.userId(),
            showloader: true,
            gettingPlans: true,
            showPaymentOptions: false,
            showAddCardButton: false,
            cards: [],
            paymentMethod: "",
            showPayNowButton: false,
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
        this.getCards();
    }

    getCards = async () => {
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
                let options = [{
                    text: "Select Card",
                    value: ""
                }];
                for (let i = 0; i < res.cards.length; i++) {
                    options.push({
                        value: res.cards[i].hyperPayId,
                        text: res.cards[i].cardNumber
                    });
                }
                if (options.length > 1) {
                    this.setState({
                        cards: options
                    });
                }
                else {
                    this.setState({
                        showAddCardButton: true
                    });
                }

                console.log("cards loaded", this.state.cards);
            }
        });
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
                            userPlans: response.data ? response.data : [],
                            userAlreadySubscribed: response.data.length > 0,
                        });
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

    onCardSelected = e => {
        if (e.target.value) {
            this.setState({
                paymentMethod: e.target.value,
                showPayNowButton: true,
            });
        }
        else {
            this.setState({
                paymentMethod: e.target.value,
                showPayNowButton: false,
            });
        }
    };

    subscribe = async planId => {
        try {
            this.setState({ userAlreadySubscribed: true, showloader: true });
            Meteor.call(
                "subscribePlan",
                { planId: planId, userId: Meteor.userId(), hyperPayId: this.state.paymentMethod },
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
                            this.getUserSubscriptions();
                            this.setState({
                                userAlreadySubscribed: true,
                            });
                        }
                    }
                    this.setState({
                        userAlreadySubscribed: true,
                        showloader: false,
                        showAddCardButton: false,
                        showPaymentOptions: false,
                    });
                }
            );
        } catch (ex) {
            console.log(ex);
            this.setState({ loading: false });
        }
    };

    cancelSubscription = async () => {
        try {
            if (this.state.userPlans) {
                if (this.state.userPlans.length > 0) {
                    if (this.state.userPlans[0].uniqueIdentifier) {
                        this.setState({
                            showloader: true
                        });
                        Meteor.call("cancelSubscription", this.state.userPlans[0].uniqueIdentifier,
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
                                if (response.success) {
                                    notify.show("Subscription cancelled successfully!", "success");
                                    this.getUserSubscriptions();
                                } else {
                                    notify.show(
                                        response.message
                                            ? response.message
                                            : "Unable to cancel subscription!",
                                        "error"
                                    );
                                }
                            }
                            this.setState({
                                showloader: false
                            });
                        });
                    } else {
                        throw {
                            message: "Unexpected Error Occured!"
                        }
                    }
                } else {
                    throw {
                        message: "Unexpected Error Occured!"
                    }
                }
            } else {
                throw {
                    message: "Unexpected Error Occured!"
                }
            }
        } catch (ex) {
            console.log(ex);
            notify.show(
                ex.message
                    ? ex.message
                    : "Unable to cancel subscription!",
                "error"
            );
            this.setState({
                showloader: true
            });
        }
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
            <div className="" style={{ height: "100%" }}>
                {!this.state.gettingPlans ? (
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
                            {!this.state.userAlreadySubscribed ? (this.state.showAddCardButton ? (
                                    <button
                                        className="button button-block button-energized activated"
                                        onClick={(e) => this.props.history.push('/app/addCards')}
                                    >
                                        Add Card
                                    </button>
                                ) : (
                                        <ul className="list">
                                            <li
                                                className="item"
                                                style={{ 
                                                    whiteSpace: "normal", 
                                                    paddingLeft: '0px',
                                                    paddingRight: '0px'
                                                }}
                                            >
                                                <div>
                                                    <select
                                                        name="paymentMethod"
                                                        value={this.state.paymentMethod}
                                                        onChange={this.onCardSelected}
                                                        style={{
                                                            fontSize: "16px",
                                                            width: "96%"
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
                                                </div>
                                            </li>
                                        </ul>
                                )
                            ) : ""}
                            <div className="">
                            {!this.state.userAlreadySubscribed ? (
                                <LaddaButton
                                    className="button button-block button-energized activated"
                                    loading={this.state.showloader}
                                    disabled={
                                        this.state.userAlreadySubscribed || !this.state.showPayNowButton
                                            ? true
                                            : false
                                    }
                                    data-color="##FFFF00"
                                    data-spinner-size={30}
                                    data-size={S}
                                    data-style={SLIDE_UP}
                                    data-spinner-color="#ddd"
                                    data-spinner-lines={12}
                                    onClick={this.subscribe.bind(
                                        this,
                                        this.state.subscriptionPlan
                                            .uniqueIdentifier
                                    )}
                                >
                                    <i className="fa fa-check" aria-hidden="true"></i> Subscribe
                            </LaddaButton> ) : (
                            <LaddaButton
                            className="button button-block button-assertive activated"
                            loading={this.state.showloader}
                            disabled={
                                !this.state.userAlreadySubscribed
                            }
                            data-color="##FFFF00"
                            data-spinner-size={30}
                            data-size={S}
                            data-style={SLIDE_UP}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                            onClick={this.cancelSubscription.bind(
                                this
                            )}
                        >
                            <i className="fa fa-times" aria-hidden="true"></i> Cancel Subscription
                        </LaddaButton>
                            ) }
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

export default withRouter(Subscriptions);
