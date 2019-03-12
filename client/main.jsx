import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import App from "../imports/ui/containers/app/App";

Meteor.startup(() => {
    Push.Configure({
        android: {
            senderID: 937200706426,
            alert: true,
            badge: true,
            sound: true,
            vibrate: true,
            clearNotifications: true
            // icon: '',
            // iconColor: ''
        },
        ios: {
            alert: true,
            badge: true,
            sound: true
        }
    });
    render(<App />, document.getElementById("react-target"));
});
