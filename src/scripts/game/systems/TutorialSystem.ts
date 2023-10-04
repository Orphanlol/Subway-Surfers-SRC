import { i18n, waitAFrame } from '@goodboydigital/astro';
import { Entity, Time } from '@goodboydigital/odie';
import { TweenLite } from 'gsap';
import { Container, Sprite } from 'pixi.js';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Label from '../../ui/Label';
import Math2 from '../../utils/Math2';
import { GameSystem } from '../GameSystem';

class Arrow extends Container
{
    public img: Sprite;
    public time = 0;
    public duration = 0;
    public animRange = 300;

    constructor()
    {
        super();
        this.img = Sprite.from('tutorial-arrow.png');
        this.img.anchor.set(0.5);
        this.img.scale.set(2);
        this.img.alpha = 0.5;
        this.addChild(this.img);
        this.visible = false;
    }

    async show(type: string, duration = 40): Promise<void>
    {
        const rot: Record<string, number> = {
            up: 0,
            right: 1,
            down: 2,
            left: 3,
        };

        if (rot[type] === undefined) return;
        console.log('[TutorialSystem]', 'arrow show', type);
        this.rotation = Math2.PI_HALF * rot[type];
        await waitAFrame();
        this.visible = true;
        this.time = 0;
        this.duration = duration;
        this.img.y = this.animRange;
    }

    hide()
    {
        console.log('[TutorialSystem]', 'arrow hide');
        this.visible = false;
    }

    update(delta: number)
    {
        if (!this.visible) return;
        this.time += delta;
        const ratio = this.time / this.duration;

        this.img.y = this.animRange - ((this.animRange * 2) * ratio);
        if (ratio > 1) this.hide();
    }
}

class Msg extends Label
{
    public app: any;
    public time = 0;
    public duration = 60;
    public showing = false;

    constructor(app: any)
    {
        super('MSG', {
            align: 'center',
            fill: 0xFFFFFF,
            fontSize: 50,
            fontFamily: 'Lilita One',
            stroke: 'black',
            strokeThickness: 5,
            anchor: 0.5,
        });
        this.app = app;
        this.visible = false;
        this.time = 0;
        this.duration = 60;
    }

    show(type: string, offset: boolean)
    {
        const sufix = !GameConfig.mobile ? '_desktop' : '';
        let text = i18n.translate(`tutorial_${type}${sufix}`);

        if (!text) text = i18n.translate(`tutorial_${type}`);
        if (!text) return;
        console.log('[TutorialSystem]', 'msg show');
        this.text = text;
        this.visible = true;
        this.time = 0;
        this.duration = 20 + (text.length * 2);
        this.scale.y = 0;
        TweenLite.to(this.scale, 0.01, { y: 1 });
        this.y = offset ? 300 : 0;
        this.showing = true;
    }

    hide()
    {
        console.log('[TutorialSystem]', 'msg hide');
        this.showing = false;
        TweenLite.to(this.scale, 0.1, { y: 0, onComplete: () =>
        {
            this.visible = false;
        } });
    }

    update(delta: number): void
    {
        if (!this.visible || !this.showing) return;
        this.time += delta;
        if (this.time > this.duration) this.hide();
    }
}

/**
 * Fills up the game world with entities and chunks,
 * also responsible for removing passed entities.
 */
export default class TutorialSystem extends GameSystem
{
    public view: Container;

    protected _enabled = false;
    protected _built = false;

    private arrow!: Arrow;
    private msg!: Msg;

    constructor(entity: Entity)
    {
        super(entity);
        this.view = new Container();
        this.game.onRun.add(this as any);
        this.game.onPause.add(this as any);
        this.game.onResume.add(this as any);
    }

    get enabled(): boolean
    {
        return this._enabled;
    }

    set enabled(v: boolean)
    {
        this._enabled = v;
    }

    run(): void
    {
        if (!this._enabled) return;
        this.show();
    }

    pause(): void
    {
        if (!this._enabled) return;
        this.view.visible = false;
    }

    resume(): void
    {
        if (!this._enabled) return;
        this.view.visible = true;
    }

    build(): void
    {
        if (this._built) return;
        this._built = true;

        console.log('[TutorialSystem]', 'built');
        this.arrow = new Arrow();
        this.view.addChild(this.arrow);

        this.msg = new Msg(this.game.app);
        this.view.addChild(this.msg);
    }

    show(): void
    {
        if (!this._enabled) return;
        this.build();
        this.game.hero.hoverboard.lock();
        app.ui.mainLayer.addChild(this.view);
        app.resize.onResize.connect(this.onResize);
        this.onResize();
    }

    hide(): void
    {
        this.view.parent?.removeChild(this.view);
        app.resize.onResize.disconnect(this.onResize);
    }

    enterTrigger(type: string): void
    {
        if (!this._enabled) return;
        console.log('[TutorialSystem]', 'enter trigger:', type);
        if (this.game.stats.distanceDelta < 0) return;
        this.arrow.show(type);
        this.msg.show(type, this.arrow.visible);
        if (type === 'hoverboard')
        {
            this.game.hero.hoverboard.unlock();
        }
    }

    exitTrigger(type: string): void
    {
        console.log('[TutorialSystem]', 'exit trigger', type);
        if (type === 'finished')
        {
            app.user.tutorial = true;
            app.user.save();
        }
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this._enabled) return;
        if (this.arrow) this.arrow.update(delta);
        if (this.msg) this.msg.update(delta);
    }

    onResize = (): void =>
    {
        this.view.x = app.ui.viewportWidth / 2;
        this.view.y = app.ui.viewportHeight / 2;
    };
}
