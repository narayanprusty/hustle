import {
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver,
    updateDriverLocation
} from "./driverMeta";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver,
    updateDriverLocation
});
export {};
