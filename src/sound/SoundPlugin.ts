import SoundBoy from '@goodboydigital/soundboy';
import { VisibilityPlugin } from '../stage';
import { Plugin } from './../core/app/Plugin';
export class SoundPlugin extends Plugin {
    constructor(app, options) {
        var _a;
        super(app, options);
        this._manifest = options.manifest;
        this._basePath = (_a = options.basePath) !== null && _a !== void 0 ? _a : '';
        this._manifestIDs = options.manifestIDs || ['default'];
        this.registerSounds = options.registerSounds || this._defaultRegisterSounds;
        this.visibilityChange = options.visibilityChange || this._defaultVisibilityChange;
    }
    start() {
        this.app.get(VisibilityPlugin).onVisibilityChange.connect((visible) => {
            this.visibilityChange(visible);
        });
        this.registerSounds();
    }
    _defaultVisibilityChange(visible) {
        SoundBoy.systemPaused = !visible;
    }
    _defaultRegisterSounds() {
        this._manifestIDs.forEach((manifestId) => {
            const targetManifest = this._manifest[manifestId];
            Object.values(targetManifest.audio).forEach((value) => {
                const id = value.shortcut.split('.').shift();
                const isMusic = id.indexOf('music') !== -1;
                const loop = isMusic || id.indexOf('loop') !== -1;
                const preload = false;
                const stream = false;
                SoundBoy.registerSound({
                    id,
                    src: [
                        this._basePath + value.mp3,
                        this._basePath + value.ogg,
                    ],
                    stream,
                    loop,
                    preload,
                });
            });
        });
    }
}
//# sourceMappingURL=SoundPlugin.js.map