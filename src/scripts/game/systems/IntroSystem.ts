import { Entity, Runner, Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import Curve, { CurveFunc } from '../../utils/Curve';
import Math2 from '../../utils/Math2';
import { GameSystem } from '../GameSystem';
import { CameraRig } from './CameraSystem';

class CameraPos
{
    public idleX = 0;
    public idleY = 0;
    public idleZ = 0;
    public idleRotX = 0;
    public idleRotY = 0;
    public mainX = 0;
    public mainY = 0;
    public mainZ = 0;
    public mainRotX = 0;
    public mainRotY = 0;
    public fov = 60;

    constructor(rig: CameraRig)
    {
        if (rig) this.copy(rig);
    }

    copy(rig: CameraRig)
    {
        this.idleX = rig.idleX;
        this.idleY = rig.idleY;
        this.idleZ = rig.idleZ;
        this.idleRotX = rig.idleRotX;
        this.idleRotY = rig.idleRotY;
        this.mainX = rig.mainX;
        this.mainY = rig.mainY;
        this.mainZ = rig.mainZ;
        this.mainRotX = rig.mainRotX;
        this.mainRotY = rig.mainRotY;
        this.fov = rig.fov;
    }
}

class CameraAnim
{
    public name = '';
    public rig: CameraRig;
    public from: CameraPos;
    public to: CameraPos;
    public curve: CurveFunc;
    public time = 0;
    public duration = 0;
    public next: CameraAnim | null = null;
    public playing = false;

    constructor(name: string, rig: CameraRig, duration = 1)
    {
        this.name = name;
        this.rig = rig;
        this.from = new CameraPos(this.rig);
        this.to = new CameraPos(this.rig);
        // this.curve = Curve.sineInOut;
        this.curve = Curve.linear;
        this.time = 0;
        this.duration = duration;
        this.next = null;
    }

    play()
    {
        console.log('[IntroSystem] play', this.name);
        this.playing = true;
        this.time = 0;
        this.from = new CameraPos(this.rig);
    }

    update(delta: number)
    {
        if (!this.playing) return;
        this.time += delta;
        if (this.time >= this.duration) this.time = this.duration;
        const r = this.curve ? this.curve(this.ratio) : this.ratio;

        this.rig.idleX = Math2.lerp(this.from.idleX, this.to.idleX, r);
        this.rig.idleY = Math2.lerp(this.from.idleY, this.to.idleY, r);
        this.rig.idleZ = Math2.lerp(this.from.idleZ, this.to.idleZ, r);
        this.rig.idleRotX = Math2.lerp(this.from.idleRotX, this.to.idleRotX, r);
        this.rig.idleRotY = Math2.lerp(this.from.idleRotY, this.to.idleRotY, r);
        this.rig.mainX = Math2.lerp(this.from.mainX, this.to.mainX, r);
        this.rig.mainY = Math2.lerp(this.from.mainY, this.to.mainY, r);
        this.rig.mainZ = Math2.lerp(this.from.mainZ, this.to.mainZ, r);
        this.rig.mainRotX = Math2.lerp(this.from.mainRotX, this.to.mainRotX, r);
        this.rig.mainRotY = Math2.lerp(this.from.mainRotY, this.to.mainRotY, r);
        this.rig.fov = Math2.lerp(this.from.fov, this.to.fov, r);
        if (this.time >= this.duration) this.complete();
    }

    complete()
    {
        console.log('[IntroSystem] complete', this.name);
        this.playing = false;
        this.time = this.duration;
        if (this.next) this.next.play();
    }

    get ratio()
    {
        return this.time / this.duration;
    }

    set ratio(v)
    {
        this.time = this.duration * Math2.clamp(v);
    }
}

export default class IntroSystem extends GameSystem
{
    public time = 0;
    public duration = 60;
    public playing = false;
    public onIntroComplete: Runner;
    public step1?: CameraAnim;
    public step2?: CameraAnim;
    public step3?: CameraAnim;

    constructor(entity: Entity)
    {
        super(entity);
        this.onIntroComplete = new Runner('onIntroComplete');
        this.time = 0;
        this.duration = 60;
        this.playing = false;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.playing) return;
        // delta = 1;
        // const delta = this.game.delta;

        if (this.step1) this.step1.update(delta);
        if (this.step2) this.step2.update(delta);
        if (this.step3) this.step3.update(delta);
        // this.mod.fov *= 0.5 * delta;
    }

    preupdate(): void
    {
        if (!this.playing) return;
        const delta = this.game.delta;

        this.time += delta;
        if (this.time >= this.duration) this.time = this.duration;
        if (this.time >= this.duration) this.complete();
    }

    play(): void
    {
        console.log('[IntroSystem] play');
        this.playing = true;
        this.game.camera.takeControl();
        this.game.camera.updateIdle(0);
        this.time = 0;

        this.step1 = new CameraAnim('step1', this.game.camera.rig, this.duration * 0.4);
        this.step1.to.idleX = -16.49361;
        this.step1.to.idleY = -8.666094;
        this.step1.to.idleZ = 12.52404;
        this.step1.to.idleRotX = 23.52661 * Math2.DEG_TO_RAD;
        this.step1.to.idleRotY = 55.26425 * Math2.DEG_TO_RAD;
        this.step1.to.mainX = 0;
        this.step1.to.mainY = GameConfig.cameraPosY;
        this.step1.to.mainZ = GameConfig.cameraPosZ;
        this.step1.to.mainRotX = GameConfig.cameraRotX;
        this.step1.to.mainRotY = 0;
        this.step1.curve = Curve.sineInOut;

        this.step2 = new CameraAnim('step2', this.game.camera.rig, this.duration * 0.2);
        this.step2.to.idleX = -16.49361;
        this.step2.to.idleY = -8.666094;
        this.step2.to.idleZ = 12.52404;
        this.step2.to.idleRotX = 23.30551 * Math2.DEG_TO_RAD;
        this.step2.to.idleRotY = 55.47934 * Math2.DEG_TO_RAD;
        this.step2.to.mainX = 0;
        this.step2.to.mainY = GameConfig.cameraPosY;
        this.step2.to.mainZ = GameConfig.cameraPosZ;
        this.step2.to.mainRotX = GameConfig.cameraRotX;
        this.step2.to.mainRotY = 0;

        this.step3 = new CameraAnim('step3', this.game.camera.rig, this.duration * 0.4);
        this.step3.to.idleX = 0;
        this.step3.to.idleY = 0;
        this.step3.to.idleZ = 0;
        this.step3.to.idleRotX = 0;
        this.step3.to.idleRotY = 0;
        this.step3.to.mainX = 0;
        this.step3.to.mainY = GameConfig.cameraPosY;
        this.step3.to.mainZ = GameConfig.cameraPosZ;
        this.step3.to.mainRotX = GameConfig.cameraRotX;
        this.step3.to.mainRotY = 0;
        this.step3.to.fov = GameConfig.cameraFov;
        // this.step3.curve = Curve.quartIn;
        // this.step3.curve = Curve.quintIn;
        this.step3.curve = Curve.sineIn;

        this.step1.next = this.step2;
        this.step2.next = this.step3;

        this.step1.play();
    }

    complete(): void
    {
        console.log('[IntroSystem] complete');
        this.playing = false;
        this.game.camera.releaseControl();
        this.onIntroComplete.dispatch();
        this.game.runFromIntro();
    }

    get ratio(): number
    {
        return this.time / this.duration;
    }
}
