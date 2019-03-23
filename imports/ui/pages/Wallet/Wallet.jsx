import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter, Link } from "react-router-dom";
import { notify } from "react-notify-toast";
import localizationManager from "../../localization";
import moment from "moment";
import "moment/locale/ar";

import CarLoader from "../../components/CarLoader/CarLoader";

class Wallet extends Component {
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
        if (driverMode) {
            this.props.history.push("/app/driver/newreqs");
        }
        this.getUserWallet = this.getUserWallet.bind(this);
    }

    componentDidMount() {
        this.getUserWallet();
    }

    getUserWallet = async () => {
        Meteor.call("getUserWallet", Meteor.userId(), (error, response) => {
            console.log(response, error);
            if (error) {
                console.log(error);
                //Add localization support
                notify.show(
                    error.reason
                        ? error.reason
                        : localizationManager.strings.unableToGetWallet,
                    "error"
                );
            } else {
                if (response.success && !response.message) {
                    this.setState({
                        wallet: response.wallet,
                        transactions: response.wallet.transactions.reverse()
                    });
                } else {
                    if (response.message) {
                        //Add localization support
                        notify.show(response.message, "error");
                    }
                }
            }
            this.setState({ showloader: false });
        });
    };

    render() {
        return (
            <div
                className=""
                style={{
                    height: "100%",
                    direction: localizationManager.strings.textDirection
                }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-money" aria-hidden="true" />{" "}
                        {localizationManager.strings.wallet}
                    </h3>
                </div>
                {!this.state.showloader ? (
                    <div>
                        <div className="padding-left padding-right">
                            <center className="background-colorful-wallet padding-top padding-bottom">
                                <h4
                                    style={{
                                        color: "white",
                                        marginTop: "10px",
                                        marginBottom: "0px"
                                    }}
                                >
                                    {localizationManager.strings.balance}:
                                </h4>
                                <h2
                                    style={{
                                        color: "white",
                                        marginTop: "0px"
                                    }}
                                >
                                    {this.state.wallet.balance} SAR
                                </h2>
                            </center>
                        </div>
                        <br />
                        <div className="item item-divider">
                            {localizationManager.strings.history}
                        </div>
                        <div
                            className="item item-body"
                            style={{ border: "none" }}
                        >
                            <ul className="list">
                                {!this.state.transactions ||
                                this.state.transactions.length == 0
                                    ? "No Transactions to display!"
                                    : this.state.transactions.map((txn, i) => {
                                          return (
                                              <li
                                                  key={i}
                                                  className="item"
                                                  style={{
                                                      whiteSpace: "normal"
                                                  }}
                                              >
                                                  <div
                                                      style={{
                                                          color:
                                                              txn.type ==
                                                              "Debit"
                                                                  ? "red"
                                                                  : "green"
                                                      }}
                                                  >
                                                      {txn.type == "Debit"
                                                          ? "- "
                                                          : "+ "}
                                                      {txn.amount} SAR
                                                  </div>
                                                  <div>
                                                      {moment(
                                                          new Date(
                                                              txn.timestamp
                                                          )
                                                      )
                                                          .locale(
                                                              localizationManager.getLanguage()
                                                          )
                                                          .fromNow()}
                                                  </div>
                                              </li>
                                          );
                                      })}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <CarLoader />
                )}
            </div>
        );
    }
}

export default withRouter(Wallet);
