import { TimelineMax } from 'gsap';
import { Container, Sprite, Texture } from 'pixi.js';

import { MysteryBoxType } from '../data/mysterybox/MysteryBoxData';
import { CurrencyTypes } from '../shop/Shop';
import { app } from '../SubwaySurfersApp';
import Poki from '../utils/Poki';
import { Button } from './buttons/Button';

const prizes = [
    { type: 'mystery-box', icon: 'icon-item-mystery-box.png' },
    { amount: 1, type: 'keys', icon: 'icon-key.png' },
    { type: 'mini-mystery-box', icon: 'icon-item-mini-mystery-box.png' },
    { amount: 1000, type: 'coins', icon: 'coin-pouch-icon.png' },
];

export class FreeStuffButton extends Button
{
    private tvIcon: Sprite;
    private tvShine: Sprite;
    private arrowIcon: Sprite;
    private itemIcon: Sprite;
    private itemShine: Sprite;
    private timeline: TimelineMax;
    private prizeNumber = 0;

    constructor()
    {
        super({
            w: 210, h: 80,
            color: 0x51a42a,
        });

        this.tvIcon = this.addChild(Sprite.from('icon-tv.png'));
        this.tvIcon.anchor.set(0.5);
        this.tvIcon.scale.set(0.8);
        this.tvIcon.x = -60;
        this.tvShine = this.tvIcon.addChild(Sprite.from('shine-effect.png'));
        const tvShineMask = this.tvIcon.addChild(Sprite.from('icon-tv.png'));

        tvShineMask.anchor.set(0.5);
        this.tvShine.anchor.set(0.5);
        this.tvShine.mask = tvShineMask;

        this.arrowIcon = this.addChild(Sprite.from('icon-stay-low.png'));
        this.arrowIcon.anchor.set(0.5);
        this.arrowIcon.rotation = -Math.PI / 2;

        this.itemIcon = this.addChild(Sprite.from('coin-pouch-icon.png'));
        this.itemIcon.anchor.set(0.5);
        this.itemIcon.scale.set(68 / this.itemIcon.height);

        this.itemIcon.x = 60;

        this.itemShine = this.itemIcon.addChild(Sprite.from('shine-effect.png'));
        const itemShineMask = this.itemIcon.addChild(Sprite.from('coin-pouch-icon.png'));

        itemShineMask.anchor.set(0.5);
        this.itemShine.anchor.set(0.5);
        this.itemShine.mask = itemShineMask;

        this.timeline = new TimelineMax({ repeat: -1 });

        this.onTap = async () =>
        {
            const prize = prizes[this.prizeNumber];

            const success = await Poki.SDK.rewardedBreak({ type: 'freeStuff', prize: prize.type });

            if (success)
            {
                if (prize.type.includes('mystery-box'))
                {
                    app.nav.toPrizeScreen(prize.type as MysteryBoxType);
                }
                else
                {
                    app.prizeScreen.open({ prizes: [prize] });
                    app.user[prize.type as CurrencyTypes] += prize.amount || 0;
                }
                this.prizeNumber++;
                this.prizeNumber %= prizes.length;
                app.user.gameSettings.rewardedBreakPrize = this.prizeNumber;
                this.setPrize();
                app.user.save();
            }
        };
        this.prizeNumber = app.user.gameSettings.rewardedBreakPrize;
        this.setPrize();
    }

    setPrize(): void
    {
        this.timeline.time(0);
        this.timeline.kill();
        this.timeline.clear();
        const icon = prizes[this.prizeNumber].icon;
        const texture = Texture.from(icon);

        this.itemIcon.scale.set(1);
        this.itemIcon.texture = texture;

        this.itemIcon.removeChild(this.itemShine.mask as Container);

        const itemShineMask = this.itemIcon.addChild(Sprite.from(texture));

        itemShineMask.anchor.set(0.5);
        this.itemShine.mask = itemShineMask;

        this.itemIcon.scale.set(68 / this.itemIcon.height);

        const { x, y } = this.itemIcon.scale;

        this.timeline.delay(0.5);
        this.timeline.to(this.tvIcon.scale, 0.3, { x: 1, y: 1 })
            .to(this.tvIcon.scale, 0.3, { x: 0.8, y: 0.8 })
            .fromTo(this.tvShine, 1, { x: -100, y: 100 }, { x: 100, y: -100 }, 0)
            .to(this.arrowIcon.scale, 0.3, { x: 1.4, y: 1.4 }, 0.3)
            .to(this.arrowIcon.scale, 0.3, { x: 1, y: 1 }, 0.61);

        this.timeline.to(this.itemIcon.scale, 0.3, { x: x + 0.2, y: y + 0.2 }, 0.6);
        this.timeline.to(this.itemIcon.scale, 0.3, { x, y }, 0.91);
        this.timeline.fromTo(this.itemShine, 1, { x: -100, y: 100 }, { x: 100, y: -100 }, 0.6);
    }
}
