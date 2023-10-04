import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

const NOOP = () => {}; // eslint-disable-line

type Callback = (...args: any[]) => void;

export interface StateItem extends Record<string, any>
{
    id?: string;
    begin: Callback;
    update: Callback;
    render: Callback;
    end: Callback;
    empty?: Callback;
    entity?: GameEntity;
}

export default class State extends GameComponent
{
    public states: Record<string, StateItem>;
    public currentStateId = '';
    public transitionMap: Record<string, any>;
    public params: any;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.states = {};
        this.currentStateId = 'empty';
        this.transitionMap = {};
        this.add('empty', { end: NOOP, begin: NOOP, update: NOOP, render: NOOP });
        this.params = {};
    }

    get id(): string
    {
        return this.currentStateId;
    }

    addTransition(id1: string, id2: string, bothways = false): State
    {
        if (!this.transitionMap[id1]) this.transitionMap[id1] = {};
        this.transitionMap[id1][id2] = true;
        if (bothways) this.transitionMap[id2][id1] = true;

        return this;
    }

    add(id: string, state: StateItem): State
    {
        this.states[id] = state;
        state.id = id;
        state.entity = this.entity;

        if (!state.empty) state.empty = NOOP;
        if (!state.begin) state.begin = NOOP;
        if (!state.update) state.update = NOOP;
        if (!state.render) state.render = NOOP;
        if (!state.end) state.end = NOOP;

        if (!this.transitionMap[id]) this.transitionMap[id] = {};
        this.addTransition('empty', id, true);

        return this;
    }

    set(id: string): void
    {
        if (this.can(id))
        {
            const from = this.currentStateId;
            // console.log('STATE - FROM:', this.currentStateId, 'TO:', id);

            this.states[this.currentStateId].end();
            this.currentStateId = id;
            this.states[this.currentStateId].begin(from);
        }
    }

    can(id: string): boolean
    {
        if (this.currentStateId === id) return false;
        const fromAll = this.transitionMap['all'][id];
        const toAll = this.transitionMap[this.currentStateId]['all'];
        const fromTo = this.transitionMap[this.currentStateId][id];

        return (fromAll || toAll || fromTo);
    }

    update(dt: number): void
    {
        const entity: any = this.entity;

        if (entity.onStateUpdate)
        {
            entity.onStateUpdate();
            const params = this.params;
            const states = this.states;

            for (const i in states)
            {
                if (i === 'empty') continue;
                const state = states[i];
                let matched = true;

                for (const k in params)
                {
                    if (state[k] === undefined) continue;
                    if (state[k] !== params[k])
                    {
                        matched = false;
                        break;
                    }
                }

                if (matched && this.currentStateId !== i)
                {
                    const fromAll = this.transitionMap['all'][i];
                    const toAll = this.transitionMap[this.currentStateId]['all'];
                    const fromTo = this.transitionMap[this.currentStateId][i];

                    if (fromAll || toAll || fromTo)
                    {
                        this.set(i);
                        break;
                    }
                }
            }
        }
        this.states[this.currentStateId].update(dt);
    }

    render(dt: number): void
    {
        this.states[this.currentStateId].render(dt);
    }
}
