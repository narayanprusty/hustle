import {
    newBookingReq,
    onDriverAccept,
    onStartRide,
    onStopRide,
    onConfirmPayment,
    fetchUserBookings,
    fetchBookingReq,
    onCancellation,
    currentBookingDriver,
    currentBookingRider,
    paymentReceived,
    getBookingById,
    fetchLocationwithKeyword
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
    currentBookingDriver,
    currentBookingRider,
    paymentReceived,
    getBookingById,
    fetchLocationwithKeyword
});
export {};
