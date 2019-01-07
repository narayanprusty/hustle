import React,{Component} from "react";
import { BrowserRouter, Route, Switch, Redirect,Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { slide as Menu } from "react-burger-menu";
import { Meteor } from "meteor/meteor";
import {notify} from 'react-notify-toast';


var styles = {
  bmBurgerButton: {
    position: "fixed",
    width: "36px",
    height: "30px",
    left: "36px",
    top: "36px"
  },
  bmBurgerBars: {
    background: "#373a47"
  },
  bmCrossButton: {
    height: "24px",
    width: "24px"
  },
  bmCross: {
    background: "#bdc3c7"
  },
  bmMenu: {
    background: "#373a47",
    padding: "2.5em 1.5em 0",
    fontSize: "1.15em"
  },
  bmMorphShape: {
    fill: "#373a47"
  },
  bmItemList: {
    color: "#b8b7ad",
    padding: "0.8em"
  },
  bmItem: {
    color: "#b8b7ad",
    padding: "0.8em",
    display: "inline-block"
  },
  bmOverlay: {
    background: "rgba(0, 0, 0, 0.3)"
  }
};


export default class SlideMenu extends Component {
  state={
    isMenuOpen:false
  }
  logout = ()=>{
    Meteor.logout((err,done)=>{
      if(err){
        notify.show(err.error,'error');
        return false;
      }else{
        notify.show('Logging you out','success');
        location.href='/login'
      }

    })
  }
 
  render() {
    return (
      <Menu styles={styles} isOpen={ this.state.isMenuOpen } >
        <Link to='/'>
          Home
        </Link>
        <br />
        <Link to="/hello" >
          Hello
        </Link>
        <br />
        <Link to="/signup">
          Register
        </Link>
        <Link to='#' onClick={this.logout}>
            Logout
        </Link>
      </Menu>
      
      
    );
  }
};
