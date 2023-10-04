export interface State
{
    name: string;
    condition?: (sm: StateMachine) => boolean;
    enter?: (from: string) => void;
    update?: (dt: number) => void;
    exit?: (to: string) => void;
}

export class StateMachine
{
    public states: Record<string, State>;
    public current!: State;

    constructor()
    {
        const none = { name: 'none' };

        this.states = { none };
        this.current = none;
    }

    public add(state: State): void
    {
        if (this.states[state.name]) throw new Error(`State with same name already exists: ${state.name}`);
        this.states[state.name] = state;
    }

    public update(dt = 0): void
    {
        this.current?.update?.(dt);

        for (const name in this.states)
        {
            const state = this.states[name];

            if (state.condition && state.condition(this))
            {
                this.set(state.name);
                break;
            }
        }
    }

    public set(name: string): void
    {
        const prev = this.current;
        const next = this.states[name];

        if (next === this.current) return;

        console.log(`[SM] from: ${prev.name} to: ${next.name}`);
        this.current?.exit?.(next.name);
        this.current = next;
        this.current?.enter?.(prev.name);
    }

    public either(...names: string[]): boolean
    {
        return names.indexOf(this.current.name) >= 0;
    }

    public neither(...names: string[]): boolean
    {
        return names.indexOf(this.current.name) < 0;
    }
}

