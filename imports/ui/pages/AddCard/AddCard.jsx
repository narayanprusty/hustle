import React, { Component } from 'react';
import { notify } from "react-notify-toast";
// import { Form, Field } from 'react-final-form';
// import Card from './Card';
// import { formatCreditCardNumber, formatCVC, formatExpirationDate } from './CardUtils';
// import LaddaButton, { S, SLIDE_UP } from "react-ladda";
// import { Route } from 'react-router-dom'
import localizationManager from "../../localization/index";

// import "./AddCard_client.scss";

export default class AddCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            processing: false,
        };
    }

    componentDidMount() {
        this.checkout();
        // function (responseData) {
        //     console.log(responseData);
        //     this.setState({
        //         checkoutId: responseData.data.id,
        //         loading: false
        //     })
        // }
    }

    checkout = () => {
        this.setState({
            loading: true
        });

        Meteor.call(
            "getCheckoutId",
            (err, res) => {
                if (err) {
                    console.log(err);
                    // notify.show(localizationManager.strings.failedAddingCard, "error");
                }
                console.log("info:", res, err);
                this.setState({
                    loading: false,
                    checkoutId: res.op.id
                });
            }
        );
    }

    // onSubmit = async values => {
    //     this.setState({
    //         processing: true
    //     });
    //     Meteor.call(
    //         "addCard",
    //         values,
    //         (err, res) => {
    //             if (err) {
    //                 console.log(err);
    //                 notify.show(localizationManager.strings.failedAddingCard, "error");
    //             }
    //             console.log("info:", res, err);
    //             if (res) {
    //                 if (res.message || !res.success) {
    //                     notify.show(res.message ? res.message :
    //                         localizationManager.strings.failedAddingCard, "error");
    //                 } else {
    //                     notify.show(localizationManager.strings.cardAdded, "success");
    //                     this.props.history.push('/app/myCards')
    //                 }
    //             }
    //             else {
    //                 notify.show(localizationManager.strings.failedAddingCard, "error");
    //             }
    //             this.setState({
    //                 processing: false
    //             });
    //         }
    //     );
    // }

    renderPaymentform = () => {
        /*console.log('Loading ')
        const script = document.createElement("script");

        console.log(this.state.checkoutId)

        script.src = `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${this.state.checkoutId}`;
        script.async = true;

        document.head.appendChild(script);*/

        /*const form = document.createElement("form")
        form.action = "http://localhost:3000/result";
        form.setAttribute("class", "paymentWidgets");
        form.setAttribute("data-brands", "VISA MASTER AMEX")
        document.getElementById("checkoutFormDiv").appendChild(form);*/
    }

    render() {
        return (<div>
            <div className="padding-top padding-right padding-left padding-bottom" style={{ direction: localizationManager.strings.textDirection }}>
                {/* style={{ borderBottomWidth: 1, borderBottomStyle: "solid", alignContent: "left" }} */}
                <h3 className="padding">
                    <i className="fa fa-plus-square" aria-hidden="true" />
                    &nbsp; {localizationManager.strings.addNewCard} </h3>
                <div id="checkoutFormDiv">
                {
                    !this.state.loading && this.state.checkoutId ?
                        (
                            <div>
                                {this.renderPaymentform()}
                            </div>
                        ) : (
                            <div> Still Loading</div>
                        )
                }
                </div>
            </div>
        </div>);
    }
}