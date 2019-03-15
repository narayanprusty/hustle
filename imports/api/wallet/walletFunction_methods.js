import {
    createWallet,
    getUserWallet,
    payUsingWallet,
    returnChangeToWallet
} from "./walletFunctions";
import {
    Meteor
} from "meteor/meteor";
Meteor.methods({
    createWallet,
    getUserWallet,
    payUsingWallet,
    returnChangeToWallet
});

export {
};
