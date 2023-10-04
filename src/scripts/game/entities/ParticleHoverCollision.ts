import EntityTools from '../../utils/EntityTools';
import Random from '../../utils/Random';
import GameEntity from '../GameEntity';

export default class ParticleHoverCollision extends GameEntity
{
    constructor()
    {
        super();
        this.levelEntity = false;
        this.view = EntityTools.particle(16, 16, 1, 'spray-splash');
        this.addChild(this.view);
        const color = Random.pick(0xf80f01, 0x9cfa01, 0xb7b802);

        EntityTools.tint(this.view, color);
    }
}
