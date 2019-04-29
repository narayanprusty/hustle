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

    componentDidMount() {
        this.processIt();
    }

    processIt = async () => {
        this.setState({ processing: true });
        const quries = queryString(this.props.location.search);
        const op = {
            success: true,
            result: {
                description:
                    "successfully processed, \nplease wait this window will close automatically."
            },
            id: quries.id
        };
        Meteor.call(
            "addCard",
            op,
            quries.user,
            decodeURIComponent(quries.resourcePath),
            (err, data) => {
                console.log(err, data);
                if (err) {
                    this.setState({
                        finished: true,
                        message:
                            "we cannot process your card, please try again later."
                    });
                    self.close();
                } else {
                    if (data.success) {
                        this.setState({ finished: true });
                        self.close();
                    } else {
                        this.setState({
                            finished: true,
                            errorMessage: data.message
                        });
                        self.close();
                    }
                }
            }
        );
    };

    render() {
        return (
            <div style={{ textAlign: "center" }}>
                <p>{this.state.message ? this.state.message : "Hi,"}</p>
                {this.state.finished
                    ? "please close this window manually. incase not closed automatically!"
                    : this.state.processing
                    ? "we are processing your card please wait....\n dont close the window."
                    : "please click next to proceed"}
                <br />
                {this.state.errorMessage ? this.state.errorMessage : ""}
                <p>
                    incase any amount deducted by the system will be refunded
                    within 1-5 business days.
                </p>
            </div>
        );
    }
}
