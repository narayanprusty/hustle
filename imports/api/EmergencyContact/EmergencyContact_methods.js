import { getContacts, saveAndUpdate } from "./EmergencyContact.js";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    getContacts,
    saveAndUpdate
});

export {};
