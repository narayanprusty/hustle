import {
    newBookingReq,
    onDriverAccept,
    onStartRide,
    onStopRide,
    onConfirmPayment,
    fetchUserBookings,
    fetchDriverBookings,
    fetchBookingReq,
    onCancellation,
    currentBookingDriver,
    currentBookingRider,
    paymentReceived,
    getBookingById,
    fetchLocationwithKeyword,
    getBookingFromDb,
    getDriverLocation,
    calculateApproxBookingPrice,
    calculateFinalBookingPrice,
    getPricingConfig,
} from "./booking.js";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    newBookingReq,
    onDriverAccept,
    onStartRide,
    onStopRide,
    onConfirmPayment,
    fetchUserBookings,
    fetchDriverBookings,
    fetchBookingReq,
    onCancellation,
    currentBookingDriver,
    currentBookingRider,
    paymentReceived,
    getBookingById,
    fetchLocationwithKeyword,
    getBookingFromDb,
    getDriverLocation,
    calculateApproxBookingPrice,
    calculateFinalBookingPrice,
    getPricingConfig,
});
export {};
