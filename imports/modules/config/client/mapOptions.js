var mapStyle = require("./MapStyle.json");

module.exports = {
    mapStyle: mapStyle,
    mapOptions: {
        keyboardShortcuts: false,
        panControl: false,
        scaleControl: false,
        clickableIcons: false,
        disableDefaultUI: false,
        gestureHandling: "greedy",
        panControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        fullscreenControl: false,
        draggable: true,
        zoomControl: true,
        styles: mapStyle
    }
};
