/* eslint-disable quote-props */

import { Entity3D, Geometry3D, StandardMaterial } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import { UnlitHighShaderMaterial } from '../materials/UnlitHighShaderMaterial';
import { SubwaySurfersApp } from '../SubwaySurfersApp';
import { OdieUtils } from './OdieUtils';

/** Map scene names with texture names */
const sceneMapTable: Record<string, string> = {
    'environment-idle': 'environment-tex',
    'environment-basic': 'environment-tex',
    'environment-full': 'environment-tex',
    'trains-idle': 'trains-tex',
    'trains-basic': 'trains-tex',
    'trains-full': 'trains-tex',
    'model-dog': 'enemies',
    'model-guard': 'enemies',
    'props': 'props-tex',
    'props-start': 'props-tex',
    'model-tricky-idlexmas': 'tricky-tex',
    'board_default_base': 'board-hoverboard-tex',
};

/** Common options to create/mount entities */
export interface LibraryOptions
{
    map?: string | PIXI.Texture;
    opacity?: number;
    material?: PIXI.Shader | any;
    blendMode?: number;
    color?: number;
    scale?: number;
    rails?: boolean;
    fog?: boolean;
}

/**
 * Fetch models and textures from app resource cache and organise them on it's own way,
 * considering that a single file can contain several models and each model
 * can be formed by one or multiple geometries.
 * For intance, `library.getEntity('train_standard')` should provide a train
 * entity with the right material and texture, regardless the original file,
 * as long it is loaded.
 */
export class Library
{
    public app: SubwaySurfersApp;

    /** All geometries found on Cache, useful for composing and extract grouped objects */
    public geometries: Record<string, PIXI.Geometry> = {};

    /** Textures found in TextureCache */
    public maps: Record<string, PIXI.Texture> = {};

    /** Scenes are full 3D files into an entity */
    public scenes: Record<string, any> = {};

    /** Map a scene name to each geometry name */
    public geometrySceneNames: Record<string, string> = {};

    /** Map a scene name to each geometry name */
    public geometryByHash: Record<string, Geometry3D> = {};

    /** Map a scene name to each geometry name */
    public geometryGroups: Record<string, string[]> = {};

    /** Map a scene name to each geometry name */
    public sceneByGeometryHash: Record<string, string> = {};

    private characterDataCompleted = false;

    constructor(app: SubwaySurfersApp)
    {
        StandardMaterial.MAX_BONES = 64;
        this.app = app;
        this.app.resources.manager.onLoadComplete.connect(() => { this.refresh(); });
    }

    /**
     * Do the first refresh
     */
    public init(): void
    {
        this.refresh();
    }

    private completeCharData(): void
    {
        const charData = this.app.data.getAvailableCharacters();

        if (!charData || this.characterDataCompleted) return;
        this.characterDataCompleted = true;

        for (let i = 0; i < charData.length; i++)
        {
            const { id } = charData[i];

            sceneMapTable[`${id}-game`] = `${id}-tex`;
            sceneMapTable[`${id}-idle`] = `${id}-tex`;
        }
    }

    /**
     * Get app resource cache
     */
    public get cache(): Record<string, any>
    {
        return this.app.resources.cache;
    }

