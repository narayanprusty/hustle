import React, { Component } from "react";
import {Meteor} from 'meteor/meteor'
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import SlideMenu from "../../components/sideMenu/SideMenu";
import Settings from "../../pages/settings/Settings";
import Notifications from 'react-notify-toast';
import Bookings from "../../pages/bookings/Bookings";

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
        </div>
        <div className="tabs tabs-icon-top footer" style={{
          backgroundColor: "rgb(232, 187, 10)",
          color: 'white'
        }}>
          <a className="tab-item">
            <i className="icon ion-home"></i>
            Home
          </a>
          <a className="tab-item">
            <i className="icon ion-navicon-round"></i>
            Rides
          </a>
          <Link to="/app/settings" className="tab-item">
            <i className="icon ion-gear-a"></i>
            Settings
          </Link>
        </div>

        <Notifications />
      </div>
    );
  }
}
