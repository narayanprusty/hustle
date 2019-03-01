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
                    notify.show(localizationManager.strings.failedAddingCard, "error");
                }
                console.log("info:", res, err);
                if (res) {
                    if (res.message || !res.success) {
                        notify.show(res.message ? res.message : localizationManager.strings.failedAddingCard, "error");
                    } else {
                        notify.show(localizationManager.strings.cardAdded, "success");
                        this.props.history.push('/app/myCards')
                    }
                }
                else {
                    notify.show(localizationManager.strings.failedAddingCard, "error");
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
                    <i className="fa fa-plus-square" aria-hidden="true" /> {localizationManager.strings.addNewCard} </h3>
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
                                                        {localizationManager.strings.cardNumber}:{" "}
                                                    </span>
                                                    <Field
                                                        name="number"
                                                        component="input"
                                                        type="text"
                                                        pattern="[\d| ]{16,22}"
                                                        placeholder={localizationManager.strings.cardNumber}
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
                                                        {localizationManager.strings.nameOnTheCard}:{" "}
                                                    </span>
                                                    <Field
                                                        name="name"
                                                        component="input"
                                                        type="text"
                                                        placeholder={localizationManager.strings.name}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="list">
                                                <label className="item item-input item-stacked-label">
                                                    <span className="input-label">
                                                        {" "}
                                                        {localizationManager.strings.cardExpiry}:{" "}
                                                    </span>
                                                    <Field
                                                        name="expiry"
                                                        component="input"
                                                        type="text"
                                                        pattern="\d\d/\d\d"
                                                        placeholder={localizationManager.strings.validThru}
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
                                                        {localizationManager.strings.cvv}:{" "}
                                                    </span>
                                                    <Field
                                                        name="cvc"
                                                        component="input"
                                                        type="text"
                                                        pattern="\d{3,4}"
                                                        placeholder={localizationManager.strings.cvv}
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
                                                    <i className="fa fa-check" aria-hidden="true"></i> {localizationManager.strings.submit}
                                                </LaddaButton>
                                            </div>
                                            {/* <button type="submit" disabled={submitting} className="button button-block button-balanced activated">
                                            <i class="fa fa-check" aria-hidden="true"></i> Submit
                                            </button> */}
                                            <div className="padding-left padding-right padding-top">
                                                <button className="button button-block button-stable activated"
                                                    type="button"
                                                    onClick={reset}
                                                    disabled={submitting || pristine || this.state.processing} > <i className="fa fa-minus" aria-hidden="true"></i>{localizationManager.strings.reset}</button>
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