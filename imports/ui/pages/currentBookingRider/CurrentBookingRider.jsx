import React, { Component,Fragment } from "react";
import config from "../../../modules/config/client";
import { Link, withRouter } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";
import mapStyle from '../bookings/MapStyle.json'; 
import "./CurrentBooking_client.scss"

const Marker = ({ metaData }) => (
    <div>
      {metaData == "current" && <span className="pulse_current" />}
      {metaData == "car" && (<div className="car car-red" >
      <div className="car-front"></div>
      <div className="car-middle"></div>
      <div className="car-back"></div>
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
        zoom:18,
        boardingPoint:{lat:0,lng:0},
        driverLoc:{
          lat:0,
          lng:0
        }
    };
    this.pubnub.init(this);

   
    
  }
  componentWillUnmount() {
    if (this._isMounted) {
      this.pubnub.unsubscribe({
        channels: [Meteor.userId()]
      });
    }
  }

  componentDidMount = async () => {
    this.fetchCurrentRide();
      console.log(Meteor.userId())
    
    this.pubnub.subscribe({
      channels: [Meteor.userId()],
      withPresence: true
    });
    await this.pubnub.deleteMessages(
      {
          channel: Meteor.userId()
      });
    this._isMounted = true;
    navigator.geolocation.watchPosition(pos => {
      const coords = pos.coords;
      this.callInsideRender();
      this.setState({
        currentPosition: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      });
    });
    
  };

  fetchCurrentRide=async()=>{
    return Meteor.call('currentBookingRider',Meteor.userId(),(err,currentRide)=>{
   
    if(!currentRide){
      this.props.history.push("/app");
      return;
    }else{
      if(currentRide.status=="started"){
        this.setState({
          rideStarted:true
        })
      }else if(currentRide.status=="finished"){
        this.setState({
          rideFinished:true
        })
      }
      this.setState(currentRide);
      return currentRide;
    }
  });
  }

  createMapOptions = maps => {
    return {
      keyboardShortcuts:false,
      panControl:false,
      scaleControl:false,
      clickableIcons:false,
      disableDefaultUI:false,
      gestureHandling: "greedy",
      panControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      fullscreenControl:false,
      draggable:true,
      zoomControl:false,
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
        origin: currentPoint.lat+','+currentPoint.lng,
        destination: destPoint.lat+','+destPoint.lng,
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
if(message.userMetadata.type=="driverAccept"){
  this.setState({
    showMap:true,
    driverLoc:message.message.driverCoords
});
}
if(message.userMetadata.type=="driverLoc"){
    this.setState({
        showMap:true,
        driverLoc:message.message.driverCoords
    });
    
}
if(message.userMetadata.type == 'status'){
  this.setState(message.message);
  //rideFinished ,rideStarted,paymentReceived 
}

if(this.state.rideStarted && this.state.mapApiLoaded){
    this.changeRoute(this.state.droppingPoint,message.message.driverCoords);
}else if(this.state.mapApiLoaded){
  this.changeRoute(this.state.boardingPoint,message.message.driverCoords);
}
}


callInsideRender = ()=>{

  if( this._isMounted){
    const messages = this.pubnub.getMessage(Meteor.userId());
    if(messages && messages.length){
        this.handleSocket(messages[messages.length-1])
    }
}
}

  render() {
    
    return (
      <div>
        {this.state.rideStarted && (
          <div>
            You are on the ride
            </div>
        )}
         {!this.state.rideStarted && (
          <div>
           Driver is on the way
            </div>
        )}
        <div style={{ height: '100vh', width: '100%' }}>

        {this._isMounted  && this.state.rideStarted &&  this.state.showMap && (

              <GoogleMapReact
              options={this.createMapOptions}
              bootstrapURLKeys={{ key: config.GAPIKEY, libraries: ["places"] }}
              initialCenter={this.state.driverLoc}
              center={this.state.driverLoc}
              defaultZoom={18}
              zoom={this.state.zoom}
              layerTypes={["TrafficLayer", "TransitLayer"]}
              heat={true}
              gestureHandling="greedy"
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) =>
                this.apiHasLoaded(map, maps)
              }
            >
          {this.state.currentPosition && (
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
                metaData="current"
              />)}
               {this.state.boardingPoint && (
           <Marker
                lat={
                  this.state.boardingPoint.lat
                    ? this.state.boardingPoint.lat
                    : this.state.boardingPoint.lat
                }
                lng={
                  this.state.boardingPoint.lng
                    ? this.state.boardingPoint.lng
                    : this.state.boardingPoint.lng
                }
                metaData="board"
              />)}
               {this.state.droppingPoint && (
           <Marker
                lat={
                  this.state.droppingPoint.lat
                    ? this.state.droppingPoint.lat
                    : this.state.droppingPoint.lat
                }
                lng={
                  this.state.droppingPoint.lng
                    ? this.state.droppingPoint.lng
                    : this.state.droppingPoint.lng
                }
                metaData="drop"
              />)}
              {this.state.driverLoc &&(
               <Marker
                lat={
                  this.state.driverLoc.lat
                    ? this.state.driverLoc.lat
                    : this.state.driverLoc.lat
                }
                lng={
                  this.state.driverLoc.lng
                    ? this.state.driverLoc.lng
                    : this.state.driverLoc.lng
                }
                metaData="car"
              />)}
          </GoogleMapReact>

        )}
        </div>
      </div>
    );
  }
}
export default withRouter(CurrentBookingRider);
