import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

export class Countdown extends PIXI.Container
{
    private label!: I18nLabel;
    private callback?: () => void;
    private timeout: any;
    private i18nKey = '';

    constructor(i18nKey = 'start_countdown')
    {
        super();
        this.i18nKey = i18nKey;
        this.visible = false;
    }

    private build(): void
    {
        if (this.label) return;
        this.label = new I18nLabel(this.i18nKey, {
            params: { num: 0 },
            fill: 'white',
            align: 'center',
            fontSize: 80,
            fontFamily: 'Titan One',
            stroke: 'black',
            strokeThickness: 5,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.addChild(this.label);
    }

    public run(timeout = 3, callback?: () => void): void
    {
        this.build();
        clearTimeout(this.timeout);
        this.callback = callback;
        this.step(timeout);
    }

    public stop(): void
    {
        clearTimeout(this.timeout);
        this.visible = false;
    }

    private step(step: number)
    {
        if (step === 0)
        {
            console.log('[Countdown] Finish!');
            if (this.callback) this.callback();
            this.visible = false;

            return;
        }
        console.log('[Countdown] Step:', step);

        this.label.options.params = { num: step };
        this.label.refresh();
        this.visible = true;
        this.timeout = setTimeout(this.step.bind(this), 600, step - 1);
    }
}
