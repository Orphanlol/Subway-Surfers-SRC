export default class Platform
{
    public static getUrlParams(): Record<string, number | string | boolean>
    {
        const url = location.search;
        const items = url.slice(url.indexOf('?') + 1).split('&');
        const params = {} as Record<string, any>;

        for (const item of items)
        {
            const split = item.split('=');
            const k = split[0];
            let v = split[1] as any;

            if (v === undefined) v = true;
            if (v === 'true' || v === 'false') v = v === 'true';
            if (typeof (v) === 'string')
            {
                if (v.indexOf('[') === 0 && v.indexOf(']') === v.length - 1)
                {
                    params[k] = JSON.parse(v);
                }
                else params[k] = v.match(/^[-.0-9]+$/) ? parseFloat(v) : v;
            }
            else
            {
                params[k] = v;
            }
        }

        return params;
    }

    public static getUrlParam(name: string, fallback?: number | string | boolean): number | string | boolean | undefined
    {
        const params = this.getUrlParams();

        return params[name] !== undefined ? params[name] : fallback;
    }
}
