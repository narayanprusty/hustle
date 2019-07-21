module.exports = {
    farePerMeter: 0.04,
    fareUnit: "SAR",
    GAPIKEY: process.env.GAPIKEY || "AIzaSyAs2LAkFCJr8p4EzgIVtk169Qreykfi74Q",
    // GAPIKEY: "AIzaSyBnjRZAHqrP5Flir8iuhmBmJlOr7qKlSTE",
    PUBNUB: {
        pubKey:
            process.env.PUBNUB_PUBKEY ||
            "pub-c-f4bd0466-069e-4bd2-94cf-b299dc02f92a",
        subKey:
            process.env.PUBNUB_SUBKEY ||
            "sub-c-b6590186-f6e1-11e8-b35b-72ed2feff2dd",
        secret:
            process.env.PUBNUB_SECRET ||
            "sec-c-ODI1ZjY2MWUtMTIwNy00M2MxLWIzY2EtZDUwMjQ5MTlhNmY5"
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
