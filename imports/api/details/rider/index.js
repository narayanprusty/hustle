import { Meteor } from "meteor/meteor";

const riderDetails = async userId => {
    const riderProfile = await Meteor.users.find({ _id: userId }).fetch()[0];

    const dataToSend = {
        name: riderProfile.profile ? riderProfile.profile.name : "-",
        phone: riderProfile.profile ? riderProfile.profile.phone : "-",
        userType: riderProfile.profile
            ? riderProfile.profile.userType
            : "Rider",
        avgRating: riderProfile.profile ? riderProfile.profile.avgRating : "0"
    };
    return dataToSend;
};
export { riderDetails };
