import Body from '../components/Body';
import GameEntity from '../GameEntity';

export default class Cube extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body);
    }

    reset(): void
    {
        this.body.deco = false;
        this.body.box.size.reset();
        this.body.box.center.reset();
    }
}
