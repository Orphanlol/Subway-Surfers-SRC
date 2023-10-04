import { i18n } from '@goodboydigital/astro';
import { Container, Sprite, Text } from 'pixi.js';

export class PowerupTag extends Container
{
    private icon: Sprite;
    private h1Label: Text;
    private h2Label: Text;

    constructor()
    {
        super();

        this.icon = this.addChild(Sprite.from('icon-board-powerup.png'));
        this.icon.anchor.set(0.5);
        this.icon.tint = 0xCC5407;
        this.icon.position.set(45, 0);

        this.h1Label = this.addChild(new Text('', {
            fill: 0xCC5407,
            fontSize: 28,
            fontFamily: 'Lilita One',
        }));
        this.h1Label.position.set(90, -35);
        this.h1Label.text = i18n.translate('special-power');

        this.h2Label = this.addChild(new Text('', {
            fill: 0xCC5407,
            fontSize: 28,
            fontFamily: 'Lilita One',
        }));
        this.h2Label.x = 90;
    }

    setPowerup(name: string):void
    {
        this.h2Label.text = i18n.translate(name);
    }
}
