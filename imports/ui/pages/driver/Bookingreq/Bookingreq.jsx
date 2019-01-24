import React, { Component } from "react";
import { Link,withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import InfiniteScroll from "react-infinite-scroller";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import PubNubReact from "pubnub-react";
import config from '../../../../modules/config/client'

class Bookingreq extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      hasMoreItems: true
    };
    this._isMounted = false;
    this.pubnub = new PubNubReact({
      publishKey: config.PUBNUB.pubKey,
      subscribeKey: config.PUBNUB.subKey,
      secretKey: config.PUBNUB.secret
    });
    this.pubnub.init(this);
  }

  componentDidMount=()=>{
    this._isMounted = true;
  }
  componentWillMount =async()=>{
    await this.fetchCurrentRide();
  }
  fetchCurrentRide=()=>{
    return Meteor.call('currentBookingDriver',Meteor.userId(),(err,currentRide)=>{
      if(err){
        console.log(err);
      }
     if(currentRide){
       this.props.history.push("/app/driver/currentBooking");
       return;
     }
    })
       
     }
 
  handleClickAction=(data)=>{
    console.log("Accepting.....")
    Meteor.call("onDriverAccept",data.bookingId,Meteor.userId(),async(error, response) => {
      if (error) {
        console.log(error);
        notify.show(
        error.reason ? error.reason : "Unable to accept the ride!",
        "error"
        );
      }
      await this.pubnub.publish({
        message: {
          driverLoc:this.state.current_pos
        },
        channel: data.userId,
        meta:{
          type:"driverAccept"
        }
        });
      this.props.history.push("/app/driver/currentBooking");
      });
  }
  loadItems = page => {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = pos.coords;
      this.setState({
        current_pos:coords
      });
      Meteor.call(
        "fetchBookingReq",
        { lat: coords.latitude, lng: coords.longitude, page: page },
        (err, withingDistanceData) => {
            console.log(withingDistanceData)
          if (err) {
            console.log(err);
            notify.show(err.reason, "error");
          }
          if (withingDistanceData && withingDistanceData.length) {
            let datas = this.state.datas;
            datas = datas.concat(withingDistanceData);
            this.setState({
              datas: datas
            });
          } else {
            this.setState({
              hasMoreItems: false
            });
          }
          return { data: withingDistanceData };
        }
      );
    });
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
  items.push( <div className="item item-button-right" key={i}>
            {data.createdAt ? moment(data.createdAt).format('LLL') : '-'} &nbsp; {data.totalFare} USD   &nbsp; {data.totalDistance} &nbsp; {data.totalDuration}
        <button className="button button-positive" onClick={this.handleClickAction.bind(this,data)}>
          <i className="icon fa fa-location-arrow" />
        </button>
  </div>);
    });
    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={this.loadItems.bind(this)}
        hasMore={this.state.hasMoreItems}
        loader={loader}
        useWindow={false}
      >
        <div className="list">{items}</div>
      </InfiniteScroll>
    );
  }
}


export default withRouter(Bookingreq);