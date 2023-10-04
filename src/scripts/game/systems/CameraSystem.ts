import { CameraEntity, Entity, Entity3D, Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { CurveFunc } from '../../utils/Curve';
import Math2 from '../../utils/Math2';
import Random from '../../utils/Random';
import { GameSystem } from '../GameSystem';

/*
UNITY unity_startGame
    x = -21.94232
    y = -13.06444
    z = -11.95625
    rx = -16.37991
    ry = -59.09998
UNITY Main Camera
    x = 0
    y = 33.8
    z = -33
    rx = 21.50143
    ry = 0
*/

export class CameraRig extends Entity3D
{
    public camera: CameraEntity;
    public levels = [
        '_idle',
        '_idleRotY',
        '_idleRotX',
        '_main',
        '_mainRotY',
        '_mainRotX',
        '_tunnel',
    ];

    public _idle!: any;
    public _idleRotY!: any;
    public _idleRotX!: any;
    public _main!: any;
    public _mainRotY!: any;
    public _mainRotX!: any;
    public _tunnel!: any;
    public _fov = 1;

    constructor(camera: CameraEntity)
    {
        super();
        this.camera = camera;
        this.levels = [
            '_idle',
            '_idleRotY',
            '_idleRotX',
            '_main',
            '_mainRotY',
            '_mainRotX',
            '_tunnel',
        ];

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let container: Entity3D = this;

        for (const i in this.levels)
        {
            const sub = new Entity3D();

            (this as any)[this.levels[i]] = sub;
            (container as any).addChild(sub);
            container = sub;
            if (camera) (sub as any).addChild(camera);
        }
    }

    reset(): void
    {
        for (const i in this.levels)
        {
            this.resetLevel(this.levels[i]);
        }
    }

    resetLevel(name: string): void
    {
        const level = (this as any)[name];

        level.x = 0;
        level.y = 0;
        level.z = 0;
        level.rx = 0;
        level.ry = 0;
    }

    resetIdle(): void
    {
        this.resetLevel('_idle');
    }

    get fov(): number
    {
        return this._fov;
    }

    set fov(v: number)
    {
        this._fov = v;
        (this.camera as any).camera.fov = v * (Math.PI / 180);
    }

    get idleX(): number
    {
        return this._idle.x;
    }

    set idleX(v: number)
    {
        this._idle.x = v;
    }

    get idleY(): number
    {
        return this._idle.y;
    }

    set idleY(v: number)
    {
        this._idle.y = v;
    }

    get idleZ(): number
    {
        return this._idle.z;
    }

    set idleZ(v: number)
    {
        this._idle.z = v;
    }

    get idleRotX(): number
    {
        return this._idleRotX.rx;
    }

    set idleRotX(v: number)
    {
        this._idleRotX.rx = v;
    }

    get idleRotY(): number
    {
        return this._idleRotY.ry;
    }

    set idleRotY(v: number)
    {
        this._idleRotY.ry = v;
    }

    get mainX(): number
    {
        return this._main.x;
    }

    set mainX(v: number)
    {
        this._main.x = v;
    }

    get mainY(): number
    {
        return this._main.y;
    }

    set mainY(v: number)
    {
        this._main.y = v;
    }

    get mainZ(): number
    {
        return this._main.z;
    }

    set mainZ(v: number)
    {
        this._main.z = v;
    }

    get mainRotX(): number
    {
        return this._mainRotX.rx;
    }

    set mainRotX(v: number)
    {
        this._mainRotX.rx = v;
    }

    get mainRotY(): number
    {
        return this._mainRotY.ry;
    }

    set mainRotY(v: number)
    {
        this._mainRotY.ry = v;
    }
}

export default class CameraSystem extends GameSystem
{
    public running = true;
    public tunnel = false;
    public rig!: CameraRig;
    public suspend = false;

    protected _shakePower = 0;
    protected _controlled = false;
    protected _animating = false;
    protected _profile?: any;
    protected _animStart: any = {};
    protected _animEnd: any = {};
    protected _animCurve?: CurveFunc;
    protected _animTime = 0;

    constructor(entity: Entity)
    {
        super(entity);

        this.game.onIdle.add(this as any);
        this.game.onRun.add(this as any);
        this.game.onEnterTunnel.add(this as any);
        this.game.onExitTunnel.add(this as any);
    }

    public get mainCamera(): CameraEntity
    {
        return this.game.view3d.camera;
    }

    idle(): void
    {
        if (this.rig) this.rig.reset();
        this.running = false;
        this._shakePower = 0;
        this.tunnel = false;
    }

    run(): void
    {
        if (this.rig) this.rig.resetLevel('_tunnel');
        this.running = true;
        this.tunnel = false;
    }

    enterTunnel(): void
    {
        this.tunnel = true;
    }

    exitTunnel(): void
    {
        this.tunnel = false;
    }

    setup(): void
    {
        if (this.rig) return;
        this.rig = new CameraRig(this.game.view3d.camera);
        this.game.addChild(this.rig);
        this.game.view3d.camera.x = 0;
        this.game.view3d.camera.y = 0;
        this.game.view3d.camera.z = 0;
        this.game.view3d.camera.rx = 0;
        this.game.view3d.camera.ry = 0;
        this.game.view3d.camera.rz = 0;
        this.game.view3d.camera.camera.near = 3;
        this.game.view3d.camera.camera.far = 1000;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (this.suspend) return;
        if (!this.rig) this.setup();
        if (this.running)
        {
            this.updateRunning(delta);
        }
        else
        {
            this.updateIdle(delta);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateIdle(delta: number): void
    {
        if (this._controlled) return;

        // Official settings
        this.rig.idleX = -21.94232;
        this.rig.idleY = -13.06444;
        this.rig.idleZ = 11.95625;
        this.rig.idleRotX = 16.37991 * Math2.DEG_TO_RAD;
        this.rig.idleRotY = 59.09998 * Math2.DEG_TO_RAD;
        this.rig.idleRotY += 0.001; // Fix camera position when idle

        // Optimised settings
        this.rig.idleX = -25;
        this.rig.idleY = -13.06444;
        this.rig.idleZ = 15;
        this.rig.idleRotX = 16.37991 * Math2.DEG_TO_RAD;
        this.rig.idleRotY = 77 * Math2.DEG_TO_RAD;
        this.rig.idleRotY += 0.001; // Fix camera position when idle

        this.rig.mainX = 0;
        this.rig.mainY = GameConfig.cameraPosY;
        this.rig.mainZ = GameConfig.cameraPosZ;
        this.rig.mainRotX = GameConfig.cameraRotX;
        this.rig.mainRotY = 0;

        this.rig.fov = 71.99513;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateRunning(delta: number): void
    {
        if (!this.rig) return;
        if (this._animating) this.updateAnimation(delta);

        if (!this._controlled)
        {
            this.rig.idleX = 0;
            this.rig.idleY = 0;
            this.rig.idleZ = 0;
            this.rig.idleRotX = 0;
            this.rig.idleRotY = 0;

            const px = this.game.stats.x * GameConfig.cameraModX;

            this.rig.mainX = Math2.lerp(this.rig.mainX, px, delta * 0.3);

            const py = this.game.hero.player.cameraY + GameConfig.cameraPosY;
            // const rx = GameConfig.cameraRotX;

            this.rig.mainY = Math2.lerp(this.rig.mainY, py, delta * 0.3);
            // this.rig.mainZ = Math2.lerp(this.rig.mainZ, this.game.stats.z + GameConfig.cameraPosZ, delta * 0.9);
            this.rig.mainZ = this.game.stats.z + GameConfig.cameraPosZ;
            this.rig.mainRotX = Math2.lerp(this.rig.mainRotX, GameConfig.cameraRotX, delta * 0.1);
            this.rig.mainRotY = 0;
            this.rig.fov = GameConfig.cameraFov;
        }

        this.updateTunnel(delta);
        this.updateShake(delta);
    }

    updateTunnel(delta: number): void
    {
        // const tunnel = this.game.hero.player.tunnel;
        const tunnel = this.tunnel;
        const rig = this.rig._tunnel;

        if (!tunnel && rig.rx === 0 && this.rig.y === 0) return;
        const targetY = 18.30177;
        const targetRotX = -4.621953 * Math2.DEG_TO_RAD;
        const y = tunnel ? GameConfig.cameraPosY - targetY : 0;
        const rx = tunnel ? GameConfig.cameraRotX - targetRotX : 0;
        const speed = (this.game.stats.speed * 0.25) + 0.75;

        rig.y = Math2.smoothDamp(rig.y, -y, 0, 0.2, 1.2 * speed, delta);
        rig.rx = Math2.smoothDamp(rig.rx, -rx, 0, 0.05, 0.1 * speed, delta);
    }

    updateShake(delta: number): void
    {
        const rig = this.rig;

        if (!this._shakePower && rig.x === 0 && this.rig.y === 0) return;
        rig.y = Random.range(-this._shakePower, this._shakePower);
        rig.x = Random.range(-this._shakePower, this._shakePower);
        this._shakePower -= delta * 0.5;
        if (this._shakePower < 0) this._shakePower = 0;
    }

    get profile(): Record<string, any>
    {
        if (!this._profile) this._profile = {};
        if (!this.rig) return this._profile;
        this._profile.idleX = this.rig.idleX;
        this._profile.idleY = this.rig.idleY;
        this._profile.idleZ = this.rig.idleZ;
        this._profile.idleRotX = this.rig.idleRotX;
        this._profile.idleRotY = this.rig.idleRotY;
        this._profile.mainX = this.rig.mainX;
        this._profile.mainY = this.rig.mainY;
        this._profile.mainZ = this.rig.mainZ;
        this._profile.mainRotX = this.rig.mainRotX;
        this._profile.mainRotY = this.rig.mainRotY;
        this._profile.fov = this.game.view3d.camera.camera.fov;
        this._profile.near = this.game.view3d.camera.camera.near;
        this._profile.far = this.game.view3d.camera.camera.far;

        return this._profile;
    }

    takeControl(): CameraRig
    {
        this._controlled = true;

        return this.rig;
    }

    releaseControl(): void
    {
        this._controlled = false;
    }

    shake(power: number): void
    {
        this._shakePower = power;
    }

    animate(props: Record<string, number>, time: number, curve: CurveFunc): void
    {
        this._controlled = true;
        this._animating = true;

        if (!this._animStart) this._animStart = {};
        if (!this._animEnd) this._animEnd = {};
        this._animCurve = curve;
        this._animTime = time;

        for (const f in props)
        {
            this._animStart[f] = (this.rig as any)[f];
            this._animEnd[f] = props[f];
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAnimation(delta: number): void
    {
        // If needed...
    }

    animateEnd(): void
    {
        this._controlled = false;
        this._animating = false;
    }
}
