import { i18n, I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import { app } from '../SubwaySurfersApp';
import { Button } from './buttons/Button';
import Graph from './Graph';
import Label from './Label';
import NicknamePrompt from './NicknamePrompt';

type Callback = (...args: any[]) => void;

interface SettingsItemOpts
{
    icon: string,
    title: string,
    subtitle: string,
}

export class SettingsItem extends PIXI.Container
{
    public w = 550;
    public h = 230;
    public opts: SettingsItemOpts;
    public bg: PIXI.Graphics;
    public btn: Button;
    public title: I18nLabel;
    public subtitle: Label;
    protected onTap?: Callback;
    protected onBgTap?: Callback;
    protected onButtonTap?: Callback;
    protected signalNode: any;

    constructor(opts: SettingsItemOpts)
    {
        super();
        const o = opts;

        this.w = 550;
        this.h = 130;
        this.opts = o;

        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0xFF0000, 1);
        this.bg.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
        this.addChild(this.bg);
        this.bg.alpha = 0;
        this.bg.interactive = true;
        this.bg.buttonMode = true;
        this.bg.on('pointertap', () =>
        {
            if (this.onTap || this.onBgTap) app.sound.play('gui-tap');
            if (this.onTap) this.onTap();
            if (this.onBgTap) this.onBgTap();
        });

        this.btn = new Button({
            icon: o.icon,
            base: Graph.rectComp(
                { w: 116, h: 118, image: 'box-border-grey-small.png', x: 1, y: 1 },
                { w: 100, h: 100, color: 0x3689be, round: 6 },
            ),
        });
        this.btn.onTap = () =>
        {
            if (this.onTap) this.onTap();
            if (this.onButtonTap) this.onButtonTap();
        };
        this.addChild(this.btn);
        this.btn.x = (-this.w / 2) + 60;

        this.title = new I18nLabel(o.title, {
            align: 'left',
            fill: 0x004a80,
            fontSize: 40,
            fontFamily: 'Titan One',
        });
        this.addChild(this.title);
        this.title.x = this.btn.x + 80;
        this.title.y = o.subtitle === 'empty' ? -20 : -30;

        const subtitleText = i18n.translate(o.subtitle);

        this.subtitle = new Label(subtitleText, {
            align: 'left',
            fill: 0x3a8bbf,
            fontSize: 30,
            fontFamily: 'Titan One',
            anchor: 0,
        });
        this.addChild(this.subtitle);
        this.subtitle.x = this.title.x;
        this.subtitle.y = this.title.y + 55;
    }

    public enable(): void
    {
        // For subclasses
    }

    public disable(): void
    {
        // For subclasses
    }
}

export class SettingsItemProfile extends SettingsItem
{
    public prompt?: NicknamePrompt;

    constructor()
    {
        super({
            icon: 'icon-user.png',
            title: 'nickname',
            subtitle: 'nickname_prompt',
        });
    }

    protected onBgTap = (): void =>
    {
        if (!this.prompt) this.prompt = new NicknamePrompt('nickname');
        this.prompt.show();
    };

    public enable(): void
    {
        if (this.signalNode) return;
        this.subtitle.text = app.user.name;
        this.signalNode = app.user.onGameSettingsChange.add(this.onUserChange, this);
    }

    public disable(): void
    {
        if (this.signalNode) app.user.onGameSettingsChange.remove(this.onUserChange, this);
        this.signalNode = null;
    }

    protected onUserChange = (): void =>
    {
        this.subtitle.text = app.user.name;
    };
}

export class SettingsItemSound extends SettingsItem
{
    private diagonal: PIXI.Sprite;

    constructor()
    {
        super({
            icon: 'icon-sound.png',
            title: 'sound',
            subtitle: 'on',
        });

        this.diagonal = PIXI.Sprite.from('diagonal.png');
        this.diagonal.anchor.set(0.5);
        this.btn.addChild(this.diagonal);
    }

    protected onTap = (): void =>
    {
        app.sound.toggleMuted();
    };

    protected refresh = (): void =>
    {
        const textId = app.sound.muted ? 'off' : 'on';

        this.subtitle.text = i18n.translate(textId);
        this.diagonal.visible = app.sound.muted;
    };

    public enable(): void
    {
        if (this.signalNode) return;
        this.signalNode = app.sound.onMutedChange.add(this.refresh, this);
        this.refresh();
    }

    public disable(): void
    {
        if (this.signalNode) app.user.onGameSettingsChange.remove(this.refresh, this);
        this.signalNode = null;
    }
}

export class SettingsItemPrivacy extends SettingsItem
{
    constructor()
    {
        super({
            icon: 'icon-info.png',
            title: 'privacy_policy',
            subtitle: 'empty',
        });
    }

    protected onTap = (): void =>
    {
        window.open(i18n.translate('privacy_policy_link'), '_blank');
    };
}
