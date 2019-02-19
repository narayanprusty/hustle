import { driverDetails } from "../details/driver";
const triggerSos = async messageElems => {
    const driver = await driverDetails(messageElems.driverId);
    const message = `${messageElems.username} needs your help, its emergency.
    current lat:${messageElems.lat}, lng:${messageElems.lng},
    car number:${messageElems.carNumber},car model:${messageElems.carModel},
    track here: ${messageElems.trackUrl},boarded from:${
        messageElems.start_address
    },
    destination:${messageElems.end_address},driver name:${
        driver.name
    },driver phone:${driver.phone}
    `;
    //send message to every one here
};

export { triggerSos };
