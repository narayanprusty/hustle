import { Meteor } from "meteor/meteor";

const riderDetails = async userId => {
    const riderProfile = await Meteor.users.find({ _id: userId }).fetch()[0];

    const dataToSend = {
        name: riderProfile.profile ? riderProfile.profile.name : "-",
        phone: riderProfile.profile ? riderProfile.profile.phone : "-"
    };
    return dataToSend;
};
export { riderDetails };
