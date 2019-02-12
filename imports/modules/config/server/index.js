const defaults = require("../local.config.js");

function getEnv() {
    if (
        ["production", "staging", "test", "dev"].includes(process.env.NODE_ENV)
    ) {
        return process.env.NODE_ENV;
    }
    return "dev";
}

function getDatabase() {
    const a = process.env.MONGO_URL || defaults.MONGO_URL;
    if (!a) {
        return "admin";
    }

    if (a.indexOf("?replica") === -1) {
        return "admin";
    }

    const db = a.substring(a.lastIndexOf("/") + 1, a.lastIndexOf("?replica"));
    if (!db) {
        return "admin";
    }
    return db;
}

function getMongoConnectionString() {
    return process.env.MONGO_URL || defaults.MONGO_URL;

    if (
        ["production"].includes(process.env.NODE_ENV) ||
        process.env.ENTERPRISE
    ) {
        return process.env.MONGO_URL;
    }

    const database = getDatabase();
    if (!process.env.MONGO_URL.includes(database)) {
        return `${process.env.MONGO_URL}/${database}`;
    }

    return `mongodb://${q.host}/admin`;
}

module.exports = {
    SMTP: {
        host: defaults.SMTP.host,
        user: defaults.SMTP.user,
        pass: defaults.SMTP.pass
    },
    database: getDatabase(),
    mongoConnectionString: getMongoConnectionString(),
    apiHost: defaults.apiHost,
    SMS: defaults.SMS,
    BLOCKCLUSTER: defaults.BLOCKCLUSTER,
    ASSET: {
        Card: "Card",
        Bookings: "Bookings",
        BookingsInfo: "BookingsInfo",
        SubscriptionPlans: "SubscriptionPlans",
        Subscriptions: "Subscriptions",
        Reviews: "Reviews"
    },
    HYPERPAY: {
        UserId: "8ac7a4c86783997f0167971a1b65109d",
        Password: "9ZJzxaHtPc",
        EntityId: "8ac7a4c86783997f0167971bc49010a1",
        Currency: "SAR",
        PaymentType: "DB",
        PaymentMethods: {
            VISA: "VISA",
            MASTERCARD: "MASTER"
        }
    },
    GAPIKEY: defaults.GAPIKEY,
    farePerMeter: 0.04,
    fareUnit: "USD",
    driversWithin: defaults.driversWithin,
    PUBNUB: defaults.PUBNUB,
    env: getEnv()
};
