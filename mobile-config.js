App.info({
    id: "com.hustle.block.io",
    name: "Hustle",
    version: "0.0.1"
});
App.launchScreens({

  // iOS splash screens
  iphone5: 'resources/launch_screens/iphone5.png',
  iphone6: 'resources/launch_screens/iphone6.png',
  iphone6p_portrait: 'resources/launch_screens/iphone6p_portrait.png',
  iphone6p_landscape: 'resources/launch_screens/iphone6p_landscape.png',
  iphoneX_portrait: 'resources/launch_screens/iphoneX_portrait.png',
  iphoneX_landscape: 'resources/launch_screens/iphoneX_landscape.png',
  ipad_portrait_2x: 'resources/launch_screens/ipad_portrait_2x.png',
  ipad_landscape_2x: 'resources/launch_screens/ipad_landscape_2x.png',
  ipad_portrait_pro_10_5: 'resources/launch_screens/ipad_portrait_pro_10_5.png',
  ipad_landscape_pro_10_5: 'resources/launch_screens/ipad_landscape_pro_10_5.png',
  ipad_portrait_pro_12_9: 'resources/launch_screens/ipad_portrait_pro_12_9.png',
  ipad_landscape_pro_12_9: 'resources/launch_screens/ipad_landscape_pro_12_9.png',

  // iOS splash screens legacy
  iphone_2x: 'resources/launch_screens/iphone_2x.png',
  ipad_portrait: 'resources/launch_screens/ipad_portrait.png',
  ipad_landscape: 'resources/launch_screens/ipad_landscape.png',

  // Android splash screens
  android_mdpi_portrait: 'resources/launch_screens/android_mdpi_portrait.png',
  android_mdpi_landscape: 'resources/launch_screens/android_mdpi_landscape.png',
  android_hdpi_portrait: 'resources/launch_screens/android_hdpi_portrait.png',
  android_hdpi_landscape: 'resources/launch_screens/android_hdpi_landscape.png',
  android_xhdpi_portrait: 'resources/launch_screens/android_xhdpi_portrait.png',
  android_xhdpi_landscape: 'resources/launch_screens/android_xhdpi_landscape.png',
  android_xxhdpi_portrait: 'resources/launch_screens/android_xxhdpi_portrait.png',
  android_xxhdpi_landscape: 'resources/launch_screens/android_xxhdpi_landscape.png',
  android_xxxhdpi_portrait: 'resources/launch_screens/android_xxxhdpi_portrait.png',
  android_xxxhdpi_landscape: 'resources/launch_screens/android_xxxhdpi_landscape.png'

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
App.setPreference("DisallowOverscroll", "true");
