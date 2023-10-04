import { i18n } from '@goodboydigital/astro';
import { TweenMax } from 'gsap';
import { BLEND_MODES, Container, Sprite, Text } from 'pixi.js';
import { Signal } from 'signals';

import type { MysteryBoxPrize, MysteryPrizeType } from '../data/mysterybox/MysteryBoxData';
import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import Poki from '../utils/Poki';
import { BgStripes } from './BgStripes';
import { Button } from './buttons/Button';
import Graph from './Graph';
import UserCurrencies from './me/characters/UserCurrencies';
import { MysteryBoxThumb } from './mysterybox/MysteryBoxThumb';
import { PrizeThumb } from './mysterybox/PrizeThumb';
import Widget from './Widget';

const prizeTexMap: Partial<Record<MysteryPrizeType, string>> = {
    hoverboard: 'board-hoverboard-tex',
};

const prizeModelMap: Record<MysteryPrizeType, string> = {
    coins: 'currency_coin',
    keys: 'currency_key',
    hoverboard: 'board_default_base',
    headstart: 'headstartToken',
    scoreBooster: 'ScoreBooster',
};
const prizeLabelMap: Record<MysteryPrizeType, string> = {
    coins: 'Coin',
    keys: 'Key',
    hoverboard: 'Hoverboard',
    headstart: 'Headstart',
    scoreBooster: 'Score Booster',
};

enum PrizeScreenState
    {
    OPENING,
    CLOSING,
    REPEATING,
}

export class PrizeScreen extends Widget
{
    private state = PrizeScreenState.OPENING;
    private bg!: Sprite;
    private prizeButton!: Button;
    private currencies!: UserCurrencies;
    private hint!: Text;
    private mysteryBoxThumb!: MysteryBoxThumb;
    private prizeThumb!: PrizeThumb;
    private rays!: BgStripes;
    private prizeText!: Text;
    private onExitCallback?: () => void;
    private prizes: MysteryBoxPrize[] = [];
    private boxType = '';
    private currentPrize?: MysteryBoxPrize;
    private blockEvents = false;

    public onOpenPrize = new Signal();

    protected onBuild(): void
    {
        this.bg = this.addChild(Sprite.from('prizescreen-bg.png'));
        this.bg.anchor.set(0.5);
        this.bg.interactive = true;

        this.prizeButton = this.addChild(new Button({
            base: Graph.rectShadow(
                {
                    round: 12,
                    w: 200, h: 90,
                    shadowAlpha: 0.15,
                    shadowDistance: 2,
                    color: 0xe47f00,
                },
            ),
            icon: 'mystery-box-icon.png',
            iconX: -50,
            label: 'prizes',
            labelX: 40,
            labelFont: 'Lilita One',
            labelShadow: 2,
            labelSize: 32,
            onTap: () => app.prizesPanel.open(this.boxType) },
        ));
        this.prizeButton.icon?.scale.set(0.5);

        this.currencies = this.addChild(new UserCurrencies());

        const raysMask = Sprite.from('background-superglow.png');

        raysMask.anchor.set(0.5);

        this.rays = this.addChild(new BgStripes({
            baseAlpha: 0,
            radius: 20,
            w: 650, h: 650,
            color: 0xFFFF66,
            glow: 0xFFFF66,
            glowScale: { x: 7, y: 7 },
            mask: raysMask,
            blendMode: BLEND_MODES.ADD,
            raysAlpha: 0.75,
        }));
        this.rays.scale.set(1.2);

        this.mysteryBoxThumb = this.addChild(new MysteryBoxThumb('mysteryBox_default'));
        this.prizeThumb = this.addChild(new PrizeThumb('currency_key'));

        this.hint = this.addChild(new Text('', {
            fontSize: 45,
            fill: 0xFFFFFF,
            fontFamily: 'Titan One',
        }));
        this.hint.anchor.set(0.5);

        this.prizeText = this.addChild(new Text('', {
            fontSize: 45,
            fill: 0x000000,
            fontFamily: 'Titan One',
            dropShadow: true,
            dropShadowColor: 0xFFFFFF,
        }));
        this.prizeText.anchor.set(0.5);

        Poki.SDK.onBreakStart.add(() =>
        {
            this.blockEvents = true;
        });
        Poki.SDK.onBreakComplete.add(() =>
        {
            this.blockEvents = false;
        });
    }

    protected onOpen(data: {prizes: MysteryBoxPrize[]; onExitCallback?: () => void}): void
    {
        this.prizes = data.prizes;
        this.onExitCallback = data.onExitCallback;
        if (this.prizes.length)
        {
            this.currencies.coins = app.user.coins;
            this.currencies.keys = app.user.keys;

            this.setup();
        }
        else this.close();
    }

