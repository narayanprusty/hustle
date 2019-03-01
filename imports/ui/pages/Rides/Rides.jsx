import React, { Component, Fragment } from "react";
import { notify } from "react-notify-toast";
import InfiniteScroll from "react-infinite-scroller";
import moment from "moment";
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";
import "../../../../node_modules/react-accessible-accordion/dist/fancy-example.css";

import "./Rides_client.scss";
import { Meteor } from "meteor/meteor";
import localizationManager from "../../localization";

export default class Rides extends Component {
  state = {
    datas: [],
    hasMoreItems: true
  };

  loadItems = page => {
    Meteor.call(
      "fetchUserBookings",
      Meteor.userId(),
      page,
      (error, response) => {
        if (error) {
        //Add localization support
          notify.show(
            error.reason ? error.reason : localizationManager.strings.unableToFetch,
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
        <div className="list card" key={data.uniqueIdentifier} style={{
        }}>
          <AccordionItem key={i}>
            <AccordionItemTitle>
              <div className="item item-avatar">
                <img src={status} />
                <h2>{data.totalFare + " " + data.fareUnit}</h2>
                <p>{data.createdAt ? moment(data.createdAt).format("LLL") : "-"}</p>
              </div>
            </AccordionItemTitle>
            <AccordionItemBody>
              <div className="item item-body">
                <ul className="list">
                  <li className="item" style={{whiteSpace: 'normal'}}>
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.bookingID}:</b>
                    </div>
                    <div>
                      #{data.uniqueIdentifier}
                    </div>
                  </li>
                  <li className="item" style={{whiteSpace: 'normal'}}>
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.boardingPoint}:</b>
                    </div>
                    <div>
                      {data.start_address}
                    </div>
                  </li>
                  <li className="item" style={{whiteSpace: 'normal'}}>
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.droppingPoint}:</b>
                    </div>
                    <div>
                      {data.end_address}
                    </div>
                  </li>
                  <li className="item">
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.duration}:</b>
                    </div>
                    <div>
                      {data.time_shown}
                    </div>
                  </li>
                  <li className="item">
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.paymentMethod}:</b>
                    </div>
                    <div>
                      {localizationManager.strings[data.paymentMethod]}
                    </div>
                  </li>
                  <li className="item">
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.paymentStatus}:</b>
                    </div>
                    <div>
                      {localizationManager.strings[data.paymentStatus]}
                    </div>
                  </li>
                  <li className="item">
                    <div style={{marginBottom: '10px'}}>
                      <b>{localizationManager.strings.totalDistance}: </b>
                    </div>
                    <div>
                      {data.totalDistance / 1000}KM
                    </div>
                  </li>
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
        <div className="padding-top padding-right padding-left padding-bottom">
          <h3 className="padding">
            <i className="fa fa-road" aria-hidden="true" /> {localizationManager.strings.yourRides}
          </h3>
          <Accordion>
            {items}
          </Accordion>
        </div>
      </InfiniteScroll>
    );
  }
}
