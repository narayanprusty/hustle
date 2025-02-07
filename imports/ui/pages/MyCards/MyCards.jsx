import React, { Component } from "react";
import localizationManager from "../../localization/index";
import { notify } from "react-notify-toast";
import { Link } from "react-router-dom";

import "../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";
import "./MyCards_client.scss";
import { Meteor } from "meteor/meteor";
import CarLoader from "../../components/CarLoader/CarLoader";
import config from "../../../modules/config/client";
export default class MyCards extends Component {
    state = {
        hasMoreItems: false
    };

    componentDidMount() {
        this.loadCards();
    }

    loadCards = () => {
        Meteor.call("getCards", (err, res) => {
            if (err) {
                console.log(err);
                return notify.show(
                    localizationManager.strings.failedAddingCard,
                    "error"
                );
            }
            console.log("info:", res, err);
            if (res.message || !res.cards) {
                notify.show(
                    ex.message
                        ? ex.message
                        : localizationManager.strings.unableToLoadCards,
                    "error"
                );
            } else {
                this.setState({
                    cards: res.cards
                });
            }
            this.setState({
                processing: false
            });
        });
    };

    reloadCards = () => {
        this.setState({
            cards: undefined
        });
        this.loadCards();
    };

    checkout = () => {
        Meteor.call("getCheckoutId", (err, res) => {
            if (err) {
                console.log(err);
                // notify.show(localizationManager.strings.failedAddingCard, "error");
            }
            console.log("info:", res, err);
            //https://hustle-pay.gohustleapp.com
            //http://localhost:3001
            if (window.cordova) {
                const win = window.cordova.InAppBrowser.open(
                    `${config.HUSTLE_PAY_BASE}/checkout?id=${
                        res.op.id
                    }&user=${Meteor.userId()}`,
                    "_blank",
                    "location=yes"
                );

                win.addEventListener("loadstop", function(event) {
                    if (
                        event.url &&
                        event.url
                            .split("/")
                            .indexOf("booking.gohustleapp.com") > -1
                    ) {
                        setTimeout(() => {
                            win.close();
                        }, 5000)
                    }
                });
            } else {
                open(
                    `${config.HUSTLE_PAY_BASE}/checkout?id=${
                        res.op.id
                    }&user=${Meteor.userId()}`,
                    "_blank",
                    "location=yes"
                );
            }
        });
    };

    render() {
        const loader = <CarLoader />;

        return (
            <div
                className="padding-top padding-bottom"
                style={{
                    direction: localizationManager.strings.textDirection,
                    overflowX: "hidden"
                }}
            >
                <h3 className="padding  padding-right padding-left">
                    <i className="fa fa-credit-card-alt" aria-hidden="true" />{" "}
                    {localizationManager.strings.yourCards}
                    <i
                        onClick={this.reloadCards}
                        style={{ float: "right" }}
                        className="fa fa-refresh"
                        aria-hidden="true"
                    />{" "}
                </h3>

                <div className="list padding-bottom">
                    {this.state.cards ? (
                        this.state.cards.length > 0 ? (
                            <div className="list">
                                {this.state.cards.map((data, i) => {
                                    return (
                                        <a key={i} className="item" href="#">
                                            <h2>{data.cardNumber || ""}</h2>
                                            <p>
                                                {data.nameOnCard || ""} -{" "}
                                                {data.expiry || ""}
                                            </p>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="padding-left padding-right">
                                <h4>
                                    {
                                        localizationManager.strings
                                            .noCardsAvailable
                                    }
                                </h4>
                            </div>
                        )
                    ) : (
                        loader
                    )}
                </div>
                <div className="padding-left padding-right">
                    <a
                        onClick={this.checkout}
                        className="button button-block button-positive"
                    >
                        <i className="icon fa fa-plus" />{" "}
                        {localizationManager.strings.addCards}
                    </a>
                </div>
            </div>
        );
    }
}
