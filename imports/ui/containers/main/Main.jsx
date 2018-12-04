import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect ,Link} from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { slide as Menu } from "react-burger-menu";
import Hello from '../../pages/Hello';
import Register from '../../pages/register/Register';
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
        <Link to='/'>
          Home
          </Link>
        <br />
        <Link to="/hello">
          Hello
        </Link>
        <br />
        <Link to="/signup">
          Contact
        </Link>
      </Menu>
    );
  }
}

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <SlideMenu />
        <div className="page-container">
        <Route exact path="/hello" component={Hello} />
        <Route exact path="/signup" component={Register} />
        </div>
        
      </div>
    );
  }
}
