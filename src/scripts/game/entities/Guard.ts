import { Entity3D } from '@goodboydigital/odie';

import Anim from '../components/Anim';
import Body from '../components/Body';
import Chaser from '../components/Chaser';
import State from '../components/State';
import modelMap from '../data/anim';
import GameEntity from '../GameEntity';
import Dog from './Dog';

export default class Guard extends GameEntity
{
    public anim!: Anim;
    public chaser!: Chaser;
    public state!: State;
    public dog: Dog;


    public model: Entity3D;
    public catch: boolean | null;
    public catchCount: number;
    protected _initialized = false;
    protected statesReady = false;


    constructor()
    {
        super();
        this.levelEntity = false;
        this.add(Body, { deco: true, ghost: true });
        this.add(Chaser);
        this.add(Anim);
        this.body.height = 14;
        this.body.width = 6;
        this.body.depth = 6;

        this.model = this.anim.container;
        this.model.y = -this.body.height * 0.4;
        this.model.ry = Math.PI;
        this.addChild(this.model);

        this.catch = null;
        this.catchCount = 0;

        this.dog = new Dog();
        this.dog.body.x = 5;
        this.dog.body.z = -6;
        this.addChild(this.dog);
    }

    init(): void
    {
        if (this._initialized) return;
        this._initialized = true;
        this.anim.addScene(modelMap.guard.movement);
        this.anim.addScene(modelMap.guard.catch);
        this.dog.init();
    }

    playIntro(): void
    {
        this.init();
        this.scale.set(0.01);
        this.active = true;
        this.z = 999;
        this.body.z = this.z;
        this.chaser.playIntro();

        this.dog.playIntro();

        setTimeout(() => this.scale.set(1), 100);
    }

    run(): void
    {
        this.init();
        this.active = true;
        this.anim.play('Guard_run', { loop: true, mixRatio: 0.1 });
        this.chaser.enable();
        this.dog.run();
    }

    reset(): void
    {
        if (!this._initialized) return;
        this.chaser.reset();
        this.z = 999;
        this.body.z = this.z;
        this.catchCount = 0;
        this.catch = null;
        this.active = false;
        this.dog.reset();
    }

    catchHero(): void
    {
        this.catchCount = 10;
    }
}
