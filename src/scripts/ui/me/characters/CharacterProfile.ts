/* eslint-disable @typescript-eslint/no-use-before-define */
import { i18n } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';
import type { BoardBoostData, BoardData } from 'src/scripts/data/boards/BoardData';

import type { ShopCharacter } from '../../../shop/Shop';
import { app } from '../../../SubwaySurfersApp';
import { HorizontalMenu } from '../../buttons/HorizontalMenu';
import { OutfitButton } from '../../buttons/OutfitButton';
import { ShopButton } from '../../buttons/ShopButton';
import { PowerupTag } from '../PowerupTag';
import { CharacterThumb, CharacterThumbOptions } from './CharacterThumb';

// TODO I don;t think the property data should be part of this class
export class CharacterProfile extends PIXI.Container
{
    private thumb: CharacterThumb;
    private costLabel: PIXI.Text;
    private labelName: PIXI.Text;
    private labelOutfit: PIXI.Text;
    private featsMenu: HorizontalMenu<OutfitButton>;
    private data?: ShopCharacter;
    private powerupTag: PowerupTag;

    public outfit = 0;
    public selectedPowers: number[] = [];
    public boardPowers: number[] = [0];
    public btnSelect!: ShopButton;

    public onSelectOutfit: Signal<() =>void>;

    constructor(type: string, thumbData: CharacterThumbOptions)
    {
        super();

        this.onSelectOutfit = new Signal();

        this.labelName = new PIXI.Text('', {
            fill: 0x033b71,
            fontSize: 40,
            fontFamily: 'Titan One',
        });
        this.addChild(this.labelName);

        this.labelOutfit = new PIXI.Text('', {
            fill: 0x033b71,
            fontSize: 20,
            fontFamily: 'Titan One',
        });

        this.addChild(this.labelOutfit);
        this.labelOutfit.y = 50;

        this.powerupTag = this.addChild(new PowerupTag());

        this.featsMenu = new HorizontalMenu({ anchorX: 0, spacing: 20 });
        this.addChild(this.featsMenu);
        this.featsMenu.y = 120;

        this.addOutfitButton(0, `icon-${type}.png`);
        this.addOutfitButton(1, 'icon-outfit.png');
        this.addOutfitButton(2, 'icon-outfit.png');

        this.btnSelect = new ShopButton({ label: 'select' });
        this.btnSelect.x = (this.btnSelect.width / 2) - 23;
        this.btnSelect.y = 260;
        this.btnSelect.scale.set(0.9);
        this.addChild(this.btnSelect);

        this.costLabel = new PIXI.Text('', {
            fill: 0xFFFFFF,
            fontSize: 35,
            fontFamily: 'Titan One',
        });

        this.costLabel.x = this.btnSelect.x;
        this.costLabel.y = this.btnSelect.y;
        this.costLabel.anchor.set(0.5);

        this.thumb = new CharacterThumb(thumbData);
        this.addChild(this.thumb);
        this.thumb.x = -170;
        this.thumb.y = 400;
        this.thumb.scale.set(1.3);

        this.outfit = app.user.outfit;
        this.boardPowers = [...app.user.boardPowers];
        this.selectedPowers = [...app.user.boardPowers];
    }

    private addOutfitButton(index: number, icon: string): void
    {
        const btn = new OutfitButton({ icon,
            onTap: () => this.selectOutfit(index),
        });

        btn.selectIcon.visible = false;
        this.featsMenu.addButton(btn);
    }

    public setCharData(data: ShopCharacter, thumbId:string, charId = thumbId): void
    {
        this.data = data;
        this.labelName.text = i18n.translate(data.id);
        this.thumb.stop();
        this.thumb.setChar(thumbId, charId, this.outfit);
        this.thumb.play('uiIdle');
        this.powerupTag.visible = false;

        // Get correspondent character data with given shop data id
        const charData = app.data.getCharData(data.id);

        // If no character data has been found, then something went wrong
        if (!charData) throw new Error(`No character data found for id: ${data.id}`);

        // Mount outfit list, including 'default' outfit
        const outfitList = [charData, ...charData.outfits];

        this.featsMenu.visible = outfitList.length > 1;

        for (let i = 0; i < outfitList.length; i++)
        {
            const outfit = outfitList[i];
            const btn = this.featsMenu.buttons[i];

            btn.visible = !!outfit.available;

            // Skip outfits flagged as unavailable
            if (!outfit.available) continue;

            btn.locked = outfit.locked;

            // Tint the button parts
            btn.tintBase(outfit.colors[0] ? PIXI.utils.string2hex(outfit.colors[0]) : 0x3b8abc);
            btn.tintIcon(outfit.colors[1] ? PIXI.utils.string2hex(outfit.colors[1]) : 0x10364f);

            // Update lock state
            if (i > 0) btn.locked = data.outfits[i - 1].locked;
        }
    }

