import React, { Component } from 'react';
import { notify } from "react-notify-toast";
import { Form, Field } from 'react-final-form';
import Card from './Card';
import { formatCreditCardNumber, formatCVC, formatExpirationDate } from './CardUtils';
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

        return (<div>
            <div className="padding-top padding-right padding-left padding-bottom">
            {/* style={{ borderBottomWidth: 1, borderBottomStyle: "solid", alignContent: "left" }} */}
                <h3 className="padding">
                    <i className="fa fa-plus-square" aria-hidden="true" /> Add new card
                        </h3>
                {!this.state.processing ? (
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
                                            <button type="submit" disabled={submitting} className="button button-block button-energized activated">
                                                Submit
                                </button>
                                            <button className="button button-block button-energized activated"
                                                type="button"
                                                onClick={reset}
                                                disabled={submitting || pristine} > Reset </button>
                                        </div>
                                    </form>
                                </div>
                            )
                        }}
                    />)
                    : loader}
            </div>
        </div>);
    }
}