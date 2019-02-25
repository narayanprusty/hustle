import {
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan,
    cancelSubscription
} from './subscriptions';

import {
    Meteor
} from "meteor/meteor";

Meteor.methods({
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan,
    cancelSubscription
});

export {};