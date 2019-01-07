import React, { Component,Fragment } from "react";
import isEmpty from 'lodash.isempty';
import SearchBox from './SearchBox';
import mapStyle from './MapStyle';//https://mapstyle.withgoogle.com/ you can build yours from 
const config = {
  GAPIKEY: "AIzaSyAQfL-suU57febWtcN0tRarLZ07erPof_A"
};
{/* <FontAwesomeIcon className ='font-awesome' icon={faMapMarker} /> */}
import  GoogleMapReact from "google-map-react";


import "./Home_client.scss";

const Marker = ({metaData}) =>(<div><div className='pin bounce'></div>
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
    zoom: 18,
    mapApiLoaded: false,
      mapInstance: null,
      mapApi: null,
      places: [],
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
  addPlace = (place) => {
    this.setState({ places: place });
  };
  codeLatLng = t => {
    console.log(t);
    this.setState({
        currentLocation:{
            lat:t.lat,
            lng:t.lng
        }
    });
  };
  apiHasLoaded = (map, maps) => {
    debugger;
    this.setState({
      mapApiLoaded: true,
      mapInstance: map,
      mapApi: maps,
    });
  };
  createMapOptions= (maps)=> {
    return {
      gestureHandling: 'greedy',
      panControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      styles: mapStyle
    }
  }
  render() {
    const {
      places, mapApiLoaded, mapInstance, mapApi,
    } = this.state;
    return (
      <div class="bar bar-header">
        <button class="button button-icon icon ion-navicon"></button>
        <div class="h1 title">Header Buttons</div>
        <button class="button button-clear button-positive">Edit</button>
      </div>
    );
  }
}
