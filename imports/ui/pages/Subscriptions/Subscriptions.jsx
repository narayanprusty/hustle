import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter, Link } from "react-router-dom";
import { notify } from "react-notify-toast";
import LaddaButton, { S, SLIDE_UP } from "react-ladda";
import localizationManager from "../../localization";
import Modal from "react-responsive-modal";
import CarLoader from "../../components/CarLoader/CarLoader";

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
            showPayNowButton: false
        };
        const driverMode = localStorage.getItem("driverMode");
        if (!driverMode) {
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
                let options = [
                    {
                        text: "Select Card",
                        value: ""
                    }
                ];
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
                } else {
                    this.setState({
                        showAddCardButton: true
                    });
                }

                console.log("cards loaded", this.state.cards);
            }
        });
    };

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
                            : localizationManager.strings
                                  .unableToGetSubscriptions,
                        "error"
                    );
                } else {
                    if (response.success && !response.message) {
                        this.setState({
                            userPlans: response.data ? response.data : [],
                            userAlreadySubscribed: response.data.length > 0,
                            renew:
                                response.data.length > 0
                                    ? response.data[0].renew
                                        ? true
                                        : false
                                    : true,
                            paymentMethod:
                                response.data.length > 0
                                    ? response.data[0].hyperPayId
                                        ? response.data[0].hyperPayId
                                        : ""
                                    : ""
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
                    error.reason
                        ? error.reason
                        : localizationManager.strings.unableToGetPlans,
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
                showPayNowButton: true
            });
        } else {
            this.setState({
                paymentMethod: e.target.value,
                showPayNowButton: false
            });
        }
    };

    subscribe = async planId => {
        try {
            this.setState({ userAlreadySubscribed: true, showloader: true });
            Meteor.call(
                "subscribePlan",
                {
                    planId: planId,
                    userId: Meteor.userId(),
                    hyperPayId: this.state.paymentMethod
                },
                (error, response) => {
                    if (error) {
                        console.log(error);
                        //Add localization support
                        notify.show(
                            error.reason
                                ? error.reason
                                : localizationManager.strings.unableToSubscribe,
                            "error"
                        );
                    } else {
                        if (!response.success) {
                            if (response.message) {
                                //Add localization support
                                notify.show(response.message, "error");
                            }
                        } else {
                            notify.show(
                                localizationManager.strings.planSubscribed,
                                "success"
                            );
                            this.onOpenModal();
                            this.getUserSubscriptions();
                            this.setState({
                                userAlreadySubscribed: true
                            });
                        }
                    }
                    this.setState({
                        userAlreadySubscribed: true,
                        showloader: false,
                        showAddCardButton: false,
                        showPaymentOptions: false
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
                        Meteor.call(
                            "cancelSubscription",
                            this.state.userPlans[0].uniqueIdentifier,
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
                                        notify.show(
                                            localizationManager.strings
                                                .subscriptionCancelled,
                                            "success"
                                        );
                                        this.getUserSubscriptions();
                                    } else {
                                        notify.show(
                                            response.message
                                                ? response.message
                                                : localizationManager.strings
                                                      .unableToCancelSubscription,
                                            "error"
                                        );
                                    }
                                }
                                this.setState({
                                    showloader: false
                                });
                            }
                        );
                    } else {
                        throw {
                            message: localizationManager.strings.unexpectedError
                        };
                    }
                } else {
                    throw {
                        message: localizationManager.strings.unexpectedError
                    };
                }
            } else {
                throw {
                    message: localizationManager.strings.unexpectedError
                };
            }
        } catch (ex) {
            console.log(ex);
            notify.show(
                ex.message
                    ? ex.message
                    : localizationManager.strings.unableToCancelSubscription,
                "error"
            );
            this.setState({
                showloader: true
            });
        }
    };

    reSubscribe = async () => {
        try {
            if (this.state.userPlans) {
                if (this.state.userPlans.length > 0) {
                    if (this.state.userPlans[0].uniqueIdentifier) {
                        this.setState({
                            showloader: true
                        });
                        Meteor.call(
                            "reSubscribe",
                            this.state.userPlans[0].uniqueIdentifier,
                            (error, response) => {
                                if (error) {
                                    console.log(error);
                                    //Add localization support
                                    notify.show(
                                        error.reason
                                            ? error.reason
                                            : localizationManager.strings
                                                  .unabbleToReSubscribe,
                                        "error"
                                    );
                                } else {
                                    if (response.success) {
                                        notify.show(
                                            localizationManager.strings
                                                .reSubscribed,
                                            "success"
                                        );
                                        this.getUserSubscriptions();
                                    } else {
                                        notify.show(
                                            response.message
                                                ? response.message
                                                : localizationManager.strings
                                                      .unabbleToReSubscribe,
                                            "error"
                                        );
                                    }
                                }
                                this.setState({
                                    showloader: false
                                });
                            }
                        );
                    } else {
                        throw {
                            message: localizationManager.strings.unexpectedError
                        };
                    }
                } else {
                    throw {
                        message: localizationManager.strings.unexpectedError
                    };
                }
            } else {
                throw {
                    message: localizationManager.strings.unexpectedError
                };
            }
        } catch (ex) {
            console.log(ex);
            notify.show(
                ex.message
                    ? ex.message
                    : localizationManager.strings.unabbleToReSubscribe,
                "error"
            );
            this.setState({
                showloader: true
            });
        }
    };

    onOpenModal = () => {
        this.setState({ showWindow: true });
    };

    onCloseModal = () => {
        this.setState({ showWindow: false });
    };

    render() {
        const loader = <CarLoader />;

        return (
            <div
                className=""
                style={{
                    height: "100%",
                    direction: localizationManager.strings.textDirection
                }}
            >
                <Modal
                    open={this.state.showWindow}
                    onClose={this.onCloseModal.bind(this)}
                    center
                >
                    <div>
                        <center>
                            <img src={"/images/subscribe.png"} />
                        </center>
                        <h3>{localizationManager.strings.welcomeMessage}</h3>
                    </div>
                </Modal>
                {!this.state.gettingPlans ? (
                    <div>
                        <div className="padding">
                            <h3 className="padding">
                                <i className="fa fa-cog" aria-hidden="true" />{" "}
                                {localizationManager.strings.subscription}
                            </h3>
                        </div>
                        <div
                            className="item item-body"
                            style={{ border: "none" }}
                        >
                            <ul className="list">
                                <li
                                    className="item"
                                    style={{ whiteSpace: "normal" }}
                                >
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>
                                            {localizationManager.strings.price}
                                        </b>
                                    </div>
                                    <div>
                                        {this.state.subscriptionPlan.price} SAR
                                    </div>
                                </li>
                                <li
                                    className="item"
                                    style={{ whiteSpace: "normal" }}
                                >
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>
                                            {
                                                localizationManager.strings
                                                    .renewable
                                            }
                                        </b>
                                    </div>
                                    <div>
                                        {localizationManager.strings.after}{" "}
                                        {this.state.subscriptionPlan.validity}{" "}
                                        {localizationManager.strings.days}
                                    </div>
                                </li>
                                <li
                                    className="item"
                                    style={{ whiteSpace: "normal" }}
                                >
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>
                                            {
                                                localizationManager.strings
                                                    .description
                                            }
                                        </b>
                                    </div>
                                    <div>
                                        {this.state.subscriptionPlan.desDetails}
                                    </div>
                                </li>
                            </ul>
                            {this.state.showAddCardButton ? (
                                <button
                                    disabled={this.state.userAlreadySubscribed}
                                    className="button button-block button-energized activated"
                                    onClick={e =>
                                        this.props.history.push("/app/addCards")
                                    }
                                >
                                    {localizationManager.strings.addCards}
                                </button>
                            ) : (
                                <ul className="list">
                                    <li
                                        className="item"
                                        style={{
                                            whiteSpace: "normal",
                                            paddingLeft: "0px",
                                            paddingRight: "0px"
                                        }}
                                    >
                                        <div>
                                            <select
                                                disabled={
                                                    this.state
                                                        .userAlreadySubscribed
                                                }
                                                name="paymentMethod"
                                                value={this.state.paymentMethod}
                                                onChange={this.onCardSelected}
                                                style={{
                                                    fontSize: "16px",
                                                    width: "96%"
                                                }}
                                            >
                                                {this.state.cards.map(
                                                    (card, i) => (
                                                        <option
                                                            value={card.value}
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
                                        </div>
                                    </li>
                                </ul>
                            )}
                            <div className="">
                                {!this.state.userAlreadySubscribed ? (
                                    <LaddaButton
                                        className="button button-block button-energized activated"
                                        loading={this.state.showloader}
                                        disabled={
                                            this.state.userAlreadySubscribed ||
                                            !this.state.showPayNowButton
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
                                        <i
                                            className="fa fa-check"
                                            aria-hidden="true"
                                        />{" "}
                                        {localizationManager.strings.subscribe}
                                    </LaddaButton>
                                ) : this.state.renew ? (
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
                                        <i
                                            className="fa fa-times"
                                            aria-hidden="true"
                                        />{" "}
                                        {
                                            localizationManager.strings
                                                .cancelSubscription
                                        }
                                    </LaddaButton>
                                ) : (
                                    <LaddaButton
                                        className="button button-block button-calm activated"
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
                                        onClick={this.reSubscribe.bind(this)}
                                    >
                                        <i
                                            className="fa fa-refresh"
                                            aria-hidden="true"
                                        />{" "}
                                        {
                                            localizationManager.strings
                                                .reSubscribe
                                        }
                                    </LaddaButton>
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

export default withRouter(Subscriptions);
