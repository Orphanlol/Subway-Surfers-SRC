import { Entity3D, Sphere, View3DComponent } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

export class OdieUtils
{
    /**
     * Multiply every position point on a geometry, and implicitly flag geometry as scaled
     * @param geometry - Geometry to be scaled
     * @param scale - Value multiplier
     */
    public static scaleGeometry(geometry: PIXI.Geometry, scale = 100): void
    {
        // Position buffer
        const buffer = (geometry as any).geometry ? (geometry as any).geometry.buffers[0] : (geometry as any).buffers[0];

        // Skip if this buffer was scaled already
        if (buffer.__scaled) return;
        buffer.__scaled = true;

        // Multiply every point by scale
        for (const i in buffer.data) buffer.data[i] *= scale;
    }

    /**
     * Safely get a copy of an entity children array, empty if there is none
     * @param entity - Entity to provide children array
     */
    public static entityChildren(entity: Entity3D): Entity3D[]
    {
        const array = entity.container && entity.container.children ? entity.container.children : [];

        return array.slice(0);
    }

    public static applyMap(entity: Entity3D, property: string, map: PIXI.Texture): void
    {
        if (entity.view3d && entity.view3d.material)
        {
            (entity.view3d.material as any).diffuseMap = map;
        }

        const children = OdieUtils.entityChildren(entity);
        let i = children.length;

        while (i--) OdieUtils.applyMap(children[i], property, map);
    }

    /**
     * Safe set material to an entity
     * @param entity - Entity to use the material
     * @param material - Material to be used
     * @param recursive - Set the same material for all the children
     */
    public static applyMaterial(entity: Entity3D, material: PIXI.Shader, recursive = false): void
    {
        if (entity.view3d) entity.view3d.material = material;

        if (!recursive) return;

        const children = OdieUtils.entityChildren(entity);
        let i = children.length;

        while (i--) OdieUtils.applyMaterial(children[i], material);
    }

    public static getSphere(entity: Entity3D, base: Sphere | null = null): Sphere | null
    {
        const view3d = entity.getComponent(View3DComponent as any) as View3DComponent;

        if (view3d)
        {
            const sphere = view3d.getBoundingSphere();

            if (!base || base.radius < sphere.radius) base = sphere;
        }

        const children = OdieUtils.entityChildren(entity);

        for (const child of children)
        {
            base = OdieUtils.getSphere(child, base);
        }

        return base;
    }
}
