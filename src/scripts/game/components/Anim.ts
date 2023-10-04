import { Animation3D, Animator3DComponent, Entity3D, Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

const animPlayOptions = {
    loop: false,
    sudden: false,
    mixRatio: 0.3,
    speed: 1,
    restart: true,
};

export type AnimPlayOptions = typeof animPlayOptions;

const defaultAnimSceneData = {
    file: '',
    texture: '',
    fps: 24,
    offset: 0,
    speed: 0.015,
    clips: {} as Record<string, {frames: number[]}>,
};

export type AnimSceneData = typeof defaultAnimSceneData;

export default class Anim extends GameComponent
{
    public container!: Entity3D;
    public scene: any | null = null;
    public fpsGame = 60;
    public currentAction: any | null = null;
    public currentAnimationName = '';
    public currentAnimationClipName = '';
    public currentAnimation: Animation3D | null = null;
    public currentAnimationLoop = false;
    public scenes: Record<string, Entity3D> = {};
    public animations: Record<string, Entity3D> = {};
    public clips: any = {};
    public actions: any = {};
    public debug = false;
    public speed = 1;
    public active = true;
    public character = '';

    protected _enforce = 0;
    protected _queued: any | null = null;
    protected extra: string | null = null;
    protected currentScene: Entity3D | null = null;
    protected nextScene: Entity3D | null = null;
    protected currentController: Animator3DComponent | null = null;
    protected timeout: any;

    constructor(entity: GameEntity)
    {
        super(entity);
        this.container = new Entity3D();
        const parent = this.entity.model || this.entity;

        parent.addChild(this.container);
        this.container.scale.set(100);
    }

    private getAnimationName(clipName: string)
    {
        return this.character ? `${this.character}-${clipName}` : clipName;
    }

    reset(): void
    {
        this.currentAction = null;
        this.stop();
    }

    addScene(sceneData: Partial<AnimSceneData>): void
    {
        const data = { ...defaultAnimSceneData, ...sceneData };

        this.character = data.file.split('-').shift() || '';

        // Check if scene was added already
        if (this.scenes[data.file]) return;

        // Get a scene 3d model from library
        // TODO if possible let's map the texture data within Library init so we don't need to pass it around
        const scene = app.library.getScene(data.file, { map: data.texture });

        // Find out the animation controller component - if there is none then the scene is not an animation
        const animationController = scene.getComponent(Animator3DComponent as any) as Animator3DComponent;

        if (!animationController)
        {
            throw new Error(`[Anim] Scene does not have an animationController: ${data.file}`);
        }

        // Some of the models have this 'Mess' object inside, which I think are more for testing...
        const mess = EntityTools.findEntity(scene, 'Mess', 10);

        // ...and it is handy to remove that here if exists, but probably we will remove from original file
        if (mess && mess.parent) mess.parent.removeChild(mess);

        animationController.autoUpdate = false;
        this.scenes[data.file] = scene;
        // console.log(`[Anim] Scene added: ${data.file}`);

        const offset = data.offset;
        const speed = data.speed;
        const controllerAnimations = animationController['_animations'] as Record<string, Animation3D>;
        const masterAnimation = controllerAnimations['0'];

        for (const clipName in data.clips)
        {
            const name = this.getAnimationName(clipName);

            this.animations[name] = scene;
            // console.log(`[Anim] Animation3D added: '${name}'`);

            const clip = data.clips[clipName];
            const frames = clip.frames;
            const start = Math.max((frames[0] + offset) / data.fps, 0);
            const end = Math.min((frames[1] + offset) / data.fps, masterAnimation.duration);

            const animData = {
                name,
                start,
                end,
                animation: masterAnimation,
                speed,
                loop: false,
            };

            controllerAnimations[name] = Animation3D.fromAnimation(animData);
        }
    }

    getSceneEntity(name: string): Entity3D
    {
        return this.scenes[name];
    }

    public updateCurrentAnimation(): void
    {
        if (!this.currentAnimationName) return;
        this.currentAnimationName = '';
        this.play(this.currentAnimationClipName, { sudden: true, loop: this.currentAnimationLoop });
    }

    play(clipName: string | string[], opts: Partial<AnimPlayOptions> = {}): void
    {
        // Randomize one of the names if an array
        if (Array.isArray(clipName)) clipName = clipName[Math.floor(Math.random() * clipName.length)];

        const name = this.getAnimationName(clipName);

        const scene = this.animations[name];

        if (!scene) throw new Error(`[Anim] Animation not available: '${name}'`);

        if (this.currentAnimationName === name) return;
        this.currentAnimationName = name;

        const o = { ...animPlayOptions, ...opts };

        // console.log(`[Anim] Play: ${name}`);

        // Change scene in stage fi nedeed
        if (scene !== this.currentScene)
        {
            this.nextScene = scene;
        }
        // this.currentScene = scene;

        const controller = scene.getComponent(Animator3DComponent as any) as Animator3DComponent;
        const animation = controller['_animations'][name];

        animation.loop = o.loop;
        controller.play(name, o.restart);

        this.speed = o.speed;
        this.currentAnimation = animation;
        this.currentController = controller;

        if (o.sudden)
        {
            controller['_mixRatio'] = 1;
            (controller as any).lastAnimation = null; // enforce null
            controller['_mixing'] = false;
            this.swapScene(scene);
            controller.updateAnimation(0.1);
            controller.render();
        }
        else
        {
            controller.allowMixing = true;
            controller.mixAmount = o.mixRatio;
        }

        this.currentAnimationClipName = clipName;
        this.currentAnimationLoop = o.loop;
    }

    swapScene(newScene: Entity3D, oldScene: Entity3D | null = null): void
    {
        if (this.currentScene === newScene) return;
        if (!oldScene) oldScene = this.currentScene;

        this.currentScene = newScene;
        this.nextScene = null;
        newScene.scale.set(1);
        newScene.active = true;
        this.container.addChild(newScene);
        // HACK - remove scenes might cause them to not get added properly in future - to investigate
        if (oldScene)
        {
            oldScene.scale.set(0.000001);
            oldScene.active = false;
        }
        // if (oldScene && oldScene.parent) this.container.removeChild(oldScene);
    }

    stop(): void
    {
        // if (!this.currentScene || !this.currentScene.stop) return;
        // this.currentScene.stop();
        console.log(`[Anim] Stop: ${this.currentAnimationName}`);
    }

    update(time: Time): void
    {
        if (!this.active) return;

        const delta = time.frameTime;
        const speed = GameConfig.baseAnimSpeed * this.speed;

        if (this.nextScene && this.nextScene !== this.currentScene)
        {
            this.swapScene(this.nextScene);
        }

        if (this.currentController && delta) this.currentController.updateAnimation(delta);
        if (this.currentAnimation && delta) this.currentAnimation.speed = speed;
    }

    getCurrentAnimationName(): string
    {
        return this.currentAnimationName;
    }
}
