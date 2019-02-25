import React, { Component } from 'react';
import { notify } from "react-notify-toast";
import { Form, Field } from 'react-final-form';
import Card from './Card';
import { formatCreditCardNumber, formatCVC, formatExpirationDate } from './CardUtils';
import LaddaButton, { S, SLIDE_UP } from "react-ladda";
import { Route } from 'react-router-dom'
import localizationManager from "../../localization/index";

import "./AddCard_client.scss";

export default class AddCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            processing: false,
        };
    }

    onSubmit = async values => {
        this.setState({
            processing: true
        });
        Meteor.call(
            "addCard",
            values,
            (err, res) => {
                if (err) {
                    console.log(err);
                    notify.show("Failed adding card.", "error");
                }
                console.log("info:", res, err);
                if (res) {
                    if (res.message || !res.success) {
                        notify.show(res.message ? res.message : "Failed adding card.", "error");
                    } else {
                        notify.show("Card added successfully!", "success");
                        this.props.history.push('/app/myCards')
                    }
                }
                else {
                    notify.show("Failed adding card.", "error");
                }
                this.setState({
                    processing: false
                });
            }
        );
    }
    render() {
        return (<div>
            <div className="padding-top padding-right padding-left padding-bottom">
            {/* style={{ borderBottomWidth: 1, borderBottomStyle: "solid", alignContent: "left" }} */}
                <h3 className="padding">
                    <i className="fa fa-plus-square" aria-hidden="true" /> Add new card </h3>
                    <Form
                        onSubmit={this.onSubmit}
                        render={({
                            handleSubmit,
                            reset,
                            submitting,
                            pristine,
                            values,
                            active
                        }) => {
                            return (
                                <div className="list padding-bottom">
                                    <form onSubmit={handleSubmit}>
                                        <Card
                                            number={values.number || ''}
                                            name={values.name || ''}
                                            expiry={values.expiry || ''}
                                            cvc={values.cvc || ''}
                                            focused={active}
                                        />
                                        <div style={{marginTop: 10}}>
                                            <div className="list">
                                                <label className="item item-input item-stacked-label">
                                                    <span className="input-label">
                                                        {" "}
                                                        {
                                                            "Card Number"
                                                        }:{" "}
                                                    </span>
                                                    <Field
                                                        name="number"
                                                        component="input"
                                                        type="text"
                                                        pattern="[\d| ]{16,22}"
                                                        placeholder="Card Number"
                                                        format={formatCreditCardNumber}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="list">
                                                <label className="item item-input item-stacked-label">
                                                    <span className="input-label">
                                                        {" "}
                                                        {
                                                            "Name on the card"
                                                        }:{" "}
                                                    </span>
                                                    <Field
                                                        name="name"
                                                        component="input"
                                                        type="text"
                                                        placeholder="Name"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="list">
                                                <label className="item item-input item-stacked-label">
                                                    <span className="input-label">
                                                        {" "}
                                                        {
                                                            "Card expiry"
                                                        }:{" "}
                                                    </span>
                                                    <Field
                                                        name="expiry"
                                                        component="input"
                                                        type="text"
                                                        pattern="\d\d/\d\d"
                                                        placeholder="Valid Thru"
                                                        format={formatExpirationDate}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="list">
                                                <label className="item item-input item-stacked-label">
                                                    <span className="input-label">
                                                        {" "}
                                                        {
                                                            "CVV"
                                                        }:{" "}
                                                    </span>
                                                    <Field
                                                        name="cvc"
                                                        component="input"
                                                        type="text"
                                                        pattern="\d{3,4}"
                                                        placeholder="CVV"
                                                        maxLength="4"
                                                        style={{ width: '10' }}
                                                        format={formatCVC}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="buttons">
                                            <div className="padding-left padding-right padding-top">
                                                <LaddaButton
                                                    className="button button-block button-energized activated"
                                                    loading={this.state.processing}
                                                    data-color="##FFFF00"
                                                    data-spinner-size={30}
                                                    data-size={S}
                                                    data-style={SLIDE_UP}
                                                    data-spinner-color="#ddd"
                                                    data-spinner-lines={12}
                                                    type="submit"
                                                >
                                                    <i className="fa fa-check" aria-hidden="true"></i> Submit
                                                </LaddaButton>
                                            </div>
                                            {/* <button type="submit" disabled={submitting} className="button button-block button-balanced activated">
                                            <i class="fa fa-check" aria-hidden="true"></i> Submit
                                            </button> */}
                                            <div className="padding-left padding-right padding-top">
                                                <button className="button button-block button-stable activated"
                                                    type="button"
                                                    onClick={reset}
                                                    disabled={submitting || pristine || this.state.processing} > <i className="fa fa-minus" aria-hidden="true"></i> Reset</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )
                        }}
                    />
            </div>
        </div>);
    }
}