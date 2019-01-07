import {sendMessage} from './message-sender';
import { Meteor } from 'meteor/meteor';
import genToken from 'generate-sms-verification-code'

const verificationMessage = async(phone)=>{
    const length =4;
    const token = genToken(length,{type: 'number'});
    const message= `Hi, Your phone verification code is ${token}`;
    await sendMessage(phone,message);
    return {token:token,length:4}
};

Meteor.methods({
    verificationMessage:verificationMessage
});
export {verificationMessage}