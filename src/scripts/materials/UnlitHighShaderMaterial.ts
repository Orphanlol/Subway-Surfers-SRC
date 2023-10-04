import {
    alphaStandard,
    colorGamma,
    diffuseStandard,
    fastNormalMatrix,
    fogStandard,
    generateNoLights,
    generateSkinning,
    HighFragment,
    LightData,
    LightEntity,
    Matrix3,
    modelMatrix,
    StandardMaterial,
    StandardMaterialConfig,
    standardNormalMatrix,
    standardShaderTemplate,
    uvsWithFrameStandard } from '@goodboydigital/odie';
import { Program, Rectangle, Texture, utils } from 'pixi.js';

import { compileHighShader } from './compileHighShader';
import { bendFragment } from './shader-fragments/bendFragment';
import { fogFragment } from './shader-fragments/fogFragment';
import { railsFragment } from './shader-fragments/railsFragment';
import Uniforms from './Uniforms';

export interface UnlitHighShaderMaterialOptions
{
    /** Fast normals mean the shader will not need to calculate normal matrix. This is a win as long as scale stays uniform on the model */
    fastNormals?: boolean;
    /** The base color of the material */
    color?: number;
    /** The diffuse texture (this can come from a sprite sheet!) */
    diffuseMap?: Texture;
    /** Set to true for vertex skinning animation! */
    skinning?: boolean;
    /** The maximum number of bones to upload to the GPU. Default is MAX_BONES (20)*/
    maxBones?: number;
    /** If true, transforms will be instanced * use this if you know what you are doing ?:)*/
    instancing?: boolean;
    /** The name of you shader (defaults to phong-shader) */
    name?: string;
    /**
     * use tangents for calculating normals if they are available
     * pro - slightly faster shader, but requires tangents to be generated if they are not in the model
     * con - if the tangents are not provided, some lighting may appear ia bit off!
     */
    tangents?: boolean;
    /**
     * any uniforms to set on the shader..
     */
    uniforms?: Unlit2Uniforms;

    /** Apply world bend */
    bend?: boolean;

    /** alpha */
    opacity?: number;

    /** Use custom fog high shader fragment */
    customFog?: boolean;

    /** Use rails high shader fragment */
    rails?: boolean;
}

const baseOptions = {
    bend: true,
    fastNormals: true,
};

/**
 * the possible uniforms that this shader may added to the shader
 */
export interface Unlit2Uniforms
{

    [key: string]: any;
    uNormalMatrix?: Matrix3;
    uDiffuseMap?: Texture;
    uMapFrame?: Rectangle;
    uDiffuseColor?: Float32Array;
}

export class UnlitHighShaderMaterial extends StandardMaterial
{
    public static PREFER_TANGENTS = false;
    public static uniformGroup: any;

    public tangents: boolean;
    private _hexColor!: number;

    constructor(options: UnlitHighShaderMaterialOptions = {})
    {
        options = { ...baseOptions, ...options };

        const uniforms = { ...Uniforms.group } as Record<string, any>;

        let normalMatrix;

        if (options.fastNormals ?? StandardMaterial.FAST_NORMALS)
        {
            normalMatrix = fastNormalMatrix;
        }
        else
        {
            normalMatrix = standardNormalMatrix;
            uniforms.uNormalMatrix = new Matrix3();
        }

        const lights: (lights?: LightEntity[]) => HighFragment = generateNoLights;

        const config: StandardMaterialConfig = {
            modelMatrix,
            normalMatrix,
            uv: uvsWithFrameStandard,
            alpha: alphaStandard,
            lights,
            extensions: [],
        };

        uniforms.uDiffuseColor = new Float32Array([1, 1, 1, options.opacity ?? 1]);
        uniforms.uMapFrame = new Rectangle(0, 0, 1, 1);

        if (options.diffuseMap)
        {
            config.diffuse = diffuseStandard;
            uniforms.uDiffuseMap = options.diffuseMap ?? Texture.WHITE;
        }

        if (options.skinning && config.extensions)
        {
            const skinningStandard = generateSkinning(options.maxBones ?? StandardMaterial.MAX_BONES);

            config.extensions.push(skinningStandard);
        }

        if (options.bend && config.extensions)
        {
            config.extensions.push(bendFragment);
        }

        if (options.customFog && config.extensions)
        {
            config.extensions.push(fogFragment);
        }

        if (options.rails && config.extensions)
        {
            config.extensions.push(railsFragment);
        }

        super(config, uniforms);

        this.tangents = options.tangents ?? false;

        this.color = options.color ?? 0xFFFFFF;
    }

    set diffuseMap(value: Texture)
    {
        this.uniforms.uDiffuseMap = value;
    }

    get diffuseMap(): Texture
    {
        return this.uniforms.uDiffuseMap;
    }

    set color(value: number)
    {
        this._hexColor = value;
        utils.hex2rgb(value, this.uniforms.uDiffuseColor as unknown as number[]);
    }

    get color(): number
    {
        return this._hexColor;
    }

    set opacity(value: number)
    {
        this.uniforms.uDiffuseColor[3] = value;
    }

    get opacity(): number
    {
        return this.uniforms.uDiffuseColor[3];
    }

    public build(lightData: LightData, fog: boolean, isWebGL2: boolean): void
    {
        const config = this['_config'];

        if (fog)
        {
            config.extensions.push(fogStandard);
        }

        const highFragments = [
            config.modelMatrix,
            config.normalMatrix,
            config.uv,

            // color..
            config.normal,
            config.diffuse,
            config.alpha,
            config.specular,
            config.emissive,
            config.reflection,

            config.lights(lightData.lights),
            colorGamma,
            ...config.extensions ?? [],
        ].filter((a) => !!a);

        const { vertex, fragment } = compileHighShader(isWebGL2, standardShaderTemplate, highFragments);

        this.program = Program.from(vertex, fragment);
    }
}

