import {
    rateDriver,
    rateRider,
    fetchAvgRatingDriver,
    fetchAvgRatingRider,
    fetchRatingsDriver,
    fetchRatingsRider
} from "./reviews";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    rateDriver,
    rateRider,
    fetchAvgRatingDriver,
    fetchAvgRatingRider,
    fetchRatingsDriver,
    fetchRatingsRider
});
export {};
