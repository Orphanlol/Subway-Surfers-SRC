import { Entity3D } from '@goodboydigital/odie';

import EntityTools from '../../utils/EntityTools';
import Math2 from '../../utils/Math2';
import GameComponent from '../GameComponent';

export default class Shadow extends GameComponent
{
    public view?: Entity3D;

    createView(): void
    {
        if (this.view) return;
        this.view = EntityTools.plane(8, 8, 0.5, 'shadow');
        this.view.name = 'shadow';

        this.view.rx = Math2.PI_HALF;
        this.view.z = 1;
        this.entity.addChild(this.view);
    }

    update(): void
    {
        if (!this.view || !this.view.active) return;
        const ground = this.entity.body ? this.entity.body.ground : 0;

        this.view.y = -this.entity.y + ground + 1;
    }

    turnOn(): void
    {
        this.createView();
        if (this.view) this.view.active = true;
    }

    turnOff(): void
    {
        if (this.view) this.view.active = false;
    }

    isOn(): boolean
    {
        return !!(this.view && this.view.active);
    }
}
