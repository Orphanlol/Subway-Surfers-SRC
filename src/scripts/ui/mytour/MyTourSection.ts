import {  I18nLabel } from '@goodboydigital/astro';
import { Container, Sprite,  TextStyle } from 'pixi.js';

type TextOptions = Partial<TextStyle> & {label: string};
interface MyTourSectionOptions
{
    h1Options: TextOptions;
    h2Options: TextOptions;
    headerIcon: string;
}
export class MyTourSection extends Container
{
    headerIcon: Sprite;
    protected h1Label: I18nLabel;
    protected h2Label: I18nLabel;

    constructor(opts: MyTourSectionOptions)
    {
        super();

        this.headerIcon = this.addChild(Sprite.from(opts.headerIcon));
        this.headerIcon.scale.set(1.3);
        this.headerIcon.anchor.set(1, 0);

        this.h1Label = this.addChild(new I18nLabel(opts.h1Options.label, opts.h1Options));

        this.h2Label = this.addChild(new I18nLabel(opts.h2Options.label, opts.h2Options));
    }

    open(data?: any):void
    {
        // For subclasses
    }

    close():void
    {
        // For subclasses
    }

    resize(w: number, h: number): void
    {
        this.headerIcon.position.set((w / 2) - 45, (-h / 2) + 15);
        this.h1Label.position.set((-w / 2) + 40, (-h / 2) + 25);
        this.h2Label.position.set((-w / 2) + 40, this.h1Label.y + this.h1Label.height);
    }
}
