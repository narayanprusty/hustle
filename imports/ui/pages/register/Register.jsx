import React, {Component} from 'react';
import {Link} from 'react-router-dom'
// import validations from "../../../startup/client/validations"
import LaddaButton, { S, SLIDE_UP } from 'react-ladda';

export default class Register extends Component {
	
	constructor(props){
		super();

		this.state = {
	      formSubmitError: "",
		  formSubmitSuccess: false
	    };
	}

	createAccount = (e) => {
		e.preventDefault();
		this.setState({
			register_formloading:true
		  },()=>{
		Accounts.createUser({
			email: this.email.value,
			password: this.pass.value,
			profile: {
				firstName: this.fname.value,
				lastName: this.lname.value
			}
		}, (error) => {
			console.log(error);
			if(error) {
				if(error.error && error.error === "unverified-account-created") {
					this.setState({
						register_formloading:false,
						formSubmitError: '',
						formSubmitSuccess: true
					})
				} else if(error && !error.error){
					this.setState({
						register_formloading:false,
						formSubmitError: 'An error occured during creating your account.',
						formSubmitSuccess: true
					})
				}else {
					this.setState({
						register_formloading:false,
						formSubmitError: error.reason,
						formSubmitSuccess: false
					})
				}
			} else {
				this.setState({
					register_formloading:false,
					formSubmitError: '',
					formSubmitSuccess: false
				})
			}
		})
	});
	}

	render(){
		return (
			<ion-card>
  <ion-card-header>
   
    <ion-card-title>Signup</ion-card-title>
  </ion-card-header>

  <ion-card-content>
<ion-input name="firstname" placeholder="first name"></ion-input>
<ion-input name="lastname" placeholder="last name"></ion-input>
<ion-input name="email" placeholder="email"></ion-input>
<ion-input name="password" placeholder="password" type="password"></ion-input>
  </ion-card-content>
  <ion-button >
      <ion-icon slot="icon-only" name="star"></ion-icon>
    </ion-button>
</ion-card>
		)
	}
}