    /**
     * Update internal cache according to what is found in app resources cache
     */
    public refresh(): void
    {
        // Find geometries and scenes
        this.completeCharData();
        for (const f in this.cache)
        {
            // Name without any urls params
            const plainName = f.split('?').shift() || f;

            // Check if is a 3d model
            if (plainName.endsWith('.gb'))
            {
                // Strip out slashes and extensions from the name
                const sceneName = shortName(plainName);

                // Continue if scene has already been parsed
                if (this.scenes[sceneName]) continue;

                // Loop through existing geometries
                for (const geomHash in this.cache[f].geometryHash)
                {
                    // Turn 'train_standard + 1' into 'train_standard'
                    const geomName = String(geomHash.split(' +').shift());

                    // Cache that geometry in a singe map
                    this.geometryByHash[geomHash] = this.cache[f].geometryHash[geomHash];

                    // Form a new geometry group if does not exist yet
                    if (!this.geometryGroups[geomName]) this.geometryGroups[geomName] = [];

                    // Append that raw geometry hash into the group
                    if (this.geometryGroups[geomName].indexOf(geomHash) < 0) this.geometryGroups[geomName].push(geomHash);

                    // Skip if geometry already there
                    if (this.geometries[geomName]) continue;

                    // Add geometry into internal geometry map
                    this.geometries[geomName] = this.cache[f].geometryHash[geomHash];

                    // Add scene name to the geometry/scene map
                    this.geometrySceneNames[geomName] = sceneName;
                }

                // Save scene in internal map
                this.scenes[sceneName] = this.cache[f];
            }

            // Check if is a texture
            if (plainName.endsWith('.png') || plainName.endsWith('.webp'))
            {
                // Strip out funny characters
                let name = shortMapName(plainName).replace(/@[\d]*\.?[\d]x/g, '');

                // Strip out extension
                name = name.replace('.webp', '');
                name = name.replace('.png', '');

                // Skip if already registered
                if (this.maps[name]) continue;

                // Save texture in internal map
                this.maps[name] = this.cache[f];
            }
        }

        // Log everything to make easier to debug
        console.log('[Library] ----- REFRESH -----');
        console.log('[Library]', this);
        console.log('[Library] -------------------');
    }

    /**
     * From given names, return the first one that exists
     * Because in different city themes, names of a geometry can change.
     * New York = 'sl_monument_4'
     * Seoul    = 'sl_monument_04'
     * @param names - List of possible names
     */
    public whichEntity(...names: string[]): string | null
    {
        for (const i in names)
        {
            if (this.geometries[names[i]]) return names[i];
        }

        return null;
    }

    /**
     * Check if scene is loaded and available
     * @param sceneName - Name of the scene to check
     */
    public hasScene(sceneName: string): boolean
    {
        return !!this.scenes[sceneName];
    }

    /**
     * Get a full scene file as an entity
     * @param sceneName - Name of the scene
     * @param opts - Options for the entity
     */
    public getScene(sceneName: string, opts: LibraryOptions = {}): Entity3D
    {
        if (!opts.map) opts.map = sceneMapTable[sceneName];
        const sceneLibrary = this.scenes[sceneName] as any;

        const scene = sceneLibrary.getScene() as any;
        const map = opts.map instanceof PIXI.Texture ? opts.map : this.maps[opts.map];

        applyMap(scene, map);

        return scene;
    }

    /**
     * Get an entity from a geometry group name
     * For instance, getEntity('train') will return an entity
     * formed by 'train + ' + 'train + 1' + 'train + 2'
     * @param groupName - Name of the geometry group
     * @param opts - Options for that entity
     */
    public getEntity(groupName: string, opts: LibraryOptions = {}): Entity3D
    {
        // If that group name is formed by a single geometry, then we can return an entity from that
        if (this.geometryGroups[groupName].length === 1)
        {
            return this.getEntityFromGeometry(groupName, this.geometryGroups[groupName][0], opts);
        }

        // In case of multiple geometrues, a container should be 'mounted'
        return this.mountEntity(new Entity3D(), groupName, opts);
    }

    /**
     * Mount inside an entity all geometries found under a group name
     * For instance, `mountEntity(myEntity, 'train')` will create inside `myEntity`
     * one entity for each 'train + ', 'train + 1' and 'train + 2' geometries.
     * @param groupName - Name of the geometry group
     * @param geomHash - Name of the geometry group
     * @param opts - Options for that entity
     */
    public mountEntity(entity: Entity3D, groupName: string, opts: LibraryOptions = {}): Entity3D
    {
        const group = this.geometryGroups[groupName];

        for (const geomHash in group)
        {
            const en = this.getEntityFromGeometry(groupName, group[geomHash], opts);

            entity.addChild(en);

            // Inject parts in entity
            if (!(entity as any).parts) (entity as any).parts = {};
            (entity as any).parts[geomHash] = en;
        }

        return entity;
    }

