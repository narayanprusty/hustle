import {
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan,
    cancelSubscription,
    reSubscribe
} from './subscriptions';

import {
    Meteor
} from "meteor/meteor";

Meteor.methods({
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan,
    cancelSubscription,
    reSubscribe
});

export {};