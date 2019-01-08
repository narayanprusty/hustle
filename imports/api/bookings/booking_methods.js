import {
  newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment,fetchUserBookings
} from "./booking.js";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment,fetchUserBookings
});
export {};