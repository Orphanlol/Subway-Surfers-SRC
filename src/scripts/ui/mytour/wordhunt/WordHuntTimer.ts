import { Back, TweenLite } from 'gsap';
import { Container, Graphics, Sprite, Text } from 'pixi.js';

import Graph from '../../Graph';

export class WordHuntTimer extends Container
{
    public base: Container;
    private border: Sprite;
    private fill: Graphics;
    private timerLabel: Text;
    private arc: number;

    constructor()
    {
        super();

        this.base = this.addChild(Graph.roundRectBorder({
            w: 135, h: 27,
            borderColor: 0x6fb500,
            color: 0x6fb500,
        }));
        this.border = this.base.addChild(Sprite.from('timer-empty-icon.png'));
        this.border.scale.set(0.9);
        this.border.anchor.set(0.5);
        this.border.x = (-this.base.width / 2) + (this.border.width / 2) + 7;
        this.fill = this.border.addChild(new Graphics());
        this.fill.y = 3.5;

        this.timerLabel = this.base.addChild(new Text('', {
            fill: 0xFFFFFF,
            fontSize: 28,
            fontFamily: 'Lilita One',
        }));
        this.timerLabel.anchor.y = 0.5;
        this.timerLabel.x = this.border.x + (this.border.width / 2) + 5;

        this.arc = 0;
        this.tween();
    }

    tween(): void
    {
        this.updateTime();
        if (this.arc >= Math.PI * 2)
        {
            this.arc = 0;
        }
        TweenLite.to(this, 1, { arc: this.arc + (Math.PI / 2),
            ease: Back.easeOut,
            onUpdate: () =>
            {
                this.fill.clear().beginFill(0xFFFFFF);
                this.fill.arc(0, 0, 9, -Math.PI / 2, this.arc - (Math.PI / 2))
                    .lineTo(0, 0)
                    .endFill();
            },
            onComplete: () =>
            {
                this.tween();
            },
        });
    }

    updateTransform(): void
    {
        super.updateTransform();
        this.arc += (Math.PI / 30);
    }

    updateTime(): void
    {
        const d = new Date();
        const hours = 23 - d.getUTCHours();
        const minutes = 59 - d.getUTCMinutes();

        this.timerLabel.text = `${hours}h ${minutes}m`;
    }
}
