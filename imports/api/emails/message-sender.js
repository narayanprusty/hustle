import rp from "request-promise";
import config from "../../modules/config/server";

const sendMessage = async mobile => {
    const options = {
        method: "POST",
        headers: {
            "X-Authy-API-Key": config.SMS.apiKey
        },
        uri: "https://api.authy.com/protected/json/phones/verification/start",
        body: {
            phone_number: mobile.number,
            country_code: mobile.country_code,
            via: "sms"
        },
        json: true
    };
    return await rp(options);
};

const verifyPhone = async mobile => {
    const options = {
        uri: "https://api.authy.com/protected/json/phones/verification/check",

        method: "GET",
        headers: {
            "X-Authy-API-Key": config.SMS.apiKey
        },
        qs: {
            phone_number: mobile.number,
            country_code: mobile.country_code,
            verification_code: mobile.verification_code
        },
        json: true
    };
    return await rp(options);
};

export { sendMessage, verifyPhone };
