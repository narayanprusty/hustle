import { autoRenewal } from "../../../../api/subscriptions/subscriptions";

module.exports = function(agenda) {
    const name = "subscriptionAutoPayment";
    agenda.define(
        name,
        { priority: "highest" },
        Meteor.bindEnvironment(job => {
            autoRenewal();
        })
    );
    (async () => {
        await agenda.every("1 day", name);
    })();
};
