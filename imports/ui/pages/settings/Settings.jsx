import React, { Component } from "react";
import {Meteor} from 'meteor/meteor'
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import SlideMenu from "../../components/sideMenu/SideMenu";
import Notifications from 'react-notify-toast';
import {notify} from 'react-notify-toast';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  logout = ()=>{
    Meteor.logout((err,done)=>{
      if(err){
        notify.show(err.error,'error');
        return false;
      }else{
        notify.show('Logging you out','success');
        this.setState({
          toLogin: true
        })
      }
    })
  }
  // if user not loggedIn dont show sideMenu
  render() {
    return (
      <div className='' style={{height: '100%'}}>
        <div className='padding'>
          <h3 className='padding'><i className="fa fa-cog" aria-hidden="true"></i> Settings</h3>
        </div>
        <div className="list">
          <a className="item item-icon-left" href="#">
            <i className="icon ion-email"></i>
            Edit E-Mail
          </a>

          <a className="item item-icon-left item-icon-right" href="#">
            <i className="icon ion-chatbubble-working"></i>
            Call Support
            <i className="icon ion-ios-telephone-outline"></i>
          </a>
          <div class="item item-divider">
            Others
          </div>
          <Link to="#" onClick={this.logout} className="item item-icon-left">
            <i className="icon fa fa-sign-out"></i>
            Logout
          </Link>
        </div>

        {this.state.toLogin &&
          <Redirect to="/login" />
        }
      </div>
    );
  }
}
