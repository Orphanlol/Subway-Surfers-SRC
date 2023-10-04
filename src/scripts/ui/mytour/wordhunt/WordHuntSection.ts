import { MyTourSection } from '../MyTourSection';
import { WordHuntLetterbox } from './WordHuntLetterbox';
import { WordHuntPrizes } from './WordHuntPrizes';
import { WordHuntTimer } from './WordHuntTimer';

export class WordHuntSection extends MyTourSection
{
    timer: WordHuntTimer;
    lettersBox: WordHuntLetterbox;
    prizes: WordHuntPrizes;

    constructor()
    {
        const options = {
            headerIcon: 'abc-graffiti-icon.png',
            h1Options: {
                label: 'word-hunt',
                fill: 0x07294a,
                fontSize: 40,
                fontFamily: 'Titan One',
            },
            h2Options: {
                label: 'collect-letters',
                fill: 0x6fb500,
                fontSize: 35,
                fontFamily: 'Lilita One',
            },
        };

        super(options);

        this.timer = this.addChild(new WordHuntTimer());
        this.lettersBox = this.addChildAt(new WordHuntLetterbox(), 0);
        this.lettersBox.y = -180;
        this.prizes = this.addChild(new WordHuntPrizes());
    }

    open(): void
    {
        this.prizes.show();
    }

    resize(w: number, h: number): void
    {
        super.resize(w, h);
        this.timer.x = this.h2Label.x + (this.timer.base.width / 2);
        this.timer.y = this.h2Label.y + this.h2Label.height + (this.timer.base.height / 2) + 5;
    }
}
