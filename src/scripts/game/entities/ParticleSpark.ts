import { app } from '../../SubwaySurfersApp';
import GameEntity from '../GameEntity';

export default class ParticleSpark extends GameEntity
{
    constructor()
    {
        super();
        this.levelEntity = false;

        this.view = app.library.getEntity('grindSpark', { map: 'effects-tex', opacity: 0.8, blendMode: 1 });

        this.view.ry = Math.PI * 0.5;
        if (this.view.view3d)
        {
            this.view.view3d.state.blend = true;
            this.view.view3d.state.depthTest = true;
            this.view.view3d.orderBias = 999;
        }
        this.addChild(this.view);
        this.view.scale.set(0.3);
    }
}
