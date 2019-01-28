import {
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver
} from "./driverMeta";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver
});
export {};
