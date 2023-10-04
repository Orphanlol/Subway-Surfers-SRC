import Graph from '../Graph';
import { Button, ButtonOptions } from './Button';

export class LargeButton extends Button
{
    constructor(opts: Partial<ButtonOptions> = {})
    {
        const color = 0x41972a;
        const base = Graph.rectComp(
            { w: 330 + 16, h: 100 + 20, image: 'box-border-grey.png', x: 5, y: 6 },
            { w: 330 - 8, h: 100 - 6, color, round: 12 },
        );

        super({
            base,
            color,
            labelY: 0,
            labelSize: 40,
            ...opts,
        });
    }
}
