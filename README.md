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