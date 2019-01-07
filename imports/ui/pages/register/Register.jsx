import React, { Component } from "react";
import { Link } from "react-router-dom";
import {Meteor} from 'meteor/meteor';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {notify} from 'react-notify-toast';
import PhoneInput from 'react-phone-number-input'

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
              name: this.state.first_name,
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
                notify.show((error.reason =='Email already exists.') ?  'Phone already exists.' :error.reason ,'error');
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
    const {phone,first_name,password,verification,isSent,sendable} =this.state;
    return (
      <div className="padding">
        <div className='list'>
          <h3 className='padding-bottom'><i className="fa fa-user-plus" aria-hidden="true"></i> Create Account</h3>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Name</span>
            <input
              type="text"
              placeholder="Saikat"
              name="first_name"
              onChange={this.inputHandler.bind(this)}
            />
          </label>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Phone</span>
            <PhoneInput
              placeholder="Enter phone number"
              value={ this.state.phone }
              onChange={ phone => this.setState({ phone }) } />
          </label>
          <button className="button button-block button-energized activated" onClick={this.sendMessage.bind(this)} disabled={phone ? (isSent ? sendable: false) : true}>
             {isSent ? 'Resend' : 'Verify'}
          </button>
          <label className="item item-input item-stacked-label">
            <span className="input-label">Verification Code</span>
            <input
              type="text"
              placeholder="####"
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
          <button onClick={this.createAccount.bind(this)}
              disabled={phone && first_name && password && verification  ? false : true} className="button button-block button-energized activated">Register</button>
        </div>
        <span className='seperator padding-left padding-right padding-bottom'>&nbsp;&nbsp;OR&nbsp;&nbsp;</span>
        <div className='row'>
          <div className='col col-100'>
            <button onClick={() => {this.props.history.push('/login')}} className="button button-block button-light activated"><i className="fa fa-sign-in" aria-hidden="true"></i> Login </button>
          </div>
        </div>
      </div>
    );
  }
}
