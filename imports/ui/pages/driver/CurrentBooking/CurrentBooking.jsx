import React, { Component } from "react";
import config from '../../../../modules/config/client'
import { Link,withRouter } from "react-router-dom";
import { BookingRecord } from "../../../../collections/booking-record";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";


class CurrentBooking extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.pubnub = new PubNubReact({
      publishKey: config.PUBNUB.pubKey,
      subscribeKey: config.PUBNUB.subKey,
      secretKey: config.PUBNUB.secret
    });
    this.pubnub.init(this);

    this.state = {}
    this._mounted = false;
  }

  
 componentWillUnmount() {
    if(this._isMounted ) {
      this.pubnub.unsubscribe({
        channels: [this.state.userId]
      });
    }
  }

  componentDidMount=async()=>{
      const currentRide =await this.fetchCurrentRide();
      if(currentRide){
      this.setState(currentRide);
      this.pubnub.subscribe({
        channels: [this.state.userId],
        withPresence: true
      });
      this._isMounted = true;
      navigator.geolocation.watchPosition(async(pos) => {
        const coords = pos.coords;
       await this.pubnub.publish(
          {
              message: {
                  driverCoords: coords
              },
              channel: this.state.userId,
              sendByPost: false, // true to send via post
              storeInHistory: false, //override default storage options
              meta: {
                  "type": "driverLoc"
              }
          });
          this.setState({
            currentPosition:{
              lat:coords.latitude,
              lng:coords.longitude
            }
          })
      });
    }
   
  }

  fetchCurrentRide=async()=>{
    const currentRide = await BookingRecord.find({driverId:Meteor.userId()}).fetch()[0];
    if(!currentRide){
      this.props.history.push("/app/driver/newreqs");
      return;
    }else{
      return currentRide;
    }
  }

  navigateToRider=()=>{
   location.href=  "http://maps.google.com/maps?q=loc:"+this.state.boardingPoint.lat+','+this.state.boardingPoint.lng
  }

  startRide=()=>{
	Meteor.call("onStartRide",this.state.bookingId,this.state.currentPosition,async(error, response) => {
	if (error) {
		console.log(error);
		notify.show(
		error.reason ? error.reason : "Unable to start the ride!",
		"error"
		);
  }
  await this.pubnub.publish(
    {
        message: {
           rideStarted: true
        },
        channel: this.state.userId,
        sendByPost: false, // true to send via post
        storeInHistory: false, //override default storage options
        meta: {
            "type": "status"
        }
    });
  
	location.href=  "http://maps.google.com/maps?q=loc:"+this.state.droppingPoint.lat+','+this.state.droppingPoint.lng
	});
  }
  finishRide=()=>{
    Meteor.call("onStopRide",this.state.bookingId,this.state.currentPosition,(error, response) => {
      if (error) {
        console.log(error);
        notify.show(
          error.reason ? error.reason : "Unable to Finish the ride!",
          "error"
        );
      }
      await this.pubnub.publish(
        {
            message: {
               rideFinished: true
            },
            channel: this.state.userId,
            sendByPost: false, // true to send via post
            storeInHistory: false, //override default storage options
            meta: {
                "type": "status"
            }
        });
      notify.show("Ride completed","success");
    });
  }
  paymentReceived=()=>{
	Meteor.call("onConfirmPayment",this.state.bookingId,null,this.state.totalFare,async(error, response) => {
		if (error) {
		  console.log(error);
		  notify.show(
			error.reason ? error.reason : "Unable to mark payment for the ride!",
			"error"
		  );
    }
    await this.pubnub.publish(
      {
          message: {
             paymentReceived: true
          },
          channel: this.state.userId,
          sendByPost: false, // true to send via post
          storeInHistory: false, //override default storage options
          meta: {
              "type": "status"
          }
      });
		notify.show("Payment Marked","success");
	  });
  }

  render(){
    return(
    <div>
        <div className="list" style={{marginBottom: '0px'}}>
                  <a className="item item-icon-left" href="#">
                    <i className="icon fa fa-clock-o"></i>
                    {this.state.totalDuration}
                    <span className="item-note">
                      Time
                    </span>
                  </a>

                  <a className="item item-icon-left" href="#">
                    <i className="icon fa fa-road"></i>
                    {this.state.totalDistance}
                    <span className="item-note">
                      Distance
                    </span>
                  </a>

                  <a className="item item-icon-left" href="#">
                    <i className="icon fa fa-money"></i>
                    {Math.round(
                      this.state.totalFare ) + config.fareUnit}{" "}
                    <span className="item-note">
                      Fare
                    </span>
                  </a>
                  <a className="item item-icon-left" href="#">
                    <i className="icon fa fa-shopping-cart"></i>
                    
                    {this.state.payementMethod}
                    <span className="item-note">
                      Payment Method
                    </span>
                  </a>
                  <button
                    className="button button-block button-energized activated"
                    onClick={this.navigateToRider}
                    disabled={this.state.status=="accepted" ? false : true}
                  >
                    Navigate to Rider
                  </button>
                  <button
                    className="button button-block button-energized activated"
                    onClick={this.startRide}
                    disabled={this.state.status=="accepted" ? false : true}
                  >
                    Start Ride
                  </button>

                  <button
                    className="button button-block button-energized activated"
                    onClick={this.finishRide}
                    disabled={this.state.status=="started" ? false : true}
                  >
                    Finish Ride
                  </button>
                  <button
                    className="button button-block button-energized activated"
                    onClick={this.paymentReceived}
                    disabled={this.state.payementMetho=="cash" ? false : true}
                  >
                    Payment Received
                  </button>

                  
                </div>
    </div>
    )
}

}

export default withRouter(CurrentBooking);