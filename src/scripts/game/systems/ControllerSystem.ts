import { Entity, Runner } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import Game from '../../Game';
import { Keyboard } from '../../utils/Keyboard';
import Math2 from '../../utils/Math2';
import { GameSystem } from '../GameSystem';

export default class ControllerSystem extends GameSystem
{
    public keyboard: Keyboard;
    public view: PIXI.Sprite;

    public vertical = 0;
    public horizontal = 0;
    public action = 0;

    public pressing = false;
    public pressStartX = 0;
    public pressStartY = 0;
    public tapCount = 0;
    private tapTimeout?: any;

    public onSwipeHorizontal: Runner;
    public onSwipeVertical: Runner;
    public onDoubleTap: Runner;

    constructor(entity: Entity)
    {
        super(entity);

        this.keyboard = new Keyboard();
        this.keyboard.bindKeyDown('left', this.pressLeft.bind(this));
        this.keyboard.bindKeyDown('up', this.pressUp.bind(this));
        this.keyboard.bindKeyDown('right', this.pressRight.bind(this));
        this.keyboard.bindKeyDown('down', this.pressDown.bind(this));
        this.keyboard.bindKeyDown('a', this.pressLeft.bind(this));
        this.keyboard.bindKeyDown('w', this.pressUp.bind(this));
        this.keyboard.bindKeyDown('d', this.pressRight.bind(this));
        this.keyboard.bindKeyDown('s', this.pressDown.bind(this));


        this.keyboard.bindKeyDown('space', this.pressAction.bind(this));
        this.keyboard.enabled = false;

        this.view = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.view.alpha = 0;
        this.view.width = this.view.height = 9999;

        this.view.on('pointerdown', this.onPointerDown, this);
        this.view.on('pointermove', this.onPointerMove, this);
        this.view.on('pointerup', this.onPointerUp, this);

        const runnerItem = this as any;

        this.game.onReset.add(runnerItem);
        this.game.onRun.add(runnerItem);
        this.game.onPause.add(runnerItem);
        this.game.onResume.add(runnerItem);
        this.game.onGameover.add(runnerItem);
        this.game.onRevive.add(runnerItem);

        this.vertical = 0;
        this.horizontal = 0;
        this.action = 0;

        this.pressing = false;
        this.pressStartX = 0;
        this.pressStartY = 0;
        this.tapCount = 0;

        this.onSwipeHorizontal = new Runner('onSwipeHorizontal', 1);
        this.onSwipeVertical = new Runner('onSwipeVertical', 1);
        this.onDoubleTap = new Runner('onDoubleTap');
    }

    onPointerDown(e: PIXI.InteractionEvent): void
    {
        const point = e.data.global;

        this.doubleTapUpdate();
        this.pressStartX = point.x;
        this.pressStartY = point.y;
        this.pressing = true;
    }

    onPointerMove(e: PIXI.InteractionEvent): void
    {
        if (!this.pressing) return;
        const point = e.data.global;
        const minDistance = 60;
        const dx = point.x - this.pressStartX;
        const dy = point.y - this.pressStartY;

        if (Math.abs(dx) > minDistance)
        {
            this.pressing = false;
            this.doubleTapReset();
            this.horizontal = Math2.sign(dx);

            return;
        }

        if (Math.abs(dy) > minDistance)
        {
            this.pressing = false;
            this.doubleTapReset();
            this.vertical = -Math2.sign(dy);

            return;
        }
    }

    onPointerUp(): void
    {
        this.pressing = false;
    }

    onPointerCancel(): void
    {
        this.pressing = false;
    }

    pressUp(e: KeyboardEvent): void
    {
        e.preventDefault();
        this.vertical = 1;
    }

    pressDown(e: KeyboardEvent): void
    {
        e.preventDefault();
        this.vertical = -1;
    }

    pressLeft(e: KeyboardEvent): void
    {
        e.preventDefault();
        this.horizontal = -1;
    }

    pressRight(e: KeyboardEvent): void
    {
        e.preventDefault();
        this.horizontal = 1;
    }

    pressAction(e: KeyboardEvent): void
    {
        if (this.game.state !== Game.RUNNING) return;
        e.preventDefault();
        this.action = 1;
    }

    update(): void
    {
        if (this.game.state === Game.RUNNING)
        {
            if (this.vertical === 1)
            {
                this.onSwipeVertical.dispatch(this.vertical);
            }
            else if (this.vertical === -1)
            {
                this.onSwipeVertical.dispatch(this.vertical);
            }
            else if (this.horizontal)
            {
                this.onSwipeHorizontal.dispatch(this.horizontal);
            }
            else if (this.action)
            {
                this.onDoubleTap.dispatch();
            }
        }

        this.vertical = 0;
        this.horizontal = 0;
        this.action = 0;
    }

    reset(): void
    {
        this.hide();
    }

    show(): void
    {
        this.doubleTapReset();
        this.tapCount = 0;
        this.vertical = 0;
        this.horizontal = 0;
        this.action = 0;
        this.view.visible = true;
        this.view.interactive = true;
        this.game.stage.addChild(this.view);
        this.keyboard.enabled = true;
    }

    hide(): void
    {
        this.doubleTapReset();
        this.tapCount = 0;
        this.vertical = 0;
        this.horizontal = 0;
        this.action = 0;
        this.view.visible = false;
        this.view.interactive = false;
        this.keyboard.enabled = false;
        if (this.view.parent) this.view.parent.addChild(this.view);
    }

    run(): void
    {
        this.show();
    }

    revive(): void
    {
        this.hide();
    }

    pause(): void
    {
        this.hide();
    }

    resume(): void
    {
        this.show();
    }

    gameover(): void
    {
        this.hide();
    }

    resize(w: number, h: number): void
    {
        this.view.x = 0;
        this.view.y = 0;
        this.view.width = w;
        this.view.height = h;
    }

    /** Isolate double tap from game update cycle */
    private doubleTapUpdate(): void
    {
        if (this.tapCount > 0 && this.game.state === Game.RUNNING) this.action = 1;
        this.tapCount += 1;
        if (this.tapTimeout) clearTimeout(this.tapTimeout);

        // Reset tap count after 300 miliseconds, which is the double tap interval
        this.tapTimeout = setTimeout(() => { this.tapCount = 0; }, 300);
    }

    /** Clear accumulated tap and timeout */
    private doubleTapReset(): void
    {
        if (this.tapTimeout) clearTimeout(this.tapTimeout);
        this.tapTimeout = undefined;
        this.tapCount = 0;
        this.action = 0;
    }
}
