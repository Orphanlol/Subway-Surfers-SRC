import * as PIXI from 'pixi.js';

const baseUniforms = {
    uBend: new Float32Array([0, 0]),
    uFogDensity: 0.008,
    uFogDistance: 410,
    uFogColor: new Float32Array([0.388, 0.698, 1.0]),
};

export type MainUniformGroup = typeof baseUniforms;

export default class Uniforms
{
    public static _uniformGroup?: PIXI.UniformGroup;

    public static get group(): MainUniformGroup
    {
        if (!Uniforms._uniformGroup)
        {
            Uniforms._uniformGroup = new PIXI.UniformGroup(baseUniforms, false);
        }

        return Uniforms._uniformGroup.uniforms;
    }

    public static getNewGroup(): MainUniformGroup
    {
        return new PIXI.UniformGroup(baseUniforms, true).uniforms;
    }
}

