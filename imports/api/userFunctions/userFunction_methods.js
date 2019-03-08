import {
    triggerSos,
    getUserProfile,
    changeName,
    uploadeFile
} from "./userFunction";
import { Meteor } from "meteor/meteor";
Meteor.methods({ triggerSos, getUserProfile, changeName, uploadeFile });

export {};
