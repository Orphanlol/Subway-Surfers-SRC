import { Entity3D, Time } from '@goodboydigital/odie';

import Game from '../../Game';
import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Curve from '../../utils/Curve';
import EntityTools from '../../utils/EntityTools';
import Math2 from '../../utils/Math2';
import Random from '../../utils/Random';
import Character from '../entities/Character';
import Coin from '../entities/Coin';
import Pickup from '../entities/Pickup';
import Smoke from '../entities/Smoke';
import GameComponent from '../GameComponent';
import { CameraRig } from '../systems/CameraSystem';

/**
 * Jetpack duration is based on distance, not time. This was the most reasonable way I've found to ensure
 * a safe spot for landing - a empty chunk without obstacles, that should be set somewhere after curretly
 * placed chunks. So the total jetpack duration will be the distance between jetpack start and that safe chunk,
 * and that time, in seconds, can vary depending on the length of chunks that has been placed in between
 */

export default class Jetpack extends GameComponent
{
    public distance = 0;
    public distanceTotal = 1;
    public speed = 0;
    public ceiling = 100;
    public coinDistance = 30;
    public timer?: any;
    public takeOffTime = 0;
    public takeOffDuration = 0;
    public takeOffStartY = 0;
    public takeOffEndY = 0;
    public rig!: CameraRig;
    public rigStartY = 0;
    public rigStartZ = 0;
    public smokeLeft?: Smoke;
    public smokeRight?: Smoke;
    public view!: Entity3D;
    public headstartLevel = 0;
    private pickups: Pickup[] = [];

    public calculateDistance(): number
    {
        if (this.headstartLevel)
        {
            return 2000 + (1000 * this.headstartLevel);
        }

        const baseDistance = 1000; // min distance
        const speedDistance = 200 * Math.abs(this.speed); // distance per speed point
        const boostDistance = 600 * Math.abs(app.user.boosts.permanents.jetpack); // distance per upgrade point

        return baseDistance + speedDistance + boostDistance;
    }

    show(): void
    {
        if (!this.view) this.view = app.library.getEntity('powerups_jetpack', { map: 'props-tex' });
        this.view.ry = Math.PI;
        this.view.y = 1 * 0.01;
        this.view.z = 0.5 * 0.01;
        this.view.scale.set(0.6 * 0.01);

        if (this.entity.anim)
        {
            const scene = (this.entity as Character).gameScene;
            const parent = EntityTools.findEntity(scene, 'LowerSpine_jnt', 10);

            if (parent) parent.addChild(this.view);
        }

        this.entity.game.sfx.play('special-jetpack-start');
        this.entity.game.sfx.play('special-jetpack', { loops: true });
        this.jetpackSmokeOn();
    }

    hide(): void
    {
        this.entity.game.hud.removeItemTimer('jetpack');
        this.jetpackSmokeOff();
        this.entity.game.sfx.stop('special-jetpack');
        if (this.view.parent) this.view.parent.removeChild(this.view);
    }

    get ratio(): number
    {
        return this.distance / this.distanceTotal;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.distance) return;
        if (this.timer) this.timer.ratio = this.ratio;
        const vz = Math2.lerp(this.entity.body.velocity.z, this.speed, delta * 0.1);

        this.entity.body.velocity.z = vz;

        this.distance -= this.entity.game.stats.distanceDelta;
        this.entity.game.hud.updateItemTimer('jetpack', this.ratio);

        const my = this.entity.game.stats.y + GameConfig.cameraPosY;
        const mz = this.entity.game.stats.z + GameConfig.cameraPosZ;

        this.entity.game.hero.player.cameraY = my;

        if (this.takeOffTime < this.takeOffDuration)
        {
            this.takeOffTime += this.entity.game.deltaSecs;
            if (this.takeOffTime > this.takeOffDuration) this.takeOffTime = this.takeOffDuration;
            const r = this.takeOffTime / this.takeOffDuration;
            // const t = Curve.quartInOut(r);

            this.entity.body.y = Math2.lerp(this.takeOffStartY, this.takeOffEndY, r);

            this.rig.mainY = Math2.lerp(this.rigStartY, my, Curve.sineOut(r));
            this.rig.mainZ = Math2.lerp(this.rigStartZ, mz, Curve.expoOut(r));
        }
        else
        {
            this.rig.mainY = my;
            this.rig.mainZ = mz;
        }

        this.rig.mainX = this.entity.game.stats.x * GameConfig.cameraModX;
        this.rig.mainRotX = GameConfig.cameraRotX + this.entity.game.hero.player.cameraRotX;
        if (this.entity.player) this.entity.player.cameraTargetY = this.entity.body.bottom;

