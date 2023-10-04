import { Sprite } from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { makeDashedLine } from '../../utils/makeDashedLine';
import { Button } from '../buttons/Button';
import { UserPanelButton } from '../buttons/UserPanelButton';
import ScreenGlow from '../ScreenGlow';
import UserPanel from '../UserPanel';
import Widget from '../Widget';
import { PauseHuntSection } from './PauseHuntSection';
import { PauseMissionSection } from './PauseMissionSection';

export default class PausePanel extends Widget
{
    public panel!: UserPanel;
    public bg!: ScreenGlow;
    public btnResume!: Button;

    private missionSection!: PauseMissionSection;
    private resumeCallback: () => void;

    constructor(resumeCallback: () => void)
    {
        super();
        this.resumeCallback = resumeCallback;
    }

    onBuild(): void
    {
        this.bg = new ScreenGlow();
        this.addChild(this.bg);
        this.panel = this.addChild(new UserPanel({ icon: 'icon-white-house.png' }));
        const huntSection = this.addChild(new PauseHuntSection());

        huntSection.y = 25 - (this.panel.base.height / 2);

        const settingsButton = new UserPanelButton({ bg: 'navigation-button-blu.png', icon: 'icon-settings.png',
            label: 'settings', onTap: () => app.settings.open() });

        const base = Sprite.from('large-navigation-button-light-green.png');

        base.anchor.set(0.5);
        base.scale.set(0.83);
        this.btnResume = new Button({ label: 'resume', name: 'resume',
            base, labelSize: 55, labelFont: 'Lilita One', onTap: () => this.resumeCallback() });
        this.panel.addButton(settingsButton, this.btnResume);

        const dashed = this.addChild(makeDashedLine({ sections: 22, length: this.panel.base.width - 60,
            space: 8, color: 0x07294a }));

        dashed.y = -125;

        this.missionSection = this.addChild(new PauseMissionSection());

        this.missionSection.y = -110;
    }

    onOpen(): void
    {
        this.missionSection.initMissions();
    }

    onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.x = w / 2;
        this.y = h / 2;

        this.bg.resize(w, h);
        this.panel.resize(w, h);
    }
}
