import {
    addCard,
    getCards,
    removeCard,
    getCardsForPayment,
    getCheckoutId
} from "./payments";
import {
    Meteor
} from "meteor/meteor";

Meteor.methods({
    addCard,
    getCards,
    removeCard,
    getCardsForPayment,
    getCheckoutId
});
export {};