    setup():void
    {
        this.currentPrize = this.prizes.shift() as MysteryBoxPrize;
        const { type, amount, boxType } = this.currentPrize;
        let label = prizeLabelMap[type];

        this.state = PrizeScreenState.OPENING;

        if (amount > 1) label += 's';
        this.prizeText.text = `${amount} ${label}`;
        this.prizeText.alpha = 0;

        const shouldUseDefault = boxType === 'mystery-box' || boxType === 'mini-mystery-box';

        this.prizeThumb.reset();

        this.mysteryBoxThumb.setup(shouldUseDefault ? 'mysteryBox_default' : 'mysteryBox_super');
        this.prizeThumb.setup(prizeModelMap[type], prizeTexMap[type]);

        this.hint.text = i18n.translate('prize-screen-open');
        this.hint.alpha = 1;
        TweenMax.to(this.hint, 1.3, { alpha: 0.1 }).yoyo(true).repeat(-1);

        this.bg.on('pointertap', this.onPointerTap);
        window.addEventListener('keydown', this.onKeyDown);
        this.mysteryBoxThumb.tween(1);

        this.rays.alpha = 0;
        (this.rays.mask as Container).scale.set(0);
        this.rays.rotation = 0;

        this.mysteryBoxThumb.visible = !!boxType;
        this.prizeButton.visible = !!boxType;
        this.boxType = boxType;
        if (!boxType)
        {
            this.onPointerTap();
        }
    }

    protected onClose(): void
    {
        app.sound.musicFadeIn();
        TweenMax.killTweensOf(this.hint);

        window.removeEventListener('keydown', this.onKeyDown);
        this.bg.off('pointertap', this.onPointerTap);
        this.onExitCallback?.();
        this.prizeThumb.reset();
    }

    private onKeyDown = (e: KeyboardEvent) =>
    {
        if (e.repeat || this.blockEvents) return;

        if (e.key === 'Spacebar' || e.key === ' ')
        {
            this.onPointerTap();
        }
    };

    private onPointerTap = () =>
    {
        if (this.state === PrizeScreenState.OPENING)
        {
            this.openPrize();
        }
        else if (this.state === PrizeScreenState.CLOSING)
        {
            this.close();
        }
        else if (this.state === PrizeScreenState.REPEATING)
        {
            this.setup();
        }
    };

    private openPrize(): void
    {
        if (this.currentPrize) app.user.openMysteryBox(this.currentPrize);

        app.sound.stopAllFx();
        app.sound.musicFadeOut();
        app.sound.play('open-prize');
        this.state = -1;
        this.prizeThumb.entity.scale.set(0);
        TweenMax.killTweensOf(this.hint);
        this.hint.alpha = 0;

        this.mysteryBoxThumb.tween(2);
        TweenMax.to(this.rays, 0.3, { alpha: 1 });
        TweenMax.to(this.rays.mask as Container, 0.3, { width: 650, height: 650 });
        TweenMax.delayedCall(0.5, () => this.prizeThumb.tween());
        TweenMax.to(this.rays, 4, { rotation: Math.PI * 2, onComplete: () =>
        {
            TweenMax.to(this.rays, 1, { alpha: 0, onComplete: () =>
            {
                this.hint.text = i18n.translate(`prize-screen-continue${GameConfig.mobile ? '-mobile' : ''}`);
                this.hint.alpha = 0.1;
                TweenMax.to(this.hint, 1.3, { alpha: 1 }).yoyo(true).repeat(-1);

                if (this.prizes.length)
                {
                    this.state = PrizeScreenState.REPEATING;
                }
                else
                {
                    this.state = PrizeScreenState.CLOSING;
                }
            } });
        } });
        TweenMax.to(this.prizeText, 0.5, { alpha: 1 }).delay(2.5);

        this.onOpenPrize.dispatch(this.boxType);
        this.currentPrize = undefined;
    }

    protected onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        const bigger = (w > h ? w : h) * 1.25;

        this.bg.width = bigger;
        this.bg.height = bigger;
        this.bg.x = w / 2;
        this.bg.y = (h / 2) - (h * 0.05);

        this.prizeButton.x = (w / 2) - (this.prizeButton.width / 2) - 60;
        this.prizeButton.y = (this.prizeButton.height / 2) + 40;

        this.currencies.x = (w / 2) + (this.currencies.width / 2) + 60;
        this.currencies.y = (this.prizeButton.height / 2) + 40;

        this.hint.x = (w / 2);
        this.hint.y = h - (this.hint.height / 2) - 25;

        this.prizeText.x = (w / 2);
        this.prizeText.y = (h / 2) + (this.prizeThumb.height / 2);

        this.mysteryBoxThumb.x = (w / 2);
        this.mysteryBoxThumb.y = (h / 2);

        this.prizeThumb.x = (w / 2);
        this.prizeThumb.y = (h / 2);

        this.rays.x = (w / 2);
        this.rays.y = (h / 2);
    }
}
