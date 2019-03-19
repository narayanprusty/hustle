import { Meteor } from "meteor/meteor";
import AWS from "aws-sdk";
import { driverDetails } from "../details/driver";
import { getSOSNumbers } from "../sos/sos";
import { getContacts } from "../EmergencyContact/EmergencyContact";
import { sendMessage } from "../../Messaging/send_text";
import { sendEmail } from "../emails/email-sender";
import { getEJSTemplate } from "../../modules/helpers/server";
import config from "../../modules/config/server";

const triggerSos = async messageElems => {
    const driver = await driverDetails(messageElems.driverId);
    let message;
    const LangPref = Meteor.user().profile.langPref || "en";

    if (LangPref == "ar") {
        //this needs to be changed
        message = `[HUSTLE]\n${
            messageElems.username
        } needs your help, its emergency.
        current lat:${messageElems.currentLatlng.lat}, lng:${
            messageElems.currentLatlng.lng
        },
        car number:${messageElems.carNumber},car model:${messageElems.carModel},
        track here: ${messageElems.trackUrl},boarded from:${
            messageElems.start_address
        },
        destination:${messageElems.end_address},driver name:${
            driver.name
        },driver phone:${driver.phone}
        `;
    } else {
        message = `[HUSTLE]\n${
            messageElems.username
        } needs your help, its emergency.
        current lat:${messageElems.currentLatlng.lat}, lng:${
            messageElems.currentLatlng.lng
        },
        car number:${messageElems.carNumber},car model:${messageElems.carModel},
        track here: ${messageElems.trackUrl},boarded from:${
            messageElems.start_address
        },
        destination:${messageElems.end_address},driver name:${
            driver.name
        },driver phone:${driver.phone}
        `;
    }

    const { econtacts } = await getContacts();
    const defaultContacts = await getSOSNumbers();
    let allNumbers = [];
    if (econtacts && econtacts.length) {
        const userContacts = econtacts;
        allNumbers = allNumbers.concat(userContacts);
    }
    if (defaultContacts && defaultContacts.length) {
        const globalContacts = defaultContacts;
        allNumbers = allNumbers.concat(globalContacts);
    }
    if (allNumbers.length) {
        try {
            return sendMessage(allNumbers, message);
        } catch (err) {
            console.log(err, 1);
            throw new Meteor.Error("Error Occurred");
        }
    } else {
        console.log(2);
        throw new Meteor.Error("No contacts found!");
    }
    //send message to every one here
};

const getUserProfile = () => {
    const userProfile = Meteor.user();
    return { ...userProfile.profile, id: Meteor.userId() };
};

const changeNameAndEmail = (userId, newName, newEmail) => {
    Meteor.users.update(
        {
            _id: userId
        },
        {
            $set: {
                "profile.name": newName,
                "profile.email": newEmail
            }
        }
    );
    return true;
};

const uploadeFile = (fileBase, fileName) => {
    var s3Bucket = new AWS.S3({ params: { Bucket: config.AWS.S3_BUCKET } });
    let buf = new Buffer(
        fileBase.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
    );
    var data = {
        Key: fileName,
        Body: buf,
        "Content-Length": buf.length,
        ContentEncoding: "base64",
        ContentType: "image/jpeg"
    };
    return s3Bucket
        .upload(data)
        .promise()
        .then(data => {
            console.log(data);
            return data;
        })
        .catch(error => {
            throw error;
        });
};

const sendReceiptEmail = async (
    booking,
    userId,
    ditanceCovered,
    timeTaken,
    totalFare
) => {
    const user = Meteor.users.find({ _id: userId }).fetch()[0];
    if (user && user.profile && user.profile.email) {
        const LangPref = user.profile.langPref || "en";
        const ejsTemplate = await getEJSTemplate({
            fileName: "email-receipt-" + LangPref + ".ejs"
        });
        const finalHTML = ejsTemplate({
            user: userId.profile,
            ditanceCovered: ditanceCovered,
            timeTaken: timeTaken,
            totalFare: totalFare
        });

        const emailProps = {
            from: { email: "no-reply@hustle.io", name: "Hustle" },
            to: user.profile.email,
            subject: `[HUSTLE] Receipt for your recent ride, booking ${
                booking.uniqueIdentifier
            }`,
            html: finalHTML
        };
        return await sendEmail(emailProps);
    } else {
        return false;
    }
};

const resetPass = (userId, password) => {
    Accounts.setPassword(userId, password, error => {
        if (error) {
            throw error;
        } else {
            return true;
        }
    });
};

export {
    triggerSos,
    getUserProfile,
    changeNameAndEmail,
    uploadeFile,
    sendReceiptEmail,
    resetPass
};
