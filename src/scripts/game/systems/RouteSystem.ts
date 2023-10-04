/* eslint-disable quote-props */
import { Entity } from '@goodboydigital/odie';

import Game from '../../Game';
import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Math2 from '../../utils/Math2';
import Random from '../../utils/Random';
import Data from '../data/Data';
import sections from '../data/sections';
import { GameSystem } from '../GameSystem';

class RouteBuilder
{
    public game: Game;
    public minDistanceBetweenRepeats: number;
    public sectionsStart: Record<string, number>;
    public sectionsMid: Record<string, number>;
    public levels: string[];
    public picked?: Record<string, number>;
    public level = 0;
    public availableSections: any;
    // public sectionsMid: Record<string, number>;

    constructor(game: Game)
    {
        this.game = game;

        // Prevent repeated section in range
        // this.minDistanceBetweenRepeats = 1900;
        this.minDistanceBetweenRepeats = 2700;

        // Game start sections available
        this.sectionsStart = {
            'default_start': 10,
        };

        // Game sections available
        this.sectionsMid = {
            'default_b-s-b': 10,
            'default_choice': 10,
            'default_s-b-s-b': 10,
            'default_s-s': 10,
            'default_s-s-s-s': 10,
            'default_train_tops_1': 10,
            'default_train_tops_2': 10,
            'default_tunnel_notrain': 10,
            'default_ramp_1': 10,
            'default_epic': 20,
            'default_1_track': 30,
            'default_2_tracks': 10,
            'default_train_tops_moving': 10,
            'default_train_tops_moving_combined': 10,
            'default_train_tops_moving_multiple': 10,
            'default_tunnel': 30,
            'default_epic_various': 20,
            'default_4_units_3_tracks_b-s-b': 10,
            'default_4_units_3_tracks_choice': 10,
            'default_4_units_3_tracks_s-b-s-b': 10,
            'default_4_units_3_tracks_s-s': 10,
            'default_4_units_3_tracks_s-s-s-s': 10,
            'default_short_1_track': 10,
            'default_ramp_2': 10,
            'default_short_2_tracks': 10,
            'default_short_train_tops_moving_combined': 10,
            'default_short_train_tops_moving_multiple': 10,
            'default_short_train_tops_moving': 10,
            'default_pogostick_start': 5,
            'default_bonus_short': 10,
            'default_bonus_long': 10,
        };

        this.levels = ['easy', 'normal', 'hard', 'expert'];
        this.reset();
    }

    reset()
    {
        this.picked = {
            'default_tunnel': 1,
            'default_tunnel_notrain': 1,
        };
        this.level = 0;
        this.availableSections = {};
        this.addAvailableSections('easy');
    }

    getSectionByLevel(level: number)
    {
        if (!this.picked) this.picked = {};

        if (level > this.level)
        {
            this.level = level;
            const levelName = this.levels[this.level];

            this.addAvailableSections(levelName);
            if (level === 2)
            {
                this.addAvailableSection('default_bonus_short');
                this.addAvailableSection('default_bonus_long');
                this.addAvailableSection('default_pogostick_start');
            }
        }

        // Remove sections recently picked
        for (const f in this.picked)
        {
            if (this.game.stats.distance > this.picked[f])
            {
                delete this.picked[f];
            }
        }

        // Prevent repeated sections
        let available = Object.assign({}, this.availableSections);

        for (const f in this.picked) delete available[f];

        if (!Object.keys(available).length) this.addAvailableSections(this.levels[this.level]);

        available = Object.assign({}, this.availableSections);

        // Plain random available sections - weight should be considered here
        const section = Random.item(available);

        if (!section) throw new Error('No section available');
        if (section.__shortname.match('default_tunnel'))
        {
            this.picked['default_tunnel'] = this.game.stats.distance + (this.minDistanceBetweenRepeats * 0.75);
            this.picked['default_tunnel_notrain'] = this.game.stats.distance + (this.minDistanceBetweenRepeats * 0.75);
        }
        else
        {
            this.picked[section.__shortname] = this.game.stats.distance + this.minDistanceBetweenRepeats;
        }

        return section;
    }

    addAvailableSections(levelName: string)
    {
        const levelSections = (sections as any)[levelName].default;

        for (const f in levelSections)
        {
            this.addAvailableSection(levelSections[f]);
        }
    }

    addAvailableSection(section: any)
    {
        if (typeof (section) === 'string') section = Data.section(section);
        const fullName = section.name;
        const name = fullName.replace('routeSection_', '').replace('route_section_', '');

        if (!this.sectionsMid[name]) return;
        this.availableSections[name] = section;
        section.__shortname = name;
    }
}
export default class RouteSystem extends GameSystem
{
    public _spawns: Record<string, any>;
    public builder: RouteBuilder;
    public firstPassed = false;
    public hasTube = false;
    private _profile?: any;

    constructor(entity: Entity)
    {
        super(entity);
        this.game.onReset.add(this as any);
        this._spawns = {};
        this.builder = new RouteBuilder(this.game);
        this.firstPassed = false;
    }

    reset(): void
    {
        console.log('[RouteSystem] reset');
        this.builder.reset();
        this.firstPassed = false;
        this.game.stats.route = '';
        this._spawns = {
            pickup: -900,
            tube: -90,
        };
    }

    getSequence(): string[]
    {
        const level = Math2.clamp(this.game.stats.level, 0, 3);
        const sequence = [];
        const placed = [];
        const selectedSections = [];

        if (GameConfig.route)
        {
            selectedSections.push(Data.section('default_fallback'));
            selectedSections.push(Data.section(GameConfig.route));
        }
        else if (!this.firstPassed)
        {
            const startingSection = app.library.hasResourcesForFullGameplay() ? 'default_start' : 'basic_game';
            const firstSection = Data.section(this.game.tutorial.enabled ? 'tutorial' : startingSection);

            selectedSections.push(firstSection);
            this.firstPassed = true;
        }
        else if (!app.library.hasResourcesForFullGameplay())
        {
            selectedSections.push(Data.section('basic_game'));
        }
        else
        {
            selectedSections.push(this.builder.getSectionByLevel(level));
        }

        for (let i = 0; i < selectedSections.length; i++)
        {
            const section = selectedSections[i];

            // Repeated section in sequence, Skip...
            if (placed.indexOf(section.name) >= 0) continue;
            placed.push(section.name);

            // Append start chunks to the sequence
            if (section.start) for (const i in section.start) sequence.push(section.start[i]);

            // Append middle chunks to the sequence
            if (section.mid) sequence.push(Random.item(section.mid));
            // if (section.mid) for (let i in section.mid) sequence.push(section.mid[i]);

            // Append ending chunks to the sequence
            if (section.end) for (const i in section.end) sequence.push(section.end[i]);
        }

        // Make it easier to test chunks individually - can be a sequence of them, separated by comma
        if (GameConfig.chunk) return GameConfig.chunk.split(',');

        return sequence;
    }

    canSpawn(name: string, position: number): boolean
    {
        if (this._spawns[name] === undefined) return true;
        const last = this._spawns[name];
        const can = position <= last;
        // console.log('test', name, position, 'last:', this._spawns[name], 'can?', can);

        return can;
    }

    setSpawn(name: string, position: number): void
    {
        this._spawns[name] = position;
    }

    get profile(): Record<string, any>
    {
        if (!this._profile) this._profile = {};

        return this._profile;
    }

    resetSpawns(): void
    {
        this.builder.picked = {};
        this._spawns = {
            pickup: -900,
            tube: -90,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSpawnDistance(name: string, distance: number): void
    {
        // To verify if we really need this function
    }
}
