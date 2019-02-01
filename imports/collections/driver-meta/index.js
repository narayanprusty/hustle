import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const DriverMetaCollection = new Mongo.Collection("DriverMeta");

DriverMetaCollection.schema = new SimpleSchema({
    driverId: {
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
