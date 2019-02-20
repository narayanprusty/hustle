import { getContacts, saveAndUpdate } from "./EmergencyContact";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    getContacts,
    saveAndUpdate
});

export {};
