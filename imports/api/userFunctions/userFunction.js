import { driverDetails } from "../details/driver";
import { getSOSNumbers } from "../sos/sos";
import { getContacts } from "../EmergencyContact/EmergencyContact";
import { sendMessage } from "../../Messaging/send_text";
import { Meteor } from "meteor/meteor";

const triggerSos = async messageElems => {
    const driver = await driverDetails(messageElems.driverId);
    const message = `[HUSTLE]\n${
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

    const { econtacts } = await getContacts();
    const defaultContacts = await getSOSNumbers();
    let allNumbers = [];
    if (econtacts && econtacts.length) {
        const userContacts = econtacts.split(",");
        allNumbers = allNumbers.concat(userContacts);
    }
    if (defaultContacts && defaultContacts.length) {
        const globalContacts = defaultContacts.split(",");
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

export { triggerSos, getUserProfile };
