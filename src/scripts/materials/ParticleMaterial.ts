/* eslint-disable @typescript-eslint/no-var-requires */
import * as PIXI from 'pixi.js';

import CoreMaterial from './CoreMaterial';

const vertexSource = require('./shaders/particle.vert').default;
const fragmentSource = require('./shaders/particle.frag').default;

export default class ParticleMaterial extends CoreMaterial
{
    public static _uniformGroup?: PIXI.UniformGroup;

    constructor(options: any = {})
    {
        const defines: string[] = [];

        if (options.map) defines.push('#define MAP');

        super(options, vertexSource, fragmentSource, defines, 'particle');
    }
}

