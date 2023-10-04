import { Container, Sprite, Text } from 'pixi.js';

const defaultOptions = {
    base: '',
    icon: '',
    length: 6,
};

export type HUDLabelOptions = typeof defaultOptions;

export class HUDLabel extends Container
{
    public spacing = 30;
    public base?: Sprite;
    public icon?: Sprite;
    public text: Container;
    private _txt: string | number = -1;
    private maxTextLength = 6;
    private currentTextLength = 6;

    constructor(options: Partial<HUDLabelOptions> = {})
    {
        super();

        const o = { ...defaultOptions, ...options };

        this.maxTextLength = o.length;
        this.currentTextLength = o.length;

        if (o.base)
        {
            this.base = Sprite.from(o.base);
            this.base.anchor.set(0, 0.5);
            this.base.alpha = 0.5;
            this.addChild(this.base);
        }

        if (o.icon)
        {
            this.icon = Sprite.from(o.icon);
            this.icon.anchor.set(0.5);
            this.addChild(this.icon);
            this.icon.x = (this.maxTextLength * this.spacing * 0.5) + 35;
            this.icon.scale.set(0.75);
        }

        this.text = new Container();
        this.addChild(this.text);

        // Create a digit text for each char
        for (let i = 0; i < this.maxTextLength; i++)
        {
            const charSprite = new Text('0', {
                fill: 'white',
                align: 'center',
                fontSize: 50,
                fontFamily: 'Lilita One',
            });

            charSprite.anchor.set(0.5);
            charSprite.x = i * this.spacing;
            this.text.addChild(charSprite);
        }

        this.updatePositions();
    }

    private updatePositions(): void
    {
        const halfSpacing = this.spacing * 0.5;

        this.text.x = -(this.maxTextLength - 1) * halfSpacing;
        if (this.base)
        {
            this.base.x = (this.maxTextLength * halfSpacing) - (this.currentTextLength * this.spacing) - 20;
        }
    }

    public setText(txt: string | number, pad = 0): void
    {
        // Skip if current and new text are the same
        if (txt === this._txt) return;
        this._txt = txt;

        let str = String(txt);

        // Pad the text left with 0, if provided
        if (pad) str = str.padStart(pad, '0');

        const textLength = str.length;
        const diff = this.maxTextLength - textLength;
        let i = this.maxTextLength;

        // Loop through digit sprites to update them
        while (i--)
        {
            const charSprite = this.text.children[i] as Text;
            const charStrIndex = i - diff;
            const charStr = str[charStrIndex];

            if (charStrIndex >= 0)
            {
                charSprite.text = charStr;
                charSprite.visible = true;
            }
            else
            {
                charSprite.visible = false;
            }

            // Break the loop if remaining characters does not need to be updated
            if (i < diff && this.currentTextLength <= textLength) break;
        }

        // Save current text length, for future updates
        this.currentTextLength = textLength;

        // Adjust base position according to number of characters, if not padded
        if (this.base && !pad) this.updatePositions();
    }

    public getText(): string | number
    {
        return this._txt;
    }
}
