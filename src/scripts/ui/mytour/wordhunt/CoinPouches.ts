import { Container, Sprite } from 'pixi.js';

export class CoinPouches extends Container
{
    constructor(amount: number)
    {
        super();

        let elementsInARow = 1;

        for (let i = 0; i < amount; i += elementsInARow)
        {
            const row = new Container();

            for (let k = 0; k < elementsInARow; k++)
            {
                const pouch = row.addChild(Sprite.from('coin-pouch-icon.png'));

                pouch.x = (pouch.width - 20) * k;
            }

            row.x = -row.width / 2;
            row.y = -(30 / amount) * i;
            this.addChildAt(row, 0);
            elementsInARow++;
        }
    }
}
