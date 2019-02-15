App.info({
    id: "com.hustle.block.io",
    name: "Hustle",
    version: "0.0.1"
});

App.accessRule("*");
App.appendToConfig(`
  <edit-config target="NSLocationWhenInUseUsageDescription" file="*-Info.plist" mode="merge">
    <string>My app needs access to your location for navigation purposes</string>
  </edit-config>
`);
App.setPreference("AutoHideSplashScreen", "true");
App.setPreference("Orientation", "default");
App.setPreference("Orientation", "all", "ios");