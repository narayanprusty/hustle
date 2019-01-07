import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { notify } from "react-notify-toast";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import "./Login_client.scss";

export default class Login extends Component {
  constructor(props) {
    super();

    this.state = {
      formSubmitError: "",
      formSubmitSuccess: false,
      userType: "Rider"
    };
  }
  componentDidMount() {
    //if user logged in redirect him/her
    const user = Meteor.userId();
    if (user) {
      location.href = "/";
    }
  }

  inputHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  loginHandler = e => {
    e.preventDefault();
    this.setState(
      {
        login_formloading: true
      },
      () => {
        Meteor.loginWithPassword(
          { email: this.state.phone },
          this.state.password,
          error => {
            if (error && error.reason) {
              notify.show(error.reason, "error");
              this.setState({
                login_formloading: false,
                formSubmitError: error.reason
              });
            } else if (error && !error.reason) {
              notify.show("Some Error Occured!", "error");
              this.setState({
                login_formloading: false,
                formSubmitError: "An error occured.please try again."
              });
            } else {
              notify.show("Login successful!", "success");
              this.setState({
                login_formloading: false,
                formSubmitError: ""
              });

              window.open("/", "_self");
            }
          }
        );
      }
    );
  };

  render() {
    return (
      <div className="padding">
        <div className='list padding'>
          <div style={{
            textAlign: 'center',
            paddingBottom: '30px'
          }} className='padding-bottom padding-top'> 
            <img src='/images/logo.png' style={{
              width: '40%'
            }} />
          </div>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Phone</span>
            <PhoneInput
              placeholder="Enter phone number"
              value={ this.state.phone }
              onChange={ phone => this.setState({ phone }) } />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Password</span>
            <input
              type="password"
              placeholder="password"
              name="password"
              onChange={this.inputHandler.bind(this)}
            />
          </label>
          <div className="padding-top">
            <button onClick={this.loginHandler.bind(this)}
              disabled={this.state.phone && this.state.password ? false : true} className="button button-block button-energized activated">Login</button>
          </div>
          
        </div>
        <span className='seperator padding-left padding-right padding-bottom'>&nbsp;&nbsp;OR&nbsp;&nbsp;</span>
        <div className='row'>
          <div className='col col-60'>
            <button onClick={() => {this.props.history.push('/signup')}} className="button button-block button-light activated"><i className="fa fa-key" aria-hidden="true"></i> Forgot Password </button>
          </div>
          <div className='col col-40'>
            <button onClick={() => {this.props.history.push('/signup')}} className="button button-block button-dark activated"><i className="fa fa-user-plus" aria-hidden="true"></i> Sign Up</button>
          </div>
        </div>
      </div>
    );
  }
}
