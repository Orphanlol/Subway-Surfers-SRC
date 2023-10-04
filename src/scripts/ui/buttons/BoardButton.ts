import * as PIXI from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { Button, ButtonOptions } from './Button';

export class BoardButton extends Button
{
    private numBoards: PIXI.Text;

    constructor(opts: Partial<ButtonOptions> = {})
    {
        const icon = 'icon-item-hoverboard.png';
        const base = PIXI.Sprite.from('base-item-large.png');

        base.anchor.set(0.5);
        base.width = 100;
        base.height = 100;

        super({
            w: 100,
            h: 100,
            icon,
            base,
            ...opts,
        });

        this.numBoards = new PIXI.Text('9', {
            align: 'right',
            fontFamily: 'Lilita One',
            fontSize: 22,
            dropShadow: true,
            dropShadowDistance: 2,
            dropShadowColor: 0xFFFFFF,
        });

        this.numBoards.anchor.set(1.0, 1.0);
        this.numBoards.x = 33;
        this.numBoards.y = 38;

        this.addChild(this.numBoards);

        app.user.gameSettings.onChange.add(() => this.refresh());
        this.refresh();
    }

    public refresh(): void
    {
        this.numBoards.text = String(app.user.boosts.consumables.hoverboard);
    }
}
