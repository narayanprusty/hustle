import React, { Component } from "react";
import { Link } from "react-router-dom";
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

  inputHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  loginHandler = e => {
    e.preventDefault();
    this.setState({
      login_formloading:true
    },()=>{
      Meteor.loginWithPassword(this.state.email, this.state.password, error => {
      if (error && error.reason) {
        
        this.setState({
          login_formloading:false,
          formSubmitError: error.reason,
        });
      } else if (error && !error.reason){
        this.setState({
          login_formloading:false,
          formSubmitError: "An error occured.please try again.",
        });
      }else {
        if (window.location.search.includes('action=join-network')) {
          window.open('/', '_self');
        }
        this.setState({
          login_formloading:false,
          formSubmitError: '',
        });
      }
    });
  });
  };

  render() {
    return (
       
      <div className="root list">
        <label className="item item-input item-stacked-label">
          <span className="input-label">Email</span>
          <input type="text" placeholder="saikat@gmail.com" name='email' onChange={this.inputHandler.bind(this)} />
        </label>
        <label className="item item-input item-stacked-label">
          <span className="input-label">Password</span>
          <input type="password" placeholder="password" name='password' onChange={this.inputHandler.bind(this)} />
        </label>
        <div style={{textAlign:"center"}}>
          <button
            className="button button-medium button-energized"
            onClick={this.loginHandler.bind(this)}
          >
            Login
          </button>
          </div>
      </div>
    
    );
  }
}
