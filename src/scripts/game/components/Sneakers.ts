import { Entity3D, Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Collision from '../../utils/Collision';
import EntityTools from '../../utils/EntityTools';
import Character from '../entities/Character';
import GameComponent from '../GameComponent';
import { CameraRig } from '../systems/CameraSystem';

export default class Sneakers extends GameComponent
{
    public mod = 0;
    public left!: Entity3D;
    public right!: Entity3D;
    public rig!: CameraRig;
    public time = 0;
    public duration = 0;
    public hitTop = 0;
    public ascending = false;
    public gravity = 0;
    public locked = false;
    public isJumping = false;
    public jumpHeight = 0;
    public jumpLength = 0;
    public startPosY = 0;
    public startPosZ = 0;
    public entity!: Character;
    public frozen = false;
    public paused = false;

    protected _activated = false;

    constructor(entity: Character, data = {})
    {
        super(entity, data);
        entity.body.onCollisionEnter.add(this as any);
        this.mod = 0;
        this.entity = entity;
    }

    /**
     * Calculate the total duration for this powerup, in seconds
     * @returns The total duration in seconds
     */
    public calculateDuration(): number
    {
        const boostPoints = Math.abs(app.user.boosts.permanents.sneakers);
        const boostDuration = 5 * boostPoints;

        return 10 + boostDuration;
    }

    public get ratio(): number
    {
        return this.time / this.duration;
    }

    public update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.time) return;
        if (!this._activated && this.entity.body.landed) this._activate();
        if (!this._activated) return;
        if (!this.frozen && !this.paused) this.time -= this.entity.game.deltaSecs;
        this.jumpUpdate(delta);

        this.entity.game.hud.updateItemTimer('sneakers', this.ratio);

        if (this.entity.player)
        {
            let d = (this.entity.body.bottom - this.entity.player.cameraY) * 0.5;

            if (this.hitTop) d *= 0.5;
            this.mod = d;
        }

        // Prevent camera updated if paused
        if (this.paused) return;

        this.rig.mainX = this.entity.game.stats.x * GameConfig.cameraModX;
        this.rig.mainY = this.entity.game.hero.player.cameraY + GameConfig.cameraPosY + this.mod;
        this.rig.mainZ = this.entity.game.stats.z + GameConfig.cameraPosZ;
        this.rig.mainRotX = GameConfig.cameraRotX;
        this.rig.mainRotY = 0;

        const currentChunk = this.entity.game.level.currentChunk;
        const rooftop = this.entity.body.y > 80;

        if (!rooftop && currentChunk && currentChunk.envTube)
        {
            const top = 70;

            if (this.rig.mainY > top) this.rig.mainY = top;
        }

        if (!rooftop && currentChunk && currentChunk.envPillars)
        {
            const top = 60;

            if (this.rig.mainY > top) this.rig.mainY = top;
        }

        if (this.time <= 0)
        {
            if (this.entity.body.landed && !this.ascending)
            {
                this.turnOff(true);
            }
            else
            {
                this.time = 0.01;
            }
        }
    }

    public turnOn(): void
    {
        this.frozen = false;
        this.mod = 0;
        this.paused = false;
        this.entity.pogo?.turnOff();
        this.entity.jetpack?.turnOff();
        this.entity.hoverboard?.cancel();

        this.hitTop = 0;
        this.duration = this.calculateDuration();
        this.time = this.duration;
        this.gravity = GameConfig.gravity;
        this.entity.game.hud.addItemTimer('sneakers');
        this.entity.game.controller.onSwipeVertical.add(this as any);
        this.show();
    }

    public turnOff(playTurnOffSound = false): void
    {
        if (!this.time) return;
        this.resume();
        this.hide();
        this.entity.jump?.unlock();
        this.frozen = false;
        this.time = 0;
        this.mod = 0;
        this.entity.game.controller.onSwipeVertical.remove(this as any);
        this.entity.game.camera.releaseControl();
        this.entity.state?.set('empty');
        this.entity.game.hud.removeItemTimer('sneakers');
        this._activated = false;
        if (playTurnOffSound) app.sound.play('pickup-powerdown');
    }

    private _activate(): void
    {
        this.entity.jump?.lock();
        this._activated = true;
        this.entity.state?.set('empty');
        this.rig = this.entity.game.camera.takeControl();
    }

    public isOn(): boolean
    {
        return !!this.time;
    }

    public onSwipeVertical(direction: number): void
    {
        if (direction === 1) this.jump();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public jump(force = false): void
    {
        if (!this.time)
        {
            console.log('[JUMP] SNEAKERS Cant jump - not active');

            return;
        }
        if (!force && this.locked)
        {
            console.log('[JUMP] SNEAKERS Cant jump - jump locked');

            return;
        }
        if (!force && this.isJumping)
        {
            console.log('[JUMP] SNEAKERS Cant jump - already jumping');

            return;
        }
        if (!force && !this.entity.body.canJump)
        {
            console.log('[JUMP] SNEAKERS Cant jump - body not landed');

            return;
        }
        if (this.entity.roll) this.entity.roll.cancel();
        this.entity.body.resetGroundChangeTolerance();
        this.isJumping = true;
        this.entity.body.y += 1;
        this.entity.body.velocity.y = 0;
        this.jumpHeight = 40;
        this.jumpLength = 160;
        this.startPosY = this.entity.body.y;
        this.startPosZ = this.entity.body.z;
        this.ascending = true;
        this.entity.game.sfx.play('hero-sneakers-jump');
    }

    private jumpUpdate(delta: number): void
    {
        if (this.isJumping && this.ascending)
        {
            const t = -(this.entity.body.z - this.startPosZ) / this.jumpLength * 2;
            const r = t <= 1 ? t : 1;

            if (r >= 1) this.ascending = false;
            const y = this.startPosY + (this.jumpHeight * this.sneakersExpoOut(r));
            const verticalMove = y - this.entity.body.y;

            this.entity.body.velocity.y = delta ? verticalMove / delta : 0;
            if (!this.ascending || this.hitTop) this.entity.body.velocity.y = 0;
        }
        else
        {
            this.entity.body.velocity.y -= this.gravity * delta;
        }

        if (this.entity.body.bottom <= this.entity.body.ground + 0.01 && this.entity.body.velocity.y <= 0)
        {
            this.entity.body.bottom = this.entity.body.ground;
            if (this.isJumping) this.jumpEnd();
        }
    }

    private sneakersExpoOut(t: number): number
    {
        return t === 1.0 ? t : 1.0 - Math.pow(2.0, -13.0 * t);
    }

    private jumpEnd(): void
    {
        this.hitTop = 0;
        this.isJumping = false;
        this.ascending = false;
        this.entity.body.velocity.y = 0;
    }

    public jumpCancel(): void
    {
        this.jumpEnd();
    }

    public onCollisionEnter(collision: Collision): void
    {
        if (collision.flags & Collision.TOP)
        {
            console.log('[PHYSICS] Body collision enter', 'y axis');
            this.entity.body.velocity.y = 0;
            this.hitTop = collision.hit.bottom - 10;
        }
    }

    public freeze(): void
    {
        if (!this.isOn()) return;
        this.frozen = true;
        this.jumpCancel();
        this.hide();
    }

    public unfreeze(): void
    {
        if (!this.isOn()) return;
        this.frozen = false;
        this.show();
        setTimeout(() => this.entity.anim.play('superRun', { loop: true, sudden: true, mixRatio: 0 }), 100);
    }

    private show(): void
    {
        this.hide();

        // Ideally, we will have only one instance of each shoe, and add/remove them from parent
        // but there is something with add/remove child in odie that seems unreliable
        this.left = app.library.getEntity('powerups_superSneakers', { map: 'props-tex' });
        this.right = app.library.getEntity('powerups_superSneakers', { map: 'props-tex' });

        this.left.rx = Math.PI * 0.5;
        this.left.ry = Math.PI * 0.5;
        // this.left.y = -0.5 * 0.01;
        // this.left.z = 0.5 * 0.01;
        // this.left.x = 0.7 * 0.01;
        this.left.scale.set(0.5 * 0.01);

        this.right.rx = -Math.PI * 0.5;
        this.right.ry = Math.PI * 0.5;
        // this.right.y = 0.5 * 0.01;
        // this.right.z = -0.5 * 0.01;
        // this.right.x = 0.7 * 0.01;
        this.right.scale.set(0.5 * 0.01);

        const scene = this.entity.gameScene;

        if (scene)
        {
            const leftParent = EntityTools.findEntity(scene, 'L_Toes_jnt', 15);
            const rightParent = EntityTools.findEntity(scene, 'R_Toes_jnt', 15);

            if (leftParent) leftParent.addChild(this.left);
            if (rightParent) rightParent.addChild(this.right);
        }

        EntityTools.toggleRenderable(this.left, true);
        EntityTools.toggleRenderable(this.right, true);
    }

    private hide(): void
    {
        if (!this.left) return;
        if (this.left.parent) this.left.parent.removeChild(this.left);
        if (this.right.parent) this.right.parent.removeChild(this.right);
        EntityTools.toggleRenderable(this.left, false);
        EntityTools.toggleRenderable(this.right, false);
    }

    pause(): void
    {
        if (!this.isOn()) return;
        this.paused = true;
        this._activated = false;
        this.entity.game.camera.releaseControl();
        this.jumpCancel();
        this.hide();
    }

    resume(): void
    {
        if (!this.isOn() || !this.paused) return;
        this.paused = false;
        this.show();
    }
}
