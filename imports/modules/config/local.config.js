module.exports = {
    SMTP: {
        host: "smtp.gmail.com",
        user: "startsetteam",
        pass: "saikat95"
    },
    MONGO_URL: "mongodb://saikatharryc:saikat95@ds145303.mlab.com:45303/hustle",
    apiHost: process.env.ROOT_URL || "localhost:3000",
    GAPIKEY: "AIzaSyAs2LAkFCJr8p4EzgIVtk169Qreykfi74Q",
    // GAPIKEY: "AIzaSyBnjRZAHqrP5Flir8iuhmBmJlOr7qKlSTE",
    SMS: {
        apiKey: "MJicpcEuLaUG5gQ57O4Xa5MORszWXsOd",
        fromNumber: "+18283304183",
        accountSid: "ACd1275e2e944d54543af3a05941489924",
        authToken: "b242112c256f92a81ad597b129c97ae4"
    },
    BLOCKCLUSTER: {
        host: "app-ap-south-1b.blockcluster.io",
        instanceId: "ckgexbea"
    },
    driversWithin: 5, //in KM
    PUBNUB: {
        pubKey: "pub-c-f4bd0466-069e-4bd2-94cf-b299dc02f92a",
        subKey: "sub-c-b6590186-f6e1-11e8-b35b-72ed2feff2dd",
        secret: "sec-c-ODI1ZjY2MWUtMTIwNy00M2MxLWIzY2EtZDUwMjQ5MTlhNmY5",
        ssl: true
    },
    AWS: {
        accessKeyId: "AKIAI75BE6D54XNLGF6A",
        secretAccessKey: "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",
        region: "us-east-2",
        S3_BUCKET: "avatar.gohustleapp.com"
    },
    PUSH_NOTIF: {
        FCM: {
            SENDER_ID: 937200706426,
            SERVER_KEY:
                "AAAA2jWD43o:APA91bED_7kx4YlbH_O1EztfUuBXPB1HNI3zQGz8sRjf9me8TGFpiGsRYYuGhB2qGEA96QkD_5akPeNMH8qk_JROJl2y8eymbkDSfeFFzdB6Dtv3SD9eHVwhbBYbMY8Fw7G2ffD7fapS"
        }
    }
};
