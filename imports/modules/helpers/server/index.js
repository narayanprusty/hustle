import crypto from "crypto";
import ejs from "ejs";
import Config from "../../config/server";

const EmailVerificationTemplate = require("../../template/email-verification");
const EmailUserReceiptTemplateEn = require("../../template/user-receipt.en");
const EmailUserReceiptTemplateAr = require("../../template/user-receipt.ar");
const EmailDriverMonthlyReportEn = require("../../template/driver-monthly-report.en");
const EmailDriverMonthlyReportAr = require("../../template/driver-monthly-report.ar");

const EJSMapping = {
    "email-verification.ejs": EmailVerificationTemplate,
    "email-receipt-en.ejs": EmailUserReceiptTemplateEn,
    "email-receipt-ar.ejs": EmailUserReceiptTemplateAr,
    "email-driver-monthly-report-en.ejs": EmailDriverMonthlyReportEn,
    "email-driver-monthly-report-ar.ejs": EmailDriverMonthlyReportAr
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
    return true;
};

let timestampToSaudiISO = () => {
    var timezone_offset_min = -180,
	offset_hrs = parseInt(Math.abs(timezone_offset_min/60)),
	offset_min = Math.abs(timezone_offset_min%60),
	timezone_standard;

    if(offset_hrs < 10)
        offset_hrs = '0' + offset_hrs;

    if(offset_min < 10)
        offset_min = '0' + offset_min;

    // Add an opposite sign to the offset
    // If offset is 0, it means timezone is UTC
    if(timezone_offset_min < 0)
        timezone_standard = '+' + offset_hrs + ':' + offset_min;
    else if(timezone_offset_min > 0)
        timezone_standard = '-' + offset_hrs + ':' + offset_min;
    else if(timezone_offset_min == 0)
        timezone_standard = 'Z';

    // Timezone difference in hours and minutes
    // String such as +5:30 or -6:00 or Z

    var dt = new Date(),
	current_date = dt.getDate(),
	current_month = dt.getMonth() + 1,
	current_year = dt.getFullYear(),
	current_hrs = dt.getHours(),
	current_mins = dt.getMinutes(),
	current_secs = dt.getSeconds(),
	current_datetime;

    // Add 0 before date, month, hrs, mins or secs if they are less than 0
    current_date = current_date < 10 ? '0' + current_date : current_date;
    current_month = current_month < 10 ? '0' + current_month : current_month;
    current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
    current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
    current_secs = current_secs < 10 ? '0' + current_secs : current_secs;

    // Current datetime
    // String such as 2016-07-16T19:20:30
    current_datetime = current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs;

    return current_datetime + timezone_standard;
}

export {
    generateRandomString,
    generateCompleteURLForEmailVerification,
    generateCompleteURLForPasswordReset,
    generateCompleteURLForUserInvite,
    getEJSTemplate,
    sendPushNotification,
    timestampToSaudiISO
};
