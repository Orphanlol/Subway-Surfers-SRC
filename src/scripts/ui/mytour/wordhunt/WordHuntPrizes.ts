import { Container, Graphics, Sprite, Text } from 'pixi.js';

import { app } from '../../../SubwaySurfersApp';
import { onWordHuntCompleted, prizeIndex, prizes } from '../../../utils/WordHuntManager';
import { BgStripes } from '../../BgStripes';
import { CoinsTag } from '../../CoinsTag';
import Graph from '../../Graph';
import { MysteryBoxThumb } from '../../mysterybox/MysteryBoxThumb';
import { CoinPouches } from './CoinPouches';

const labelOptions = {
    label: 'Mystery',
    align: 'center',
    fontFamily: 'Lilita One',
    fontSize: 24,
    fill: 0xFFFFFF,
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowColor: 0x000000,
    x: 0,
    y: 50,
    anchor: { x: 0.5, y: 0 },
    index: -1,
};

export class WordHuntPrizes extends Container
{
    normalPrizeBase: Container;
    superPrizeBase: Container;
    todayHighlight: Container;
    dayLabels: Text[] = [];
    checkMarks: Sprite[] = [];
    mysteryBoxThumb: MysteryBoxThumb;

    constructor()
    {
        super();

        const today = prizeIndex;

        this.normalPrizeBase = this.addChild(Graph.roundRectBorder({
            round: 20,
            w: 564, h: 142,
            borderColor: -1,
            color: 0x1c94d4,
        }));
        this.normalPrizeBase.y = 20;

        for (let i = 0; i < 3; i++)
        {
            const dashed = this.makeDashedLine();

            dashed.rotation = Math.PI / 2;
            const quarterWidth = this.normalPrizeBase.width / 4;

            dashed.x = -quarterWidth + (quarterWidth * i);
            dashed.y = -dashed.width / 2;
            this.normalPrizeBase.addChild(dashed);
        }

        this.superPrizeBase = this.addChild(new BgStripes({
            radius: 20,
            w: 564, h: 202,
            color: 0xf9ca3c,
            glow: 0xFFFFFF,
            glowScale: { x: 2.5, y: 2.5 },
        }));
        this.superPrizeBase.y = (this.normalPrizeBase.height / 2) + (202 / 2) + 40;

        this.todayHighlight = this.addChild(Graph.roundRectBorder({
            round: 20,
            w: 141, h: 192,
            borderColor: -1,
            color: 0x3673a8,
        }));
        this.todayHighlight.x = (this.todayHighlight.width / 2) - (this.normalPrizeBase.width / 2)
        + ((this.normalPrizeBase.width / 4) * today);
        this.todayHighlight.y = -5;
        this.todayHighlight.visible = today < 4;

        const dashed = this.makeDashedLine();

        dashed.x = -dashed.width / 2;
        dashed.y = -47;

        this.todayHighlight.addChild(dashed);

        for (let i = 0; i < 5; i++)
        {
            // TODO translate this day label
            const isToday = today === i;
            const text = isToday ? 'Today' : `Day ${i + 1}`;
            const fill = isToday ? 0xFFFFFF : 0x07294a;
            const dayLabel = this.addChild(new Text(text, {
                align: 'center',
                fontFamily: 'Lilita One',
                fontSize: 32,
                fill,
                dropShadow: isToday,
                dropShadowDistance: 3,
                dropShadowColor: 0x000000,
            }));

            dayLabel.anchor.set(0.5);
            dayLabel.x = 70.5 - (this.normalPrizeBase.width / 2) + (141 * i);
            dayLabel.y = (dayLabel.height / 2) - (this.todayHighlight.height / 2);

            this.dayLabels.push(dayLabel);
        }

        const d5 = this.dayLabels[4];

        d5.style = {
            align: 'center',
            fontFamily: 'Lilita One',
            fontSize: 32,
            fill: 0x7d1b05,
            dropShadow: true,
            dropShadowDistance: 2,
            dropShadowColor: 0xf9d98b,
        };
        if (today < 4)d5.text += '+';
        d5.position.set(this.dayLabels[0].x, this.superPrizeBase.y - (202 / 2) + (d5.height * 0.8));

        let prize = this.addChild(Sprite.from('mystery-box-icon.png'));

        prize.scale.set(0.6);
        prize.anchor.x = 0.5;
        this.setPrizeElementX(prize, 0);
        prize.y = -35;

        this.makeCheck(prize.x);

        prize = this.addChild(Sprite.from('mystery-box-icon.png'));
        prize.scale.set(0.6);
        prize.anchor.x = 0.5;
        this.setPrizeElementX(prize, 1);
        prize.y = -35;

        this.makeCheck(prize.x);

        (prize as CoinPouches) = this.addChild(new CoinPouches(3));
        prize.scale.set(0.65);
        this.setPrizeElementX(prize, 2);
        prize.y = -20;

        this.makeCheck(prize.x);

        (prize as CoinPouches) = this.addChild(new CoinPouches(6));
        prize.scale.set(0.65);
        this.setPrizeElementX(prize, 3);
        prize.y = -20;

        this.makeCheck(prize.x);

        this.mysteryBoxThumb = this.addChild(new MysteryBoxThumb('mysteryBox_super'));

        this.mysteryBoxThumb.y = 280;

        this.makeCheck(this.mysteryBoxThumb.x + 20, 200);

        this.makePrizeTag({ index: 0 });
        this.makePrizeTag({ index: 1 });
        this.makePrizeTag({ label: 'Super Mystery Box', y: 265, fontSize: 32, fill: 0x7d1b05, dropShadowColor: 0xf9d98b });
        this.makeCoinsTag(2);
        this.makeCoinsTag(3);
        this.makePrizeTag({ label: 'Super Mystery Box', y: 265, fontSize: 32, fill: 0x7d1b05, dropShadowColor: 0xf9d98b });

        app.user.completedHunts.forEach((h, i) => { this.checkMarks[i].visible = true; });
        onWordHuntCompleted.add(() =>
        {
            this.checkMarks[app.user.completedHunts.length - 1].visible = true;
        });
    }