    /**
     * Get an entity from a geometry group name
     * @param groupName - Name of the geometry group
     * @param geomHash - Original geometry hash
     * @param opts - Options for that entity
     */
    private getEntityFromGeometry(groupName: string, geomHash: string, opts: LibraryOptions = {}): Entity3D
    {
        const geometry = this.geometryByHash[geomHash];

        const sceneName = this.geometrySceneNames[groupName];

        if (!opts.map) opts.map = sceneMapTable[sceneName];
        const map = typeof opts.map === 'string' ? this.getMap(opts.map) : opts.map;
        const MaterialClass = opts.material ? opts.material : UnlitHighShaderMaterial;
        // eslint-disable-next-line max-len
        const material = opts.color ? new MaterialClass({ color: opts.color, customFog: !!opts.fog }) : new MaterialClass({ map, diffuseMap: map, customFog: true, rails: !!opts.rails });
        const state = new PIXI.State();

        if (opts.opacity) material.opacity = opts.opacity;
        state.depthTest = true;
        state.blend = opts.opacity ? opts.opacity < 1 : false;
        state.culling = false;
        if (opts.blendMode) state.blendMode = opts.blendMode;
        const entity = new Entity3D({ geometry, material, state });

        return entity;
    }

    /**
     * Get pixi texture from internal cache
     * @param name - Texture fle name, without path and/or extension
     */
    public getMap(name: string): PIXI.Texture
    {
        if (!this.maps[name]) throw new Error(`[Library] Map does not exist: ${name}`);

        return this.maps[name];
    }

    /**
     * Check if geometry exists
     * @param name - Name of the geometry
     */
    public hasGeometry(name: string): boolean
    {
        return !!this.geometries[name];
    }

    /**
     * Check if geometry group exists
     * @param name - Name of the group
     */
    public hasGroup(name: string): boolean
    {
        return !!this.geometryGroups[name];
    }

    /**
     * Check if map exists
     * @param name - Name of the texture
     */
    public hasMap(name: string): boolean
    {
        return !!this.maps[name];
    }

    /**
     * Check if basic gameplay resources has been loaded and ready
     */
    public hasResourcesForBasicGameplay(): boolean
    {
        return !!this.scenes['environment-basic'];
    }

    /**
     * Check if all gameplay resources has been loaded and ready
     */
    public hasResourcesForFullGameplay(): boolean
    {
        return !!this.scenes['environment-full'];
    }
}

/**
 * Remove dirname and extension from a name
 * Turn 'assets/models/train.gb' into 'train'
 * @param name - Name to be shortened
 */
function shortName(name: string): string
{
    return name.split('/').pop()?.split('.').shift() as string;
}

/**
 * Remove dirname and extension from a name
 * Turn 'assets/images/texture.png' into 'texture'
 * TODO - This is a legacy methot, probably should be removed in favour of `shortName()`
 * @param name - Name to be shortened
 */
function shortMapName(name: string): string
{
    return name.split('/').pop()?.replace('.png', '').replace('.jpg', '') as string;
}

/**
 * Recursively set a texture map into an entity,
 * @param entity - Entity that will receive the map
 * @param map - Pixi texture to be applied
 */
function applyMap(entity: Entity3D, map: PIXI.Texture): void
{
    const Material = UnlitHighShaderMaterial; // Main animation material to be used
    const matStatic = new Material({ diffuseMap: map, color: 0xFFFFFF });
    const matAnimated = new Material({ skinning: true, diffuseMap: map, color: 0xFFFFFF, maxBones: 29 });

    if (entity.view3d)
    {
        if (entity.view3d.material)
        {
            const attributes = (entity.view3d.geometry as any).attributes;

            if (attributes)
            {
                if (!attributes.aBoneWeights)
                {
                    entity.view3d.material = matStatic;
                }
                else if (entity.view3d.material instanceof Material)
                {
                    entity.view3d.material.diffuseMap = map;
                }
                else
                {
                    entity.view3d.material = matAnimated;
                }
            }
            else
            {
                entity.view3d.material = matStatic;
            }
        }
        else
        {
            entity.view3d.material = matStatic;
        }
    }
    const children = OdieUtils.entityChildren(entity);
    let i = children.length;

    while (i--) applyMap(children[i], map);
}
