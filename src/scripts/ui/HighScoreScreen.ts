/* eslint-disable @typescript-eslint/no-use-before-define */
import { i18n, I18nLabel } from '@goodboydigital/astro';
import { Entity3D, Vector3 } from '@goodboydigital/odie';
import { Container, Sprite, Text, Ticker } from 'pixi.js';
import { Signal } from 'signals';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import EntityTools from '../utils/EntityTools';
import Math2 from '../utils/Math2';
import Poki from '../utils/Poki';
import Random from '../utils/Random';
import { Sprite3D } from './Sprite3D';
import Widget from './Widget';

export class HighScoreScreen extends Widget
{
    private bg!: Sprite;
    private speedStripes!: SpeedStripes;
    private character!: CharacterSprite3D;
    private title!: I18nLabel;
    private message!: Text;
    private score!: Text;
    private blockEvents = false;
    public onExit = new Signal<() => void>();

    public onBuild(): void
    {
        this.bg = Sprite.from('highscorescreen-bg.png');
        this.addChild(this.bg);
        this.bg.anchor.set(0.5);

        this.speedStripes = new SpeedStripes();
        this.addChild(this.speedStripes);

        this.character = new CharacterSprite3D();
        this.addChild(this.character);
        this.character.scale.set(1.25);

        this.title = new I18nLabel('new_high_score', {
            fontFamily: 'Lilita One',
            fontSize: 50,
            anchorX: 0.5,
            anchorY: 0.5,
            fill: 0x000000,
        });
        this.addChild(this.title);

        this.score = new Text('00000', {
            fontFamily: 'Lilita One',
            fontSize: 70,
            fill: 0xFFFFFF,
        });
        this.score.anchor.set(0.5);
        this.addChild(this.score);

        this.message = new Text('', {
            align: 'center',
            fontFamily: 'Lilita One',
            fontSize: 40,
            fill: 0xFFFFFF,
        });
        this.message.anchor.set(0.5);
        this.addChild(this.message);

        Poki.SDK.onBreakStart.add(() =>
        {
            this.blockEvents = true;
        });
        Poki.SDK.onBreakComplete.add(() =>
        {
            this.blockEvents = false;
        });
    }

    protected onOpen(): void
    {
        this.character.setCharacter(app.user.character, app.user.outfit);
        this.bg.interactive = true;
        this.bg.on('pointertap', this.onPointerTap);
        window.addEventListener('keydown', this.onKeyDown);
        this.character.view.scale.x = 0.5;
        this.character.view.scale.y = -this.character.view.scale.x;
        this.character.view.x = 400;
        this.character.view.y = 50;
        this.score.text = String(app.game.stats.score);
        this.message.text = i18n.translate(`prize-screen-continue${GameConfig.mobile ? '-mobile' : ''}`);
        this.message.alpha = -5;

        app.sound.stopAllFx();
        app.sound.musicFadeOut();
        app.sound.play('unlock');
    }

    protected onClose(): void
    {
        app.sound.musicFadeIn();
        this.bg.interactive = false;
        this.bg.off('pointertap', this.onPointerTap);
        window.removeEventListener('keydown', this.onKeyDown);
    }

    public updateTransform(): void
    {
        super.updateTransform();
        const ease = 0.005 * Ticker.system.deltaTime;

        this.character.view.x = Math2.lerp(this.character.view.x, 0, ease);
        this.character.view.y = Math2.lerp(this.character.view.y, 0, ease);
        this.character.view.scale.x = Math2.lerp(this.character.view.scale.x, 1, ease);
        this.character.view.scale.y = -this.character.view.scale.x;
        this.message.alpha = Math2.lerp(this.message.alpha, 1, 0.01 * Ticker.system.deltaTime);
    }

    protected onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.bg.x = w * 1.5;
        this.bg.y = h * 0.6;
        this.bg.width = (w > h ? w : h) * 4;
        this.bg.height = (w > h ? w : h) * 1.3;
        this.bg.scale.y = (this.bg.height / 512) * -1;

        this.speedStripes.x = this.bg.x;
        this.speedStripes.y = this.bg.y;
        this.speedStripes.scale.x = this.bg.scale.x;
        this.speedStripes.scale.y = this.bg.scale.y;

        this.character.x = w / 2;
        this.character.y = h / 2;

        this.title.x = w / 2;
        this.title.y = 60;

