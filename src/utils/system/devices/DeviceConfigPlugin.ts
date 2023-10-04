import assign from 'assign-deep';
import { Plugin } from '../../../core/app/Plugin';
import { Device } from './Device';
import { DeviceSettings } from './DeviceSettings';
export class DeviceConfigPlugin extends Plugin {
    constructor(app, options) {
        super(app, options);
        this.mergeConfig(options.overrideConfig || {}, options.useDefaults);
    }
    mergeConfig(overrideConfig, useDefaults = true) {
        const mergedConfig = useDefaults ? assign(DeviceSettings, overrideConfig) : overrideConfig;
        let deviceConfig = mergedConfig.default;
        for (const key in mergedConfig) {
            const match = mergedConfig[key].match;
            if (match === 'default') {
                continue;
            }
            const result = Device.query(match);
            if (result) {
                deviceConfig = assign(deviceConfig, mergedConfig[key]);
                break;
            }
        }
        this.app.config = assign(this.app.config, deviceConfig || mergedConfig);
    }
}
//# sourceMappingURL=DeviceConfigPlugin.js.map