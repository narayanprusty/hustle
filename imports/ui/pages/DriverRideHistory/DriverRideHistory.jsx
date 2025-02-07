import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { notify } from "react-notify-toast";
import InfiniteScroll from "react-infinite-scroller";
import moment from "moment";
import "moment/locale/ar";

import localizationManager from "../../localization";

import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody
} from "react-accessible-accordion";
import "../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";

import "./DriverRideHistory_client.scss";
import { Meteor } from "meteor/meteor";
import CarLoader from "../../components/CarLoader/CarLoader";
import LaddaButton, { S, SLIDE_UP } from "react-ladda";

class DriverRideHistory extends Component {
    state = {
        datas: [],
        hasMoreItems: true
    };

    loadItems = page => {
        Meteor.call(
            "fetchDriverBookings",
            Meteor.userId(),
            page,
            (error, response) => {
                if (error) {
                    //Add localization support
                    notify.show(
                        error.reason
                            ? error.reason
                            : localizationManager.strings.unableToFetch,
                        "error"
                    );
                }

                if (response && response.data && response.data.length) {
                    let datas = this.state.datas;
                    datas = datas.concat(response.data);
                    this.setState({
                        datas: datas
                    });
                } else {
                    this.setState({
                        hasMoreItems: false
                    });
                }
            }
        );
    };

    action = bookingId => {
        this.setState({
            actioned: true
        });
        try {
            this.props.history.push("/app/driver/ride/payment/" + bookingId);
        } catch (error) {
            this.setState({
                actioned: false
            });
        }
    };

    render() {
        const loader = <CarLoader />;

        let items = [];
        this.state.datas.map((data, i) => {
            console.log(data);
            let status = "-";
            if (data.rideStatus == "pending") {
                status = "/images/pending.png";
            } else if (data.rideStatus == "accepted") {
                status = "/images/waiting.png";
            } else if (data.rideStatus == "started") {
                status = "/images/riding.png";
            } else if (data.rideStatus == "finished") {
                status = "/images/completed.png";
            } else if (data.rideStatus == "cancelled") {
                status = "/images/cancelled.png";
            }
            items.push(
                <div
                    className="list card"
                    key={data.uniqueIdentifier}
                    style={{}}
                >
                    <AccordionItem key={i}>
                        <AccordionItemTitle>
                            <div className="item item-avatar">
                                <img src={status} />
                                <h2>{data.riderName || "Unknown"}</h2>
                                <h2>{data.totalFare + " " + data.fareUnit}</h2>
                                <p>
                                    {data.createdAt
                                        ? moment(data.createdAt)
                                              .locale(
                                                  localizationManager.getLanguage()
                                              )
                                              .format("LLL")
                                        : "-"}
                                </p>
                            </div>
                        </AccordionItemTitle>
                        <AccordionItemBody>
                            <div className="item item-body">
                                <ul className="list">
                                    <li
                                        className="item"
                                        style={{ whiteSpace: "normal" }}
                                    >
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .bookingID
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>#{data.uniqueIdentifier}</div>
                                    </li>
                                    <li
                                        className="item"
                                        style={{ whiteSpace: "normal" }}
                                    >
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .boardingPoint
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>{data.start_address}</div>
                                    </li>
                                    <li
                                        className="item"
                                        style={{ whiteSpace: "normal" }}
                                    >
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .droppingPoint
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>{data.end_address}</div>
                                    </li>
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .duration
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>{data.time_shown}</div>
                                    </li>
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .paymentMethod
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>
                                            {data.paymentMethod == "cash"
                                                ? localizationManager.strings
                                                      .cash
                                                : localizationManager.strings
                                                      .Card}
                                        </div>
                                    </li>
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .paymentStatus
                                                }
                                                :
                                            </b>
                                        </div>
                                        <div>
                                            {
                                                localizationManager.strings[
                                                    data.paymentStatus
                                                ]
                                            }
                                        </div>
                                    </li>
                                    <li className="item">
                                        <div style={{ marginBottom: "10px" }}>
                                            <b>
                                                {
                                                    localizationManager.strings
                                                        .totalDistance
                                                }
                                                :{" "}
                                            </b>
                                        </div>
                                        <div>{data.totalDistance / 1000}KM</div>
                                    </li>
                                    {data.paymentMethod == "cash" &&
                                        data.paymentStatus == "pending" && (
                                            <LaddaButton
                                                className="button button-block button-energized activated"
                                                loading={this.state.actioned}
                                                onClick={this.action.bind(
                                                    this,
                                                    data.uniqueIdentifier
                                                )}
                                                data-color="##FFFF00"
                                                data-size={S}
                                                data-style={SLIDE_UP}
                                                data-spinner-size={30}
                                                data-spinner-color="#ddd"
                                                data-spinner-lines={12}
                                            >
                                                {
                                                    localizationManager.strings
                                                        .tAction
                                                }{" "}
                                                <i
                                                    className="fa fa-arrow-right"
                                                    aria-hidden="true"
                                                />
                                            </LaddaButton>
                                        )}
                                </ul>
                            </div>
                        </AccordionItemBody>
                    </AccordionItem>
                </div>
            );
        });

        return (

            <InfiniteScroll
                pageStart={0}
                loadMore={this.loadItems.bind(this)}
                hasMore={this.state.hasMoreItems}
                loader={loader}
                useWindow={false}
            >
                <div
                    className="padding-top padding-right padding-left padding-bottom"
                    style={{
                        direction: localizationManager.strings.textDirection
                    }}
                >
                    <h3 className="padding">
                        <i className="fa fa-road" aria-hidden="true" />
                        {localizationManager.strings.yourRides}
                    </h3>
                    <div style={{textAlign:'center'}}>
                {this.state.datas && this.state.datas.length ? ''  : "No ride found"}</div>
                    <Accordion>{items}</Accordion>
                </div>
            </InfiniteScroll>


        );
    }
}
export default withRouter(DriverRideHistory);
