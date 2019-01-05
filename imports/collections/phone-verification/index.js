import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema';


const PhoneVerificationCollection = new Mongo.Collection(
  "phoneVerification"
);


PhoneVerificationCollection.schema = new SimpleSchema({
  accountId: {
    type: Mongo.ObjectID
  },
  phone: {
    type: String
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
  uniqueToken: {
    type: String
  },
  active: {
    type: Boolean
  }
});


export const PhoneVerification = PhoneVerificationCollection;
