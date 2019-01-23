import {
  newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment,
  fetchUserBookings,
  fetchBookingReq,
  onCancellation,
  getBookingById,
  paymentReceived
} from "./booking.js";
import { Meteor } from "meteor/meteor";

Meteor.methods({
  newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment,
  fetchUserBookings,
  fetchBookingReq,
  onCancellation,
  getBookingById,
  paymentReceived
});
export {};
