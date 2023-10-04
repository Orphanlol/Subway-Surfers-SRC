import { Container, Sprite } from 'pixi.js';

import Graph from '../Graph';

// TODO implement slots colouring
export class BoostCounter extends Container
{
    private counter: Sprite;
    private slot = 0;
    private maxSlot = 6;

    constructor(slot = 0)
    {
        super();
        this.counter = Sprite.from('upgrades-slot.png');
        Graph.roundRectBorder({
            w: 300,
            h: 30,
            round: 20,
            color: 0xAAAAAA,
            alpha: 1,
            borderWidth: 3,
            borderColor: 0x999999,

        });
        // 00aaa8
        // ffcc00
        this.addChild(this.counter);

        for (let index = 0; index < slot; index++) this.setNextSlot();
    }

    setNextSlot():void
    {
        if (this.slot === this.maxSlot) return;

        const slot = Graph.rect({ w: 28, h: 15, round: 5, color: 0xffcc00, x: 27 + (41.5 * this.slot), y: this.height / 2 });

        this.addChild(slot);
        this.slot++;
    }

    setLevel(value: number):void
    {
        for (let index = this.slot; index < value; index++) this.setNextSlot();
    }
}