    show(): void
    {
        this.mysteryBoxThumb.tween(0);
    }

    makePrizeTag(opts: Partial<typeof labelOptions>):Sprite
    {
        const options = { ...labelOptions, ...opts };
        const label = this.addChild(new Text(options.label, options));

        label.anchor.set(options.anchor.x, options.anchor.y);
        label.y = options.y;
        if (options.index !== -1) this.setPrizeElementX(label, options.index);

        return label;
    }

    makeCheck(x: number, y = -10):Sprite
    {
        const check = this.addChild(Sprite.from('checkmark-icon.png'));

        this.checkMarks.push(check);
        check.anchor.x = 0.2;
        check.x = x;
        check.y = y;
        check.visible = false;

        return check;
    }

    makeCoinsTag(index: number):CoinsTag
    {
        const coins = prizes[index] as number;
        const coinsTag = this.addChild(new CoinsTag({ fontSize: 40, coins }));

        coinsTag.y = 65;
        coinsTag.scale.set(0.6);
        this.setPrizeElementX(coinsTag, index);
        coinsTag.x -= 30;

        return coinsTag;
    }

    setPrizeElementX(prize: Container, index:number): void
    {
        prize.x = ((this.normalPrizeBase.width / 4) * index) + (this.normalPrizeBase.width / 8)
         - (this.normalPrizeBase.width / 2);
    }

    makeDashedLine(): Container
    {
        const dashed = new Container();

        dashed.addChild(
            new Graphics().beginFill(0xFFFFFF).drawRect(0, 0, 15, 4).endFill(),
            new Graphics().beginFill(0xFFFFFF).drawRect(25, 0, 15, 4).endFill(),
            new Graphics().beginFill(0xFFFFFF).drawRect(50, 0, 15, 4).endFill(),
            new Graphics().beginFill(0xFFFFFF).drawRect(75, 0, 15, 4).endFill(),
            new Graphics().beginFill(0xFFFFFF).drawRect(100, 0, 15, 4).endFill(),
        );

        return dashed;
    }
}
