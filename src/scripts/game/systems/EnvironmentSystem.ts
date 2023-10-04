import { Entity3D } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import Random from '../../utils/Random';
import Chunk from '../data/Chunk';
import Node, { NodeObj } from '../data/Node';
import Epic from '../entities/Epic';
import { Fillers } from '../entities/Fillers';
import Floor from '../entities/Floor';
import Gates from '../entities/Gates';
import PillarsEnvironment from '../entities/PillarsEnvironment';
import Skyline from '../entities/Skyline';
import StationEnvironment from '../entities/StationEnvironment';
import TubeEnvironment from '../entities/TubeEnvironment';
import GameEntity from '../GameEntity';
import { GameSystem } from '../GameSystem';

export default class EnvironmentSystem extends GameSystem
{
    public models: GameEntity[];
    public skyline?: Skyline;

    constructor(entity: Entity3D)
    {
        super(entity);
        this.models = [];
        this.game.onRun.add({ run: this.run.bind(this) });
    }

    run(): void
    {
        if (this.skyline) return;
        this.skyline = new Skyline();
        this.game.addChild(this.skyline);
    }

    update(): void
    {
        if (!this.skyline) return;
        this.skyline.z = this.game.stats.z - (GameConfig.visibleMaxDistance * 0.95);
    }

    canSpawn(node: NodeObj): boolean
    {
        const envNode = Node.environment(node);
        let environment = envNode ? Node.environmentType(envNode) : null;

        if (!environment)
        {
            if (node.name.match(/tunnel/))
            {
                environment = ['Gates', 'All'];
            }
            else if (node.name.match(/epic/))
            {
                environment = ['Epic', 'All'];
            }
            else if (node.components.RouteChunk)
            {
                const envs = node.components.RouteChunk._limitedAllowedEnvironmentKinds;
                const types = envs?.length ? Random.item(envs)._type.split(',') : ['Fillers', 'All'];

                environment = types || [];
            }
            else
            {
                environment = [];
            }
        }

        if (!environment) throw Error('Environment should not be undefined at this point');

        if (environment.indexOf('Tube') >= 0 && !TubeEnvironment.hasNecessaryResources())
        {
            return false;
        }
        else if (environment.indexOf('Station') >= 0 && !StationEnvironment.hasNecessaryResources())
        {
            return false;
        }
        else if (environment.indexOf('Epic') >= 0 && !Epic.hasNecessaryResources())
        {
            return false;
        }
        else if (environment.indexOf('Gates') >= 0 && !Gates.hasNecessaryResources())
        {
            return false;
        }
        else if (environment.indexOf('Pillars') >= 0 && !PillarsEnvironment.hasNecessaryResources())
        {
            return false;
        }

        return true;
    }

    setup(chunk: Chunk): void
    {
        const envNode = Node.environment(chunk.node);
        let environment = envNode ? Node.environmentType(envNode) : null;

        if (!environment)
        {
            if (chunk.node.name.match(/tunnel/))
            {
                environment = ['Gates', 'All'];
            }
            else if (chunk.node.name.match(/epic/))
            {
                environment = ['Epic', 'All'];
            }
            else if (chunk.node.components.RouteChunk)
            {
                const envs = chunk.node.components.RouteChunk._limitedAllowedEnvironmentKinds;
                const types = envs.length ? Random.item(envs)._type.split(',') : ['Fillers', 'All'];

                environment = types || [];
            }
            else
            {
                environment = [];
            }
        }

        if (!environment) throw Error('Environment should not be undefined at this point');

        // const envKinds = Node.get(node, 'components.RouteChunk._limitedAllowedEnvironmentKinds', []);
        // const envKind = Random.item(envKinds);
        // this.envType = Node.get(envKind, '_type', 'Fillers,All');
        // this.envDensity = Node.get(envKind, '_type', 'High,All');

        chunk.envTube = false;
        chunk.envStation = false;
        chunk.envEpic = false;
        chunk.envGates = false;
        chunk.envEmpty = false;
        chunk.envPillars = false;

        if ((GameConfig.forceTube || environment.indexOf('Tube') >= 0) && TubeEnvironment.hasNecessaryResources())
        {
            chunk.envTube = this.game.route.canSpawn('tube', chunk.z);
        }
        else if (environment.indexOf('Station') >= 0 && StationEnvironment.hasNecessaryResources())
        {
            chunk.envStation = true;
        }
        else if (environment.indexOf('Epic') >= 0 && Epic.hasNecessaryResources())
        {
            chunk.envEpic = this.game.route.canSpawn('epic', chunk.z);
        }
        else if (environment.indexOf('Gates') >= 0 && Gates.hasNecessaryResources())
        {
            chunk.envGates = true;
        }
        else if (environment.indexOf('Pillars') >= 0 && PillarsEnvironment.hasNecessaryResources())
        {
            chunk.envPillars = true;
        }
        else if (environment.indexOf('Empty') >= 0)
        {
            chunk.envEmpty = true;
        }
    }

    mount(chunk: Chunk): void
    {
        if (chunk.envTube && TubeEnvironment.hasNecessaryResources())
        {
            this.spawnTube(chunk);
        }
        else if (chunk.envStation && StationEnvironment.hasNecessaryResources())
        {
            this.spawnStation(chunk);
        }
        else if (chunk.envEpic && Epic.hasNecessaryResources())
        {
            this.spawnEpic(chunk);
        }
        else if (chunk.envEmpty)
        {
            this.spawnRegular(chunk);
        }
        else if (chunk.envGates)
        {
            this.spawnGates(chunk);
        }
        else
        {
            this.spawnRegular(chunk);
        }
    }

    spawnEpic(chunk: Chunk): void
    {
        Epic.mount(chunk);
        this.game.route.setSpawn('epic', chunk.z - chunk.length - 1800);
    }

    spawnTube(chunk: Chunk): void
    {
        const node = chunk.node;
        const tubeEnv = chunk.game.pool.get(TubeEnvironment) as GameEntity;

        chunk.game.addChild(tubeEnv);
        tubeEnv.awake(chunk, node);
        this.game.route.setSpawn('tube', chunk.z - chunk.length - 360);
    }

    spawnStation(chunk: Chunk): void
    {
        const node = Node.environment(chunk.node);
        const env = chunk.game.pool.get(StationEnvironment) as GameEntity;

        env.awake(chunk, node);
        chunk.game.addChild(env);
        Floor.mount(chunk);
        Fillers.mount(chunk);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    spawnGates(chunk: Chunk): void
    {
        // gates fill themselves
    }

    spawnRegular(chunk: Chunk): void
    {
        Fillers.mount(chunk);
        Floor.mount(chunk);
    }
}
