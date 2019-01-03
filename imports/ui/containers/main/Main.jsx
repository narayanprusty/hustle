import React, { Component } from "react";
import {Meteor} from 'meteor/meteor'
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Layout from "./Layout";
import SlideMenu from "../../components/sideMenu/SideMenu";
export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // if user not loggedIn dont show sideMenu
  render() {
    return (
      <div>
       {Meteor.user()
          &&(<SlideMenu />)}
       
        <br />
        <Layout />
      </div>
    );
  }
}
