import React, { Component } from "react";
import './Home_client.scss'


export default class Home extends Component{
    componentDidMount(){
        //if user logged in redirect him/her
        const user = Meteor.userId();
        if(!user){
          location.href = '/login';
        } 
      }

    render(){
        return(<div className='root'>All those map things will be here</div>)
    }
}