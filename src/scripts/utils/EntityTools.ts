import {
    Animation3D,
    Animator3DComponent,
    BoxGeometry,
    Entity3D,
    FromAnimationOptions,
    PlaneGeometry } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import ParticleMaterial from '../materials/ParticleMaterial';
import { UnlitHighShaderMaterial } from '../materials/UnlitHighShaderMaterial';
import { app } from '../SubwaySurfersApp';
import Box from './Box';
import RampGeometry from './RampGeometry';
import Random from './Random';

export default class EntityTools
{
    public static entityChildren(entity: Entity3D): Entity3D[]
    {
        // const array = entity?.container?.children ? entity.container.children : [];
        const array = entity?.container?.children || [];

        return array.slice(0);
    }

    public static toggleRenderable(entity: Entity3D, renderable: boolean, recursive = true): void
    {
        if (entity.view3d) entity.view3d.renderable = renderable;

        if (recursive)
        {
            const children = this.entityChildren(entity);

            for (const child of children) this.toggleRenderable(child, renderable, recursive);
        }
    }

    public static setMap(entity: Entity3D, uniform: string, map: PIXI.Texture, recursive = true): void
    {
        if (entity.view3d && entity.view3d.material) (entity.view3d.material as any)[uniform] = map;

        if (recursive)
        {
            const children = this.entityChildren(entity);

            for (const child of children) this.setMap(child, uniform, map, recursive);
        }
    }

    public static findEntity(entity: Entity3D, path: string, depth = 4, features?: string[]): Entity3D | null
    {
        if (!path) throw new Error('A path must be provided');
        const map = this.childrenFlatMap(entity, {}, '', depth);
        let childEntity = null;

        if (map[path]) childEntity = map[path];
        for (const k in map)
        {
            if (k.endsWith(path) && !k.match('_old'))
            {
                childEntity = map[k];
                break;
            }
        }

        if (childEntity && features)
        {
            const map = this.childrenFlatMap(childEntity, {}, '', depth);

            for (const k in map)
            {
                const sub = map[k];

                this.toggleRenderable(sub, features.includes(sub.name));
            }
        }

        return childEntity;
    }

    /**
     * Map maps all loaded entities, or only the ones inside a entity, if provided.
     * @param entity - Entity to be maped, defaults to (PIXI as any).sceneCache
     * @param out - Dictionary of mapped entities by path
     * @param path - Base path to prepend the mapped ones
     */
    // eslint-disable-next-line max-len
    public static childrenFlatMap(entity: Entity3D, out: Record<string, Entity3D> = {}, path = '', depth = 4): Record<string, Entity3D>
    {
        const list = this.entityChildren(entity);

        depth -= 1;
        for (const i in list)
        {
            const sub = list[i] as any;

            const subName = sub.name;
            const subPath = `${path}/${subName}`;

            out[subPath] = sub;
            if (depth > 0) this.childrenFlatMap(sub, out, subPath, depth);
        }

        return out;
    }

    // UTILS ------------------------------------------------------------------

    public static box(box: Box, color?: number, opacity?: number): Entity3D
    {
        if (color === undefined) color = Random.color();
        if (opacity === undefined) opacity = 1;
        const state = new PIXI.State();

        state.blend = opacity < 1;
        state.depthTest = true;
        const geometry = new BoxGeometry(box.width, box.height, box.depth, 1, 1, 64);
        const material = new UnlitHighShaderMaterial({ color, opacity });
        const entity = new Entity3D({ geometry, material, state });

        return entity;
    }

    static ramp(box: Box, color?: number, opacity = 1): Entity3D
    {
        if (color === undefined) color = Random.color();
        const state = new PIXI.State();

        state.blend = opacity < 1;
        state.depthTest = true;
        const geometry = new RampGeometry();
        const material = new UnlitHighShaderMaterial({ color, opacity });
        const entity = new Entity3D({ geometry, material, state });

        return entity;
    }

