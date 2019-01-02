import React, { Component } from "react";

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

  inputHandler=(e)=>{
	debugger;
	this.setState({
		[e.target.name]:e.target.value
	})
  };
  alert=()=>{
	  alert('Onclick is working');
  }
  render() {
	const rounded ={
		width: '100%',
	  height: '100px',
	  '-moz-border-radius': '50px',
	  '-webkit-border-radius': '50px',
	  'border-radius': '10px',
	  'margin-bottom': '10px',
	}
    return (
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px"
        }}
      >
        <ion-card>
          <ion-card-header>
            <ion-card-title>Register</ion-card-title>
          </ion-card-header>

          <ion-card-content >
            <ion-item>
              <ion-label fixed>First Name:</ion-label>
              <ion-input name="firstname" placeholder="Enter your first name" onChange={this.inputHandler.bind(this)} />
            </ion-item>
            <ion-item>
              <ion-label fixed>Last Name:</ion-label>
              <ion-input name="lastname" placeholder="Enter your last name" />
            </ion-item>
            <ion-item>
              <ion-label fixed>Email:</ion-label>
              <ion-input name="email" placeholder="Enter your email" />
            </ion-item>
            <ion-item>
              <ion-label fixed>Phone:</ion-label>
              <ion-input name="phone" placeholder="Enter your phone number" />
            </ion-item>
            <ion-item>
              <ion-label fixed>Password:</ion-label>
              <ion-input
                name="password"
                placeholder="Enter your password"
                type="password"
              />
            </ion-item>
          </ion-card-content>
          <ion-button type='submit' onClick={this.alert.bind()}>Register</ion-button>
        </ion-card>
      </div>
    );
  }
}
