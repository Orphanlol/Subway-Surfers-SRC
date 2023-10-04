export type BoardAnimations ={
    run: string;
    jump: string[];
    resume: string|string[];
    grind: string[];
    grindLand: string|string[];
    roll: string;
    dodgeRight: string;
    dodgeLeft: string;
    start: string|string[];
};

export const boardsAnimationMap:Record<string, BoardAnimations> = {
    hoverboard: {
        run: 'h_run',
        jump: [
            'h_jump2_kickflip_flip',
            'h_jump3_bs360grab',
            'h_jump4_360_flip',
            'h_jump5_Impossible_flip',
            'h_jump6_nollie',
            'h_jump7_heelflip_flip',
            'h_jump8_pop_shuvit_flip',
            'h_jump9_fs360grab',
            'h_jump10_heel360_flip',
            'h_jump11_fs_salto',
            'h_jump',
        ],
        resume: 'h_jump9_fs360grab',
        grind: ['h_Grind1', 'h_Grind2', 'h_Grind3'],
        grindLand: ['h_Grind1_land', 'h_Grind2_land', 'h_Grind3_land'],
        roll: 'h_roll',
        dodgeRight: 'h_right',
        dodgeLeft: 'h_left',
        start: 'h_skate_on',
    },
    'stay-low': {
        run: 'Lowrider_Run',
        jump: [
            'Lowrider_Jump1',
            'Lowrider_Jump_3_Starfish_Frontflip',
            'Lowrider_Jump_2_BarrelRoll',
            'Lowrider_Jump_4_Handstand',
        ],
        resume: 'Lowrider_Jump_4_Handstand',
        grind: ['Lowrider_Grind1', 'Lowrider_Grind2'],
        grindLand: ['Lowrider_Grind1_land', 'Lowrider_Fat_Grind2_land'],
        roll: 'Lowrider_Down',
        dodgeRight: 'Lowrider_Changelane_Right1',
        dodgeLeft: 'Lowrider_Changelane_Left1',
        start: 'Lowrider_Board_on',
    },
    // TODO this is a temp object to prevent
    'zap-sideways': {
        run: 'h_run',
        jump: [
            'h_jump2_kickflip_flip',
            'h_jump3_bs360grab',
            'h_jump4_360_flip',
            'h_jump5_Impossible_flip',
            'h_jump6_nollie',
            'h_jump7_heelflip_flip',
            'h_jump8_pop_shuvit_flip',
            'h_jump9_fs360grab',
            'h_jump10_heel360_flip',
            'h_jump11_fs_salto',
            'h_jump',
        ],
        resume: 'h_jump9_fs360grab',
        grind: ['h_Grind1', 'h_Grind2', 'h_Grind3'],
        grindLand: ['h_Grind1_land', 'h_Grind2_land', 'h_Grind3_land'],
        roll: 'h_roll',
        dodgeRight: '',
        dodgeLeft: '',
        start: 'h_skate_on',
    },
};
