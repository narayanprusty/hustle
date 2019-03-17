import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import Rating from "react-rating";

import LaddaButton, { L, SLIDE_UP } from "react-ladda";

import localizationManager from "../../localization";

class Reviews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rating: 0
        };
    }
    onReviewSubmit = () => {
        this.setState({
            review_loader: true
        });
        /**
         * In case of Driver we rate rider,
         * & for rider we rate driver
         */
        Meteor.call(
            this.props.type != "rider" ? "rateRider" : "rateDriver",
            {
                [this.props.type != "rider" ? "riderId" : "driverId"]: this
                    .props.userId,
                message: this.state.reviewMessage,
                rateVal: this.state.rating
            },
            (err, updated) => {
                if (err) {
                    this.setState({
                        review_loader: false
                    });
                    notify.show(
                        err.reason ||
                            localizationManager.strings.failedToUpdateReview,
                        "error"
                    );
                }
                this.setState({
                    review_loader: false
                });
                notify.show(
                    localizationManager.strings.reviewSubmitted,
                    "success"
                );
                this.props.history.push(
                    this.props.type == "rider" ? "/app" : "/app/driver/newreqs"
                );
            }
        );
    };

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };
    onRate = value => {
        this.setState({
            rating: value
        });
    };

    render() {
        return (
            <div>
                {!this.props.userId && !this.props.type && (
                    <div>{localizationManager.strings.loading}</div>
                )}
                {this.props.userId && this.props.type && (
                    <div
                        className="card padding-bottom card"
                        style={{
                            marginLeft: "0px",
                            marginRight: "0px"
                        }}
                    >
                        <div className="item item-divider">
                            {this.props.type == "rider"
                                ? localizationManager.strings.rateRider
                                : localizationManager.strings.rateDriver}
                        </div>
                        <div className="item item-text-wrap">
                            <div
                                style={{
                                    textAlign: "center"
                                }}
                            >
                                <Rating
                                    name="rating"
                                    {...this.props}
                                    start={0}
                                    stop={5}
                                    initialRating={this.state.rating}
                                    emptySymbol="fa fa-star-o fa-2x empty"
                                    fullSymbol="fa fa-star fa-2x full"
                                    onChange={rate => this.onRate(rate)}
                                    style={{
                                        fontSize: "200%"
                                    }}
                                />
                            </div>
                            <div className="padding-top padding-left padding-right">
                                <textarea
                                    style={{
                                        borderWidth: "2px",
                                        textAlign: "center",
                                        width: "100%",
                                        borderStyle: "solid",
                                        borderColor: "#e6e6e6",
                                        padding: "14px",
                                        borderRadius: "6px"
                                    }}
                                    name="reviewMessage"
                                    placeholder={
                                        localizationManager.strings
                                            .feedbackPlaceHolder
                                    }
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {this.props.userId && this.props.type && (
                    <LaddaButton
                        className="button button-block button-balanced activated"
                        loading={this.state.review_loader}
                        onClick={this.onReviewSubmit}
                        data-color="##FFFF00"
                        data-size={L}
                        data-style={SLIDE_UP}
                        data-spinner-size={30}
                        data-spinner-color="#ddd"
                        data-spinner-lines={12}
                    >
                        <i className="fa fa-paper-plane" aria-hidden="true" />{" "}
                        {localizationManager.strings.submitReview}
                    </LaddaButton>
                )}
                {this.props.userId && this.props.type && (
                    <LaddaButton
                        className="button button-block button-calm activated"
                        onClick={() => {
                            this.props.history.push(
                                this.props.type == "rider"
                                    ? "/app"
                                    : "/app/driver/newreqs"
                            );
                        }}
                        data-color="##FFFF00"
                        data-size={L}
                        data-style={SLIDE_UP}
                        data-spinner-size={30}
                        data-spinner-color="#ddd"
                        data-spinner-lines={12}
                    >
                        <i className="fa fa-arrow-right" aria-hidden="true" />{" "}
                        {localizationManager.strings.skip}
                    </LaddaButton>
                )}
            </div>
        );
    }
}

export default withRouter(Reviews);
