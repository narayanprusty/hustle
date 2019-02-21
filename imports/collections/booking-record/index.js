import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const BookingRecordCollection = new Mongo.Collection("BookingRecord");

BookingRecordCollection.schema = new SimpleSchema({
    bookingId: {
        type: String
    },
    username: {
        type: String
    },
    userId: {
        type: String
    },
    totalFare: {
        type: Number
    },
    driverId: {
        type: String
    },
    totalDistance: {
        type: Number
    },
    totalDuration: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    active: {
        type: Boolean,
        defaultValue: true
    },
    boardingPoint: {
        type: Object
    },
    droppingPoint: {
        type: Object
    },
    createdAt: {
        type: new Date(),
        defaultValue: Date.now()
    },
    riderRating: {
        type: Number
        //rating of the user at the time of booking
    },
    preferredCar: {
        type: String
    },
    status: {
        type: String
        //accepted riding
        //pending
        // started
        //finished
    }
});
if (Meteor.isServer) {
    BookingRecordCollection._ensureIndex({
        boardingPoint: "2dsphere"
    });
}

export const BookingRecord = BookingRecordCollection;
