
/*
emailOptions
{
  from: {email: "jason@blockcluster.io", name: "Jason from Blockcluster"},
  to: email,
  subject: `Confirm ${user.emails[0].address} on blockcluster.io`,
  text: `Visit the following link to verify your email address. ${link}`,
  html: finalHTML
}
*/

import nodemailer from 'nodemailer';
import config from '../../modules/config/server'
const transporter = nodemailer.createTransport({
	host: config.SMTP.host,
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: config.SMTP.user, // generated ethereal user
		pass: config.SMTP.pass // generated ethereal password
	}
});

const sendEmail = async(emailOptions) =>{
return await transporter.sendMail({textEncoding:'base64',...emailOptions});
};

export { sendEmail };
