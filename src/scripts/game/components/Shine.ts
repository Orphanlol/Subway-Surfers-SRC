import { Entity3D, View3DComponent } from '@goodboydigital/odie';

import EntityTools from '../../utils/EntityTools';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Shine extends GameComponent
{
    public view: Entity3D;
    public minDist = 400;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.view = EntityTools.plane(13, 13, 0.2, 'halo', 1);
        const view3d = this.view.getComponent(View3DComponent as any) as View3DComponent;

        view3d.state.blend = true;
        // view3d.state.depthTest = true;
        view3d.orderBias = 999;
        this.view.z = -1.2;
        entity.addChild(this.view);
        this.view.scale.set(2);
    }

    update(): void
    {
        const dist = this.entity.game.hero.body.z - this.entity.body.z;
        const scale = 1 - (dist / this.minDist);

        if (scale < 0)
        {
            this.view.active = false;

            return;
        }

        this.view.scale.set(scale);
        this.view.active = scale > 0.5;
    }
}
