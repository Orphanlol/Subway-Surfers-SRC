import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import GameEntity from '../GameEntity';

export default class Skyline extends GameEntity
{
    constructor()
    {
        super();
        this.levelEntity = false;
        this.rotation.y = Math.PI;
        this.y = 100;
        this.x = 100;

        if (!GameConfig.environment) return;

        const name04 = app.library.whichEntity('sl_monument_4', 'sl_monument_04') as string;
        const model4 = app.library.getEntity(name04, { color: 0x90d1ff, fog: true });

        this.addChild(model4);
        model4.x = 100;
        model4.y = -50;
        model4.z = 0;

        const name02 = app.library.whichEntity('sl_monument_2', 'sl_monument_02') as string;
        const model2 = app.library.getEntity(name02, { color: 0x63b1ff, fog: true });

        this.addChild(model2);
        model2.x = 0;
        model2.z = -30;

        const name03 = app.library.whichEntity('sl_monument_3', 'sl_monument_03') as string;
        const model3 = app.library.getEntity(name03, { color: 0x90d1ff, fog: true });

        this.addChild(model3);
        model2.x = 0;
        model2.y = -200;
        model3.z = -60;

        const name01 = app.library.whichEntity('sl_monument_1', 'sl_monument_01') as string;
        const model1 = app.library.getEntity(name01, { color: 0x63b1ff, fog: true });

        this.addChild(model1);
        model2.x = 100;
        model1.z = -90;
    }
}
