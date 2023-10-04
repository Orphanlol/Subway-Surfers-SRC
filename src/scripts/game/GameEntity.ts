import {
    Animator3DComponent,
    ComponentInterface,
    Entity3D,
    View3DComponentOptions,
} from '@goodboydigital/odie';

import Game from '../Game';
import Anim from './components/Anim';
import Attractable from './components/Attractable';
import Body from './components/Body';
import Collectible from './components/Collectible';
import Dizzy from './components/Dizzy';
import Floating from './components/Floating';
import Follower from './components/Follower';
import Halo from './components/Halo';
import Hoverboard from './components/Hoverboard';
import Jetpack from './components/Jetpack';
import Jump from './components/Jump';
import { Lane } from './components/Lane';
import Magnet from './components/Magnet';
import Movable from './components/Movable';
import Multiplier from './components/Multiplier';
import Notifier from './components/Notifier';
import Particles from './components/Particles';
import Player from './components/Player';
import Pogo from './components/Pogo';
import Pop from './components/Pop';
import PopPickup from './components/PopPickup';
import ReviveHalo from './components/ReviveHalo';
import Roll from './components/Roll';
import Shadow from './components/Shadow';
import Shine from './components/Shine';
import Sneakers from './components/Sneakers';
import State from './components/State';
import GameComponent from './GameComponent';

export type GameEntityParams = { offsetX: number; flip: boolean; };
type Callback = (...args: any[]) => void;

export type GameEntityCtor = new () => GameEntity;

/**
 * GameEntity was created as an adapter for existing entities from legacy odie to newer versions
 */
export default class GameEntity extends Entity3D
{
    /** Indicates if this entity is elegible to be handled by the level system */
    public levelEntity = true;

    /** Set if this entity should be removed when player revive after crash */
    public removableOnCrash = false;

    public view?: Entity3D;
    public model?: Entity3D;

    public anim?: Anim;
    public attractable?: Attractable;
    public body!: Body;
    public collectible?: Collectible;
    public dizzy?: Dizzy;
    public floating?: Floating;
    public follower?: Follower;
    public halo?: Halo;
    public hoverboard?: Hoverboard;
    public jetpack?: Jetpack;
    public jump?: Jump;
    public lane?: Lane;
    public magnet?: Magnet;
    public movable?: Movable;
    public multiplier?: Multiplier;
    public notifier?: Notifier;
    public particles?: Particles;
    public player?: Player;
    public pogo?: Pogo;
    public pop?: Pop;
    public popPickup?: PopPickup;
    public reviveHalo?: ReviveHalo;
    public roll?: Roll;
    public shadow?: Shadow;
    public shine?: Shine;
    public sneakers?: Sneakers;
    public state?: State;
    public parts?: Record<string, Entity3D>;

    public ramp?: boolean;
    public checkpoint?: boolean;
    public lowCamera?: boolean;
    public tutorialTrigger?: boolean;
    public animationController?: Animator3DComponent;
    public namedComponents: Record<string, ComponentInterface<any>> = {};
    public triggerEnter?: Callback;

    constructor(view3dData?: View3DComponentOptions)
    {
        super(view3dData);
        this.levelEntity = true;
    }

    public get game(): Game
    {
        return this.scene as unknown as Game;
    }

    public init(): void
    {
        this.active = true;
    }

    public reset(): void
    {
        this.active = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public awake(...args: any[]): void
    {
        // for subclasses
    }

    public sendMessage(msg: string): void
    {
        const components = Array.from((this as any)._components.values());

        components.forEach((component: any) =>
        {
            if (component[msg]) component[msg]();
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public add(type: any, data?: any, name?: string): GameComponent
    {
        const comp: GameComponent = this.addComponent(type, data as any, name);

        if (!name) name = getComponentName(type);
        (this as any)[name] = comp;

        return comp;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onCollect(collector?: Entity3D): void
    {
        // For subclasses
    }
}

function getComponentName(_class: any): string
{
    let name = _class.DEFAULT_NAME;

    if (!name)
    {
        name = _class.name;

        // DON'T know why... but using terser seems to double up class names
        // lets keep an eye on this and remove when terser plugin updates!
        const split = name.split('_');

        if (split[0] === split[1])
        {
            name = split[0];
        }

        name = name[0].toLowerCase() + name.slice(1);
    }

    if (!name)
    {
        console.warn(`${_class} does not have a name!`);
    }

    return name;
}
