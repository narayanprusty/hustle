import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect ,Link} from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Hello from '../../pages/Hello';
import Register from '../../pages/register/Register';
import Login from "../../pages/login/Login";
 class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <div className="page-container" style={{paddingLeft:'10%',paddingTop:'4%', backgroundSize:'contain',backgroundImage:'url('+'/images/6.png)'}}>
        <Route exact path="/hello" component={Hello} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Register} />
        </div>
    ); 
  }
}

export default Layout;