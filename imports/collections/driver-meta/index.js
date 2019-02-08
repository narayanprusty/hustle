import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const DriverMetaCollection = new Mongo.Collection("DriverMeta");

DriverMetaCollection.schema = new SimpleSchema({
    driverId: {
        type: String
    },
    driverEmail: {
        type: String
    },
    currentLocation: {
        type: Object
    },
    onRide: {
        type: Boolean,
        defaultValue: false
    },
    available: {
        type: Boolean,
        defaultValue: true
    },
    avgRating: {
        type: Number,
        defaultValue: 5
    },
    noOfRating: {
        type: Number,
        defaultValue: 0
    },
    totalNumberOfRide: {
        type: Number,
        defaultValue: 0
    },
    carType: {
        type: String
        //can be of this types olnly
        //sedan,suv,exec,mini,micro,lux
    },
    carModel: {
        type: String
    },
    carNumber: {
        type: String
    }
});
if (Meteor.isServer) {
    DriverMetaCollection.rawCollection().createIndex({
        currentLocation: "2dsphere"
    });
}
export const DriverMeta = DriverMetaCollection;
