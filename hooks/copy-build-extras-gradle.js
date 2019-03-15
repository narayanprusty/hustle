const fs = require("fs");
const path = require("path");
const rootdir = process.env.PWD;
const platformAndroidPath = "/platforms/android/";
const srcFile = path.join(rootdir, "build-extras.gradle");
const googleServiceFile = path.join(rootdir, "google-services.json");
const destFile = path.join(rootdir, platformAndroidPath, "build-extras.gradle");
const destGoogleFile = path.join(
    rootdir,
    platformAndroidPath,
    "google-services.json"
);
const destDir = path.dirname(destFile);
const destGoogleDir = path.dirname(destGoogleFile);
if (fs.existsSync(srcFile) && fs.existsSync(destDir)) {
    fs.createReadStream(srcFile).pipe(fs.createWriteStream(destFile));
} else {
    throw new Error("Unable to copy build-extras.gradle");
}

if (fs.existsSync(googleServiceFile) && fs.existsSync(destGoogleDir)) {
    fs.createReadStream(googleServiceFile).pipe(
        fs.createWriteStream(destGoogleFile)
    );
} else {
    throw new Error("Unable to copy google-services.json");
}
