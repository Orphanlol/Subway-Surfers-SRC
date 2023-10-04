/* eslint-disable @typescript-eslint/no-var-requires */
import * as PIXI from 'pixi.js';

import CoreMaterial from './CoreMaterial';
import Uniforms from './Uniforms';

const vertexSource = require('./shaders/smoke.vert').default;
const fragmentSource = require('./shaders/smoke.frag').default;

export default class SmokeMaterial extends CoreMaterial
{
    public static _uniformGroup?: PIXI.UniformGroup;

    constructor(options: any = {})
    {
        const defines = ['#define BEND', '#define MAP'];

        options.uniforms = { ...Uniforms.group, uOffset: 0 };
        super(options, vertexSource, fragmentSource, defines, 'unlit');
    }

    public get offset(): number
    {
        return this.uniforms.uOffset;
    }

    public set offset(v: number)
    {
        this.uniforms.uOffset = v;
    }
}

