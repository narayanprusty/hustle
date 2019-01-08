import React, { Component,Fragment } from "react";
import isEmpty from 'lodash.isempty';
import moment from 'moment';
import SearchBox from './SearchBox';
import mapStyle from './MapStyle';//https://mapstyle.withgoogle.com/ you can build yours from 
import config from '../../../modules/config/client'
import  GoogleMapReact from "google-map-react";
import Geocode from "react-geocode";
import { notify } from "react-notify-toast";


Geocode.setApiKey(config.GAPIKEY);


import "./Bookings_client.scss";

const Marker = ({metaData}) =>(

<div>
  {metaData =='current' && (<span className="pulse_current"></span>)}
{metaData !='current' && (<div>
<div className={'pin bounce '+metaData}></div>
<div className='pulse'></div>
</div>
)}
</div>)
;

export default class Bookings extends Component {
  static defaultProps = {};
  state = {
    paymentMethod:'cash',
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
    boardingPoint:{
      lat:22,
      lng:18
  },
    zoom: 18,
    mapApiLoaded: false,
      mapInstance: null,
      mapApi: null,
      droppingPlace: {},
      boardingPlace: {},

    };
  componentDidMount = async () => {
      const { lat, lng } = await this.getcurrentLocation();
      Geocode.fromLatLng(lat, lng).then(
        response => {
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
              lng,
            },
            boardingPoint:{
              lat:lat,
              lng:lng
          },
          boardingPlace:response.results[0]
          }));        
        },
        error => {
          console.error(error);
        }
      );
    
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
  inputHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  changeRoute = ()=>{
    if(this.state.poly){
      this.state.poly.setMap(null);
    }

    const  {mapInstance,mapApi,droppingPoint,boardingPoint} = this.state;
       
    const latlng = [
      new mapApi.LatLng(droppingPoint.lat,droppingPoint.lng),
      new mapApi.LatLng(boardingPoint.lat, boardingPoint.lng),
  ]; 
  var latlngbounds = new mapApi.LatLngBounds();
  for (let i = 0; i < latlng.length; i++) {
      latlngbounds.extend(latlng[i]);
  }
  mapInstance.fitBounds(latlngbounds);

  const directionsService = new mapApi.DirectionsService();
  const directionsDisplay = new mapApi.DirectionsRenderer();

  directionsService.route({
    origin: this.state.boardingPlace.geometry.location,
    destination: this.state.droppingPlace.geometry.location,
    travelMode: 'DRIVING',
    unitSystem:mapApi.UnitSystem.METRIC,
    drivingOptions: {
      departureTime: new Date(), //add drivers arriving time here
    },   
    }, (response, status) => {
    if (status === 'OK') {
      debugger;
      const bookingDetails= response.routes[0].legs[0];
      const dataObj ={
        end_address:bookingDetails.end_address ,
        start_address:bookingDetails.start_address ,
        reachAfter:bookingDetails.duration.text ,
        distance:bookingDetails.distance.text ,
        reachAfterIfTraffic:bookingDetails.duration_in_traffic.text,
      };
      this.setState({
        rideStatGen:true,
        distance_in_meter:bookingDetails.distance.value ,
        timeTaken_in_secoend:bookingDetails.duration.value ,
        timeTakenTraffic_in_secoend:bookingDetails.duration_in_traffic.value ,
        start_latLng:{lat:bookingDetails.start_location.lat(),lng:bookingDetails.start_location.lng()},
        end_latLng:{lat:bookingDetails.end_location.lat(),lng:bookingDetails.end_location.lng()},
        ...dataObj,
      })
      directionsDisplay.setDirections(response);
      console.log(response.routes[0], 'Ruta')
      const routePolyline = new mapApi.Polyline({
        path: response.routes[0].overview_path
      });
      this.setState({
        poly:routePolyline
      });
      routePolyline.setMap(mapInstance);
    } else {
      notify.show('Directions request failed due to ' + status,'error');
      }
    });
  }
  addDroppingPlace = (place) => {
    this.setState({ 
      droppingPlace: place[0],
      droppingPoint:{
        lat:place[0].geometry.location.lat(),
        lng:place[0].geometry.location.lng()
      }
    });

   //call the change route function
this.changeRoute();
    
  };
  addBoardingPlace = (place) => {
    this.setState({ 
      boardingPlace: place[0],
      boardingPoint:{
        lat:place[0].geometry.location.lat(),
        lng:place[0].geometry.location.lng()
      }
    });
    
  };
  onChangeBoarding = t => {
    Geocode.fromLatLng(t.lat, t.lng).then(
      response => {
        const address = response.results[0];
    
    this.setState({
        boardingPoint:{
            lat:t.lat,
            lng:t.lng
        },
        boardingPlace:address
    });
    if(this.state.droppingPoint){
      this.changeRoute()
    }


  });
  };
  apiHasLoaded = (map, maps) => {
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
  raiseBookingReq= (e)=>{
    e.preventDefault()
   const data={
     userId:Meteor.userId(),
    boardingPoint:this.state.boardingPoint,
    droppingPoint:this.state.droppingPoint,
    paymentMethod:this.state.paymentMethod,
    distance:this.state.distance,
    reachAfter:this.state.reachAfter,
    currentLocation:this.state.currentLocation,
    reachAfterIfTraffic:this.state.reachAfterIfTraffic,
    timeTakenTraffic_in_secoend:this.state.timeTakenTraffic_in_secoend,
    timeTaken_in_secoend:this.state.timeTaken_in_secoend,
    end_address:this.state.end_address,
    start_address:this.state.start_address,
    distance_in_meter:this.state.distance_in_meter
   }
   Meteor.call('newBookingReq',data,(error,response)=>{
     debugger;
    if(error){
      console.log(error);
      notify.show(error.reason? error.reason : 'Unable to create request!', 'error')
    }
    console.log(response);
    notify.show('Booking created Successfully!','success');
   })
  }
  
  render() {
    const {
     mapApiLoaded, mapInstance, mapApi,
    } = this.state;
    return (
      <div style={{height: '100%'}}>
        
          <Fragment>
            <div className='list'>
          <label className="item item-input item-stacked-label">
            <span className="input-label"> Boarding Point: </span>
           {mapApiLoaded && <SearchBox map={mapInstance} mapApi={mapApi} value={this.state.boardingPlace.formatted_address } addplace={this.addBoardingPlace} />}
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">  Dropping Point:  </span>
           {mapApiLoaded && <SearchBox map={mapInstance} mapApi={mapApi} addplace={this.addDroppingPlace} />}
           </label>
          {this.state.rideStatGen &&(
           <div className="list card">
          
            <span>
                <label>Time: </label> 
                {this.state.reachAfter }
            </span>
            <br />
            <span>
                <label>You will Reach at: </label> 
                {moment().add(this.state.timeTakenTraffic_in_secoend,"S").format("LT")}
            </span>
            <br />
            <span>
                <label>Total Distance: </label> 
                {this.state.distance}
            </span>
            <br />
            <span>
                <label>Total Fare: </label> 
                {Math.round(this.state.distance_in_meter*config.farePerMeter)+config.fareUnit } at {config.farePerMeter+config.fareUnit}/M
            </span>
            <br />
            <label className="item item-input item-select">
            <div className="input-label">
              Select Payment Method
            </div>
            <select name="paymentMethod" value={this.state.paymentMethod} onChange={this.inputHandler}>
              <option value={'cash'}>Cash</option>
              <option value={'card 1'}>Card 1</option>
            </select>
          </label>
            <button className="button button-block button-energized activated" onClick={this.raiseBookingReq} disabled={this.state.paymentMethod ? false :true}>
                Book
            </button> 
         
         </div>
          )}
           </div>

        <div className='mapView'>
          
          <GoogleMapReact
            options={this.createMapOptions}
            bootstrapURLKeys={{ key: config.GAPIKEY,    libraries: ['places'] }}
            initialCenter={this.state.fields.location}
            center={this.state.fields.location}
            zoom={this.state.zoom}
            layerTypes={["TrafficLayer", "TransitLayer"]}
            heat={true}
            gestureHandling= "greedy"
            onClick={(t)=>this.onChangeBoarding(t)}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => this.apiHasLoaded(map, maps)}
          > 
          {this.state.droppingPoint &&
           (
             <Marker lat={this.state.droppingPoint.lat} lng={this.state.droppingPoint.lng} metaData='drop'/>
            )}
          <Marker lat={this.state.currentLocation.lat ? this.state.currentLocation.lat : this.state.fields.lat} lng={this.state.currentLocation.lng ?  this.state.currentLocation.lng :this.state.fields.lng} metaData='current'/>
          <Marker lat={this.state.boardingPoint.lat ? this.state.boardingPoint.lat : this.state.currentLocation.lat} lng={this.state.boardingPoint.lng ?  this.state.boardingPoint.lng :this.state.currentLocation.lng } metaData='board'/>
          </GoogleMapReact> 
          
        </div>
        </Fragment>
       
      </div>
    );
  }
}
