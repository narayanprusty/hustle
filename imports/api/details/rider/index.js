import { Meteor } from "meteor/meteor";

const riderDetails = async userId => {
    const riderProfile = await Meteor.users.find({ _id: userId }).fetch()[0];

    const dataToSend = {
        name: riderProfile.profile ? riderProfile.profile.name : "-",
        phone: riderProfile.profile ? riderProfile.profile.phone : "-",
        userType: riderProfile.profile
            ? riderProfile.profile.userType
            : "Rider",
        avgUserRating: riderProfile.profile
            ? riderProfile.profile.avgRating
            : "0",
        avatar: riderProfile.profile.avatar,
        riderEmail: riderProfile.profile ? riderProfile.profile.email : null
    };
    return dataToSend;
};
export { riderDetails };
