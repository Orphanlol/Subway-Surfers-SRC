import Poki from '../utils/Poki';
export type KeyId = string | number;

type Callback = (...args: any[]) => void;

/** Map some key aliases, for lazyness */
const keyAliases: Record<KeyId, string> = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    space: ' ',
};

/** Descibes a key binding */
interface KeyBinding
{
    key: KeyId;
    action: (e: KeyboardEvent)=>void;
}

/** Stores bindings of a certaing group */
class KeyBindingCollection
{
    public map: Record<KeyId, KeyBinding[]> = {};

    public add(binding: KeyBinding)
    {
        if (keyAliases[binding.key]) binding.key = keyAliases[binding.key];
        const list = this.map[binding.key] || [];

        list.push(binding);
        this.map[binding.key] = list;
    }

    public remove(binding: KeyBinding)
    {
        const list = this.map[binding.key];

        if (!list) return;
        const index = list.indexOf(binding);

        if (index < 0) return;
        list.splice(index, 1);
    }

    public bindingsByKey(key: KeyId): KeyBinding[]
    {
        return this.map[key] || [];
    }
}

/** Bind actions to keys */
export class Keyboard
{
    public keyDownBindings: KeyBindingCollection;
    public keyUpBindings: KeyBindingCollection;
    public enabled = true;

    constructor()
    {
        this.keyDownBindings = new KeyBindingCollection();
        this.keyUpBindings = new KeyBindingCollection();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);

        Poki.SDK.onBreakStart.add(() =>
        {
            this.enabled = false;
        });
        Poki.SDK.onBreakComplete.add(() =>
        {
            this.enabled = true;
        });
    }

    public dispose(): void
    {
        this.keyDownBindings.map = {};
        this.keyUpBindings.map = {};
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    public bindKeyDown(key: string, action: Callback): KeyBinding
    {
        const binding = { key, action };

        this.keyDownBindings.add(binding);

        return binding;
    }

    public bindKeyUp(key: string, action: Callback): KeyBinding
    {
        const binding = { key, action };

        this.keyUpBindings.add(binding);

        return binding;
    }

    public unbind(binding: KeyBinding): void
    {
        this.keyDownBindings.remove(binding);
        this.keyUpBindings.remove(binding);
    }

    private onKeyDown = (e: KeyboardEvent) =>
    {
        if (!this.enabled || e.repeat) return;
        const key = e.key;
        const bindings = this.keyDownBindings.bindingsByKey(key);

        for (const binding of bindings) binding.action(e);
    };

    private onKeyUp = (e: KeyboardEvent) =>
    {
        if (!this.enabled || e.repeat) return;
        const key = e.key;
        const bindings = this.keyUpBindings.bindingsByKey(key);

        for (const binding of bindings) binding.action(e);
    };
}
