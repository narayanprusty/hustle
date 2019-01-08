import React, { Component,Fragment } from "react";

import "./Home_client.scss";


export default class Home extends Component {
  static defaultProps = {};
  state = {};
  componentDidMount = async () => {
    //if user logged in redirect 
    const user = Meteor.userId();
    if (!user) {
      location.href = "/login";
    }
  };

  
  render() {
    
    return (
      <div style={{height: '100%'}}>
        Hii
      </div>
    );
  }
}
