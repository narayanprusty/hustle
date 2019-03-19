import {
    triggerSos,
    getUserProfile,
    changeNameAndEmail,
    uploadeFile
} from "./userFunction";
import { Meteor } from "meteor/meteor";
Meteor.methods({ triggerSos, getUserProfile, changeNameAndEmail, uploadeFile });

export {};
