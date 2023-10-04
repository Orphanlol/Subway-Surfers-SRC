import * as PIXI from 'pixi.js';

import { AwardTierNames } from '../../../awards/AwardData';
import { Badge } from '../../Badge';

export class AwardUITrophies extends PIXI.Container
{
    public base: PIXI.Graphics;
    public icon: PIXI.Sprite;
    public bigSprayCan: PIXI.Sprite;
    public trophies: PIXI.Sprite[];
    public badge?: Badge;
    private _tier = 0;

    constructor(width: number, height: number)
    {
        super();
        this.base = new PIXI.Graphics();
        this.base.beginFill(0x66737f);
        this.base.drawRoundedRect(0, 0, width, height, 10);
        this.addChild(this.base);

        this.icon = new PIXI.Sprite(PIXI.Texture.from('base-item-large.png'));
        this.icon.anchor.set(0.5);
        this.addChild(this.icon);
        this.icon.x = width / 2;
        this.icon.y = (this.icon.height / 2) - 8;

        this.bigSprayCan = new PIXI.Sprite(PIXI.Texture.from('spraycan-big-bronze.png'));
        this.bigSprayCan.anchor.set(0.5);
        this.icon.addChild(this.bigSprayCan);

        const stars = new PIXI.Sprite(PIXI.Texture.from('stars.png'));

        stars.anchor.set(0.5);
        this.icon.addChild(stars);

        this.trophies = [];

        for (let i = 0; i < 4; i++)
        {
            const trophy = new PIXI.Sprite(PIXI.Texture.from('spraycan-empty.png'));

            trophy.anchor.set(0.5);
            trophy.scale.set(0.8);
            this.addChild(trophy);
            this.trophies.push(trophy);
            trophy.x = (25 * i) + 18;
            trophy.y = this.base.height - (trophy.height / 2) - 5;
        }

        this.tier = 0;
    }

    public get tier(): number
    {
        return this._tier;
    }

    public set tier(v: number)
    {
        this._tier = v;
        this.refresh();
    }

    private refresh(): void
    {
        const currentTierName = AwardTierNames[this._tier] || 'diamond';

        this.bigSprayCan.texture = PIXI.Texture.from(`spraycan-big-${currentTierName}.png`);

        for (let i = 0; i < this.trophies.length; i++)
        {
            const trophy = this.trophies[i];

            if (i === this._tier)
            {
                trophy.texture = PIXI.Texture.from('spraycan-outline.png');
            }
            else if (i > this._tier)
            {
                trophy.texture = PIXI.Texture.from('spraycan-empty.png');
            }
            else
            {
                trophy.texture = PIXI.Texture.from(`spraycan-${AwardTierNames[i]}.png`);
            }
        }
    }

    public showBadge(): void
    {
        if (!this.badge) this.badge = new Badge();
        this.icon.addChild(this.badge);
        this.badge.scale.set(0.75);
        this.badge.x = -40;
        this.badge.y = -40;
        this.badge.visible = true;
    }

    public hideBadge(): void
    {
        if (!this.badge) return;
        this.badge.visible = false;
    }
}
