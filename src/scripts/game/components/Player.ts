import { Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import Collision from '../../utils/Collision';
import Math2 from '../../utils/Math2';
import Vector3 from '../../utils/Vector3';
import Character from '../entities/Character';
import GameComponent from '../GameComponent';
import Body from './Body';

/**
 * Player character component
 */
export default class Player extends GameComponent
{
    public dizzy = 0;
    public jumpLocked = false;
    public rollLocked = false;
    public hoverboardLocked = false;
    public running = false;
    public cameraY = 0;
    public cameraTargetY = 0;
    public cameraRotX = 0;
    public cameraLow = 0;
    public tunnel = false;
    public dead = false;
    public deathCause = '';
    public catchMode = '';
    public rewindStartPoint = new Vector3();
    public rewindEndPoint: Vector3 | null = null;
    public rewinding = false;
    public bumpCount = 0;
    public rewindDuration = 600;
    public entity!: Character;

    constructor(entity: Character, data = {})
    {
        super(entity, data);
        this.entity = entity;

        this.entity.lane.onBumpSideways.add(this as any);
        this.entity.body.onCollisionEnter.add(this as any);
        this.entity.body.onCollisionExit.add(this as any);
        this.entity.body.onTriggerEnter.add(this as any);
        this.entity.body.onTriggerExit.add(this as any);
        this.reset();
    }

    /**
     * Reset player to original (idle) state
     * @param z - Posizion z
     * @param x - Position x
     */
    reset(z = 0, x = 0, lane: number | null = null): void
    {
        this.entity.body.reset();
        this.entity.body.lane = 0;
        this.entity.body.x = x;
        this.entity.body.z = z;
        this.entity.body.lane = lane || 0;
        this.entity.body.bottom = 0;
        this.entity.body.movable = true;
        this.entity.body.ghost = false;
        this.entity.x = this.entity.body.x;
        this.entity.y = this.entity.body.y;
        this.entity.z = this.entity.body.z;

        this.entity.resetModel();

        this.dizzy = 0;
        this.jumpLocked = false;
        this.rollLocked = false;
        this.hoverboardLocked = false;
        this.running = false;
        this.cameraY = 0;
        this.cameraTargetY = 0;
        this.cameraRotX = 0;
        this.cameraLow = 0;
        this.tunnel = false;
        this.dead = false;
        this.deathCause = '';
        this.catchMode = '';
        this.rewindStartPoint = new Vector3();
        this.rewindEndPoint = null;
    }

    run(dizzy?: number): void
    {
        if (!dizzy) dizzy = GameConfig.dizzyDuration * 60;
        if (!this.entity.game.level.onEnterTutorial.contains(this as any))
        {
            this.entity.game.level.onEnterTutorial.add(this as any);
            this.entity.game.level.onExitTutorial.add(this as any);
        }
        this.entity.body.velocity.z = -GameConfig.speed;
        this.entity.body.height = this.entity.regularHeight;
        this.entity.body.bottom = 0;
        this.entity.body.movable = true;
        this.running = true;
        this.dizzy = dizzy;
        this.entity.shadow.turnOn();
        this.entity.lane.turnOn();
        this.entity.jump.turnOn();
        this.entity.roll.turnOn();
        this.entity.hoverboard.enable();

        if (this.entity.hoverboard.isOn())
        {
            this.entity.anim.play(this.entity.hoverboard.animations.run, { loop: true, sudden: true });
        }
        else
        {
            this.entity.anim.play('run2', { loop: true, sudden: true });
        }
        this.entity.game.sfx.stop('special-jetpack');
    }

    stop(): void
    {
        this.running = false;
        this.entity.body.velocity.z = 0;
    }

    render(time: Time): void
    {
        const delta = time.frameTime;

        if (this.rewindEndPoint)
        {
            this.rewinding = true;
            this.entity.body.velocity.reset();
            this.entity.body.ghost = true;
            this.entity.body.x = Math2.lerp(this.entity.body.x, 0, 0.1 * delta);
            this.entity.body.bottom = Math2.lerp(this.entity.body.bottom, 0, 0.3 * delta);
            this.entity.body.z += 4 * delta;
            if (this.entity.body.z >= this.rewindEndPoint.z - 0.1)
            {
                this.entity.lane.reset();
                this.entity.body.z = this.rewindEndPoint.z;
                this.entity.body.velocity.z = 0;
                this.entity.body.ghost = false;
                this.rewinding = false;
                this.reset(this.rewindEndPoint.z);
                this.run();
            }
        }

        if (this.running && !this.dead)
        {
            if (!this.entity.jetpack.isOn())
            {
                const speed = this.entity.game.stats.speed;
                const vz = Math2.lerp(this.entity.body.velocity.z, -speed, delta * 0.1);

                this.entity.body.velocity.z = vz;
            }

            const ground = this.entity.body.ground;
            const bottom = this.entity.body.bottom;

            if (ground >= this.cameraTargetY && this.entity.body.landed)
            {
                this.cameraTargetY = ground;
            }
            else if (bottom < this.cameraTargetY)
            {
                this.cameraTargetY = bottom;
            }
            /*
            // This is making the camera 'jump' with the character on every jump
            // Should we keep that?
            else if (this.entity.jump.isJumping)
            {
                this.cameraTargetY = 35;
            }
            */
        }
        else
        {
            this.entity.body.velocity.z = 0;
        }

        this.cameraY = Math2.lerp(this.cameraY, this.cameraTargetY, delta * 0.2);
        if (this.cameraY > this.entity.body.bottom + 3)
        {
            this.cameraY = this.entity.body.bottom + 3;
        }

        if (this.dizzy)
        {
            this.dizzy -= delta;
            if (this.dizzy <= 0) this.dizzyEnd();
        }

        if (this.bumpCount)
        {
            this.bumpCount -= delta;
            if (this.bumpCount <= 0) this.bumpCount = 0;
        }
    }

    getMode(): 'hoverboard' | 'sneakers' | 'normal'
    {
        if (this.entity.hoverboard.isOn()) return 'hoverboard';
        if (this.entity.sneakers.isOn()) return 'sneakers';

        return 'normal';
    }

    dizzyStart(): void
    {
        this.dizzy = GameConfig.dizzyDuration * 60;
        this.entity.dizzy.turnOn();
        this.entity.game.sfx.play('hero-stumble');
    }

    dizzyEnd(): void
    {
        this.dizzy = 0;
        this.entity.dizzy.turnOff();
    }

    lockHoverboard(v: boolean): void
    {
        this.hoverboardLocked = v;
    }

    goBackToLastCheckPoint(): void
    {
        this.entity.anim.play('run3', { loop: true });
        this.rewindDuration = 600;
        this.rewindStartPoint.copy(this.entity.body.center);
        const chunk = this.entity.game.level.currentChunk;
        const cp = chunk?.getLastCheckpointByPosition(this.entity.body.z);

        console.log('[Player] Back to last checkpoint:', cp);
        if (cp) this.rewindEndPoint = cp.body.center;
    }

    stumble(obstacle: string, type = 'lower', safe = false): void
    {
        // bump count prevents hit again in short time
        if (this.bumpCount && safe) return;
        this.entity.game.camera.shake(3);

        this.processBumpMission(obstacle);

        if (!this.dizzy)
        {
            this.dizzyStart();
            this.bumpCount = 20;
        }
        else
        {
            this.die(type);
        }
    }

    crash(obstacle: string, type = 'train'): void
    {
        this.cameraLow = 0;
        this.tunnel = false;
        this.entity.game.camera.shake(5);
        this.processBumpMission(obstacle);
        this.die(type);
    }

    processBumpMission(obstacle: string): void
    {
        const game = this.entity.game;

        if (obstacle.includes('light'))
        {
            game.missions.addStat(1, 'mission-bump-lights');
        }
        else if (obstacle.includes('train'))
        {
            game.missions.addStat(1, 'mission-bump-trains-onerun');
        }
        else if (obstacle.includes('blocker'))
        {
            game.missions.addStat(1, 'mission-bump-barriers');
        }
    }

    die(cause: string): void
    {
        if (GameConfig.god) return;

        if (this.entity.hoverboard.isOn())
        {
            // Can't die - hoverboard is on
            this.dizzyEnd();
            this.entity.hoverboard.explode();
            this.entity.game.level.removeObstacles();
            setTimeout(() =>
            {
                this.entity.hoverboard.explode();
                this.entity.hoverboard.turnOff();
                this.entity.game.exitTunnel();
                this.entity.game.sfx.play('hero-hoverboard-crash');
            }, 1);

            return;
        }

        this.entity.body.z += 5;

        console.log('[Player]', 'DIE', cause);
        this.dead = true;
        this.deathCause = cause;
        this.dizzyEnd();
        this.entity.jetpack.turnOff();
        this.entity.pogo.turnOff();
        this.entity.shadow.turnOff();
        this.entity.lane.turnOff();
        this.entity.jump.turnOff();
        this.entity.roll.turnOff();
        this.entity.hoverboard.disable();
        this.entity.game.sfx.stop('special-jetpack');
        this.entity.game.sfx.play('hero-death');
        this.entity.freezePowerUps();

        if (cause === 'train')
        {
            setTimeout(() =>
            {
                this.entity.game.sfx.play('hero-death-hitcam');
            }, 600);
        }

        if (this.entity.game.level.isTutorial())
        {
            setTimeout(() =>
            {
                this.goBackToLastCheckPoint();
            }, 1000);
        }
        else
        {
            this.entity.game.gameover();
        }
    }

    onBumpSideways(obstacle: string): void
    {
        this.stumble(obstacle, 'lower');
    }

    onCollisionEnter(collision: Collision): void
    {
        const obstacleName = collision.pas.entity.constructor.name.toLowerCase();

        if (collision.flags & Collision.FRONT)
        {
            this.entity.body.velocity.z = 0;

            // soft collision
            if (this.entity.lane.changing || collision.hit.height < 1)
            {
                this.stumble(obstacleName, 'bounce', true);
            }
            else if (collision.pas.movable)
            {
                this.crash(obstacleName, 'train');
            }
            else if (collision.hit.height > 6)
            {
                this.crash(obstacleName, 'bounce');
            }
            else if (collision.hit.y > this.entity.body.y)
            {
                this.crash(obstacleName, 'upper');
            }
            else
            {
                this.crash(obstacleName, 'lower');
            }
        }
        else if (collision.flags & Collision.LEFT || collision.flags & Collision.RIGHT)
        {
            // this.bump('lower', collision.flags & Collision.LEFT ? -1 : 1);
            this.entity.lane.bump(obstacleName, -this.entity.lane.absStep);
        }
        else if (collision.flags & Collision.SLOPE)
        {
            this.stumble(obstacleName, 'bounce', true);
            this.entity.body.velocity.z *= 0.5;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCollisionExit(collision: Collision): void
    {
        // If needed...
    }

    onTriggerEnter(body: Body): void
    {
        if (body.entity.lowCamera && !this.entity.jetpack.isOn())
        {
            this.cameraLow = -15;
            this.tunnel = true;
            this.entity.game.enterTunnel();
        }
        else if (body.entity.tutorialTrigger)
        {
            console.log('[Player]', 'tutorial trigger enter', body.entity, (body.entity as any).type);
            this.entity.game.tutorial.enterTrigger((body.entity as any).type);
        }
        else if (body.entity.name === 'BlockerDodgeDetector')
        {
            this.entity.game.missions.addStat(1, 'mission-dodge');
        }
    }

    onTriggerExit(body: Body): void
    {
        if (body.entity.lowCamera)
        {
            this.cameraLow = 0;
            this.tunnel = false;
            this.entity.game.exitTunnel();
        }
        if (body.entity.tutorialTrigger)
        {
            console.log('[Player]', 'tutorial trigger exit', (body.entity as any).type);
            this.entity.game.tutorial.exitTrigger((body.entity as any).type);
        }
    }

    onEnterTutorial(): void
    {
        console.log('[Player]', 'enter tutorial');
    }

    onExitTutorial(): void
    {
        console.log('[Player]', 'exit tutorial');
    }

    public atoreActivePowerUps(): {turnOn:() => void}[]
    {
        return [this.entity.magnet];
    }
}
