import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import Graph from './Graph';

export default class PressToPlay extends PIXI.Container
{
    public bg: PIXI.Container;
    public label: I18nLabel;
    private count = 0;

    constructor()
    {
        super();

        this.bg = Graph.rect({ w: 500, h: 70, round: 30, color: 0x019cff });

        this.label = new I18nLabel('tap_to_play_desktop', {
            fontFamily: 'Titan One',
            align: 'center',
            fill: 0xFFFFFF,
            fontSize: 40,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.addChild(this.label);
    }

    updateTransform(): void
    {
        super.updateTransform();
        this.label.rotation = Math.cos(this.count * 0.1) * 0.1;
        this.count += 1;
    }
}
