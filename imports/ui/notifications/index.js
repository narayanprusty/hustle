import config from "../../modules/config/local.config";

var pubnub = PUBNUB.init({
    publish_key: config.PUBNUB.pubKey,
    subscribe_key: config.PUBNUB.subKey,
    secret_key: config.PUBNUB.secret,
    ssl: config.PUBNUB.ssl,
});

export default pubnub;