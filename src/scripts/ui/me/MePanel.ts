import * as PIXI from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { UserPanelButton } from '../buttons/UserPanelButton';
import UserPanel from '../UserPanel';
import Widget from '../Widget';
import AwardsUIList from './awards/AwardUIList';
import BoardSelect from './boards/BoardSelect';
import CharacterSelect from './characters/CharacterSelect';

type SectionTypes = 'characters'|'boards'|'awards';

export class MePanel extends Widget
{
    public w = 0;
    public h = 0;
    public thumbsMask!: PIXI.Graphics;
    public panel!: UserPanel;
    private section: SectionTypes = 'characters';
    private sections!: {
        characters: CharacterSelect,
        boards: BoardSelect,
        awards: AwardsUIList
    };

    private awardsButton!: UserPanelButton;

    protected onBuild(): void
    {
        this.panel = new UserPanel();
        this.addChild(this.panel);

        const charactersButton = new UserPanelButton({
            bg: 'navigation-button-green.png',
            icon: 'icon-user.png',
            label: 'characters',
        });

        const boardsButton = new UserPanelButton({
            bg: 'navigation-button-green.png',
            icon: 'icon-boards.png',
            label: 'boards',
        });

        this.awardsButton = new UserPanelButton({
            bg: 'navigation-button-green.png',
            icon: 'icon-white-awards.png',
            label: 'awards',
        });

        charactersButton.onTap = () => { this.setSection('characters'); };
        boardsButton.onTap = () => { this.setSection('boards'); };
        this.awardsButton.onTap = () => { this.setSection('awards'); };
        this.panel.addButton(charactersButton, boardsButton, this.awardsButton);

        this.sections = {
            characters: this.addChild(new CharacterSelect(this.panel.base.width, this.panel.base.height)),
            boards: this.addChild(new BoardSelect(this.panel.base.width, this.panel.base.height)),
            awards: this.addChild(new AwardsUIList(this.panel.base.width, this.panel.base.height)),
        };
        this.sections.characters.visible = true;
        this.sections.boards.visible = false;
        this.sections.awards.visible = false;
    }

    async setSection(section: SectionTypes): Promise<void>
    {
        if (section === this.section) return;

        this.sections[this.section].close();
        this.sections[this.section].visible = false;
        this.section = section;
        await this.sections[this.section].open();
        this.sections[this.section].visible = true;
    }

    protected onOpen(): void
    {
        this.sections[this.section].open();
        app.awards.onUpdate.add(this.updateBadges, this);
        this.updateBadges();
    }

    protected onClose(): void
    {
        app.awards.onUpdate.remove(this.updateBadges, this);
        this.sections[this.section].close();
    }

    protected onResize(): void
    {
        this.w = this.viewportWidth;
        this.h = this.viewportHeight;
        this.x = this.w * 0.5;
        this.y = this.h * 0.5;

        this.panel.resize(this.w, this.h);
    }

    private updateBadges(): void
    {
        if (app.awards.hasPrizeToCollect())
        {
            this.awardsButton.showBadge();
        }
        else
        {
            this.awardsButton.hideBadge();
        }
    }
}

