const config = require("../modules/config/server");
const client = require("twilio")(config.SMS.accountSid, config.SMS.authToken);

const sendMessage = async (numbers, messageBody) => {
    console.log(numbers);

    const messageStack = numbers.map(number =>
        client.messages.create({
            to: number,
            from: config.SMS.fromNumber,
            body: messageBody
        })
    );

    return await Promise.all(messageStack);
};

export { sendMessage };
