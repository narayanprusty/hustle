import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import App from "../imports/ui/containers/app/App";
import config from "../imports/modules/config/client";

Meteor.startup(() => {
    if (Meteor.isDevelopment) {
        Push.debug = true;
    }

    Push.Configure({
        android: {
            senderID: config.PUSH_NOTIF.FCM.SENDER_ID,
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
