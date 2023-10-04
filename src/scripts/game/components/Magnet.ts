import { Entity3D } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';
import Character from '../entities/Character';
import GameComponent from '../GameComponent';

export default class Magnet extends GameComponent
{
    public count = 0;
    public duration = 10;
    public view!: Entity3D;
    public timer?: any;
    public frozen = false;

    /**
     * Calculate the total duration for this powerup, in seconds
     * @returns The total duration in seconds
     */
    public calculateDuration(): number
    {
        const boostPoints = Math.abs(app.user.boosts.permanents.magnet);
        const boostDuration = 5 * boostPoints;

        return 10 + boostDuration;
    }

    public update(): void
    {
        if (!this.count || this.frozen) return;
        this.count -= app.game.deltaSecs;
        this.entity.game.hud.updateItemTimer('magnet', this.ratio);
        if (this.count <= 0) this.turnOff(true);
    }

    public turnOn(): void
    {
        this.frozen = false;
        this.addMagnetModel();
        this.duration = this.calculateDuration();
        this.entity.game.hud.addItemTimer('magnet');
        this.count = this.duration;
        this.timer = this.entity.game.sfx.play('special-magnet', { loops: true });
    }

    public turnOff(playTurnOffSound = false): void
    {
        if (!this.count) return;
        this.frozen = false;
        this.removeMagnetModel();
        this.entity.game.hud.removeItemTimer('magnet');
        this.count = 0;
        if (this.view && this.view.parent) this.view.parent.removeChild(this.view);
        this.entity.game.sfx.stop('special-magnet');
        if (playTurnOffSound) app.sound.play('pickup-powerdown');
    }

    public isOn(): boolean
    {
        return !!this.count;
    }

    public get ratio(): number
    {
        return this.count / this.duration;
    }

    public freeze(): void
    {
        if (!this.isOn()) return;
        this.frozen = true;
        this.removeMagnetModel();
    }

    public unfreeze(): void
    {
        if (!this.isOn()) return;
        this.frozen = false;
        this.addMagnetModel();
    }

    private addMagnetModel(): void
    {
        if (!this.view)
        {
            this.view = app.library.getEntity('powerups_coinMagnet', { map: 'props-tex' });
            this.view.rz = Math.PI * 0.5;
            this.view.scale.set(0.4 * 0.01);
            this.view.x = -2 * 0.01;

            // Weirdly, this model comes with an extra small triangle far from the main model
            // that can be seen flying around the screen while magnet is on
            this.view.removeChild(this.view.container.children[1]);
        }

        const scene = (this.entity as Character).gameScene;

        if (scene)
        {
            const parent = EntityTools.findEntity(scene, 'R_Hand_jnt', 10);

            if (parent) parent.addChild(this.view);
        }
    }

    private removeMagnetModel(): void
    {
        if (!this.view) return;
        if (this.view.parent) this.view.parent.removeChild(this.view);
    }
}
