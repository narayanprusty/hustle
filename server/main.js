import { Meteor } from "meteor/meteor";
import AWS from "aws-sdk";
require("../imports/startup/server");
import config from "../imports/modules/config/server";
import Verifier from "../imports/api/emails/email-validator";
Accounts.validateLoginAttempt(function(options) {
    if (!options.allowed) {
        return false;
    }

    // if (options.methodName == 'createUser') {
    //   throw new Meteor.Error('unverified-account-created');
    // }
    //If user is driver, check if its marked verified by admin
    // if(options.user.userType == 'Driver' && user.profile.driver_verified){
    //   throw new Meteor.Error('Account not yet activated');
    // }
    return true;
    // if (options.user.emails[0].verified === true) {
    //   return true;
    // } else {
    //   throw new Meteor.Error('email-not-verified', 'Your email is not verified. Kindly check your mail.');
    // }
});

Accounts.onCreateUser(function(options, user) {
    user.firstLogin = false;
    user.profile = options.profile || {};

    // Assigns first and last names to the newly created user object
    user.profile.firstName = options.profile.firstName;
    user.profile.lastName = options.profile.lastName;
    // if(options.profile.userType == 'Driver'){
    //   user.profile.driver_verified = false
    // }

    // if (!(!options.profile.firstName || options.profile.firstName === 'null' || options.profile.firstName === 'undefined')) {
    //   Verifier.sendEmailVerification(user);
    // }

    return user;
});

Meteor.startup(() => {
    console.log(">>>> Server Started <<<<");
    if (Meteor.isServer()) {
        Push.Configure({
            gcm: {
                projectNumber: 937200706426,
                apiKey: "AIzaSyA6PmzL_3n5T1qFgpv9Fnf4MyAYfVPhi_8"
            }
        });
    }
    AWS.config.update(config.AWS);
    WebApp.rawConnectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
});
