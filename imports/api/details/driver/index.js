import { DriverMeta } from "../../../collections/driver-meta";
import { Meteor } from "meteor/meteor";

const driverDetails = async userId => {
    const driverProfile = await Meteor.users.find({ _id: userId }).fetch()[0];
    const driverMeta = await DriverMeta.find({ driverId: userId }).fetch()[0];
    const dataToSend = {
        name: driverProfile.profile ? driverProfile.profile.name : "-",
        phone: driverProfile.profile ? driverProfile.profile.phone : "-",
        carNumber: driverMeta.carNumber || "-",
        carModel: driverMeta.carModel || "-",
        avgRating: driverMeta.avgRating || "0"
    };
    return dataToSend;
};
export { driverDetails };
