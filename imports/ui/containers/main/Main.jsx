import React, { Component } from "react";
import {Meteor} from 'meteor/meteor'
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Layout from "./Layout";
import SlideMenu from "../../components/sideMenu/SideMenu";

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

  // if user not loggedIn dont show sideMenu
  render() {
    return (
      <div style={{height: '100%'}}>
        { Meteor.userId() &&
          <div>
            <SlideMenu openMenu={this.state.openMenu} />
            <div className="row header-app" style={{
              borderBottomWidth: '1px',
              backgroundPosition: 'bottom',
              backgroundSize: '100% 1px',
              backgroundRepeat: 'background-repeat',
              borderBottomStyle: 'groove',
              borderBottomColor: 'rgba(255, 255, 255, 0.5)'
            }}>
              <div style={menuColStyles} className="col col-20"><button onClick={() => {
                this.setState({
                  openMenu: true
                })
              }} className="padding-left margin-left button button-icon icon ion-navicon" style={{marginTop: '2px'}}></button></div>
              <div style={{textAlign: 'center', fontSize: '17px', fontWeight: '500', lineHeight: '44px', ...menuColStyles}} className="col col-60"><h3 className="padding-top">Home</h3></div>
              <div style={{textAlign: 'right', fontSize: '17px', fontWeight: '500', lineHeight: '44px', ...menuColStyles}}  className="col col-20"><Link to='/bookings'><span className="padding-right"><i style={{marginTop: '16px', marginLeft: '24px'}} className="fa fa-car" aria-hidden="true"></i></span></Link></div>
            </div>
          </div>
        }
        <Layout />
      </div>
    );
  }
}
