import { UserPanelButton } from '../buttons/UserPanelButton';
import UserPanel from '../UserPanel';
import Widget from '../Widget';
import { MissionSection } from './missions/MissionSection';
import { WordHuntSection } from './wordhunt/WordHuntSection';

type SectionTypes = 'hunt'|'missions';

export class MyTourPanel extends Widget
{
    public w = 0;
    public h = 0;
    public panel!: UserPanel;
    private section: SectionTypes = 'hunt';
    private sections!:{
        hunt: WordHuntSection,
        missions: MissionSection,
    };

    protected onBuild(): void
    {
        this.panel = this.addChild(new UserPanel());

        const buttonOptions = { bg: 'navigation-button-red.png', icon: 'word-hunt-icon.png', label: 'word-hunt' };
        const huntButton = new UserPanelButton(buttonOptions);

        buttonOptions.icon = 'icon-white-missions.png';
        buttonOptions.label = 'missions';
        const missionsButton = new UserPanelButton(buttonOptions);

        huntButton.onTap = () => { this.setSection('hunt'); };
        missionsButton.onTap = () =>
        {
            this.setSection('missions');
        };
        this.panel.addButton(huntButton, missionsButton);
        this.sections = {
            hunt: this.panel.addChild(new WordHuntSection()),
            missions: this.panel.addChild(new MissionSection()),
        };
        this.sections.missions.visible = false;
    }

    setSection(section: SectionTypes): void
    {
        if (section === this.section) return;

        this.sections[this.section].close();
        this.sections[this.section].visible = false;
        this.section = section;
        this.sections[this.section].open();
        this.sections[this.section].visible = true;
    }

    protected onOpen(): void
    {
        this.sections[this.section].open();
    }

    protected onClose(): void
    {
        this.sections[this.section].close();
    }

    protected onResize(): void
    {
        this.w = this.viewportWidth;
        this.h = this.viewportHeight;
        this.x = this.w * 0.5;
        this.y = this.h * 0.5;

        this.panel.resize(this.w, this.h);
        this.sections.hunt.resize(this.panel.base.width, this.panel.base.height);
        this.sections.missions.resize(this.panel.base.width, this.panel.base.height);
    }
}

