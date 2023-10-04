import Random from '../../utils/Random';

/**
 * NodeCom is json object representation of an Unity Component
 */
export type NodeComp = Record<string, any>;

/**
 * NodeObj is basically json object representation of Unity GameObject
 * They can be Chunk data or Entity data, but in 'Unity' fashion
 */
export interface NodeObj
{
    name: string;
    components: Record<string, NodeComp>;
    children?: NodeObj[];
}

/**
 * Functions to read and interpret nodes
 * This is a really bad choice of name, propably would be better to call that
 * UnityDataUtils or something like that
 */
export default class Node
{
    /**
     * Get a Unity component data from a node
     * @param node - NodeObj to be looked into
     * @param comp - Name of the component to searcj
     */
    public static comp(node: NodeObj, comp: string): NodeComp
    {
        return node.components[comp];
    }

    /**
     * Find out the NodeObj in this hyerarchy that refers to an Environment
     * @param node - NodeObj to search
     */
    public static environment(node: NodeObj): any
    {
        if (node.components.Environment) return node;

        if (!node.children) return null;

        let i = node.children?.length || 0;

        while (i--)
        {
            const env = this.environment(node.children[i]);

            if (env) return env;
        }

        return null;
    }

    /**
     * Find out the Environment type of a NodeObj
     * @param node - NodeObj to search
     */
    public static environmentType(node: NodeObj): string[] | null
    {
        if (!node.components.Environment) return null;
        const kind = node.components.Environment._environmentKind;

        return kind._type.split(',');
    }

    /**
     * Find out what are the Environment types allowed by this NodeObj
     * @param node - NodeObj to search
     */
    public static environmentKinds(node: NodeObj): void
    {
        const envs = node.components.RouteChunk._limitedAllowedEnvironmentKinds;
        const types = Random.item(envs)._type.split(',');

        Node.environment = types || [];
    }
}