    public setBoardData(data: BoardData): void
    {
        this.labelName.text = i18n.translate(data.id);
        this.thumb.stop();
        this.thumb.setBoard(data, this.boardPowers);
        this.thumb.play('uiBoardIdle');
        this.labelName.visible = true;
        this.labelOutfit.visible = false;
        this.powerupTag.y = 75 + (this.powerupTag.height / 2);

        if (data.powerup)
        {
            this.powerupTag.setPowerup(data.powerup);
            this.powerupTag.visible = true;
            this.featsMenu.visible = false;
        }
        else
        {
            this.powerupTag.visible = false;
            this.featsMenu.visible = true;
        }

        this.setPowerups(data);
    }

    setPowerups(data: BoardData):void
    {
        const powerups = data.powerups || [];

        // Mount powerup list, including the 'default' powerup
        const powerupsList = [data, ...powerups];

        this.featsMenu.visible = powerupsList.length > 1;
        for (let i = 0; i < powerupsList.length; i++)
        {
            const powerup = powerupsList[i];
            const btn = this.featsMenu.buttons[i];

            btn.visible = powerup.available;

            // Skip powerups flagged as unavailable
            if (!powerup.available) continue;

            btn.setup({ onTap: () =>
            {
                this.focusPowerup(i, powerupsList);
            } });

            // Update the button icon
            if (i > 0) btn.setIcon(`icon-${powerup.id}.png`);
            btn.locked = powerup.locked;
            btn.selectIcon.visible = i > 0 && !powerup.locked && powerup.purchased;

            // Tint and make it visible
            btn.tintBase(powerup.colors[0] ? PIXI.utils.string2hex(powerup.colors[0]) : 0x3b8abc);
            btn.tintIcon(powerup.colors[1] ? PIXI.utils.string2hex(powerup.colors[1]) : 0x10364f);

            // Update lock state
            if (i > 0) btn.locked = data.powerups[i - 1].locked;
        }
    }

    public removeBoard():void
    {
        if (this.data) CharacterThumb.scene.removeBoard(this.data.id);
    }

    public selectOutfit(index: number): void
    {
        if (index === 0)
        {
            this.labelOutfit.text = '';
        }
        else
        {
            const outfit = this.data?.outfits[index - 1];

            this.labelOutfit.text = outfit?.id ? i18n.translate(outfit.id) : '';
        }

        this.cost = '';
        this.outfit = index;
        if (this.data) this.thumb.setChar(this.data.id.toLowerCase(), this.data.id.toLowerCase(), this.outfit);
        this.onSelectOutfit.dispatch();
    }

    public focusPowerup(index: number, powerups: BoardBoostData[]): void
    {
        const isBaseBoard = index === 0;

        this.labelName.visible = isBaseBoard;
        this.powerupTag.visible = !isBaseBoard;

        const powerup = powerups[index];

        this.powerupTag.setPowerup(powerup.id);
        this.powerupTag.y = this.labelName.y;

        this.cost = '';
        this.boardPowers = this.boardPowers.filter((i) => this.selectedPowers.indexOf(i) >= 0);
        const i = this.boardPowers.indexOf(index);

        if (i >= 0) { this.boardPowers.splice(i, 1); }

        this.boardPowers.push(index);
        this.thumb.setBoard(powerups[0] as BoardData, this.boardPowers);
        this.onSelectOutfit.dispatch();
    }

    public refresh(data: BoardData): void
    {
        this.featsMenu.buttons.forEach((b, i) =>
        {
            if (i === 0) return;

            b.isSelected = this.selectedPowers.indexOf(i) >= 0;
            b.selectIcon.visible = !!data.powerups[i - 1]?.purchased;
        });
    }

    // eslint-disable-next-line accessor-pairs
    set cost(cost: number|string)
    {
        this.costLabel.text = `${cost}`;
        this.btnSelect.update({ label: 'cost', labelParams: { value: cost } });
    }
}
