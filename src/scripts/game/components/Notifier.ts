import { Component } from '@goodboydigital/odie';

import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Notifier extends GameComponent
{
    public ignore = ['transform', 'container', 'notifier'];
    public comps?: Record<string, Component>;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.entity = entity;
    }

    cacheComponents(): void
    {
        this.comps = {};
        for (const k in this.entity)
        {
            if (this.ignore.indexOf(k) >= 0) continue;
            const item = (this.entity as any)[k];

            if (item instanceof Component)
            {
                this.comps[k] = item;
            }
        }
    }

    notify(msg: string, ...args: any[]): void
    {
        if (!this.comps) this.cacheComponents();
        for (const k in this.comps)
        {
            const comp = this.comps[k] as any;

            if (!comp) continue;
            const func = comp[msg];

            if (func) func.apply(comp, args);
        }
    }
}
