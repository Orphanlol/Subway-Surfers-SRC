export enum AwardTierType
    {
    BRONZE = 0,
    SILVER = 1,
    GOLD = 2,
    DIAMOND = 3,
    COMPLETED = 4,
}

export interface AwardTier
{
    goal: number,
    reward: number
}

export interface AwardProgress
{
    tier: AwardTierType,
    value: number,
}

export interface AwardData
{
    bronze: AwardTier,
    silver: AwardTier,
    gold: AwardTier,
    diamond: AwardTier,
}

export const AwardTierNames = ['bronze', 'silver', 'gold', 'diamond'];
