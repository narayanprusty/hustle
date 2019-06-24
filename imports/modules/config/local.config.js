module.exports = {
    SMTP: {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        user: process.env.SMTP_USER || "startsetteam",
        pass: process.env.SMTP_PASS || "saikat95"
    },
    MONGO_URL:
        process.env.MONGO_URL ||
        "mongodb://saikatharryc:saikat95@ds145303.mlab.com:45303/hustle",
    apiHost: process.env.ROOT_URL || "localhost:3000",
    GAPIKEY: process.env.GAPIKEY || "AIzaSyAs2LAkFCJr8p4EzgIVtk169Qreykfi74Q",
    // GAPIKEY: "AIzaSyBnjRZAHqrP5Flir8iuhmBmJlOr7qKlSTE",
    SMS: {
        apiKey: process.env.TWILIO_APIKEY || "MJicpcEuLaUG5gQ57O4Xa5MORszWXsOd",
        fromNumber: process.env.TWILIO_FROMNUMBER || "+18283304183",
        accountSid:
            process.env.TWILIO_ACCOUNTSID ||
            "ACd1275e2e944d54543af3a05941489924",
        authToken:
            process.env.TWILIO_AUTHTOK || "b242112c256f92a81ad597b129c97ae4"
    },
    BLOCKCLUSTER: {
        host: process.env.BC_HOST || "app-ap-south-1b.blockcluster.io",
        instanceId: process.env.BC_INSTANCEID || "ckgexbea"
    },
    driversWithin: 5, //in KM
    PUBNUB: {
        pubKey:
            process.env.PUBNUB_PUBKEY ||
            "pub-c-f4bd0466-069e-4bd2-94cf-b299dc02f92a",
        subKey:
            process.env.PUBNUB_SUBKEY ||
            "sub-c-b6590186-f6e1-11e8-b35b-72ed2feff2dd",
        secret:
            process.env.PUBNUB_SECRET ||
            "sec-c-ODI1ZjY2MWUtMTIwNy00M2MxLWIzY2EtZDUwMjQ5MTlhNmY5",
        ssl: true
    },
    AWS: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIAI75BE6D54XNLGF6A",
        secretAccessKey:
            process.env.AWS_SECRET_ACCESS_KEY ||
            "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",
        region: process.env.AWS_REGION || "us-east-2",
        S3_BUCKET: process.env.AWS_AVATAR_S3 || "avatar.gohustleapp.com"
    },
    PUSH_NOTIF: {
        FCM: {
            SENDER_ID: process.env.PUSH_FCM_SENDER_ID || 937200706426,
            SERVER_KEY:
                process.env.PUSH_FCM_SERVER_KEY ||
                "AAAA2jWD43o:APA91bED_7kx4YlbH_O1EztfUuBXPB1HNI3zQGz8sRjf9me8TGFpiGsRYYuGhB2qGEA96QkD_5akPeNMH8qk_JROJl2y8eymbkDSfeFFzdB6Dtv3SD9eHVwhbBYbMY8Fw7G2ffD7fapS"
        }
    },
    HYPERPAY: {
        UserId:
            process.env.HYPERPAY_USERID || "8ac7a4c86783997f0167971a1b65109d",
        Password: process.env.HYPERPAY_PASSWORD || "9ZJzxaHtPc",
        EntityId:
            process.env.HYPERPAY_ENTITY_ID ||
            "8ac7a4c967cba199016804c97cb83f25",
        Currency: process.env.HYPERPAY_CURRENCY || "SAR",
        PaymentType: process.env.HYPERPAY_PAYMENT_TYPE || "DB",
        host: process.env.HYPERPAY_HOST || "test.oppwa.com",
        PaymentMethods: {
            VISA: "VISA",
            MASTERCARD: "MASTER"
        }
    },
    WASL: {
        url: "https://wasl.api.elm.sa/api/dispatching/v2",
        clientId: "96F342A1-3FAB-4FC6-A35A-89E1D91E73B1",
        appId: "1081e23d",
        appKey: "54cdb483c6bcb03de50703d8948acf42"
    },
    MAX_DISTANCE_FOR_AVAIL: 5 //in km
};
