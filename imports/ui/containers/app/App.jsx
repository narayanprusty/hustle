import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Main from "../main/Main";
const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/*" component={Main} />
    </Switch>
  </BrowserRouter>
);

export default App;
