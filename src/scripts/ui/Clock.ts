import * as PIXI from 'pixi.js';

import Math2 from '../utils/Math2';

type Callback = (...args: any[]) => void;

export default class Clock extends PIXI.Container
{
    public base: PIXI.Sprite;
    public fill: PIXI.Sprite;
    public ticker: PIXI.Ticker;
    public time = 0;
    public secs = 0;
    public onComplete?: Callback;
    public pizza?: PIXI.Graphics;

    constructor()
    {
        super();
        this.base = PIXI.Sprite.from('clock-base.png');
        this.base.anchor.set(0.5);
        this.base.x = -1;
        this.base.y = -1;
        this.addChild(this.base);

        this.fill = PIXI.Sprite.from('clock-fill.png');
        this.fill.anchor.set(0.5);
        this.addChild(this.fill);

        this.ticker = new PIXI.Ticker();
        this.ticker.stop();
    }

    run(secs: number, onComplete?: Callback): void
    {
        if (this.secs) this.stop();
        this.time = secs;
        this.secs = secs;
        this.onComplete = onComplete;
        this.update(0);
        this.ticker.add(this.update, this, 1);
        this.ticker.start();
    }

    stop(): void
    {
        this.secs = 0;
        this.ticker.remove(this.update, this);
        this.ticker.stop();
    }

    complete(): void
    {
        this.stop();
        if (this.onComplete) this.onComplete();
    }

    update(delta: number): void
    {
        const d = delta / 60;

        this.secs -= d;
        this.updatePizza();
        if (this.secs < 0) this.complete();
    }

    updatePizza(): void
    {
        if (!this.pizza)
        {
            this.pizza = new PIXI.Graphics();
            this.addChild(this.pizza);
        }

        const ratio = this.secs / this.time;
        const angle = Math2.PI_DOUBLE * ratio;

        this.pizza.clear();
        this.pizza.beginFill(0xeeeeee);
        this.pizza.moveTo(0, 0);
        this.pizza.arc(0, 0, 43, 0, angle, true);
        this.pizza.rotation = -Math2.PI_HALF;
        this.pizza.scale.y = -1;
    }
}
