import { Program, Rectangle, Shader, Texture, utils } from 'pixi.js';

const filterEmptyLine = (str: string) => str !== '';
const dummyProgram: any = { uniformData: { id: -1 } };
let UID = 0;

const materialCache: any = {};
const MAX_BONES = 27;

export default class CoreMaterial extends Shader
{
    public type: string;
    public name: string;
    public options: any;
    public needsUpdate: boolean;
    public id: number;
    public skinning: boolean;
    public maxBones: number;
    public instancing: boolean;
    public vertexSource: string;
    public fragmentSource: string;
    public fragmentInjection: any;
    public vertexInjection: any;
    public rebuildId: number;
    public defines: any[];
    public sig: any;
    public _hexColor: number;

    constructor(options: any = {}, vertexSource: string, fragmentSource: string, defines: any[], type = 'core')
    {
        const uniforms: any = {
            uShininess: options.shininess || 32,
            uOpacity: (options.opacity === undefined) ? 1 : options.opacity,
            uSpecular: new Float32Array([0, 0, 0]),
            uColor: new Float32Array([1, 1, 1]),
            // Comment out to use fast normals?
            // This class should be removed in favour of using BaseMaterial instead
            // normal: mat3.create(),
        };

        super(dummyProgram, uniforms);

        this._hexColor = 0xFFFFFF;
        this.type = type;
        this.name = options.name || `${this.type}-shader`;

        // legacy
        this.options = {};

        this.needsUpdate = true;

        this.id = UID++;

        this.skinning = !!options.skinning;

        // set it on the options too as this is used to cre`te the shader signature..
        this.maxBones = options.maxBones = options.maxBones || MAX_BONES;

        if (this.skinning)
        {
            uniforms.bones = new Float32Array(this.maxBones * 16);
        }

        this.color = options.color === undefined ? 0xFFFFFF : options.color;
        this.instancing = !!options.instancing;

        if (this.instancing)
        {
            this.name += '-instanced';
        }

        // deal with optional properties..
        if (options.uniforms)
        {
            Object.assign(uniforms, options.uniforms);
        }

        if (options.map)
        {
            uniforms.uMap = options.map;
            uniforms.uMapFrame = new Rectangle(0, 0, 1, 1);
        }

        this.vertexSource = vertexSource;
        this.fragmentSource = fragmentSource;

        this.fragmentInjection = options.fragment || {};
        this.vertexInjection = options.vertex || {};

        this.sig = this.getSignature(options);

        this.program = dummyProgram;
        this.rebuildId = 0;
        this.defines = defines || [];
    }

    set opacity(value: number)
    {
        this.uniforms.uOpacity = value;
    }

    get opacity(): number
    {
        return this.uniforms.uOpacity;
    }

    set map(value: Texture)
    {
        this.uniforms.uMap = value;
    }

    get map(): Texture
    {
        return this.uniforms.uMap;
    }

    set color(value: number)
    {
        this._hexColor = value;
        utils.hex2rgb(value, this.uniforms.uColor);
    }

    get color(): number
    {
        return this._hexColor;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    injectDefines(source: {vertex: any, fragment: any}, fog?: boolean): void
    {
        const uniforms = this.uniforms;

        const defaultDefines = [
            uniforms.uColor ? '#define COLOR' : '',
            this.skinning ? '#define SKINNING' : '',
            uniforms.uMap ? '#define MAP' : '',
            this.instancing ? '#define INSTANCING' : '',
            // fog ? '#define FOG' : '', // TODO should be injected in,
        ];

        const finalDefines = defaultDefines.concat(this.defines);

        const defineHeader = finalDefines.filter(filterEmptyLine).join('\n');

        source.vertex = `${defineHeader}\n${source.vertex}`;
        source.fragment = `${defineHeader}\n${source.fragment}`;
    }

    injectHooks(source: {vertex: any, fragment: any}): void
    {
        const vertexInjection = this.vertexInjection;
        let vertex = source.vertex;

        vertex = vertex.replace(/#HOOK_VERTEX_START/g, vertexInjection.start || '');
        vertex = vertex.replace(/#HOOK_VERTEX_MAIN/g, vertexInjection.main || '');
        vertex = vertex.replace(/#HOOK_VERTEX_END/g, vertexInjection.end || '');

        const fragmentInjection = this.fragmentInjection;
        let fragment = source.fragment;

        fragment = fragment.replace(/#HOOK_FRAGMENT_START/g, fragmentInjection.start || '');
        fragment = fragment.replace(/#HOOK_FRAGMENT_MAIN/g, fragmentInjection.main || '');
        fragment = fragment.replace(/#HOOK_FRAGMENT_END/g, fragmentInjection.end || '');

        source.fragment = fragment;
        source.vertex = vertex;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    build(lightData?: any, fog?: boolean)
    {
        if (materialCache[this.sig])
        {
            this.program = materialCache[this.sig];

            return;
        }

        // fog not currently working..

        const source = {
            vertex: this.vertexSource,
            fragment: this.fragmentSource,
        };

        // inject bones...
        source.vertex = source.vertex.replace(/#MAX_BONES/g, String(this.maxBones));

        this.injectDefines(source, fog);
        this.injectHooks(source);

        this.program = Program.from(source.vertex, source.fragment, this.name);

        materialCache[this.sig] = this.program;

        console.log(`REBUILD SHADERS ${this.rebuildId++}`);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getSignature(options: any)
    {
        const strings = [this.type];

        for (const i in options)
        {
            strings.push(i);
        }

        strings.sort();

        if (options.vertex)
        {
            strings.push(options.vertex.start || '', options.vertex.main || '', options.vertex.end || '');
        }

        if (options.fragment)
        {
            strings.push(options.fragment.start || '', options.fragment.main || '', options.fragment.end || '');
        }

        return strings.join('-');
    }
}

