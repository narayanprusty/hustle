import {
    Meteor
} from "meteor/meteor";

const updateLangugagePreferance = async ({
    language
}) => {
    console.log("Updating", Meteor.user(), language);
    Meteor.users.update({
        _id: Meteor.userId()
    }, {
        $set: {
            "profile.langPref": language
        }
    });
    console.log(Meteor.user());
    return Meteor.user();
};

const getLangPref = async ({
    id
}) => {
    var user = Meteor.users.find({
        _id: id
    }).fetch();
    if (user.length > 0) {
        user = user[0];
        console.log("User with id", id, user);
        return user.profile.langPref;
    }
    return null;
}

Meteor.methods({
    updateLangugagePreferance,
    getLangPref,
});

export {};
