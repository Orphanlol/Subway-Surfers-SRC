/**
 * Cookie wrapper using local storage interface
 */
export class CookieStorage implements Storage
{
    /**
     * Name of the cookie
     */
    public cookieName = 'cookiestorage';

    /**
     * How many days cookie will persist
     */
    public cookieExpireDays = 30;

    constructor(cookieName: string, cookieExpireDays = 30)
    {
        this.cookieName = cookieName;
        this.cookieExpireDays = cookieExpireDays;
    }

    /**
     * Get number of keys saved
     */
    public get length(): number
    {
        return this.getKeys().length;
    }

    /**
     * Get a list of saved keys
     */
    public getKeys(): string[]
    {
        const data = this.load();

        return (data._keys as string[]) || [];
    }

    /**
     * Empties the list associated with the object of all key/value pairs, if there are any.
     */
    public clear(): void
    {
        this.save({});
    }

    /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     */
    public getItem(key: string): string | null
    {
        const data = this.load();
        const value = data[key];

        return typeof value === 'string' ? value : null;
    }

    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     */
    public setItem(key: string, value: string): void
    {
        const data = this.load();

        data[key] = value;
        const keys: string[] = (data._keys as string[]) || [];

        if (keys.indexOf(key) < 0) keys.push(key);

        data._keys = keys;
        this.save(data);
    }

    /**
     * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
     */
    public removeItem(key: string): void
    {
        const data = this.load();

        const keys: string[] = (data._keys as string[]) || [];

        const keyIndex = keys.indexOf(key);

        if (keyIndex >= 0) keys.splice(keyIndex, 1);

        delete data[key];

        data._keys = keys;
        this.save(data);
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
     */
    public key(index: number): string | null
    {
        return this.getKeys()[index] || null;
    }

    /**
     * Save an object as json string
     * @param obj - Object to be saved
     */
    private save(obj: Record<string, string|string[]>)
    {
        try
        {
            const json = JSON.stringify(obj);

            this.setCookie(this.cookieName, json, this.cookieExpireDays);
        }
        catch (e)
        {
            console.warn('[CookieStorage] Cookie data could not be parsed');
        }
    }

    /**
     * Retrieve an object saved as json
     */
    private load(): Record<string, string|string[]>
    {
        const json = this.getCookie(this.cookieName);
        let data = {};

        try
        {
            data = JSON.parse(json);
        }
        catch (e)
        {
            console.warn('[CookieStorage] Cookie data could not be parsed');
        }

        return data;
    }

    /**
     * Set a cookie
     * @param cookieName - Name of the cookie to be saved
     * @param cookieValue - Value to be saved in this cookie
     * @param cookieExpireDays - Number of days from now that the cookie will expire
     */
    private setCookie(cookieName: string, cookieValue: string, cookieExpireDays = 30): void
    {
        const d = new Date();

        d.setTime(d.getTime() + (cookieExpireDays * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;

        document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
    }

    /**
     * Get saved value from a cookie. Return an empty string if not found.
     * @param cookieName - Name of the cookie to be retrieved
     */
    private getCookie(cookieName: string): string
    {
        const name = `${cookieName}=`;
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++)
        {
            let c = ca[i];

            while (c.charAt(0) === ' ')
            {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0)
            {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }
}
