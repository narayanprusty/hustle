import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Home from "../../pages/home/Home";
import Register from "../../pages/register/Register";
import EmailVerification from "../../pages/EmailVerification/EmailVerification";
import Login from "../../pages/login/Login";
class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        style={{
          backgroundSize: "contain",
          backgroundImage: "url(" + "/images/6.png)"
        }}
      >
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Register} />
        <Route exact path="/email-verify" component={EmailVerification} />
      </div>
    );
  }
}

export default Layout;
