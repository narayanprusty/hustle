import {sendMessage} from './message-sender';
import { Meteor } from 'meteor/meteor';
import genToken from 'generate-sms-verification-code'
import localizationManager from '../../ui/localization/index';

const verificationMessage = async(phone)=>{
    const length =4;
    const token = genToken(length,{type: 'number'});
    const message= `${localizationManager.strings.phoneVerificationCode} ${token}`;
    await sendMessage(phone,message);
    return {token:token,length:4}
};

Meteor.methods({
    verificationMessage:verificationMessage
});
export {verificationMessage}