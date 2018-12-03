import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Links from '../api/links';

class Info extends Component {
  state={
    checked:true
  };
   status = (e)=>{
    console.log(e.target.value)
    
    this.setState({
      checked: this.state.checked ? false :true
    });
  };

  render() {
    const links = this.props.links.map(
      link => this.makeLink(link)
    );
       
  
    return (
      <ion-item>
      <ion-label>Demo</ion-label>
      <ion-toggle onClick={this.status.bind(this)} checked={this.state.checked} />
    </ion-item>
    );
  }

  makeLink(link) {
    return (
      <li key={link._id}>
        <a href={link.url} target="_blank">{link.title}</a>
      </li>
    );
  }
}

export default InfoContainer = withTracker(() => {
  return {
    links: Links.find().fetch(),
  };
})(Info);
