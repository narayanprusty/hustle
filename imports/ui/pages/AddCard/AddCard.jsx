import React, { Component } from 'react';
import { notify } from "react-notify-toast";
import Styles from './Styles';
import { Form, Field } from 'react-final-form';
import Card from './Card';
import { formatCreditCardNumber, formatCVC, formatExpirationDate } from './CardUtils';
import { Route } from 'react-router-dom'

export default class AddCard extends Component {

    constructor(props){
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
                    return notify.show("Failed adding card.", "error");
                }
                console.log("info:",res, err);
                if (res.message) { 
                    notify.show(ex.message, "error");
                } else {
                    notify.show("Card added successfully!", "success");
                    this.props.history.push('/app/myCards')
                }
                this.setState({
                    processing: false
                });
            }
        );
    }

    render() {
        return (<div>
                <Styles>
                    <div className="padding-top padding-right padding-left padding-bottom">
                        <h3 className="padding" style={{borderBottomWidth: 1, borderBottomStyle: "solid"}}>
                            <i className="fa fa-plus-square" aria-hidden="true" /> Add new card
                        </h3>
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
                                <center>
                            <form onSubmit={handleSubmit}>
                                <Card
                                number={values.number || ''}
                                name={values.name || ''}
                                expiry={values.expiry || ''}
                                cvc={values.cvc  || ''}
                                focused={active}
                                />
                                <div>
                                <Field
                                    name="number"
                                    component="input"
                                    type="text"
                                    pattern="[\d| ]{16,22}"
                                    placeholder="Card Number"
                                    format={formatCreditCardNumber}
                                />
                                </div>
                                <div>
                                <Field
                                    name="name"
                                    component="input"
                                    type="text"
                                    placeholder="Name"
                                />
                                </div>
                                <div>
                                <Field
                                    name="expiry"
                                    component="input"
                                    type="text"
                                    pattern="\d\d/\d\d"
                                    placeholder="Valid Thru"
                                    format={formatExpirationDate}
                                />
                                </div>
                                <div>
                                <Field
                                    name="cvc"
                                    component="input"
                                    type="text"
                                    pattern="\d{3,4}"
                                    placeholder="CVC"
                                    maxLength="4"
                                    style={{width:'10'}}
                                    format={formatCVC}
                                />
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
                            </center>
                            )
                        }}
                        />
                    </div>
                </Styles>
                </div>);
    }
}