    static plane(w: number, h: number, opacity = 1, tex: string | PIXI.Texture, blendMode?: number): Entity3D
    {
        const state = new PIXI.State();

        state.blend = opacity < 1;
        state.depthTest = true;
        if (blendMode) state.blendMode = blendMode;
        const map = typeof tex === 'string' ? app.library.getMap(tex) : tex;

        if (!map) throw new Error(`Map not found for ${tex}`);
        const geometry = new PlaneGeometry(w, h, 4, 4);
        const material = new UnlitHighShaderMaterial({ diffuseMap: map, opacity });
        const entity = new Entity3D({ geometry, material, state });

        return entity;
    }

    static particle(w: number, h: number, opacity = 1, tex: string, blendMode?: number): Entity3D
    {
        const state = new PIXI.State();

        state.blend = true;
        state.depthTest = false;
        if (blendMode) state.blendMode = blendMode;
        const map = app.library.getMap(tex);

        if (!map) throw new Error(`Map not found for ${tex}`);
        const geometry = new PlaneGeometry(w, h, 4, 4);
        const material = new ParticleMaterial({ map, opacity });
        const entity = new Entity3D({ geometry, material, state });

        return entity;
    }

    static tint(entity: Entity3D, color: number): void
    {
        if (entity.view3d && entity.view3d.material)
        {
            (entity.view3d.material as any).color = color;
        }
        const children = EntityTools.entityChildren(entity);
        let i = children.length;

        while (i--)
        {
            const child = children[i];

            EntityTools.tint(child, color);
        }
    }

    public static ensureAnimation(entity: Entity3D, fps: number, data: Partial<FromAnimationOptions>): void
    {
        const anim = entity?.getComponent(Animator3DComponent as any) as Animator3DComponent;
        const name = data.name;

        if (!name) throw new Error('[EntityTools] A name for the animation is required');
        if (!anim) throw new Error('[EntityTools] Entity has no animation controller');

        const controllerAnimations = anim['_animations'] as Record<string, Animation3D>;
        const masterAnimation = controllerAnimations['0'];

        const defaultData = {
            name,
            start: 0,
            end: 10,
            animation: masterAnimation,
            speed: 0.015,
            loop: true,
        };

        const animData = { ...defaultData, ...data };

        animData.start = Math.max(animData.start / fps, 0);
        animData.end = Math.min(animData.end / fps, masterAnimation.duration);

        if (!controllerAnimations[name])
        {
            controllerAnimations[name] = Animation3D.fromAnimation(animData);
        }
        else
        {
            controllerAnimations[name].duration = animData.end - animData.start;
            controllerAnimations[name].speed = animData.speed;
            controllerAnimations[name].loop = animData.loop;
        }
    }

    public static playAnimation(entity: Entity3D, name: string, restart = true): void
    {
        const anim = entity?.getComponent(Animator3DComponent as any) as Animator3DComponent;

        if (!anim) throw new Error('[EntityTools] Entity has no animation controller');

        anim['_mixing'] = false;
        anim['_mixRatio'] = 1;
        (anim as any).lastAnimation = null;
        anim.play(name, restart);
        anim.updateAnimation(0.1);
        anim.render();
    }

    public static stopAnimation(entity: Entity3D, name: string, restart = true): void
    {
        const anim = entity?.getComponent(Animator3DComponent as any) as Animator3DComponent;

        if (!anim) throw new Error('[EntityTools] Entity has no animation controller');

        anim['_mixing'] = false;
        anim['_mixRatio'] = 1;
        (anim as any).lastAnimation = null;
        anim.play(name, restart);
        anim.updateAnimation(0.1);
        anim.render();
        (anim as any).animation = null;
    }

    public static findWithComponent(entity: Entity3D, name: string): Entity3D[]
    {
        const entities: Entity3D[] =  [];

        entity.container.traverse((e) =>
        {
            if (e[name as keyof Entity3D])
            {
                entities.push(e);
            }
        });

        return entities;
    }
}
