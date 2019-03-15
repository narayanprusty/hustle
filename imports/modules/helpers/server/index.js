import crypto from "crypto";
import ejs from "ejs";
import Config from "../../config/server";

const EmailVerificationTemplate = require("../../template/email-verification");

const EJSMapping = {
    "email-verification.ejs": EmailVerificationTemplate
};

function generateRandomString(placeholder, salt = "hustleThing") {
    return `${new Date().getTime()}${crypto
        .createHash("sha256")
        .update(`${placeholder}${salt}${new Date().getTime()}`, "utf8")
        .digest("hex")}`;
}

function generateURL(route) {
    return `${Config.apiHost.replace(":3000/", ":3000")}${route}`;
}

function generateCompleteURLForEmailVerification(query) {
    return generateURL(`/email-verify?key=${query}`);
}

function generateCompleteURLForPasswordReset(query) {
    return generateURL(`/reset-password?key=${query}`);
}

function getEJSTemplate({ fileName }) {
    return new Promise(resolve => {
        if (!fileName) {
            fileName = "email-verification.ejs";
        }
        const content = EJSMapping[fileName];
        resolve(
            ejs.compile(content, {
                cache: true,
                filename: fileName
            })
        );
    });
}
const sendPushNotification = (title, text, userId) => {
    const notId = Math.round(new Date().getTime() / 1000);

    const query = {};
    if (userId) {
        query["userId"] = userId;
    }
    Push.send({
        from: "hustle",
        title,
        text,
        sound: "default",
        query: query,
        apn: {
            sound: "default"
        },
        contentAvailable: 1,
        androidChannel: "PushPluginChannel",
        notId
    });
};

export {
    generateRandomString,
    generateCompleteURLForEmailVerification,
    generateCompleteURLForPasswordReset,
    generateCompleteURLForUserInvite,
    getEJSTemplate,
    sendPushNotification
};
