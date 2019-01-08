import {
  newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment
} from "./booking.js";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment
});
export {};