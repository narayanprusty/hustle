const config = require("../modules/config/server");
const client = require("twilio")(config.SMS.accountSid, config.SMS.authToken);

const sendMessage = (numbers, messageBody) => {
    console.log(numbers);

    const messageStack = numbers.map(number =>
        client.messages.create({
            to: number,
            from: config.SMS.fromNumber,
            body: messageBody
        })
    );
    console.log(messageStack);
    if (messageStack.length) {
        return Promise.all(messageStack)
            .then(data => {
                console.log(data);
                return true;
            })
            .catch(error => {
                console.log(error);
                throw error;
            });
    }
};

export { sendMessage };
