/* eslint-disable @typescript-eslint/no-var-requires */

const sections = require('./sections');

let _chunkMap: any = null;
let _sectionMap: any = null;
let _resources: any = null;

export default class Data
{
    public static init(resources: Record<string, any>): void
    {
        // Set the main resource provider, usually astro resource cache
        _resources = resources;
        this.refreshCache();
    }

    // SECTIONS ---------------------------------------------------------------

    public static sectionMap(): Record<string, any>
    {
        if (_sectionMap) return _sectionMap;
        _sectionMap = {};
        extract(sections);
        function extract(data: any)
        {
            if (data.name !== undefined)
            {
                _sectionMap[data.name] = data;
            }
            else
            {
                for (const k in data) extract(data[k]);
            }
        }
        console.log('SECTION MAP', _sectionMap);

        return _sectionMap;
    }

    static section(name: string): Record<string, any>
    {
        name = name.replace('routeSection_', '');
        name = name.replace('route_section_', '');
        const map = this.sectionMap();
        const data = map[name] || map[`route_section_${name}`] || map[`routeSection_${name}`];

        if (!data) throw new Error(`Section data not found: ${name}`);

        return data;
    }

    static sectionClone(name: string): Record<string, any>
    {
        const map = this.sectionMap();

        if (!map[name]) throw new Error(`Section data not found: ${name}`);
        const section = map[name];

        return {
            name: section.name,
            start: section.start.slice(0),
            mid: section.start.slice(0),
            end: section.start.slice(0),
        };
    }

    // CHUNKS -----------------------------------------------------------------

    static chunkMap(noCache = false): Record<string, any>
    {
        if (_chunkMap && !noCache) return _chunkMap;
        _chunkMap = {};

        const chunks = {} as any;

        // Find chunks in the resource map
        for (const k in _resources)
        {
            if (k.indexOf('chunks-') >= 0)
            {
                chunks[k] = _resources[k];
            }
        }

        extract(chunks, 5);
        function extract(data: any, depth: number)
        {
            if (!data || !depth--) return;

            if (data.name === 'intro')
            {
                _chunkMap[data.name] = data;
            }
            else if (data.components && data.components.RouteChunk)
            {
                const name = data.components.RouteChunk._reportedName || data.name;
                // name = name.replace('route_chunk_', '');
                // name = name.replace('routeChunk_', '');

                _chunkMap[name] = data;
            }
            else if (data.children)
            {
                for (const k in data.children) extract(data.children[k], depth);
            }
            else
            {
                for (const k in data) extract(data[k], depth);
            }
        }

        return _chunkMap;
    }

    static chunk(name: string): Record<string, any>
    {
        name = name.replace('routeChunk_', '');
        name = name.replace('route_chunk_', '');
        const map = this.chunkMap();
        const data = map[name] || map[`routeChunk_${name}`] || map[`route_chunk_${name}`] || map[`default_${name}`];

        if (!data) throw new Error(`Chunk data not found: ${name}`);
        data.__name = name;

        return data;
    }

    static refreshCache(): void
    {
        _chunkMap = Data.chunkMap(true);
    }
}
