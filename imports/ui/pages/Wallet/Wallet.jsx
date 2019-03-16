import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withRouter, Link } from "react-router-dom";
import { notify } from "react-notify-toast";
import LaddaButton, { S, SLIDE_UP } from "react-ladda";
import localizationManager from "../../localization";
import moment from 'moment';

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
            showPayNowButton: false,
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
        Meteor.call(
            "getUserWallet",
            Meteor.userId(),
            (error, response) => {
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
            }
        );
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
            <div className="" style={{ height: "100%", direction: localizationManager.strings.textDirection }}>
                {!this.state.showloader ? (
                    <div>
                        <div className="padding">
                            <h3 className="padding">
                                <i className="fa fa-money" aria-hidden="true" />{" "}
                                {localizationManager.strings.wallet}
                            </h3>
                        </div>
                        <div>
                            <div className="padding-left padding-right">
                                <center className='background-colorful-wallet padding-top padding-bottom'>
                                    <h4 style={{color: 'white', marginTop: '10px', marginBottom: '0px'}}>Balance:</h4>
                                    <h2 style={{color: 'white', marginTop: '0px'}}>{this.state.wallet.balance} SAR</h2>
                                </center>
                            </div>
                            <br />
                            <div className="item item-divider">
                                {localizationManager.strings.history}
                            </div>
                            <div className="item item-body" style={{border: "none"}}>
                                <ul className="list">
                                {
                                    !this.state.transactions || this.state.transactions.length == 0 ?
                                    "No Transactions to display!" : (
                                        this.state.transactions.map((txn, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    className="item"
                                                    style={{ whiteSpace: "normal" }}
                                                >
                                                    <div style={{color:txn.type == "Debit" ? "red" : "green"}}>
                                                        {txn.type == "Debit" ? "- " : "+ "}{txn.amount} SAR
                                                    </div>
                                                    <div>
                                                        {moment(new Date(txn.timestamp)).fromNow()}
                                                    </div>
                                                </li>
                                            );
                                        })
                                    )
                                }
                                </ul>
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

export default withRouter(Wallet);
