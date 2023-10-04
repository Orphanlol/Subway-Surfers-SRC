/* eslint-disable tsdoc/syntax */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const FLAT_SEP = '.';

/**
 * ESPERIMENTAL - Extract differences between 2 objects.
 * Diff object is an object created from values of both objects
 * Ex.: Diff between {x: 1} and {x: 2}
 * Return the following: {x: {a: 1, b: 2}}
 * WARNING: Does not work well with arrays for now
 * @param a - First object
 * @param b - Second object
 */
export function diff(a: any, b: any): any
{
    const result = {} as any;
    const fields = {} as any;

    for (const k in a) fields[k] = 1;
    for (const k in b) fields[k] = 1;
    for (const k in fields)
    {
        const av = a[k];
        const bv = b[k];

        if (av === bv) continue;

        const at = typeof (av);
        const bt = typeof (bv);
        const aIsObject = at !== null && at === 'object';
        const bIsObject = bt !== null && bt === 'object';

        if (Array.isArray(av) && Array.isArray(bv))
        {
            result[k] = { a: bv.filter((e) => !av.includes(e)), b: av.filter((e) => !bv.includes(e)) };
        }
        else if (aIsObject && bIsObject)
        {
            result[k] = diff(av, bv);
        }
        else
        {
            result[k] = { a: av, b: bv };
        }
    }

    return result;
}

/**
 * Create a flat version of an object, meaning all subobject values
 * become first level in the flattened version
 * Ex.: {a: 1, b: {c: 2, d: 3}}
 * turns into {'a': 1, 'b.c': 2, 'b.d': 3}
 * WARNING: Does not work well with arrays for now
 * @param obj - Object to be flattened
 * @param path - Base path (for recursion)
 * @param out - Output object (for recursion)
 */

export function flatten(obj: any, path = '', out: any = {}): string[]
{
    for (const k in obj)
    {
        const v = obj[k];
        const p = path ? path + FLAT_SEP + k : k;
        const isObject = v !== null && typeof (v) === 'object';

        if (Array.isArray(v) || !isObject)
        {
            out[p] = v;
        }
        else
        {
            flatten(v, p, out);
        }
    }

    return out;
}

/**
 * Extract a regular object from the flattened version.
 * Reverts flat function
 * WARNING: Does not work well with arrays for now
 * @param obj - Flatten object
 */
export function unflatten(obj: any): any
{
    const out = {} as any;

    for (const p in obj)
    {
        const keys = p.split(FLAT_SEP);
        let sub = out;

        for (let i = 0; i < keys.length; i++)
        {
            const lastKey = i === keys.length - 1;

            if (!lastKey)
            {
                sub[keys[i]] = sub[keys[i]] || {};
            }
            else
            {
                sub[keys[i]] = obj[p];
            }
            sub = sub[keys[i]];
        }
    }

    return out;
}

/**
 * Get flat diff object from two objects
 * WARNING: Does not work well with arrays for now
 * @param a -
 * @param b -
 */
export function flattenDiff(a: any, b: any): any
{
    const fa = flatten(a);
    const fb = flatten(b);

    return diff(fa, fb);
}

/**
 * Check if object is empty
 * @param obj -
 */
export function isEmpty(obj: any)
{
    return Object.keys(obj).length === 0;
}
