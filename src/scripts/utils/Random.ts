export default class Random
{
    static color(): number
    {
        return Math.floor(0xFFFFFF * Math.random());
    }

    static range(min: number, max: number, floor = false): number
    {
        const v = min + ((max - min) * Math.random());

        return floor ? Math.floor(v) : v;
    }

    static pick(...args: any[]): any
    {
        return args[Math.floor(Math.random() * args.length)];
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static item(obj: any): any
    {
        if (Array.isArray(obj))
        {
            return obj[Math.floor(Math.random() * obj.length)];
        }
        const keys = Object.keys(obj);
        const key = keys[Math.floor(Math.random() * keys.length)];

        return obj[key];
    }

    public static shuffle(array: any[]): any[]
    {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;

        while (currentIndex !== 0)
        {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
}
