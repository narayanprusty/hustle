import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema';


const EmailVerificationCollection = new Mongo.Collection(
  "emailVerification"
);


EmailVerificationCollection.schema = new SimpleSchema({
  accountId: {
    type: Mongo.ObjectID
  },
  emailId: {
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


export const EmailVerification = EmailVerificationCollection;
