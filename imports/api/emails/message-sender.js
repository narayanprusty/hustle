import rp from 'request-promise';
import config from '../../modules/config/server'

const sendMessage = async(mobile,message)=>{
    console.log("sending sms", message);
    return await rp.get(`http://smshorizon.co.in/api/sendsms.php?user=${config.SMS.user}&apikey=${config.SMS.apiKey}&mobile=${mobile}&message=${encodeURI(message)}&senderid=${config.SMS.SENDERID}&type=txt`);
}

export {sendMessage}