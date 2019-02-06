import {
    addCard,
    getCards,
    removeCard,
    getCardsForPayment,
} from "./payments";
import {
    Meteor
} from "meteor/meteor";

Meteor.methods({
    addCard,
    getCards,
    removeCard,
    getCardsForPayment,
});
export {};