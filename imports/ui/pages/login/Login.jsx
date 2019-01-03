import React, { Component } from "react";
import { Link } from "react-router-dom";
import '../Generic.scss';
import './Login_client.scss';
export default class Login extends Component {
  constructor(props) {
    super();

    this.state = {
      formSubmitError: "",
      formSubmitSuccess: false,
      userType: "Driver"
    };
  }

  render() {
    return (
       
      <div className="root list">
        <label className="item item-input item-stacked-label">
          <span className="input-label">Username</span>
          <input type="text" />
        </label>
        <label className="item item-input item-stacked-label">
          <span className="input-label">Password</span>
          <input type="password" />
        </label>
        <div style={{textAlign:"center"}}>
          <button
            className="button button-medium button-energized"
            // onClick={this.createAccount.bind(this)}
          >
            submit
          </button>
          </div>
      </div>
    
    );
  }
}
