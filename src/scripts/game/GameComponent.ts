import { ComponentInterface } from '@goodboydigital/odie';

import GameEntity from './GameEntity';

export default class GameComponent implements ComponentInterface<any>
{
    public entity!: GameEntity;
    public data: any;

    constructor(entity: GameEntity, data: any = {})
    {
        this.entity = entity;
        this.data = data;
    }

    public reset(): void
    {
        // For subclasses
    }

    public respawn(): void
    {
        // For subclasses
    }
}

/**
 * Plugin constructor type, refers to classes that are plugin constructors
 */
export interface GameComponentConstructor<T extends GameComponent>
{
    new(entity: GameEntity, data?: any): T;
}
