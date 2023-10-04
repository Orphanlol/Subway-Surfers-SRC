import {  i18n, I18nLabel } from '@goodboydigital/astro';
import { Container,  Sprite, Text } from 'pixi.js';

import { ConsumableBoostIds } from '../../data/boosts/BoostData';
import { app } from '../../SubwaySurfersApp';
import Poki from '../../utils/Poki';
import { Button } from '../buttons/Button';

const itemsMap: {[key: string]: {amount:number; id?:ConsumableBoostIds;}} = {

    hoverboards: { amount: 3, id: 'hoverboard' },
    scoreBooster: { amount: 1 },
    headstart: { amount: 1 },
};

export class FreeStuffSection extends Container
{
    constructor()
    {
        super();

        const title = this.addChild(new I18nLabel('get-free-stuff', {
            align: 'left',
            fill: 0x004a80,
            fontSize: 70,
            fontFamily: 'Titan One',
            dropShadow: false,
            anchorX: 0.5,
        }));

        title.y = 15;

        let y = (title.height / 2) + 15;

        for (const key in itemsMap)
        {
            const boost = itemsMap[key];
            const id  = boost.id || key as ConsumableBoostIds;

            const module = this.addChild(new Button({
                base: Sprite.from('freestuff-module-panel.png'),
                onTap: async () =>
                {
                    const success = await Poki.SDK.rewardedBreak({ type: 'freeStuffShop', prize: id });

                    if (success)
                    {
                        app.user.boosts.consumables[id] += boost.amount;
                        app.user.save();
                    }
                } },
            ));

            const { width, height } = module.base as Container;
            const iconBg = module.addChild(Sprite.from('base-item.png'));
            const boostIcon = iconBg.addChild(Sprite.from(`icon-item-${id.toLowerCase()}.png`));

            iconBg.anchor.set(0.5);
            boostIcon.anchor.set(0.5);
            iconBg.scale.set(1.15);
            boostIcon.scale.set(0.9);
            iconBg.x = (iconBg.width / 2) + 20;
            iconBg.y = height / 2;

            const opts = {
                align: 'left',
                fill: 0xeecc32,
                fontSize: 42,
                fontFamily: 'Lilita One',
                dropShadow: true,
                dropShadowDistance: 2 };
            const h1 = module.addChild(new Text(i18n.translate(key), opts));

            h1.x = iconBg.x + (iconBg.width / 2) + 10;
            h1.y = 15;
            opts.fill = 0xFFFFFF;
            opts.fontSize = 25;
            const h2 = module.addChild(new Text(`${boost.amount} ${i18n.translate(key)}`, opts));

            h2.x = h1.x;
            h2.y = h1.height + 15;

            module.x = -(width / 2);
            module.y = y + (height / 2);
            y = module.y + (height / 2) + 10;
        }
    }
}
