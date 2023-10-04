import { i18n } from '@goodboydigital/astro';
import { Entity3D } from '@goodboydigital/odie';
import { Text } from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';
import GameEntity from '../GameEntity';

export default class Logo extends GameEntity
{
    public model: Entity3D;
    public score!: Entity3D;
    public scoreContainer!: Entity3D;
    public scoreText!: Text;

    constructor()
    {
        super();
        this.levelEntity = false;
        this.model = app.library.getEntity('train_start', { map: 'train-start', opacity: 0.999 });
        this.model.ry = Math.PI;
        this.addChild(this.model);

        this.scoreText = new Text('SCORE', {
            fontFamily: 'Stencilia',
            fontSize: 60,
            fill: 0xFFFFFF,
            lineHeight: 50,
        });

        this.scoreContainer = new Entity3D();
        this.scoreContainer.ry = Math.PI * 0.5;
        this.scoreContainer.x = 9.5;
        this.scoreContainer.y = 6.3;
        this.scoreContainer.z = -4;
        this.addChild(this.scoreContainer);

        this.score = EntityTools.plane(2, 2, 0.99, this.scoreText.texture);
        this.score.rx = 0.25;
        this.scoreContainer.addChild(this.score);
    }

    public updateScore(): void
    {
        const highscore = app.user.gameSettings.highscore;

        this.scoreText.text = highscore ? `${i18n.translate('score')}\n${highscore}` : ' ';
        this.scoreText.updateText(true);
        this.score.scale.x = this.scoreText.width * 0.01;
        this.score.scale.y = -this.scoreText.height * 0.01;
    }
}
