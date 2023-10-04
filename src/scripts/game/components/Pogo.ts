import { Entity3D, Runner, Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Curve from '../../utils/Curve';
import EntityTools from '../../utils/EntityTools';
import Math2 from '../../utils/Math2';
import Random from '../../utils/Random';
import Vector3 from '../../utils/Vector3';
import Character from '../entities/Character';
import Coin from '../entities/Coin';
import Pickup from '../entities/Pickup';
import Smoke from '../entities/Smoke';
import GameComponent from '../GameComponent';
import { CameraRig } from '../systems/CameraSystem';

export default class Pogo extends GameComponent
{
    public count = 0;
    public onTurnOn: Runner;
    public onTurnOff: Runner;
    public onHangtime: Runner;
    public view!: Entity3D;
    public hangtime = false;
    public position!: Vector3;
    public positionEnd = 0;
    public camera!: CameraRig;
    public cameraStartY = 0;
    public smoke?: Smoke;
    public settings = {
        jumpHeight: 150,
        jumpDistance: 300,
        characterChangeTrackLength: 60,
        finalJumpSpeed: 0,
        rows: 14,
        startRowPosition: 1,
        endRowPosition: 1,
        fadeInPosition: 0.1,
        hangtimePosition: 0.6,
        smoothCameraXDuration: 0.05,
    };

    constructor(entity: Character, data = {})
    {
        super(entity, data);
        this.count = 0;
        this.onTurnOn = new Runner('onPogoTurnOn');
        this.onTurnOff = new Runner('onPogoTurnOff');
        this.onHangtime = new Runner('onPogoHangtime');
    }

    show(): void
    {
        if (!this.view)
        {
            this.view = app.library.getEntity('powerups_rocketPogo', { map: 'props-tex' });
            // this.view.scale.set(0.01);
        }
        const scene = (this.entity as Character).gameScene;

        if (scene)
        {
            const parent = EntityTools.findEntity(scene, 'attachPoint1', 10);

            if (parent)
            {
                parent.scale.set(0.01);
                parent.addChild(this.view);
            }
        }
        this.view.active = true;
        if (this.view.view3d) this.view.view3d.renderable = true;
        this.pogoSmokeOn();
    }

    hide(): void
    {
        this.pogoSmokeOff();
        if (this.view)
        {
            this.view.active = false;
            if (this.view.view3d) this.view.view3d.renderable = false;
            if (this.view.parent) this.view.parent.removeChild(this.view);
        }
    }

    turnOn(): void
    {
        this.hangtime = false;

        this.entity.sneakers?.pause();
        this.entity.jetpack?.turnOff();
        this.entity.player?.dizzyEnd();
        this.entity.hoverboard?.pause();
        this.entity.roll?.cancel();
        this.onTurnOn.dispatch();
        this.entity.jump?.lock();

        this.camera = this.entity.game.camera.takeControl();
        this.entity.body.ghost = true;

        // Breaking animation
        this.entity.anim?.play([
            'pogostick_kicking',
        ], { loop: false });

        this.show();

        this.position = this.entity.body.center.clone();
        this.positionEnd = this.position.z - this.settings.jumpDistance;
        this.count = 1;
        this.spawnCoins();

        this.cameraStartY = this.camera.mainY;
        this.entity.roll?.onStart.add(this as any);
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.count) return;

        // Unity Logic -------------------------
        const gamePositionZ = this.entity.body.z;
        const speed = this.entity.game.stats.speed;

        if (gamePositionZ > this.positionEnd)
        {
            const newPositionZ = gamePositionZ - (speed * delta);
            const normalizedPositionZ = -(newPositionZ - this.position.z) / this.settings.jumpDistance;

            let py = this.position.y + (Number(this.jumpCurveEvaluate(normalizedPositionZ)) * this.settings.jumpHeight);

            py = Math2.lerp(this.position.y, py, normalizedPositionZ / this.settings.fadeInPosition);

            this.entity.body.bottom = py;

            if (normalizedPositionZ > this.settings.hangtimePosition && !this.hangtime)
            {
                this.hangtime = true;
                this.onHangtime.dispatch();
                this.pogoSmokeOff();
                this.entity.anim?.play([
                    'pogostick_Hangtime_flying',
                    'pogostick_Hangtime_kick',
                    'pogostick_Hangtime_front_flip1',
                ], { loop: false });
            }

            const m = Curve.sineIn(normalizedPositionZ) * 0.8;
            const cx = this.entity.game.stats.x * GameConfig.cameraModX;
            const cy = this.entity.game.stats.y + (GameConfig.cameraPosY * m);
            const cz = this.entity.game.stats.z + GameConfig.cameraPosZ;

            const warpedCameraRatio = Curve.expoOut(normalizedPositionZ);

            if (this.entity.player) this.entity.player.cameraY = cy;

            this.camera.mainX = cx;
            this.camera.mainY = Math2.lerp(this.cameraStartY, cy, warpedCameraRatio);
            this.camera.mainZ = cz;

            const dy = this.camera.mainY - this.entity.game.stats.y;
            const dz = this.camera.mainZ - this.entity.game.stats.z + 50;

            this.camera.mainRotX = Math.atan2(dz, dy) - (Math.PI * 0.5);
            if (this.entity.player) this.entity.player.cameraTargetY = py;
            if (this.entity.player) this.entity.player.cameraY = py;
            this.entity.body.velocity.y = 0;
        }
        else
        {
            this.turnOff();
        }
        // -------------------------

        if (this.smoke) this.smoke.animationStep(delta);
    }

    turnOff(): void
    {
        this.hide();
        if (!this.count) return;
        this.entity.roll?.onStart.remove(this as any);
        this.onTurnOff.dispatch();
        this.entity.body.ghost = false;
        this.entity.jump?.unlock();
        this.entity.game.camera.releaseControl();
        this.entity.hoverboard?.resume();
        this.entity.sneakers?.resume();
        this.count = 0;
    }

    onRollStart(): void
    {
        this.entity.game.sfx.stop('special-jetpack');
        this.turnOff();
    }

    private jumpCurveEvaluate(v: number): number
    {
        return Curve.quartOut(v);
    }

    isOn(): boolean
    {
        return !!this.count;
    }

    spawnCoins(): void
    {
        const yStart = this.entity.body.y;
        const yEnd = yStart + this.settings.jumpHeight;
        const zStart = this.entity.body.z;
        const zEnd = zStart - this.settings.jumpDistance;
        let y = yStart;
        let z = zStart;
        const skip = 1;
        const steps = this.settings.rows + skip;

        for (let i = 0; i <= steps; i++)
        {
            if (i < skip) continue;
            const r = i / steps;
            const c = this.jumpCurveEvaluate(r);

            y = Math2.lerp(yStart, yEnd, c);
            z = Math2.lerp(zStart, zEnd, r);
            if (i < steps)
            {
                this.spawnCoinsRow(y, z);
            }
            else
            {
                this.spawnPowerup(y, z);
            }
        }
    }

    spawnCoinsRow(y: number, z: number): void
    {
        let a = 3;

        while (a--)
        {
            const coin = this.entity.game.pool.get(Coin as any, {}) as Coin;

            coin.body.x = (a - 1) * GameConfig.laneWidth;
            coin.body.bottom = y;
            coin.body.z = z;
            coin.arc = 0;
            coin.awake();
            this.entity.game.addChild(coin);
        }
    }

    spawnPowerup(y: number, z: number): void
    {
        const powerup = Pickup.spawnRandomType(this.entity.game, ['sneakers', 'jetpack', 'magnet', 'multiplier']);

        powerup.body.x = Random.pick(-1, 0, 1) * GameConfig.laneWidth;
        powerup.body.bottom = y;
        powerup.body.z = z;
    }

    pogoSmokeOn(): void
    {
        if (!this.smoke)
        {
            this.smoke = new Smoke(5);
            this.smoke.scale.x = 0.5;
            this.smoke.scale.y = 1.1;
            this.smoke.y = -3;
        }
        if (this.view) this.view.addChild(this.smoke);
        this.smoke.turnOn();
        this.entity.game.sfx.play('special-jetpack', { loops: true });
    }

    pogoSmokeOff(): void
    {
        if (!this.smoke) return;
        this.smoke.turnOff();
        this.entity.game.sfx.stop('special-jetpack');
    }
}
