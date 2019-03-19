import { sendMessage, verifyPhone } from "./message-sender";
import { Meteor } from "meteor/meteor";
import genToken from "generate-sms-verification-code";
import localizationManager from "../../ui/localization/index";

const verificationMessage = async phone => {
    await sendMessage(phone);
    return true;
};

const verifyNumberAndSendMessage = async phone => {
    const user = Meteor.users
        .find({
            "emails.address": phone.number
        })
        .fetch()[0];
    if (!user) {
        throw new Meteor.Error("error", "user not found");
    } else {
        await sendMessage(phone);
        return user._id;
    }
};

const verifyCode = phone => {
    return verifyPhone(phone)
        .then(data => {
            return true;
        })
        .catch(error => {
            throw new Meteor.Error("verification code invalid!");
        });
};

Meteor.methods({
    verificationMessage: verificationMessage,
    verifyCode: verifyCode,
    verifyNumberAndSendMessage: verifyNumberAndSendMessage
});
export { verificationMessage, verifyCode, verifyNumberAndSendMessage };
