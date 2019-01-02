import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect ,Link} from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Hello from '../../pages/Hello';
import Register from '../../pages/register/Register';

export default class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <div className="page-container" style={{paddingLeft:'10%',paddingTop:'4%'}}>
        <Route exact path="/hello" component={Hello} />
        <Route exact path="/signup" component={Register} />
        </div>
    );
  }
}
