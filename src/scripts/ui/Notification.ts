import { TweenLite } from 'gsap';
import * as PIXI from  'pixi.js';

import { app } from '../SubwaySurfersApp';
import { delay } from '../utils/Utils';
import Widget from './Widget';

export interface NotificationData
{
    text: string,
    icon: string,
    height?: number
}

export class Notification extends Widget
{
    public content!: PIXI.Container;
    public base!: PIXI.NineSlicePlane;
    public label!: PIXI.Text;
    public icon!: PIXI.Sprite;
    public layer = 1;
    private queue: NotificationData[] = [];
    private showing = false;

    protected onBuild(): void
    {
        this.content = new PIXI.Container();
        this.addChild(this.content);

        this.base = new PIXI.NineSlicePlane(PIXI.Texture.from('base-blue.png'), 20, 20, 20, 20);
        this.content.addChild(this.base);

        this.icon = new PIXI.Sprite(PIXI.Texture.from('spraycan-big-bronze.png'));
        this.icon.anchor.set(0.5);
        this.content.addChild(this.icon);

        this.label = new PIXI.Text('AAA', {
            fontFamily: 'Lilita One',
            align: 'left',
            fill: 0xFFFFFF,
            fontSize: 30,
        });
        this.label.anchor.set(0, 0.5);
        this.content.addChild(this.label);
    }

    protected onResize(): void
    {
        this.x = this.viewportWidth / 2;
        this.y = 100;
    }

    public append(data: NotificationData): void
    {
        this.queue.push(data);
        this.processQueue();
    }

    private processQueue(): void
    {
        if (this.queue.length && !this.showing)
        {
            const item = this.queue.shift();

            if (item) this.show(item);
        }
    }

    private async show(data: NotificationData): Promise<void>
    {
        if (this.showing) return;
        this.showing = true;

        await delay(0.5);

        app.sound.play('mission-notification');

        this.open();
        this.label.text = data.text;
        this.icon.texture = PIXI.Texture.from(data.icon);

        this.base.height = data.height ? data.height : this.icon.height + 20;

        const leftSpace = Math.max(this.icon.width, this.base.height);

        this.base.width = this.label.width + leftSpace + 50;
        this.base.x = -this.base.width / 2;
        this.base.y = -this.base.height / 2;

        this.icon.x = (-this.base.width / 2) + (leftSpace / 2) + 10;
        this.label.x = this.icon.x + (leftSpace / 2) + 10;

        this.content.y = -300;
        await TweenLite.to(this.content, 0.3, { y: 0, ease: 'sine.out' });
        await delay(3);
        await TweenLite.to(this.content, 0.3, { y: -300, ease: 'sine.in' });

        this.close();
        this.showing = false;
        this.processQueue();
    }
}
