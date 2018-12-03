import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { slide as Menu } from "react-burger-menu";
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

class SlideMenu extends Component {
  render() {
    return (
      <Menu styles={styles}>
        <a id="home" className="bm-item" href="/">
          Home
        </a>
        <br />
        <a id="about" className="bm-item" href="/about">
          About
        </a>
        <br />
        <a id="contact" className="bm-item" href="/contact">
          Contact
        </a>
      </Menu>
    );
  }
}

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  openMenu = () => {
    this.setState({
      openMenu: this.state.openMenu ? false : true
    });
  };

  render() {
    return (
      <div>
        <SlideMenu />
        {/* <ion-header>
                <ion-item >
                <button onClick={this.openMenu}>
                <ion-icon name="menu"></ion-icon>
                </button>
                </ion-item>
            </ion-header> */}
      </div>
    );
  }
}
