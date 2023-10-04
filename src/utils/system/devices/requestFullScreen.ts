import { Device } from './Device';
export function requestFullScreen() {
    if (!Device.android)
        return;
    const body = document.body;
    if (body.mozRequestFullScreen) {
        body.mozRequestFullScreen();
    }
    else if (body.webkitRequestFullScreen) {
        body.webkitRequestFullScreen();
    }
}
//# sourceMappingURL=requestFullScreen.js.map