        this.score.x = this.title.x;
        this.score.y = this.title.y + 60;

        this.message.x = w / 2;
        this.message.y = h - 80;
    }

    public exit(): void
    {
        if (!this._opened || this.message.alpha < 0.2) return;
        this.close();
        if (this.onExit) this.onExit.dispatch();
    }

    private onKeyDown = (e: KeyboardEvent) =>
    {
        if (e.repeat || this.blockEvents) return;

        if (e.key === 'Spacebar' || e.key === ' ') this.exit();
    };

    private onPointerTap = () =>
    {
        this.exit();
    };
}

class SpeedStripes extends Container
{
    private w = 1024;
    private h = 1024;

    constructor()
    {
        super();
        this.w = 512;
        this.h = 512;
        for (let i = 0; i < 10; i++)
        {
            const stripe = Sprite.from('celebration-stripe.png');

            this.addChild(stripe);
            this.resetStripe(stripe);
        }
    }

    public updateTransform(): void
    {
        super.updateTransform();
        for (const stripe of this.children)
        {
            if (stripe.x > 0) this.resetStripe(stripe as Sprite, -this.w / 2);

            const speed = (stripe as any)._speed * Ticker.system.deltaTime;
            const angle = Math.atan2(stripe.y, stripe.x);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            stripe.x -= vx;
            stripe.y -= vy;
            stripe.rotation = angle;
        }
    }

    private resetStripe(stripe: Sprite, x? : number)
    {
        stripe.anchor.set(0.05, 0.5);
        stripe.scale.set(0.15, Random.range(0.07, 0.12));
        stripe.alpha = 0.75;
        stripe.x = x ?? Random.range(-this.w * 0.5, 0);
        stripe.y = Random.range(-this.h * 0.25, this.h * 0.5);
        (stripe as any)._speed = Random.range(3, 5);
    }
}

class CharacterSprite3D extends Sprite3D
{
    public shadow!: Sprite;
    private entity!: Entity3D;
    private currentId = '';
    private currentOutfit = -1;

    constructor()
    {
        super(app.stage.renderer);
    }

    public async setCharacter(id: string, outfit = 0): Promise<void>
    {
        const scene = `${id}-game`;

        // Ensure character is loaded
        if (!app.library.hasScene(scene)) await app.loader.loadCharacter(id, true);

        if (this.currentId === id && this.currentOutfit === outfit) return;
        this.currentId = id;
        this.currentOutfit = outfit;

        if (this.entity) this.scene.removeChild(this.entity);

        this.entity = app.library.getScene(scene);
        this.scene.addChild(this.entity);

        this.updateCharacter(this.entity, id, outfit);

        EntityTools.ensureAnimation(this.entity, 24, {
            name: 'run',
            start: 34,
            end: 44,
            speed: 0.003,
            loop: true,
        });
        EntityTools.stopAnimation(this.entity, 'run', true);
        EntityTools.playAnimation(this.entity, 'run', true);

        this.camera.x = 0.5;
        this.camera.y = 0;
        this.camera.z = 0.8;
        this.camera.camera.lookAtTarget = new Vector3(0, 0.05, 0);
        this.camera.camera.fov = 0.15;

        if (!this.shadow) this.shadow = Sprite.from('shadow.png');
        this.addChildAt(this.shadow, 0);
        this.shadow.anchor.set(0.5);
        this.shadow.scale.set(1, 0.2);
        this.shadow.alpha = 0.3;
    }

    private updateCharacter(scene: Entity3D, character: string, outfitIndex = 0): void
    {
        const data = app.data.getCharData(character);

        if (!data) throw new Error(`[Character] Character data not found: ${character}`);

        const outfit = outfitIndex ? data.outfits[outfitIndex - 1] : data;
        const entity = EntityTools.findEntity(scene, 'SkeletalMeshComponent0', 4, outfit.features);

        if (!entity) return;

        EntityTools.setMap(entity, 'diffuseMap', app.library.getMap(outfit.texture));
    }

    public updateTransform(): void
    {
        super.updateTransform();
        if (this.shadow)
        {
            this.shadow.scale.x = this.view.scale.x * 2;
            this.shadow.scale.y = this.view.scale.x * 0.2;
            this.shadow.x = this.view.x;
            this.shadow.y = this.view.y + (this.view.height / 2) - (60 * this.view.scale.x);
        }
    }
}
