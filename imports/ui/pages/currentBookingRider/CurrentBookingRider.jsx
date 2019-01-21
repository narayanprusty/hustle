import React, { Component } from "react";
import config from "../../../modules/config/client";
import { Link, withRouter } from "react-router-dom";
import { BookingRecord } from "../../../../collections/booking-record";
import { Meteor } from "meteor/meteor";
import { notify } from "react-notify-toast";
import PubNubReact from "pubnub-react";

import "./CurrentBooking_client.scss"

const Marker = ({ metaData }) => (
    <div>
      {metaData == "current" && <span className="pulse_current" />}
      {metaData != "current" && (
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
      secretKey: "sec-c-ODI1ZjY2MWUtMTIwNy00M2MxLWIzY2EtZDUwMjQ5MTlhNmY5"
    });
    this.pubnub.init(this);

    this.state = {};
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
  changeRoute = () => {
    if (this.state.poly) {
      this.state.poly.setMap(null);
    }

    const { mapInstance, mapApi, droppingPoint, boardingPoint } = this.state;

    const latlng = [
      new mapApi.LatLng(droppingPoint.lat,droppingPoint.lng),
      new mapApi.LatLng(boardingPoint.lat, boardingPoint.lng),
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
        origin: this.state.boardingPlace.geometry.location,
        destination: this.state.droppingPlace.geometry.location,
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
  
  render() {
    return (
      <div>
        {this._isMounted && (
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
          </GoogleMapReact>
        )}
      </div>
    );
  }
}
export default withRouter(CurrentBookingRider);
