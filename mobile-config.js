if (this.process.env.NODE_ENV === "production") {
    App.info({
        id: "com.gohustleapp.hustle",
        name: "Hustle",
        version: "1.0.8" //version Major.Minor.patch //also put `-` *rc/alpha/beta whatever if needed
    });
} else {
    App.info({
        id: "com.gohustleapp.hustle.dev",
        name: "HustleDev",
        version: "0.0.1"
    });
}
App.icons({
    iphone_2x: "resources/icons/iphone_2x.png",
    iphone_3x: "resources/icons/iphone_3x.png",
    ipad: "resources/icons/ipad.png",
    ipad_2x: "resources/icons/ipad_2x.png",
    ipad_pro: "resources/icons/ipad_pro.png",
    ios_settings: "resources/icons/ios_settings.png",
    ios_settings_2x: "resources/icons/ios_settings_2x.png",
    ios_settings_3x: "resources/icons/ios_settings_3x.png",
    ios_spotlight: "resources/icons/ios_spotlight.png",
    ios_spotlight_2x: "resources/icons/ios_spotlight_2x.png",
    android_mdpi: "resources/icons/android_mdpi.png",
    android_hdpi: "resources/icons/android_hdpi.png",
    android_xhdpi: "resources/icons/android_xhdpi.png",
    android_xxhdpi: "resources/icons/android_xxhdpi.png",
    android_xxxhdpi: "resources/icons/android_xxxhdpi.png"
});
App.launchScreens({
    // iOS splash screens
    iphone5: "resources/launch_screens/iphone5.png",
    iphone6: "resources/launch_screens/iphone6.png",
    iphone6p_portrait: "resources/launch_screens/iphone6p_portrait.png",
    iphone6p_landscape: "resources/launch_screens/iphone6p_landscape.png",
    iphoneX_portrait: "resources/launch_screens/iphoneX_portrait.png",
    iphoneX_landscape: "resources/launch_screens/iphoneX_landscape.png",
    ipad_portrait_2x: "resources/launch_screens/ipad_portrait_2x.png",
    ipad_landscape_2x: "resources/launch_screens/ipad_landscape_2x.png",

    // iOS splash screens legacy
    iphone_2x: "resources/launch_screens/iphone_2x.png",
    ipad_portrait: "resources/launch_screens/ipad_portrait.png",
    ipad_landscape: "resources/launch_screens/ipad_landscape.png",

    // Android splash screens
    android_mdpi_portrait: "resources/launch_screens/android_mdpi_portrait.png",
    android_mdpi_landscape:
        "resources/launch_screens/android_mdpi_landscape.png",
    android_hdpi_portrait: "resources/launch_screens/android_hdpi_portrait.png",
    android_hdpi_landscape:
        "resources/launch_screens/android_hdpi_landscape.png",
    android_xhdpi_portrait:
        "resources/launch_screens/android_xhdpi_portrait.png",
    android_xhdpi_landscape:
        "resources/launch_screens/android_xhdpi_landscape.png",
    android_xxhdpi_portrait:
        "resources/launch_screens/android_xxhdpi_portrait.png",
    android_xxhdpi_landscape:
        "resources/launch_screens/android_xxhdpi_landscape.png",
    android_xxxhdpi_portrait:
        "resources/launch_screens/android_xxxhdpi_portrait.png",
    android_xxxhdpi_landscape:
        "resources/launch_screens/android_xxxhdpi_landscape.png"
});

App.accessRule("*");
App.configurePlugin("phonegap-plugin-push", {
    SENDER_ID: 937200706426
});
if (this.process.env.NODE_ENV === "production") {
    App.addResourceFile(
        "google-services.json",
        "google-services.json",
        "android"
    );
} else {
    App.addResourceFile(
        "google-services.dev.json",
        "google-services.json",
        "android"
    );
}

App.appendToConfig(`
  <edit-config target="NSLocationWhenInUseUsageDescription" file="*-Info.plist" mode="merge">
    <string>Hustle needs access to your location for navigation purposes</string>
  </edit-config>
`);
App.setPreference("orientation", "portrait");
App.setPreference("AutoHideSplashScreen", "true");
App.setPreference("DisallowOverscroll", "false");