import { Linear, TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';

import avatar from '../../../game/data/anim/avatar';
import type { ShopItem } from '../../../shop/Shop';
import { app } from '../../../SubwaySurfersApp';
import Graph from '../../Graph';
import { HorizontalScroller } from '../HorizontalScroller';
import { CharacterProfile } from './CharacterProfile';
import { CharacterThumb } from './CharacterThumb';
import UserCurrencies from './UserCurrencies';

// TODO pack some of the functionality into the shop button (e.g button.setState)
// move most of the characterScroller funcionality into CharacterScroller
export default class CharacterSelect extends PIXI.Container
{
    public w = 0;
    public h = 0;
    public thumbsMask!: PIXI.Graphics;
    public characterScroller!: HorizontalScroller;

    private profile!: CharacterProfile;
    private charactersList!: CharacterThumb[];
    private charactersMap!: Record<string, CharacterThumb>;
    private charSelectionMap!: Record<string, PIXI.Sprite>;
    private characterCurrencies!: UserCurrencies;
    private focussedCharacter = '';
    private selectedCharacter = '';
    private previousCharacter = '';

    constructor(baseW: number, baseH: number)
    {
        super();

        this.thumbsMask = Graph.rectColor(
            { w: baseW - 20, h: baseH, x: (-baseW / 2), alpha: 0.4 },
        );
        this.thumbsMask.x = baseW / 2;
        this.addChild(this.thumbsMask);

        this.characterCurrencies = new UserCurrencies();
        this.characterCurrencies.onRefresh.add(() =>
        {
            this.characterCurrencies.x = (baseW / 2) - (this.characterCurrencies.width / 2) - 20;
        });
        this.addChild(this.characterCurrencies);
        this.characterCurrencies.y = -345;

        const character = app.user.character;
        const [start, end] = avatar.idle.clips.popupIdle.frames;
        const animData = { start, end, loop: true, name: 'uiIdle' };
        const thumOptions = { sceneName: `${character}-idle`, animData, thumbId: character };

        this.profile = new CharacterProfile('character', thumOptions);
        this.addChild(this.profile);
        this.profile.y = -200;
        this.profile.onSelectOutfit.add(() =>
        {
            this.refreshSelectedOutfit();
        });

        this.profile.btnSelect.onTap = () => this.confirmSelection();

        this.characterScroller = this.addChild(new HorizontalScroller({
            damp: 0.8,
            leftBound: baseW / 2,
            xScrollMax: -baseW / 2,
        }));
        this.buildCharThumbs();

        const cs = this.characterScroller;

        cs.x = -baseW / 2;
        cs.y = (baseH / 2) - (cs.height / 2);
        cs.mask = this.thumbsMask;

        const bgGraph = new PIXI.Graphics()
            .beginFill(0xFF0000, 0.001)
            .drawRect(0, -cs.height, cs.width, cs.height);

        cs.addChild(bgGraph);
        cs.refresh();
        cs.setPosition(cs.xScrollMax, 0);

        this.profile.outfit = app.user.outfit;
        this.focussedCharacter = character;
        this.selectedCharacter = character;
        this.previousCharacter = character;
        this.charSelectionMap[character].texture = PIXI.Texture.from('icon-selected.png');
        this.refresh();
    }

    private buildCharThumbs(): void
    {
        this.charactersMap = {};
        this.charSelectionMap = {};
        const charList: CharacterThumb[] = [];

        const shopCharacters = app.shop.characters;

        const [start, end] = avatar.idle.clips.popupIdle.frames;
        const animData = { start, end, loop: true, name: 'uiIdle' };

        shopCharacters.forEach((data) =>
        {
            const thumbOptions = { sceneName: `${data.id}-idle`, animData, thumbId: data.id };
            const charThumb = new CharacterThumb(thumbOptions);

            charThumb.shopData = data;
            this.characterScroller.addElement(charThumb);

            charThumb.x = (charList.length * 130) + 70;
            charThumb.scale.set(0.45);

            const sprite = this.characterScroller.addChild(PIXI.Sprite.from('icon-owned.png'));

            sprite.x = charThumb.x;
            sprite.y = -60;
            sprite.visible = !!data.purchased;
            this.charSelectionMap[charThumb.thumbId] = sprite;
            this.charactersMap[charThumb.thumbId] = charThumb;
            charList.push(charThumb);
            const index = charList.length;

            charThumb.onSelect = (thumb) =>
            {
                this.focusCharacter(thumb as CharacterThumb);
                const slot = Math.max(3, index) - 3;

                this.characterScroller.easeToSlot(slot);
            };
        });
        this.charactersList = charList;
    }

    private focusCharacter(thumb: CharacterThumb): void
    {
        if (thumb.thumbId === this.focussedCharacter) return;

        TweenLite.to(thumb.scale, 0.15, { x: 0.55, y: 0.55, overwrite: true, ease: Linear.easeInOut });
        this.charactersMap[this.focussedCharacter]?.deselect();
        this.focussedCharacter = thumb.thumbId;
    }

    private selectCharacter():void
    {
        if (this.selectedCharacter === this.focussedCharacter) return;

        this.selectedCharacter = this.focussedCharacter;
        this.profile.outfit = 0;
        this.refresh();
        this.refreshSelectedOutfit();
        CharacterThumb.scene.printEntity(this.focussedCharacter);
    }

    private confirmSelection(): void
    {
        const user = app.user;

        this.charSelectionMap[this.previousCharacter].texture = PIXI.Texture.from('icon-owned.png');
        this.previousCharacter = this.selectedCharacter;
        const sprite = this.charSelectionMap[this.selectedCharacter];

        sprite.texture = PIXI.Texture.from('icon-selected.png');
        sprite.visible = true;

        user.outfit = this.profile.outfit;
        user.character = this.selectedCharacter;
        user.save();
        this.refreshSelected();
    }

    private refresh(): void
    {
        const data = this.charactersMap[this.selectedCharacter].shopData;

        CharacterThumb.scene.stopAll();

        this.profile.setCharData(data, data.id);
        this.profile.selectOutfit(this.profile.outfit);
    }

    private refreshSelectedOutfit()
    {
        this.refreshSelected();
        const character = this.charactersMap[this.selectedCharacter].shopData;

        const btn = this.profile.btnSelect;

        if (this.profile.outfit === 0)
        {
            if (!character.purchased)
            {
                this.profile.cost = character.cost;
                btn.update({ label: 'cost', labelParams: { value: character.cost, currency: character.currency } });
                btn.onTap = async () =>
                {
                    const success = await this.purchaseRequest(character);

                    if (success)
                    {
                        this.profile.setCharData(character, character.id);
                    }
                };
                btn.alpha = 1;
            }
        }
        else
        {
            const outfit = character.outfits[this.profile.outfit - 1];

            if (outfit.locked)
            {
                btn.update({ label: 'locked' });
                btn.onTap = null;
                btn.alpha = 0.5;
            }
            else if (!outfit.purchased)
            {
                this.profile.cost = outfit.cost;
                btn.update({ label: 'cost', labelParams: { value: outfit.cost, currency: outfit.currency } });
                btn.onTap = () => this.purchaseRequest(outfit);
                btn.alpha = 1;
            }
        }
    }

    async purchaseRequest(item: ShopItem): Promise<boolean>
    {
        const success = await app.shop.purchase(item);

        if (success)
        {
            this.confirmSelection();
        }
        else
        {
            app.notEnoughCurrency.setup(item.cost, () => null, item.currency);
            app.notEnoughCurrency.open();
        }

        return success;
    }

    private refreshSelected(): void
    {
        const sameCharacter = app.user.character === this.selectedCharacter;
        const sameOutfit = app.user.outfit === this.profile.outfit;
        const btn = this.profile.btnSelect;

        this.profile.cost = '';

        if (sameCharacter && sameOutfit)
        {
            btn.update({ label: 'selected' });
            btn.onTap = null;
            btn.alpha = 0.5;
        }
        else
        {
            btn.update({ label: 'select' });
            btn.onTap = () => this.confirmSelection();
            btn.alpha = 1;
        }
    }

    public open(): void
    {
        this.characterCurrencies.coins = app.user.coins;
        this.characterCurrencies.keys = app.user.keys;

        for (const key in this.charactersMap)
        {
            const smallThumb = this.charactersMap[key];

            smallThumb.play('uiIdle');
        }
    }

    public close(): void
    {
        // TODO make this a function of the base class
    }

    updateTransform(): void
    {
        super.updateTransform();

        this.characterScroller.update();

        const x = this.characterScroller.targetX;

        if (Math.abs(this.characterScroller.xSpeed) > 0.2)
        {
            this.scrollThumbs(x);
        }
        else
        {
            this.characterScroller.x = x;
            this.selectCharacter();
        }
    }

    scrollThumbs(x: number): void
    {
        this.characterScroller.x = x;

        const charater = this.charactersList[this.characterScroller.getSlotIndex()];

        this.focusCharacter(charater);
    }
}

