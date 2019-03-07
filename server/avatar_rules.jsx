import config from "../imports/modules/config/server";

Slingshot.fileRestrictions("avatar", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg"],
    maxSize: 2 * 500 * 500 // 2 MB (use null for unlimited)
});

Slingshot.createDirective("avatar", Slingshot.S3Storage, {
    bucket: config.AWS.S3_BUCKET, // change this to your s3's bucket name

    acl: "public-read",

    authorize: function(file, metaContext) {
        //Deny uploads if user is not logged in.
        if (!this.userId) {
            var message = "Please login before posting files";
            throw new Meteor.Error("Login Required", message);
        }

        return true;
    },

    key: function(file, metaContext) {
        // User's image url with ._id attached:

        return metaContext.avatarId + "/" + Date.now() + "-" + file.name;
    }
});
