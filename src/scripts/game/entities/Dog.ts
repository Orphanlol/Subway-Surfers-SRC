import { Entity3D } from '@goodboydigital/odie';

import Anim from '../components/Anim';
import Body from '../components/Body';
import State from '../components/State';
import modelMap from '../data/anim';
import GameEntity from '../GameEntity';

export default class Dog extends GameEntity
{
    public anim!: Anim;
    public state!: State;

    public model: Entity3D;
    protected _initialized = false;
    protected statesReady = false;

    constructor()
    {
        super();
        this.levelEntity = false;
        this.add(Body, { deco: true, ghost: true });
        this.add(Anim);
        this.body.height = 14;
        this.body.width = 6;
        this.body.depth = 6;

        this.model = this.anim.container;
        this.model.y = -this.body.height * 0.4;
        this.model.ry = Math.PI;
        this.addChild(this.model);

        this.scale.set(0.01);
    }

    init(): void
    {
        if (this._initialized) return;
        this._initialized = true;
        this.anim.addScene(modelMap.dog.movement);
        this.anim.addScene(modelMap.dog.catch);
    }

    playIntro(): void
    {
        this.init();
        this.scale.set(0.01);
        this.active = true;

        setTimeout(() => this.scale.set(1), 100);
    }

    run(): void
    {
        this.init();
        this.active = true;
        this.anim.play('Dog_run', { loop: true, mixRatio: 0.1 });
    }

    reset(): void
    {
        if (!this._initialized) return;
        this.active = false;
    }
}
