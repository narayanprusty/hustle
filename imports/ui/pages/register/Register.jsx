import React, { Component } from "react";
import './Register_client.scss';
export default class Register extends Component {
  constructor(props) {
    super();

    this.state = {
      formSubmitError: "",
      formSubmitSuccess: false,
      userType:'Driver'
    };
  }
  createAccount = e => {
    e.preventDefault();
    this.setState(
      {
        register_formloading: true
      }, 
      () => {
        
        Accounts.createUser(
          {
            email: this.state.email,
            password: this.state.password,
            profile: {
              firstName: this.state.first_name,
              lastName: this.state.last_name,
              userType:this.state.userType
            }
          },
          error => {
            console.log(error);
            if (error) {
              if (error.error && error.error === "unverified-account-created") {
                this.setState({
                  register_formloading: false,
                  formSubmitError: "",
                  formSubmitSuccess: true
                });
              } else if (error && !error.error) {
                this.setState({
                  register_formloading: false,
                  formSubmitError:
                    "An error occured during creating your account.",
                  formSubmitSuccess: true
                });
              } else {
                this.setState({
                  register_formloading: false,
                  formSubmitError: error.reason,
                  formSubmitSuccess: false
                });
              }
            } else {
              this.setState({
                register_formloading: false,
                formSubmitError: "",
                formSubmitSuccess: false
              });
            }
          }
        );
      }
    );
  };

  inputHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  render() {
    return (
      <div
       className='root'
      >
          {/* <img src="/images/HUS5.png"/> */}

         <div className="switch-field">
      <div className="switch-title">I am:</div>
      <input type="radio" id="switch_left" name="userType" value="Driver" onChange={this.inputHandler.bind(this)} checked={this.state.userType == 'Driver' ? true :false}/>
      <label for="switch_left">Driver</label>
      <input type="radio" id="switch_right" name="userType" value="Rider" onChange={this.inputHandler.bind(this)} checked={this.state.userType == 'Rider' ? true :false}/>
      <label for="switch_right">Rider</label>
  </div> 

        <div className="list">
          <label className="item item-input item-stacked-label">
            <span className="input-label">First Name</span>
            <input type="text" placeholder="Saikat" name='first_name' onChange={this.inputHandler.bind(this)}/>
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Last Name</span>
            <input type="text" placeholder="Chakrabortty" name='last_name' onChange={this.inputHandler.bind(this)} />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Email</span>
            <input type="text" placeholder="e.g. john@suhr.com" name='email' onChange={this.inputHandler.bind(this)} />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Phone</span>
            <input type="text" placeholder="e.g. +918373886873" name='phone' onChange={this.inputHandler.bind(this)} />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Password</span>
            <input type="password" placeholder="Password" name='password' onChange={this.inputHandler.bind(this)} />
          </label>
          <br />&nbsp;
          <div style={{textAlign:"center"}}>
          <button
            className="button button-medium button-energized"
            onClick={this.createAccount.bind(this)}
          >
            Register
          </button>
          </div>
        </div>
      </div>
    );
  }
}
