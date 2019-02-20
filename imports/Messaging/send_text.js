const config = require("../modules/config/server");
const client = require("twilio")(config.SMS.accountSid, config.SMS.authToken);

const sendMessage = (numbers, messageBody) => {
    Promise.all(
        numbers.map(number => {
            return client.messages.create({
                to: number,
                from: config.SMS.fromNumber,
                body: messageBody
            });
        })
    )
        .then(messages => {
            return messages;
        })
        .catch(err => {
            console.log(err);
            throw new Meteor.Error("Some error eccurred");
        });
};

export { sendMessage };
