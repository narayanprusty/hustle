import React, { Component } from "react";
import './Register.css';

export default class Register extends Component {
  constructor(props) {
    super();

    this.state = {
      formSubmitError: "",
      formSubmitSuccess: false
    };
  }

  createAccount = e => {
    e.preventDefault();
    this.setState(
      {
        register_formloading: true
      },
      () => {
        debugger;
        console.log(this.email.value);
        // Accounts.createUser(
        //   {
        //     email: this.email.value,
        //     password: this.pass.value,
        //     profile: {
        //       firstName: this.fname.value,
        //       lastName: this.lname.value
        //     }
        //   },
        //   error => {
        //     console.log(error);
        //     if (error) {
        //       if (error.error && error.error === "unverified-account-created") {
        //         this.setState({
        //           register_formloading: false,
        //           formSubmitError: "",
        //           formSubmitSuccess: true
        //         });
        //       } else if (error && !error.error) {
        //         this.setState({
        //           register_formloading: false,
        //           formSubmitError:
        //             "An error occured during creating your account.",
        //           formSubmitSuccess: true
        //         });
        //       } else {
        //         this.setState({
        //           register_formloading: false,
        //           formSubmitError: error.reason,
        //           formSubmitSuccess: false
        //         });
        //       }
        //     } else {
        //       this.setState({
        //         register_formloading: false,
        //         formSubmitError: "",
        //         formSubmitSuccess: false
        //       });
        //     }
        //   }
        // );
      }
    );
  };

  inputHandler = e => {
    debugger;
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  alert = () => {
    alert("Onclick is working");
  };
  render() {
    const rounded = {
      width: "100%",
      height: "100px",
      "-moz-border-radius": "50px",
      "-webkit-border-radius": "50px",
      "border-radius": "10px",
      "margin-bottom": "10px"
    };
    return (
      <div
        style={{
          maxWidth: "600px"
        }}
      >
          <img src="/images/HUS5.png"/>

          <div class="switch-field">
      <div class="switch-title">I am:</div>
      <input type="radio" id="switch_left" name="switch_2" value="yes" checked/>
      <label for="switch_left">Driver</label>
      <input type="radio" id="switch_right" name="switch_2" value="no" />
      <label for="switch_right">Rider</label>
    </div>

        <div className="list">
          <label className="item item-input item-stacked-label">
            <span className="input-label">First Name</span>
            <input type="text" placeholder="Saikat" />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Last Name</span>
            <input type="text" placeholder="Chakrabortty" />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Email</span>
            <input type="text" placeholder="e.g. john@suhr.com" />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Phone</span>
            <input type="text" placeholder="e.g. +918373886873" />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Password</span>
            <input type="password" placeholder="Password" />
          </label>
          <br />
          <div style={{textAlign:"center"}}>
          <button
            className="button button-medium button-energized"
            onClick={this.alert.bind(this)}
          >
            submit
          </button>
          </div>
        </div>
      </div>
    );
  }
}
