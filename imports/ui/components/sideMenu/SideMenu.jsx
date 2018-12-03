import React,{Component} from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import {SideMenu} from 'react-sidemenu';

const items = [
    {divider: true, label: 'Main navigation', value: 'main-nav'},
    {label: 'item 1', value: 'item1', icon: 'fa-search',
    children: [
      {label: 'item 1.1', value: 'item1.1', icon: 'fa-snapchat',
      children: [
        {label: 'item 1.1.1', value: 'item1.1.1', icon: 'fa-anchor'},
        {label: 'item 1.1.2', value: 'item1.1.2', icon: 'fa-bar-chart'}]},
      {label: 'item 1.2', value: 'item1.2'}]}
  ];
export default (<SideMenu items={items} />);

