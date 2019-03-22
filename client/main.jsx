import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { notify } from "react-notify-toast";

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
            clearNotifications: true,
            icon: "android_mdpi"
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
        notify.show(notification.message, "success");
    });
    if (window.cordova) {
        cordova.plugins.backgroundMode.on("activate", () => {
            cordova.plugins.backgroundMode.disableWebViewOptimizations();
        });
    }
    render(<App />, document.getElementById("react-target"));
});
