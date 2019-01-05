import React, { Component } from "react";


const config = {
  GAPIKEY: "AIzaSyAQfL-suU57febWtcN0tRarLZ07erPof_A"
};
{/* <FontAwesomeIcon className ='font-awesome' icon={faMapMarker} /> */}
import  GoogleMapReact from "google-map-react";


import "./Home_client.scss";

const Marker = ({metaData}) =>( <div><div className='pin bounce'></div>
<div className='pulse'></div></div>);

export default class Home extends Component {
  static defaultProps = {};
  state = {
    fields: {
      location: {
        lat: 22,
        lng: 88
      }
    },
    currentLocation:{
        lat:22,
        lng:88
    },
    zoom: 18
  };
  componentDidMount = async () => {
    //if user logged in redirect 
    const user = Meteor.userId();
    if (!user) {
      location.href = "/login";
    } else {
      const { lat, lng } = await this.getcurrentLocation();
      this.setState(prev => ({
        fields: {
          ...prev.fields,
          location: {
            lat,
            lng
          }
        },
        currentLocation: {
          lat,
          lng
        }
      }));
    }
  };

  getcurrentLocation() {
    if (navigator && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async(pos) => {
          const coords = pos.coords;
          resolve({
            lat: coords.latitude,
            lng: coords.longitude
          });
        
        });
   
      });
    }
    return {
      lat: 0,
      lng: 0
    };
  }

  codeLatLng = t => {
    console.log(t);
    this.setState({
        currentLocation:{
            lat:t.lat,
            lng:t.lng
        }
    });
  };

  render() {
    return (
      
        <div className='mapView'>
          
          <GoogleMapReact
            bootstrapURLKeys={{ key: config.GAPIKEY }}
            initialCenter={this.state.fields.location}
            center={this.state.fields.location}
            zoom={this.state.zoom}
            layerTypes={["TrafficLayer", "TransitLayer"]}
            heat={true}
            gestureHandling= "greedy"
            onClick={(t)=>this.codeLatLng(t)}
          >
             <Marker lat={this.state.currentLocation.lat ? this.state.currentLocation.lat : this.state.fields.lat} lng={this.state.currentLocation.lng ?  this.state.currentLocation.lng :this.state.fields.lng} metaData=''/>
          </GoogleMapReact> 
          
        </div>
    );
  }
}
