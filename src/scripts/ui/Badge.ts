import * as PIXI from 'pixi.js';

export class Badge extends PIXI.Container
{
    public splash: PIXI.Sprite;
    public icon: PIXI.Sprite;

    constructor()
    {
        super();

        this.splash = new PIXI.Sprite(PIXI.Texture.from('splash-new.png'));
        this.splash.anchor.set(0.5);
        this.splash.scale.set(0.65);
        this.addChild(this.splash);
        this.splash.tint = 0xFBE861;

        this.icon = new PIXI.Sprite(PIXI.Texture.from('icon-key-white.png'));
        this.icon.anchor.set(0.5);
        this.addChild(this.icon);
        this.icon.tint = 0x458AD4;
    }

    public updateTransform(): void
    {
        super.updateTransform();
        this.splash.rotation -= 0.03;
    }
}
