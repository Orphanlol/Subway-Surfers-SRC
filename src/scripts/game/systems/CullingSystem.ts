import {
    Entity3D,
    Scene,
    SystemInterface,
    TransformComponent,
    View3DComponent,
} from '@goodboydigital/odie';

import Game from '../../Game';
import GameConfig from '../../GameConfig';

export interface VisualEntity
{
    transform: TransformComponent;
    view3d: View3DComponent;
}

export class CullingSystem implements SystemInterface
{
    public static DEFAULT_NAME = 'culling';
    public readonly scene!: Scene;
    public readonly game!: Game;

    constructor(entity: Entity3D)
    {
        this.game = entity.scene as Game;
    }

    public cull(renderables: Entity3D[]): Entity3D[]
    {
        if (GameConfig.blocks) return renderables;

        return renderables.filter((entity: any) =>
        {
            const view3d = entity.view3d as View3DComponent;
            const sphere = view3d.getBoundingSphere();
            const dist = this.game.stats.z - sphere.center.z;
            const size = sphere.radius * 200;

            return dist >= -60 - size && dist < 750 + size;
        });
    }
}
