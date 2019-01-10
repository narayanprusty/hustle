import React, { Component } from "react";
import {Meteor} from 'meteor/meteor'
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Settings from "../../pages/settings/Settings";
import Notifications from 'react-notify-toast';
import Bookings from "../../pages/bookings/Bookings";
import Rides from "../../pages/Rides/Rides";
import Bookingreq from "../../pages/driver/Bookingreq/Bookingreq";
import Dashboard from "../../pages/driver/Dashboard/Dashboard";

var menuColStyles = {
  padding: '0px' ,
}

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openMenu: false
    };
  }

  componentDidMount() {
      this.setState({
        height: ((document.body.scrollHeight - document.getElementsByClassName('footer')[0].offsetHeight)) + 'px',
      })
  }
  

  // if user not loggedIn dont show sideMenu
  render() {
    const driverMode = localStorage.getItem("driverMode");
    return (
      <div style={{height: '100%', position: 'relative'}}>
      <Notifications />

        <div className='content' style={{
          height: this.state.height,
          backgroundSize: "contain",
          backgroundImage: "url(" + "/images/bg.png)",
          backgroundPositionY: 'bottom',
          backgroundRepeat: 'repeat-x',
          backgroundRepeatX: 'repeat',
          overflow:'scroll'
        }}>
          <Route path="/app/settings" component={Settings} />
          <Route path="/app/home" component={Bookings} />
          <Route path="/app/rides" component={Rides} />
          <Route path="/app/driver/dash" component={Dashboard} />
          <Route path="/app/driver/newreqs" component={Bookingreq} />
          
        </div>

        {!driverMode &&(
        <div className="tabs tabs-icon-top footer" style={{
          backgroundColor: "rgb(232, 187, 10)",
          color: 'white'
        }}>
          <Link to='/app/home' className="tab-item">
            <i className="icon ion-home"></i>
            Home
          </Link>
          <Link to='/app/rides' className="tab-item">
            <i className="icon ion-navicon-round"></i>
            Rides
          </Link>
          <Link to="/app/settings" className="tab-item">
            <i className="icon ion-gear-a"></i>
            Settings
          </Link>
        </div>)}
        {driverMode &&(
        <div className="tabs tabs-icon-top footer" style={{
          backgroundColor: "black",
          color: 'white'
        }}>
          <Link to='/app/driver/newreqs' className="tab-item">
            <i className="icon ion-home"></i>
            Home
          </Link>
          <a to='/app/driver/rides' className="tab-item">
            <i className="icon ion-navicon-round"></i>
            Rides
          </a>
          <Link to="/app/settings" className="tab-item">
            <i className="icon ion-gear-a"></i>
            Settings
          </Link>
        </div>)}

        <Notifications />
      </div>
    );
  }
}
