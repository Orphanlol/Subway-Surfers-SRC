import * as PIXI from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { SmallButton } from './SmallButton';

export class SoundButton extends SmallButton
{
    public diagonal: PIXI.Sprite;

    constructor()
    {
        super({ icon: 'icon-sound.png' });
        this.diagonal = PIXI.Sprite.from('diagonal.png');
        this.diagonal.anchor.set(0.5);
        this.addChild(this.diagonal);

        this.onTap = () => app.sound.toggleMuted();
        app.sound.onMutedChange.add(this.refresh);
        this.refresh();
    }

    public refresh = (): void =>
    {
        this.diagonal.visible = app.sound.muted;
    };
}
