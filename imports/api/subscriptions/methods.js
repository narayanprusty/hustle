import {
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan
} from './subscriptions';

import {
    Meteor
} from "meteor/meteor";

Meteor.methods({
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan
});

export {};