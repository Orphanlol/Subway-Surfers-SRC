/* eslint-disable @typescript-eslint/no-use-before-define */
import {
    Animator3DComponent,
    CameraEntity,
    Entity3D,
    getGUI,
    OrbitalCameraEntity,
    OrbitalComponent,
    Scene3D,
} from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import { app } from '../SubwaySurfersApp';
import debugAnimations from '../utils/debugAnimations';
import EntityTools from './EntityTools';

export class ModelViewer extends Scene3D
{
    public ui: UI;
    public currentEntity?: Entity3D;
    public holder: Entity3D;

    constructor()
    {
        super({
            stage: new PIXI.Container(),
            camera: new OrbitalCameraEntity(),
            renderer: app.stage.renderer,
            culling: false,
        });

        app.stage.mainContainer.addChild(this.stage);
        app.stage.renderer.backgroundColor = 0x111111;

        this.holder = new Entity3D();
        this.addChild(this.holder as any);

        this.mainCamera.camera.near = 0.01;
        this.mainCamera.camera.far = 99999;

        this.ui = new UI(this);
        this.resetCamera();

        setTimeout(() =>
        {
            const lastEntityName = localStorage.getItem('viewer-entity-name');
            const lastEntityType = localStorage.getItem('viewer-entity-type');

            if (lastEntityName && lastEntityType) this.setEntity(lastEntityName, lastEntityType);
        }, 100);
    }

    public get mainCamera(): CameraEntity
    {
        return this.view3d.camera;
    }

    public get stage(): PIXI.Container
    {
        return this.view3d.stage;
    }

    public setEntity(name: string, type = 'model'): void
    {
        if (!name || !type) return;
        if (this.currentEntity) this.holder.removeChild(this.currentEntity as any);

        console.log('Selecting ', type);

        try
        {
            switch (type)
            {
                case 'scene':
                    this.setScene(name);
                    break;
                case 'model':
                    this.setModel(name);
                    break;
            }
        }
        catch (error)
        {
            localStorage.removeItem('viewer-entity-name');
            localStorage.removeItem('viewer-entity-type');
            console.error(error);

            return;
        }

        localStorage.setItem('viewer-entity-name', name);
        localStorage.setItem('viewer-entity-type', type);
    }

    public setModel(name: string): void
    {
        console.log('[ModelViewer] Set entity:', name);
        const en = app.library.getEntity(name);

        this.holder.scale.set(0.2);
        this.holder.rotation.y = Math.PI;
        this.holder.addChild(en as any);
        this.currentEntity = en;
        this.resetCamera();
    }

    public setScene(name: string): void
    {
        console.log('[ModelViewer] Set scene:', name);
        const en = app.library.getScene(name);

        this.holder.scale.set(5);
        this.holder.rotation.y = 0;
        this.holder.addChild(en as any);
        this.currentEntity = en;

        const oldComp = en.getComponent(Animator3DComponent as any) as Animator3DComponent;

        if (oldComp)
        {
            debugAnimations(oldComp);

            const camera = { lockCamera: false };

            getGUI().add(camera, 'lockCamera').onChange((v: boolean) =>
            {
                this.mainCamera.getComponent(OrbitalComponent).lock(v);
                this.mainCamera.getComponent(OrbitalComponent).lockZoom(v);
            });
            const map = EntityTools.childrenFlatMap(en, {}, '', 10);

            for (const key in map)
            {
                const func = { active: (v) => { } };
                let active = true;

                // if (map[key].name.search(/outfit/g) !== -1)
                {
                    getGUI().add(func, 'active').name(map[key].name).onChange(() =>
                    {
                        active = !active;
                        map[key].active = active;
                    });
                }
            }
        }

        this.resetCamera();
    }

    private resetCamera(): void
    {
        const orbital = this.mainCamera.getComponent(OrbitalComponent as any) as any;

        orbital._radius = 5;
        orbital._targetRadius = 5;
        orbital._isDown = false;

        orbital.center.set(0, 0, 0);

        orbital.easing = 0.1;
        orbital.sensitivity = 0.1;
        orbital.sensitivityRotation = 1;

        orbital._isLocked = false;
        orbital._isZoomLocked = false;
        orbital._rx = 0;
        orbital._trx = 0;
        orbital._prevx = 0;
        orbital._ry = 0;
        orbital._try = 0;
        orbital._prevy = 0;

        orbital._vec.set(0, 0, 0);
        orbital.euler.set(0, 0, 0, 'YXZ');

        orbital._mouseDown.x = 0;
        orbital._mouseDown.y = 0;
        orbital._mouse.x = 0;
        orbital._mouse.y = 0;

        this.mainCamera.transform.position.x = 0;
        this.mainCamera.transform.position.y = 0;
        this.mainCamera.transform.position.z = 0;

        this.mainCamera.transform.lookAt(orbital.center);

        orbital.update();
    }
}

class UI
{
    public element: HTMLDivElement;
    public viewer: ModelViewer;
    public models: LibraryMenu;
    public scenes: LibraryMenu;

    constructor(viewer: ModelViewer)
    {
        this.viewer = viewer;
        this.element = document.createElement('div');
        this.element.id = 'model-viewer';
        this.element.style.position = 'fixed';
        this.element.style.zIndex = '999';
        this.element.style.width = '100%';
        this.element.style.height = '100%';

        this.models = new LibraryMenu(this, 'model', 'left');
        this.scenes = new LibraryMenu(this, 'scene', 'right');

        this.show();
    }

    public show()
    {
        this.refresh();
        document.body.appendChild(this.element);
    }

    public hide()
    {
        document.body.removeChild(this.element);
    }

    public refresh()
    {
        this.models.refresh();
        this.scenes.refresh();
    }
}

class LibraryMenu
{
    public ui: UI;
    public align: string;
    public element: HTMLDivElement;
    public viewer: ModelViewer;
    public category: string;

    constructor(ui: UI, category = 'model', align = 'left')
    {
        this.ui = ui;
        this.viewer = ui.viewer;
        this.align = align;
        this.category = category;
        this.element = document.createElement('div');
        this.element.style.overflow = 'scroll';
        this.element.style.height = '100%';
        this.element.style.position = 'fixed';
        this.element.style.textAlign = align;
        if (align === 'right')
        {
            this.element.style.right = '0px';
        }
        this.ui.element.appendChild(this.element);
    }

    public refresh()
    {
        this.element.innerHTML = '';
        let list: any = app.library.geometries;

        if (this.category === 'scene') list = app.library.scenes;

        const keys = Object.keys(list).sort();

        for (const name of keys)
        {
            const btn = document.createElement('button') as HTMLButtonElement;

            btn.value = name;
            btn.style.display = 'block';
            if (this.align === 'right')
            {
                btn.style.marginLeft = 'auto';
                btn.style.marginRight = '0px';
                btn.style.textAlign = 'right';
            }
            btn.style.backgroundColor = '#222222';
            btn.style.color = '#AAAAAA';
            btn.style.cursor = 'pointer';
            btn.style.borderColor = '#000000';
            btn.style.fontSize = '11px';
            btn.style.lineHeight = '11px';
            btn.style.borderWidth = '1px';
            btn.innerText = name;
            btn.onclick = () => this.onSelect(btn.value);
            this.element.appendChild(btn);
        }
    }

    private onSelect(name: string)
    {
        this.viewer.setEntity(name, this.category);
    }
}
