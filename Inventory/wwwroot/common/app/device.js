var device = {
    android: function () {
        return navigator.userAgent.match(/Android/i);
    },

    blackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },

    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },

    opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },

    windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },

    isMobile: function () {
        return device.android() || device.blackBerry() || device.iOS() || device.opera() || device.windows();
    }
};