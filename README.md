## Procedure to  Run the application

You must have node.js installed follow below link:
https://nodejs.org/en/download/package-manager/

install meteor first follow below link:
https://www.meteor.com/install

also Git is required:
https://git-scm.com/downloads

Clone and start doing below commands:

1> `npm i`
2> Run the app:  `MONGO_URL=mongodb://saikatharryc:saikat95@ds145303.mlab.com:45303/hustle meteor`

Error: Device type "com.apple.CoreSimulator.SimDeviceType.undefined" could not be found.
Resolve: cd .meteor/local/cordova-build/platforms/ios/cordova && meteor npm install ios-sim@latest




APK generate process:
For development version: `npm run build:debug`
* check in `package.json` if the server host given is correct for the environment.
For Production: `npm run build:production`

make sure this commands exists:
*   `keytool`
*   `zipalign` [incase not`export PATH=${ANDROID_HOME}/build-tools/<SUB_FOLDER_NAME>`]


Navigate to `Keystores` Dir for keystores. permission should be `664`.
where `.keystore` is Non JKS/JCEKS. while `.keystore.old` is The JKS keystore.


this will pull up the apk to `./hustle-build/android` folder:
```
cp ../hustle-build/android/project/build/outputs/apk/release/android-release-unsigned.apk ../hustle-build/android/release-unsigned.apk
```

now sign: PassWord: `Hustle@123`
```
 jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 ./android/release-unsigned.apk hustle
```

now use zipalign:

```
$ANDROID_HOME/build-tools/<some version filder>/zipalign 4 ./release-unsigned.apk hustle.apk
```
this will create and `hustle.apk` inside `./hustle-build/android`, which is ready to be uploaded.
make sure you have done version patching before in `mobile-config.js`.

and also see the using differnt `keystore` signing method in meteor signing docs. as you have to take keystore details from this repo.
