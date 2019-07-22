module.exports = {
    farePerMeter: 0.04,
    fareUnit: "SAR",
    GAPIKEY: process.env.GAPIKEY || "AIzaSyAs2LAkFCJr8p4EzgIVtk169Qreykfi74Q",
    // GAPIKEY: "AIzaSyBnjRZAHqrP5Flir8iuhmBmJlOr7qKlSTE",
    PUBNUB: {
        pubKey:
            process.env.PUBNUB_PUBKEY ||
            "pub-c-ac305c80-9d55-45f8-852d-f036f02ead60",
        subKey:
            process.env.PUBNUB_SUBKEY ||
            "sub-c-8d04e73a-4ee5-11e9-bace-daeb5080f5f6",
        secret:
            process.env.PUBNUB_SECRET ||
            "sec-c-NTUzODQ0NGEtNDg1YS00ODg3LWIxMzItMzc1YTZmODIyMmQ4"
    },
    FRONTEND_HOST: process.env.ROOT_URL || "https://booking.gohustleapp.com",
    BASE_URL: "https://gohustleapp.com",
    shareText: "Hey, click the below link to see my live location.",
    driversWithin: 5, //inKm,
    PUSH_NOTIF: {
        FCM: {
            SENDER_ID: process.env.PUSH_FCM_SENDER_ID || 618953691604
        }
    },
    HUSTLE_PAY_BASE:
        process.env.HUSTLE_PAY_BASE || "https://hustle-pay.gohustleapp.com"
};
