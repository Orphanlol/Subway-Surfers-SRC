import { Container, Sprite, Text } from 'pixi.js';

import Game from '../Game';

export class HUDMultiplierLabel extends Container
{
    public game: Game;
    public base: Sprite;
    public label: Text;
    public labelOverlay: Text;

    constructor(game: Game)
    {
        super();
        this.game = game;
        const base = Sprite.from('base-short.png');

        base.anchor.set(0.5);
        base.alpha = 0.5;
        this.base = base;
        this.addChild(base);

        const label = new Text('0', {
            align: 'center',
            fill: 0xfedb04,
            fontSize: 50,
            fontFamily: 'Lilita One',
        });

        label.anchor.set(0.5);
        this.addChild(label);
        this.label = label;

        const labelOverlay = new Text('0', {
            align: 'center',
            fill: 0x777777,
            fontSize: 50,
            fontFamily: 'Lilita One',
        });

        labelOverlay.anchor.set(0.5);
        this.addChild(labelOverlay);
        this.labelOverlay = labelOverlay;
    }

    get text(): string
    {
        return this.label.text;
    }

    set text(v: string)
    {
        if (this.label.text === v) return;
        this.label.text = v;
        this.labelOverlay.text = v;
    }

    update(): void
    {
        const animate = this.game.hero.multiplier.isOn();

        if (animate)
        {
            const gameTime = (this.game.time as any)._lastTime;

            this.labelOverlay.alpha = 0.5 + (Math.sin(gameTime * 0.01) * 0.4);
        }
        else
        {
            this.labelOverlay.alpha = 0;
        }
    }
}
