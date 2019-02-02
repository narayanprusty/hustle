import { sendMessage, verifyPhone } from "./message-sender";
import { Meteor } from "meteor/meteor";
import genToken from "generate-sms-verification-code";
import localizationManager from "../../ui/localization/index";

const verificationMessage = async phone => {
    await sendMessage(phone);
    return true;
};

const verifyCode = phone => {
    verifyPhone(phone)
        .then(data => {
            return true;
        })
        .catch(error => {
            throw Meteor.Error({ reason: "verification code invalid!" });
        });
};

Meteor.methods({
    verificationMessage: verificationMessage,
    verifyCode: verifyCode
});
export { verificationMessage, verifyCode };
