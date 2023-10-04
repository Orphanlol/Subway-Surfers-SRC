import Body from '../components/Body';
import GameEntity from '../GameEntity';

export default class BlockerDodgeDetector extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body, { trigger: true });

        this.body.width = 16;
        this.body.height = 100;
        this.body.depth = 1;
        this.name = 'BlockerDodgeDetector';
        this.removableOnCrash = true;
    }
}
