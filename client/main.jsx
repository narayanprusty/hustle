import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import App from "../imports/ui/containers/app/App";

Meteor.startup(() => {
    if (Meteor.isDevelopment) {
        Push.debug = true;
    }
    if (Meteor.isCordova) {
        PushNotification.createChannel(
            function() {
                console.log("Channel Created!");
            },
            function() {
                console.log("Channel not created :(");
            },
            {
                id: "PushPluginChannel",
                description: "Channel Name Shown To Users",
                importance: 3,
                vibration: true
            }
        );
    }
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
    Push.enabled(true);
    Push.addListener("message", function(notification) {
        window.confirm(notification.message, "notifications", [
            "Voir",
            "fermer"
        ]);
    });
    render(<App />, document.getElementById("react-target"));
});
