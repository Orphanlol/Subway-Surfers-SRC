import { Entity, SystemInterface } from '@goodboydigital/odie';

import Game from '../Game';

export class GameSystem implements SystemInterface
{
    public entity: Entity;
    public game: Game;

    constructor(entity: Entity)
    {
        this.entity = entity;
        this.game = this.entity.scene as unknown as Game;
    }
}
