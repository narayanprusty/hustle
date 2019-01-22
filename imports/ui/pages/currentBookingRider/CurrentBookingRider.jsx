import React, { Component } from "react";
import config from "../../../modules/config/client";
import { Link, withRouter } from "react-router-dom";
import { BookingRecord } from "../../../collections/booking-record";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";

import "./CurrentBooking_client.scss"

const Marker = ({ metaData }) => (
    <div>
      {metaData == "current" && <span className="pulse_current" />}
      {metaData == "car" && (<div class="car car-red" >
      <div class="car-front"></div>
      <div class="car-middle"></div>
      <div class="car-back"></div>
    </div>)}
      {metaData != "current" && metaData != "car" && (
        <div>
          <div className={"pin bounce " + metaData} />
          <div className="pulse" />
        </div>
      )}
    </div>
  );


class CurrentBookingRider extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.pubnub = new PubNubReact({
      publishKey: config.PUBNUB.pubKey,
      subscribeKey: config.PUBNUB.subKey,
      secretKey: config.PUBNUB.secret
    });
    this.state = {
        showMap:false,
        rideStarted:false,
        rideFinished:false,
    };
    this.pubnub.init(this);

   
    this._mounted = false;
  }
  componentWillUnmount() {
    if (this._isMounted) {
      this.pubnub.unsubscribe({
        channels: [Meteor.userId()]
      });
    }
  }

  componentDidMount = async () => {
    const currentRide =await this.fetchCurrentRide();
      console.log(Meteor.userId())
    this.pubnub.subscribe({
      channels: [Meteor.userId()],
      withPresence: true
    });
    this._isMounted = true;
    navigator.geolocation.watchPosition(pos => {
      const coords = pos.coords;
      this.setState({
        currentPosition: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      });
    });
  };

  fetchCurrentRide=async()=>{
    const currentRide = await BookingRecord.find({userId:Meteor.userId(),status:{$ne:'pending'}}).fetch()[0];
    if(!currentRide){
      this.props.history.push("/app");
      return;
    }else{
      return currentRide;
    }
  }

  createMapOptions = maps => {
    return {
      gestureHandling: "greedy",
      panControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      styles: mapStyle
    };
  };
  apiHasLoaded = (map, maps) => {
    this.setState({
      mapApiLoaded: true,
      mapInstance: map,
      mapApi: maps
    });
  };
  changeRoute = (destPoint,currentPoint) => {
    if (this.state.poly) {
      this.state.poly.setMap(null);
    }

    const { mapInstance, mapApi } = this.state;

    const latlng = [
      new mapApi.LatLng(destPoint.lat,destPoint.lng),
      new mapApi.LatLng(currentPoint.lat, currentPoint.lng),
  ]; 
  let latlngbounds = new mapApi.LatLngBounds();
  for (let i = 0; i < latlng.length; i++) {
      latlngbounds.extend(latlng[i]);
    }
    mapInstance.fitBounds(latlngbounds);

    const directionsService = new mapApi.DirectionsService();
    const directionsDisplay = new mapApi.DirectionsRenderer();

    directionsService.route(
      {
        origin: this.state.currentPoint.lat+','+this.state.currentPoint.lng,
        destination: this.state.destPoint.lat+','+this.state.destPoint.lng,
        travelMode: "DRIVING",
        unitSystem: mapApi.UnitSystem.METRIC,
        drivingOptions: {
          departureTime: new Date() //add drivers arriving time here
        }
      },
      (response, status) => {
        if (status === "OK") {
          directionsDisplay.setDirections(response);
          const routePolyline = new mapApi.Polyline({
            path: response.routes[0].overview_path
          });
          
          routePolyline.setMap(mapInstance);
          this.setState({
            poly: routePolyline
          });
        } else {
          notify.show("Directions request failed due to " + status, "error");
        }
      }
    );
  }
  
handleSocket =(message)=>{
console.log(message);
//on driver connect make showmMap to true

if(latestMsg.userMetadata.type=="driverLoc"){
    this.state({
        showMap:true,
        driverLoc:latestMsg.message.driverCoords
    });
}
if(latestMsg.userMetadata.type == 'status'){
    this.state(latestMsg.message);
    //rideFinished ,rideStarted,paymentReceived 
}
}

  render() {
   if( this._isMounted){
    const messages = this.pubnub.getMessage(Meteor.userId());
    if(messages && messages.length){
        this.handleSocket(messages[messages.length-1])
    }
}
    return (
      <div>
        {this._isMounted && this.state.showMap && (
          <GoogleMapReact
            options={this.createMapOptions}
            bootstrapURLKeys={{ key: config.GAPIKEY, libraries: ["places"] }}
            initialCenter={this.state.fields.location}
            center={this.state.fields.location}
            zoom={this.state.zoom}
            layerTypes={["TrafficLayer", "TransitLayer"]}
            heat={true}
            gestureHandling="greedy"
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => this.apiHasLoaded(map, maps)}
          >
           <Marker
                lat={
                  this.state.currentPosition.lat
                    ? this.state.currentPosition.lat
                    : this.state.currentPosition.lat
                }
                lng={
                  this.state.currentPosition.lng
                    ? this.state.currentPosition.lng
                    : this.state.currentPosition.lng
                }
                metaData="board"
              />
              {this.state.driverLoc &&(
               <Marker
                lat={
                  this.state.driverLoc.latitude
                    ? this.state.driverLoc.latitude
                    : this.state.driverLoc.latitude
                }
                lng={
                  this.state.driverLoc.longitude
                    ? this.state.driverLoc.longitude
                    : this.state.driverLoc.longitude
                }
                metaData="car"
              />)}
          </GoogleMapReact>
        )}
      </div>
    );
  }
}
export default withRouter(CurrentBookingRider);
