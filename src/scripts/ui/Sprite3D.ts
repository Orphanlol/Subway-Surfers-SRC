import { CameraEntity, Scene3D } from '@goodboydigital/odie';
import { Container, Renderer, RenderTexture, SCALE_MODES, Sprite, State } from 'pixi.js';

const defaultOptions = {
    width: 512,
    height: 512,
    scaleMode: SCALE_MODES.LINEAR,
    resolution: 1,
    culling: false,
    clear: true,
    depthTest: true,
    blend: true,
};

export type Sprite3DOptions = typeof defaultOptions;

export class Sprite3D extends Container
{
    protected state: State;
    protected texture!: RenderTexture;
    protected renderer: Renderer;
    public scene: Scene3D;
    public view: Sprite;

    constructor(renderer: Renderer, opts: Partial<Sprite3DOptions> = {})
    {
        super();
        const o = { ...defaultOptions, ...opts };

        this.scene = new Scene3D({
            renderer,
            culling: o.culling,
            clear: o.clear,
        });

        this.renderer = renderer;
        this.state = new State();
        this.state.depthTest = o.depthTest;
        this.state.blend = o.blend;

        this.texture = RenderTexture.create(o);
        (this.texture.baseTexture as any).framebuffer.addDepthTexture();

        this.view = new Sprite(this.texture);
        this.view.anchor.set(0.5);
        this.view.scale.x = 1;
        this.view.scale.y = -this.view.scale.x;
        this.addChild(this.view);
    }

    public render(renderer: Renderer): void
    {
        this.scene.view3d.renderTexture = this.texture;
        this.scene.view3d['_renderChildren'](this.renderer);
        super.render(renderer);
    }

    public get camera(): CameraEntity
    {
        return this.scene.view3d.camera;
    }
}