        if (this.smokeLeft) this.smokeLeft.animationStep(delta);
        if (this.smokeRight) this.smokeRight.animationStep(delta);
        if (this.distance <= 0) this.turnOff(true);
    }

    turnOn(headstartLevel = 0): void
    {
        this.headstartLevel = headstartLevel;

        // Disable/cancel other components
        this.entity.player?.dizzyEnd();
        this.entity.sneakers?.turnOff();
        this.entity.pogo?.turnOff();
        this.entity.hoverboard?.pause();
        this.entity.jump?.lock();
        this.entity.roll?.lock();
        this.entity.state?.set('empty');

        // Physics setup
        this.entity.body.velocity.y = 0;
        this.entity.body.ghost = true;

        // Set the jetpack speed
        this.speed = (-this.entity.game.stats.speed * 2) - 1 - headstartLevel;

        // Find out the desired ending point to the jetpack
        const pos = -this.entity.body.z;
        const end = pos + this.calculateDistance();

        // This function will fill up the level with chunks until the end position
        // after that will place a safe landing chunk and return its position
        const landingPos = this.entity.game.level.setSafeLanding(end);

        // Total distance is the difference of current pos to the landing chunk
        // and that will define the duration of jetpack
        this.distanceTotal = landingPos - pos;
        this.distance = this.distanceTotal;

        // Animation setup
        this.takeOffStartY = this.entity.body.y;
        this.takeOffEndY = 100;
        this.takeOffTime = 0;
        this.takeOffDuration = 2;

        // Custom camera
        this.rig = this.entity.game.camera.takeControl();
        this.rigStartY = this.rig.mainY;
        this.rigStartZ = this.rig.mainZ;

        this.show();

        if (!headstartLevel)
        {
            this.entity.game.hud.addItemTimer('jetpack');
            this.spawnCoins(this.entity.game, this.takeOffEndY, this.distance);
        }
        else
        {
            this.spawnPickups(this.entity.game, this.takeOffEndY, -landingPos);
        }
    }

    turnOff(playTurnOffSound = false): void
    {
        if (!this.distance) return;
        this.hide();
        this.pickups = [];
        this.headstartLevel = 0;
        this.entity.body.ghost = false;
        this.entity.body.velocity.y = 0;
        this.entity.jump?.unlock();
        this.entity.roll?.unlock();
        if (this.entity.hoverboard?.isOn()) this.entity.hoverboard.show();
        this.entity.game.camera.releaseControl();
        this.distance = 0;
        (this.entity as any).restoreSize();
        this.entity.hoverboard?.resume();
        app.game.hud.boostGauge.lowlightHeadstart();
        if (playTurnOffSound) app.sound.play('pickup-powerdown');
    }

    isOn(): boolean
    {
        return !!this.distance;
    }

    private spawnCoins(game: Game, height: number, length: number): void
    {
        const offset = 350 * game.stats.speed;
        const coinsLength = length - offset;
        const amount = coinsLength / this.coinDistance;
        const spacing = coinsLength / amount;
        let rx = 0;
        let px = 0;
        let changeCount = 5;

        for (let i = 0; i < amount; i++)
        {
            const coin = game.pool.get(Coin as any, {}) as unknown as Coin;

            if (!changeCount)
            {
                rx = !rx ? Random.pick(-1, 0, 1) : Random.pick(0, rx);
                changeCount = 5;
            }
            else
            {
                changeCount -= 1;
            }
            if (px < rx)
            {
                px += 0.5;
            }
            else if (px > rx)
            {
                px -= 0.5;
            }
            // px = rx;
            coin.body.x = GameConfig.laneWidth * px;
            coin.body.y = height;
            coin.body.z = game.stats.z - (spacing * i) - offset;
            coin.arc = 0;
            coin.awake();
            game.addChild(coin as any);
        }
    }

    private spawnPickups(game: Game, y: number, z: number): void
    {
        const magnet = this.pickups[0] || Pickup.spawn(game, 'magnet');
        const multiplier = this.pickups[1] || Pickup.spawn(game, 'multiplier');
        const sneakers = this.pickups[2] || Pickup.spawn(game, 'sneakers');
        const positions = Random.shuffle([-20, 0, 20]);

        magnet.body.x = positions[0];
        magnet.body.y = y;
        magnet.body.z = z;

        multiplier.body.x = positions[1];
        multiplier.body.y = y;
        multiplier.body.z = z;

        sneakers.body.x = positions[2];
        sneakers.body.y = y;
        sneakers.body.z = z;

        this.pickups[0] = magnet;
        this.pickups[1] = multiplier;
        this.pickups[2] = sneakers;
    }

    jetpackSmokeOn(): void
    {
        if (!this.entity.model) return;

        if (!this.smokeLeft)
        {
            this.smokeLeft = new Smoke(3, true);
            this.smokeLeft.x = 0.9 + this.entity.model.x;
            this.smokeLeft.y = 1.7;
            this.smokeLeft.z = 0.5;
            this.smokeLeft.scale.x = 0.5;
            this.smokeLeft.scale.y = 2.0;
            this.smokeLeft.rotation.x = -Math2.PI_HALF;
        }

        if (!this.smokeRight)
        {
            this.smokeRight = new Smoke(3, true);
            this.smokeRight.x = -0.9 + this.entity.model.x;
            this.smokeRight.y = this.smokeLeft.y;
            this.smokeRight.z = this.smokeLeft.z;
            this.smokeRight.scale.x = -this.smokeLeft.scale.x;
            this.smokeRight.scale.y = this.smokeLeft.scale.y;
            this.smokeRight.rotation.x = this.smokeLeft.rotation.x;
        }

        this.entity.addChild(this.smokeLeft);
        this.entity.addChild(this.smokeRight);
        this.smokeLeft.turnOn();
        this.smokeRight.turnOn();
    }

    jetpackSmokeOff(): void
    {
        if (this.smokeLeft) this.smokeLeft.turnOff();
        if (this.smokeRight) this.smokeRight.turnOff();
    }
}
