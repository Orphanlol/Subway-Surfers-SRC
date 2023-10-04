import { Entity3D, FromAnimationOptions, Scene3D, Vector3 } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';

export type AnimationOptions = {name:string} & Partial<FromAnimationOptions>;
interface SceneData
{
    id: string;
    entity: Entity3D;
    size: number;
    animData: AnimationOptions;
}
export class ThumbScene3D extends Scene3D
{
    protected playing: boolean;
    protected animating: string[];
    protected entitiesMap: Map<string, Entity3D>;
    protected textures: Map<string, PIXI.RenderTexture>;
    protected state: PIXI.State;

    constructor()
    {
        super({
            renderer: app.stage.renderer,
            culling: false,
            clear: true,
        });

        this.playing = false;
        this.animating = [];
        this.entitiesMap = new Map();
        this.textures = new Map();

        this.state = new PIXI.State();
        this.state.depthTest = true;
        this.state.blend = true;
    }

    public getTexture(...args: any[]): void
    {
        // For subclasses
    }

    public renderStart(): void
    {
        this.onPrerender.run(this.time);
        this['_onRenderEntities'].run(this.time);
    }

    protected refresh(): void
    {
        if (this.entitiesMap.size) return;
        app.stage.stage.addChild(this.view3d.stage);
        this.view3d.container['_render'] = this.renderChildren.bind(this);
        this.view3d.camera.z = 0.6;
        this.view3d.camera.y = 0.6;
        this.view3d.camera.camera.lookAtTarget = new Vector3(0, 0.05, 0);
        this.view3d.camera.camera.fov = 0.15;
    }

    public printEntity(name: string): void
    {
        const char = this.entitiesMap.get(name);

        if (char) console.log(EntityTools.childrenFlatMap(char, {}, '', 5));
    }

    public play(name: string, animation?: string): void
    {
        this.playing = true;

        const char = this.entitiesMap.get(name);

        if (!char) return;

        if (animation) EntityTools.playAnimation(char, animation, true);
        this.animating.push(name);
    }

    public stop(...names: string[]): void
    {
        names.forEach((name) =>
        {
            const index = this.animating.indexOf(name);

            if (index < 0) return;
            this.animating.splice(index, 1);
        });

        if (!this.animating.length) this.playing = false;
    }

    public stopAll(): void
    {
        this.playing = false;
        this.animating = [];
    }

    protected renderChildren(): void
    {
        if (!this.playing || this.animating.length === 0) return;
        this.update(true);

        this.animating.forEach((name) =>
        {
            const entity = this.entitiesMap.get(name) as Entity3D;
            const texture = this.textures.get(name) as PIXI.RenderTexture;

            entity.active = true;
            this.view3d.renderTexture = texture;
            this.view3d['_renderChildren'](app.stage.renderer);
            entity.active = false;
        });
    }

    public update(force = false): void
    {
        if (!this.playing && !force) return;
        super.update();
    }

    public addScene(id: string, entity: Entity3D, size: number): void
    {
        this.refresh();

        entity.name = id;
        this.entitiesMap.set(id, entity);

        const texture = PIXI.RenderTexture.create({
            width: size,
            height: size,
            scaleMode: PIXI.SCALE_MODES.LINEAR,
            resolution: 1,
        });

        (texture.baseTexture as any).framebuffer.addDepthTexture();
        this.textures.set(id, texture);

        this.addChild(entity);

        this.play(id);
        this.renderChildren();
        this.stopAll();
    }

    public addAnimatedScene({ id, entity, size, animData }: SceneData): void
    {
        EntityTools.ensureAnimation(entity, 24, animData);
        this.play(id, animData.name);
        this.addScene(id, entity, size);
        EntityTools.stopAnimation(entity, animData.name, true);
    }

    protected updateScene(scene: Entity3D, path: string, texture: string, features?: string[]): void
    {
        const entity = EntityTools.findEntity(scene, path, 4, features);

        if (!entity)
        {
            console.warn(`Entity not found at path: ${path}`);

            return;
        }
        EntityTools.setMap(entity, 'diffuseMap', app.library.getMap(texture));
    }
}
