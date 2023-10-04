import { Container, Graphics } from 'pixi.js';

const defaultOptions
= {
    sections: 4,
    length: 95,
    orientation: 'horizontal',
    color: 0x4b86a6,
    space: 5,
    lineHeight: 5,
};

export function makeDashedLine(opts: Partial<typeof defaultOptions> = {}): Container
{
    const { length, sections, orientation, color, lineHeight, space } = {
        ...defaultOptions,
        ...opts,
    };
    const dashed = new Container();

    const totalSpace = space * (sections - 1);
    const segmentWidth = (length - totalSpace) / sections;

    const y = -lineHeight / 2;
    const x = -length / 2;

    for (let i = 0; i < sections; i++)
    {
        if (orientation === 'horizontal')
        {
            dashed.addChild(
                new Graphics().beginFill(color)
                    .drawRect(((segmentWidth + space) * i) + x, y, segmentWidth, lineHeight)
                    .endFill(),
            );
        }
        else
        {
            dashed.addChild(
                new Graphics().beginFill(color)
                    .drawRect(y, ((segmentWidth + space) * i) + x, lineHeight, segmentWidth)
                    .endFill(),
            );
        }
    }

    return dashed;
}
