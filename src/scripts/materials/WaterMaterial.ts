/* eslint-disable @typescript-eslint/no-var-requires */
import * as PIXI from 'pixi.js';

import CoreMaterial from './CoreMaterial';
import Uniforms from './Uniforms';

const vertexSource = require('./shaders/water.vert').default;
const fragmentSource = require('./shaders/water.frag').default;

export default class WaterMaterial extends CoreMaterial
{
    public static _uniformGroup?: PIXI.UniformGroup;

    constructor(options: any = {})
    {
        const defines = ['#define BEND', '#define FOG'];

        options.uniforms = Uniforms.group;
        super(options, vertexSource, fragmentSource, defines, 'water');
    }
}

