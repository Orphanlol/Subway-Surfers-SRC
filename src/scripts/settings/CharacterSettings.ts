import DeepStore from '../utils/DeepStore';

export class CharacterSettings extends DeepStore
{
    public name = 'jake';
    public outfit = 0;

    constructor()
    {
        super('CharacterSettings');
        this.load();
    }
}
