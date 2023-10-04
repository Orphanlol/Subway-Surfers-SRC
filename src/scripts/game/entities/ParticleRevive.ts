import EntityTools from '../../utils/EntityTools';
import Random from '../../utils/Random';
import GameEntity from '../GameEntity';

export default class ParticleRevive extends GameEntity
{
    constructor()
    {
        super();
        this.levelEntity = false;
        this.view = EntityTools.particle(16, 16, 1, 'spray-splash');
        this.addChild(this.view);

        if (this.view.view3d)
        {
            this.view.view3d.state.blend = true;
            this.view.view3d.state.depthTest = true;
            this.view.view3d.orderBias = 999;
        }

        const color = Random.pick(0x1579ce, 0x41bff0, 0x2998dc);

        EntityTools.tint(this.view, color);
    }
}
