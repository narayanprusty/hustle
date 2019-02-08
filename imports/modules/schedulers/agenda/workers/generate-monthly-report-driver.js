import { iterateOverDrivers } from "../../../../api/driverMeta/driverMeta";

module.exports = function(agenda) {
    const name = "generate-monthly";
    agenda.define(
        name,
        { priority: "highest" },
        Meteor.bindEnvironment(job => {
            iterateOverDrivers();
        })
    );
    (async () => {
        await agenda.every("30 0 1 * *", name);
    })();
};
