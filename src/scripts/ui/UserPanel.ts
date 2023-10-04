import { Container, Sprite } from 'pixi.js';

import { app } from '../SubwaySurfersApp';
import { Button } from './buttons/Button';
import { HorizontalMenu } from './buttons/HorizontalMenu';
import { UserButtonOptions, UserPanelButton } from './buttons/UserPanelButton';
import ScreenGlow from './ScreenGlow';

export default class UserPanel extends Container
{
    public bg!: ScreenGlow;
    public base!: Sprite;
    private panel: Container;
    private bottomMenu: HorizontalMenu;
    private w = 0;
    private h = 0;

    constructor(opts: UserButtonOptions = {})
    {
        super();
        const backButtonOptions = {
            icon: 'icon-white-back.png',
            onTap: (() => app.nav.toIdleScreen('title')),
            ...opts,
        };

        this.bg = new ScreenGlow();
        this.addChild(this.bg);

        this.panel = new Container();
        this.addChild(this.panel);

        this.base = Sprite.from('notepad-panel.png');
        this.base.anchor.set(0.5);
        this.panel.addChild(this.base);

        const backButton = new UserPanelButton(backButtonOptions);
        const maxButtons = 4;
        const spacing = (this.base.width - (backButton.width * maxButtons)) / (maxButtons + 1);

        this.bottomMenu = this.addChild(new HorizontalMenu({ spacing, anchorX: 0 }));
        this.bottomMenu.addButton(backButton);
        this.interactive = true;
    }

    addButton(...buttons: Button[]): void
    {
        buttons.forEach((button) => this.bottomMenu.addButton(button));
        this.resize(this.w, this.h);
    }

    public resize(w: number, h: number): void
    {
        this.bg.resize(w, h);
        this.w = w;
        this.h = h;

        this.bottomMenu.x = this.bottomMenu.options.spacing - (this.base.width / 2);
        this.bottomMenu.y = (h / 2) - 88;
        this.panel.y = -(this.bottomMenu.height / 2);
    }
}

