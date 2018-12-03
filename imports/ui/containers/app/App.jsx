import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import Main from '../main/Main';
const App = () => (
  <div>
    <h1>Welcome to Meteor!</h1>
    <Main />
  </div>
);

export default App;
