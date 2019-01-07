import React, { Component } from "react";
import { Link } from "react-router-dom";
import {Meteor} from 'meteor/meteor';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {notify} from 'react-notify-toast';


import "./Register_client.scss";
export default class Register extends Component {
  constructor(props) {
    super(); 
    this.state = {
      formSubmitError: "",
      formSubmitSuccess: false,
      userType: "Rider",
    };
  }

  componentDidMount() {
    //if user logged in redirect him/her
    const user = Meteor.userId();
    if (user) {
      location.href = "/";
    }
  }
  sendMessage= (e)=>{
    Meteor.call('verificationMessage',this.state.phone,(err,res)=>{
      if(err){
        console.log(err);
        return notify.show('Failed sending code.','error');
      }
      notify.show('Verification code sent!','success');
      this.setState({
        token:res.token,
        isSent:true,
        sendable:true
      });
      setTimeout(()=>this.setState({sendable:false}),5000);
    });
  }
  createAccount = e => {
    e.preventDefault();
    if(this.state.token != this.state.verification){
      notify.show('Wrong Verification code!','error');
      return;
    }else{
    this.setState(
      {
        register_formloading: true
      },
      () => {
        Accounts.createUser(
          {
            password: this.state.password,
            email:this.state.phone,
            profile: {
              firstName: this.state.first_name,
              lastName: this.state.last_name,
              userType: this.state.userType,
              phone:this.state.phone
            }
          },
          error => {
            console.log(error);
            if (error) {
              if (error.error) {
                this.setState({
                  register_formloading: false,
                  formSubmitSuccess: true
                });
                notify.show(error.error,'error');
              }else {
                this.setState({
                  register_formloading: false,
                  formSubmitError: error.reason,
                  formSubmitSuccess: false
                });
              }
            } else {
              notify.show('Account created successfully!','success');
              this.setState({
                register_formloading: false,
                formSubmitError: "",
                formSubmitSuccess: false
              });
              location.href='/'
            }
          }
        );
      }
    );
    }
  };

  inputHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  render() {
    const {phone,first_name,last_name,password,verification,isSent,sendable} =this.state;
    return (
      <div className="root">
        {/* <img src="/images/HUS5.png"/> */}

        {/* <div className="switch-field">
          <div className="switch-title">I am:</div>
          <input
            type="radio"
            id="switch_left"
            name="userType"
            value="Driver"
            onChange={this.inputHandler.bind(this)}
            checked={this.state.userType == "Driver" ? true : false}
          />
          <label for="switch_left">Driver</label>
          <input
            type="radio"
            id="switch_right"
            name="userType"
            value="Rider"
            onChange={this.inputHandler.bind(this)}
            checked={this.state.userType == "Rider" ? true : false}
          />
          <label for="switch_right">Rider</label>
        </div> */}

        <div className="list">
          <label className="item item-input item-stacked-label">
            <span className="input-label">First Name</span>
            <input
              type="text"
              placeholder="Saikat"
              name="first_name"
              onChange={this.inputHandler.bind(this)}
            />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Last Name</span>
            <input
              type="text"
              placeholder="Chakrabortty"
              name="last_name"
              onChange={this.inputHandler.bind(this)}
            />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Phone</span>
            <input
              type="text"
              placeholder="e.g. 8373886873"
              name="phone"
              max='10'
              onChange={this.inputHandler.bind(this)}
            /> 
           
          </label>
          <button className="button button-small button-positive" onClick={this.sendMessage.bind(this)} disabled={phone ? (isSent ? sendable: false) : true}>
             {isSent ? 'resend' : 'verify'}
            </button>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Verification Code</span>
            <input
              type="text"
              placeholder="verification code"
              name="verification"
              onChange={this.inputHandler.bind(this)}
            />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Password</span>
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={this.inputHandler.bind(this)}
            />
          </label>
          <br />
          &nbsp;
          <div style={{ textAlign: "center" }}>
            <button
              className="button button-small button-energized"
              style={{ marginTop: "2em", marginLeft: "10em" }}
              onClick={this.createAccount.bind(this)}
              disabled={phone && first_name && last_name && password && verification  ? false : true}
            >
              Register
            </button>
            <Link
              to="/login"
              className="button button-small button-energized"
              style={{ marginTop: "2em", marginLeft: "10em" }}
            >
              Login <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
