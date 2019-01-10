import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema';


const BookingRecordCollection = new Mongo.Collection(
  "BookingRecord"
);


BookingRecordCollection.schema = new SimpleSchema({
    bookingId:{
        type:String,
    },
    userId:{
        type:String
    },
    totalFare:{
        type:Number
    },
    totalDistance:{
        type:Number
    },
    totalDuration:{
        type:String
    },
    active:{
        type:Boolean,
        defaultValue:true
    },
    boardingPoint:{
        type:Object
    },
    createdAt:{
        type:new Date(),
        defaultValue:Date.now()
    }
});
if(Meteor.isServer){
BookingRecordCollection.rawCollection().createIndex({ boardingPoint: '2dsphere' });
}

export const BookingRecord = BookingRecordCollection;
