import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Hello from "../../pages/Hello";
import Register from "../../pages/register/Register";
import Layout from "./Layout";
import SlideMenu from "../../components/sideMenu/SideMenu";
export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
       
          <SlideMenu />
       
        <br />
        <Layout />
      </div>
    );
  }
}
