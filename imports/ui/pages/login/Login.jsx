import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import "./Login_client.scss";
export default class Login extends Component {
  constructor(props) {
    super();

    this.state = {
      formSubmitError: "",
      formSubmitSuccess: false,
      userType: "Driver"
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
          this.state.email,
          this.state.password,
          error => {
            if (error && error.reason) {
              this.setState({
                login_formloading: false,
                formSubmitError: error.reason
              });
            } else if (error && !error.reason) {
              this.setState({
                login_formloading: false,
                formSubmitError: "An error occured.please try again."
              });
            } else {
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
      <div className="root list" style={{ paddingTop: "16%" }}>
        <label className="item item-input item-stacked-label">
          <span className="input-label">Email</span>
          <input
            type="text"
            placeholder="saikat@gmail.com"
            name="email"
            onChange={this.inputHandler.bind(this)}
          />
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
        <div style={{ textAlign: "center" }}>
          <button
            className="button button-small button-energized"
            style={{ marginTop: "2em" }}
            onClick={this.loginHandler.bind(this)}
          >
            Login
          </button>
          <Link
            to="/signup"
            className="button button-small button-energized"
            style={{ marginTop: "2em", marginLeft: "10em" }}
          >
            Signup <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>
    );
  }
}
