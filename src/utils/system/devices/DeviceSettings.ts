const DeviceSettings = {
    iPhoneX: {
        match: 'device:iPhoneX',
        stage: {
            clearBeforeRender: false,
            resolution: 2,
            antialias: true,
        },
    },
    iPhone6: {
        match: 'device:iPhone6',
        stage: {
            clearBeforeRender: true,
            resolution: 1.5,
            antialias: true,
        },
        resource: {
            version: 'high',
        },
    },
    galaxyS5: {
        match: 'device:S5',
        stage: {
            clearBeforeRender: true,
            resolution: 2,
            antialias: false,
        },
        resource: {
            version: 'high',
        },
    },
    androidTablet: {
        match: 'model:tablet--os:android',
        stage: {
            clearBeforeRender: true,
            resolution: 1,
            antialias: true,
        },
        resource: {
            version: 'high',
        },
    },
};
export { DeviceSettings, };
//# sourceMappingURL=DeviceSettings.js.map