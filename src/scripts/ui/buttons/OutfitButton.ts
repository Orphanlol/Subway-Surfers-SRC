import * as PIXI from 'pixi.js';

import { Button, ButtonOptions } from './Button';

export class OutfitButton extends Button
{
    public lock: PIXI.Sprite;
    public selectIcon: PIXI.Sprite;

    constructor(opts: Partial<ButtonOptions> = {})
    {
        const base = PIXI.Sprite.from('btn-base-small.png');
        const lock = PIXI.Sprite.from('icon-lock-outfit.png');
        const selected = PIXI.Sprite.from('icon-owned.png');

        base.anchor.set(0.5);

        lock.anchor.set(0.5);
        lock.x = (base.width / 2) - 5;
        lock.y = (base.height / 2) - 5;
        lock.scale.set(0.75);

        selected.anchor.set(0.5);
        selected.x = (base.width / 2) - 5;
        selected.y = (base.height / 2) - 5;
        selected.scale.set(0.75);

        super({
            base,
            tintBaseOnPress: false,
            ...opts,
        });

        this.lock = lock;
        this.addChild(lock);
        this.selectIcon = selected;
        this.addChild(selected);
    }

    setIcon(icon: string): void
    {
        this.setup({ icon });
        this.addChild(this.lock);
        this.addChild(this.selectIcon);
    }

    get locked(): boolean
    {
        return this.lock.visible;
    }

    set locked(v: boolean)
    {
        this.lock.visible = v;
    }

    get isSelected(): boolean
    {
        return this.lock.visible;
    }

    set isSelected(v: boolean)
    {
        this.selectIcon.texture = v ? PIXI.Texture.from('icon-selected.png') : PIXI.Texture.from('icon-owned.png');
    }
}
