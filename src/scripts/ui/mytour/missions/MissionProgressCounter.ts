import { Container, Sprite } from 'pixi.js';

import Graph from '../../Graph';

const TOTAL_MISSIONS = 3;

export class MissionProgressCounter extends Container
{
    private completedCounters: Container[] = [];

    constructor()
    {
        super();
        const w = 166;

        const container = this.addChild(Graph.rectColor({
            w, h: 40,
            color: 0xacbfd3,
            round: 14,
        }));

        const prizeIcon = container.addChild(Sprite.from('mission-multiplier-reward.png'));

        prizeIcon.anchor.set(0.5);
        prizeIcon.x = w / 2;
        const totalPadding = 40;
        const slotWidth = (w - (prizeIcon.width / 2) - totalPadding) / TOTAL_MISSIONS;

        for (let i = 0; i < TOTAL_MISSIONS; i++)
        {
            let slot: Container = container.addChild(Graph.rectColor({
                w: slotWidth, h: 16,
                color: 0x7692ad,
                round: 5,
            }));

            slot.x = (-w / 2) + ((slotWidth + (totalPadding / 4)) * (i + 1)) - (slotWidth / 2);

            this.completedCounters[i] = slot;
            const borderWidth = 4;

            slot = container.addChild(Graph.rectBorder({
                w: slotWidth - borderWidth, h: 16 - borderWidth,
                color: 0x8fd326,
                borderColor: 0x64aa1d,
                borderWidth,
                round: 8,
            }));
            slot.visible = false;

            slot.x = (-w / 2) + ((slotWidth + (totalPadding / 4)) * (i + 1)) - (slotWidth / 2);
            this.completedCounters[i + TOTAL_MISSIONS] = slot;
        }
    }

    setProgress(i: number, completed: boolean):void
    {
        this.completedCounters[i].visible = completed;
    }
}
