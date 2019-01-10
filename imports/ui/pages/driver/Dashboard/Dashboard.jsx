import React, { Component } from "react";
import { Link } from "react-router-dom";


export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render(){
    return(<div><Link to='/app/driver/newreqs'>See new Requests</Link></div>)
}

}