import DeepStore from '../utils/DeepStore';

export class BoardSettings extends DeepStore
{
    public name = 'hoverboard';
    public powerups: number[] = [0];

    constructor()
    {
        super('BoardSettings');
        this.load();
    }
}
