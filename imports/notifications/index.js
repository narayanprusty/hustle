const PubNub = require('pubnub');
const config = require('../modules/config/local.config');

let counter = 0;

let pubnub = new PubNub({
    publishKey: config.PUBNUB.pubKey,
    subscribeKey: config.PUBNUB.subKey,
    ssl: config.PUBNUB.ssl,
    secretKey: config.PUBNUB.secret
});

//type: success | error | warning
const sendMessage = (channel, message, type = "success", link = "") => {
    try {
        pubnub.publish({
                message: {
                    data: message.toString(),
                    type: type,
                    link: link,
                    counter: ++counter,
                },
                channel: channel.toString(),
                sendByPost: false, // true to send via post
                storeInHistory: false, //override default storage options
                meta: {
                    "cool": "meta"
                } // publish extra meta with the request
            },
            function (status, response) {
                if (status.error) {
                    // handle error
                    console.log(status)
                } else {
                    console.log("Message Published", response)
                }
            }
        );
    } catch (ex) {
        console.log(ex);
    }
}

export {
    sendMessage
};