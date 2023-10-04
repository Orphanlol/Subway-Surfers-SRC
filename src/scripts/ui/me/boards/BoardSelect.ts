import { Linear, TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';

import type { BoardBoostData, BoardData } from '../../../data/boards/BoardData';
import avatar from '../../../game/data/anim/avatar';
import { app } from '../../../SubwaySurfersApp';
import Graph from '../../Graph';
import { CharacterProfile } from '../characters/CharacterProfile';
import UserCurrencies from '../characters/UserCurrencies';
import { HorizontalScroller } from '../HorizontalScroller';
import { BoardThumb } from './BoardThumb';

// TODO pack some of the functionality into the shop button (e.g button.setState)
// move most of the characterScroller funcionality into CharacterScroller
// This and CharacterProfile snowballed into a mess, need a proper refactor
export default class BoardSelect extends PIXI.Container
{
    public w = 0;
    public h = 0;
    public thumbsMask!: PIXI.Graphics;
    public boardsScroller!: HorizontalScroller;

    private profile!: CharacterProfile;
    private boardsList!: BoardThumb[];
    private boardsMap!: Record<string, BoardThumb>;
    private boardSelectionMap!: Record<string, PIXI.Sprite>;
    private userCurrencies!: UserCurrencies;
    private focussedBoard = '';
    private selectedBoard = '';
    private previousBoard = '';

    constructor(baseW: number, baseH: number)
    {
        super();

        this.thumbsMask = Graph.rectColor(
            { w: baseW - 20, h: baseH, x: (-baseW / 2), alpha: 0.4 },
        );
        this.thumbsMask.x = baseW / 2;
        this.addChild(this.thumbsMask);

        this.userCurrencies = new UserCurrencies();
        this.userCurrencies.onRefresh.add(() =>
        {
            this.userCurrencies.x = (baseW / 2) - (this.userCurrencies.width / 2) - 20;
        });
        this.addChild(this.userCurrencies);
        this.userCurrencies.y = -345;

        this.boardsScroller = this.addChild(new HorizontalScroller({
            damp: 0.8,
            leftBound: baseW / 2,
            xScrollMax: -baseW / 2,
        }));
        this.buildBoardThumbs();

        const cs = this.boardsScroller;

        cs.x = -baseW / 2;
        cs.y = (baseH / 2) - (cs.height / 2);
        cs.mask = this.thumbsMask;

        const bgGraph = new PIXI.Graphics()
            .beginFill(0xFF0000, 0.001)
            .drawRect(0, -cs.height, cs.width, cs.height);

        cs.addChild(bgGraph);
        cs.refresh();
        cs.setPosition(cs.xScrollMax, 0);

        const [start, end] = (avatar.game.clips as any).h_run.frames;
        const animData = { start, end, loop: true, name: 'uiBoardIdle' };
        const charId = app.user.character;
        const thumOptions = { thumbId: `${charId}-on-board`, charId, sceneName: `${charId}-game`, animData };

        this.profile = new CharacterProfile('board', thumOptions);
        this.addChild(this.profile);
        this.profile.y = -200;
        this.profile.onSelectOutfit.add(() =>
        {
            this.refreshSelected();
        });

        this.profile.btnSelect.onTap = () => this.confirmSelection();

        const board = app.user.board;

        this.selectedBoard = board;
        this.previousBoard = board;
        this.boardSelectionMap[board].texture = PIXI.Texture.from('icon-selected.png');
        this.boardsMap[board].powers = [...app.user.boardPowers];
    }

    private buildBoardThumbs(): void
    {
        this.boardsMap = {};
        this.boardSelectionMap = {};
        const boardsList: BoardThumb[] = [];

        const shopBoards = app.shop.boards;

        shopBoards.forEach((data) =>
        {
            const boardThumb = new BoardThumb(data);

            this.boardsScroller.addElement(boardThumb);

            boardThumb.x = (boardsList.length * 130) + 70;
            boardThumb.scale.set(0.45);
            this.boardsMap[boardThumb.thumbId] = boardThumb;
            const sprite = this.boardsScroller.addChild(PIXI.Sprite.from('icon-owned.png'));

            sprite.x = boardThumb.x;
            sprite.y = -60;
            sprite.visible = !!data.purchased;
            this.boardSelectionMap[boardThumb.thumbId] = sprite;
            boardsList.push(boardThumb);
            boardThumb.onSelect = (thumb) =>
            {
                const bp = this.profile.boardPowers;
                const i = bp.indexOf(0);

                if (i >= 0) { bp.splice(i, 1); }
                bp.push(0);
                this.focusBoard(thumb as BoardThumb);
            };
        });
        this.boardsList = boardsList;
    }

    private focusBoard(thumb: BoardThumb): void
    {
        if (thumb.thumbId === this.focussedBoard) return;

        TweenLite.to(thumb.scale, 0.15, { x: 0.55, y: 0.55, overwrite: true, ease: Linear.easeInOut });
        this.boardsMap[this.focussedBoard]?.deselect();

        // Stop all thumbs that are not currently being animated
        for (const key in this.boardsMap) !this.boardsMap[key].animating && this.boardsMap[key].stop();

        this.boardsMap[this.focussedBoard]?.animateOut();
        this.focussedBoard = thumb.thumbId;
        this.boardsMap[this.focussedBoard]?.animateIn();
        const slot = Math.max(3, this.boardsList.indexOf(thumb) + 1) - 3;

        this.boardsScroller.easeToSlot(slot);
    }

    private selectBoard():void
    {
        if (this.selectedBoard === this.focussedBoard) return;

        this.selectedBoard = this.focussedBoard;

        this.refresh();
        this.refreshSelected(false);
        BoardThumb.scene.printEntity(this.focussedBoard);
    }

    private confirmSelection(): void
    {
        const user = app.user;
        const powers = this.profile.boardPowers;

        this.boardSelectionMap[this.previousBoard].texture = PIXI.Texture.from('icon-owned.png');
        const prevThumb = this.boardsMap[this.previousBoard];

        prevThumb.powers = [0];
        prevThumb.setBoard();
        this.previousBoard = this.selectedBoard;
        this.boardsMap[this.selectedBoard].powers = [...powers];
        const sprite = this.boardSelectionMap[this.selectedBoard];

        sprite.texture = PIXI.Texture.from('icon-selected.png');
        sprite.visible = true;

        user.board = this.selectedBoard;
        this.profile.selectedPowers = [...powers];
        user.boardPowers = [...powers];
        user.save();
        this.refreshSelected();
    }

    private refresh(): void
    {
        const data = this.boardsMap[this.selectedBoard].shopData;

        this.profile.setBoardData(data);
    }

    async purchaseRequest(item: BoardData|BoardBoostData): Promise<boolean>
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

    private refreshSelected(sameBoard = true): void
    {
        if (!sameBoard)
        {
            this.profile.selectedPowers = [];
            this.profile.boardPowers = [0];
        }
        const btn = this.profile.btnSelect;
        const thumb = this.boardsMap[this.selectedBoard];
        const board = thumb.shopData;
        const enabledPowers = this.profile.boardPowers;

        thumb.setBoard();
        thumb.animateIn();

        this.profile.cost = '';
        const selectedPowerupIndex = enabledPowers[enabledPowers.length - 1] - 1;

        if (selectedPowerupIndex === -1)
        {
            if (!board.purchased)
            {
                this.profile.cost = board.cost;
                btn.update({ label: 'cost', labelParams: { value: board.cost, currency: board.currency } });
                btn.onTap = async () =>
                {
                    const success = await this.purchaseRequest(board);

                    if (success)
                    {
                        this.profile.setBoardData(board);
                    }
                };
                btn.alpha = 1;
            }
            else if (this.selectedBoard === app.user.board)
            {
                this.profile.selectedPowers = [...app.user.boardPowers];
                this.profile.boardPowers = [...app.user.boardPowers];
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
        else
        {
            const powerup = board.powerups[selectedPowerupIndex];

            if (!powerup) return;

            const selectedPowerup = selectedPowerupIndex + 1;

            if (powerup.locked)
            {
                btn.update({ label: 'locked' });
                btn.onTap = null;
                btn.alpha = 0.5;
            }
            else if (!powerup.purchased)
            {
                this.profile.cost = powerup.cost;
                btn.update({ label: 'cost', labelParams: { value: powerup.cost, currency: powerup.currency } });
                btn.onTap = () => this.purchaseRequest(powerup);
                btn.alpha = 1;
            }
            else if (this.profile.selectedPowers.indexOf(selectedPowerup) === -1)
            {
                btn.update({ label: 'turn-on' });
                btn.onTap = () => this.confirmSelection();
                btn.alpha = 1;
            }
            else
            {
                btn.update({ label: 'turn-off' });
                btn.onTap = () =>
                {
                    const i = this.profile.selectedPowers.indexOf(selectedPowerup);

                    this.profile.selectedPowers.splice(i, 1);
                    app.user.boardPowers = [...this.profile.selectedPowers];
                    app.user.save();
                    this.refreshSelected();
                };
                btn.alpha = 1;
            }
        }

        this.profile.refresh(board);
    }

    public async open(): Promise<void>
    {
        app.showLoadingMessage();
        await app.loader.loadSelectedFullCharacter();
        app.hideLoadingMessage();

        const charId = app.user.character;

        const charData = app.shop.characters.find((c) => c.id === charId);

        const [start, end] = (avatar.game.clips as any).h_run.frames;
        const animData = { start, end, loop: true, name: 'uiBoardIdle' };
        const thumbOptions = { thumbId: `${charId}-on-board`, charId, sceneName: `${charId}-game`, animData };

        this.profile['thumb'].setScene(thumbOptions);

        if (!charData) throw new Error(`Character data not found for: ${charId}`);

        this.profile.setCharData(charData, thumbOptions.thumbId, charId);

        const data = this.boardsMap[this.selectedBoard].shopData;

        this.profile.setBoardData(data);

        this.userCurrencies.coins = app.user.coins;
        this.userCurrencies.keys = app.user.keys;
        this.refreshSelected();

        this.focusBoard(this.boardsMap[this.selectedBoard]);
    }

    public close(): void
    {
        this.profile.removeBoard();
    }

    updateTransform(): void
    {
        super.updateTransform();

        this.boardsScroller.update();

        const x = this.boardsScroller.targetX;

        if (Math.abs(this.boardsScroller.xSpeed) > 0.2)
        {
            this.scrollThumbs(x);
        }
        else
        {
            this.boardsScroller.x = x;
            this.selectBoard();
        }
    }

    scrollThumbs(x: number): void
    {
        this.boardsScroller.x = x;

        const board = this.boardsList[this.boardsScroller.getSlotIndex()];

        this.focusBoard(board);
    }
}

