import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import "../../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";
import { Meteor } from "meteor/meteor";
import moment from "moment";
import "moment/locale/ar";

import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody
} from "react-accessible-accordion";
import localizationManager from "../../../localization";

import Reviews from "../../../components/ReviewComponent/Reviews";
import CarLoader from "../../../components/CarLoader/CarLoader";

class pricingConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            config: "",
        };
        this._isMounted = false;
        this.getPricingConfig = this.getPricingConfig.bind(this);
    }

    componentDidMount = () => {
        this._isMounted = true;
        const driverMode = localStorage.getItem("driverMode");
        if (!driverMode) {
            this.props.history.push("/login");
        } else {
            this.getPricingConfig();
        }
    };

    getPricingConfig = async () => {
        try {
            Meteor.call("getPricingConfig", [], (err, res) => {
                console.log(err, res);
                if(!err) {
                    if(res.config) {
                        this.setState({
                            config: res.config
                        });
                    }
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    }

    render() {
        return (
            <div
                style={{ direction: localizationManager.strings.textDirection }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-bolt" aria-hidden="true" />{" "}
                        {localizationManager.strings.pricingConfig}
                    </h3>
                </div>
                {this.state.config ? (
                    <div>
                        <Accordion>
                            {
                                this.state.config.dateTime && this.state.config.dateTime.length > 0 ? (
                                    
                                        <AccordionItem>
                                            <AccordionItemTitle>
                                                <div className="item item-icon-left">
                                                    <i className="icon fa fa-clock-o" />
                                                    {localizationManager.strings.dateTimeRules}
                                                </div>
                                            </AccordionItemTitle>
                                            <AccordionItemBody>
                                                <div className="item item-body">
                                                    <ul className="list">
                                                    {
                                                        this.state.config.dateTime.map((data, i) => {
                                                            let str = "";
                                                            let mlist = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                                                            let dlist = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
                                                            switch (data.type) {
                                                                case "month":
                                                                    str = mlist[data.month];
                                                                    break;
                                                                case "day":
                                                                    str = dlist[data.day];
                                                                    break;
                                                                case "hour":
                                                                    str = data.fromHour + " - " + data.toHour;
                                                                    break;
                                                                default:
                                                                    break;
                                                            }
                                                            let change = parseInt(data.change);
                                                            change = isNaN(change) ? 0 : change;
                                                            return(
                                                                <li
                                                                    key={i}
                                                                    className="item"
                                                                    style={{ whiteSpace: "normal" }}
                                                                >
                                                                    <div style={{ marginBottom: "10px" }}>
                                                                        <b>
                                                                            {
                                                                                str
                                                                            }
                                                                        </b>
                                                                    </div>
                                                                    <div style={{color: change > 0 ? "green" : "red"}}>{change > 0 ? "+" + data.change+" %" : data.change+" %"}</div>
                                                            </li>
                                                            );
                                                        })

                                                    }
                                                    </ul>
                                                </div>
                                            </AccordionItemBody>
                                        </AccordionItem>
                                    
                                ) : ""
                            }
                            {
                                this.state.config.locations && this.state.config.locations.length > 0 ? (
                                    
                                        <AccordionItem>
                                            <AccordionItemTitle>
                                                <div className="item item-icon-left">
                                                    <i className="icon fa fa-map-marker" />
                                                    {localizationManager.strings.locationRules}
                                                </div>
                                            </AccordionItemTitle>
                                            <AccordionItemBody>
                                            <div className="item item-body">
                                                    <ul className="list">
                                                    {
                                                        this.state.config.locations.map((data, i) => {
                                                            let change = parseInt(data.change);
                                                            change = isNaN(change) ? 0 : change;
                                                            return(
                                                                <li
                                                                    key={i}
                                                                    className="item"
                                                                    style={{ whiteSpace: "normal" }}
                                                                >
                                                                    <div style={{ marginBottom: "10px" }}>
                                                                        <b>
                                                                            {
                                                                                data.location
                                                                            }
                                                                        </b>
                                                                    </div>
                                                                    <div style={{color: change > 0 ? "green" : "red"}}>{change > 0 ? "+" + data.change+" %" : data.change+" %"}</div>
                                                            </li>
                                                            );
                                                        })

                                                    }
                                                    </ul>
                                                </div>
                                            </AccordionItemBody>
                                        </AccordionItem>
                                    
                                ) : ""
                            }
                        </Accordion>
                    </div>
                    ) : (
                        <CarLoader />
                    )}
            </div>
        );
    }
}

export default withRouter(pricingConfig);
