import React, { Component } from "react";
import queryString from "stringquery";
// import { Form, Field } from 'react-final-form';
// import Card from './Card';
// import { formatCreditCardNumber, formatCVC, formatExpirationDate } from './CardUtils';
// import LaddaButton, { S, SLIDE_UP } from "react-ladda";
// import { Route } from 'react-router-dom'
import localizationManager from "../../localization/index";
import { Meteor } from "meteor/meteor";

// import "./AddCard_client.scss";

export default class AcceptCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            finished: false
        };
    }
    processIt = () => {
        this.setState({ processing: true });
        const quries = queryString(this.props.location.search);
        const data = {
            expiry: "02/21",
            number: "400555" + Date.now(),
            cvc: "123",
            name: "Mario"
        };
        const op = {
            success: true,
            result: {
                description: "successfully processed"
            },
            id: quries.id
        };
        Meteor.call(
            "addCard",
            data,
            op,
            quries.user,
            decodeURIComponent(quries.resourcePath),
            (err, data) => {
                this.setState({ finished: true });
                if (err) {
                    this.setState({
                        message:
                            "we cnnot process your card, please try again later."
                    });
                }
            }
        );
    };

    render() {
        return (
            <div>
                <p>{this.state.message ? this.state.message : "Hi,"}</p>
                {this.state.finished
                    ? "please close this window."
                    : this.state.processing
                    ? "we are processing your card please wait....\n dont close the window."
                    : "please click next to proceed"}
                {!this.state.processing && (
                    <p>
                        <button onClick={this.processIt}>Next</button>
                    </p>
                )}
            </div>
        );
    }
}
