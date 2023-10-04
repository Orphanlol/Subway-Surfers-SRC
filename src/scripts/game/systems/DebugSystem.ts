import GameConfig from '../../GameConfig';
import { FreeCameraComponent } from '../components/FreeCamera';
import GameEntity from '../GameEntity';
import { GameSystem } from '../GameSystem';

class DebugText
{
    public element: HTMLDivElement;
    public showing = false;

    constructor()
    {
        this.element = document.createElement('tag') as HTMLDivElement;
        this.element.style.position = 'absolute';
        // this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.3';
        this.element.style.fontFamily = 'Arial';
        this.element.style.color = '#FFFFFF';
        this.element.style.display = 'block';
        this.element.style.overflow = 'hidden';
        this.element.style.fontSize = '0.7em';
        this.element.style.padding = '5px';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }

    public toggle(): void
    {
        this.showing ? this.hide() : this.show();
    }

    public show()
    {
        this.showing = true;
        document.body.appendChild(this.element);
    }

    public hide()
    {
        this.showing = false;
        this.element.remove();
    }

    public update(str: string)
    {
        this.element.innerText = str;
    }
}

export default class DebugSystem extends GameSystem
{
    public freeCameraOn = false;
    public debugStats: DebugText;

    constructor(entity: GameEntity)
    {
        super(entity);
        this.freeCameraOn = false;
        window.addEventListener('keydown', this.onKeyDown.bind(this));

        this.debugStats = new DebugText();

        setInterval(() => this._update(), 100);
    }

    private _update(): void
    {
        if (!this.game || this.game.app.crashed) return;
        const text = [
            str('ENGINE', this.game.profile),
            str('STATS', this.game.stats.profile),
            str('CAMERA', this.game.camera.profile),
            str('PHYSICS', this.game.physics.stats),
        ];

        this.debugStats.update(text.join('\n'));
    }

    private onKeyDown(e: KeyboardEvent): void
    {
        if (e.key === 'z') this.toggleFreeCamera();
        if (e.key === 'x') this.debugStats.toggle();
        if (this.freeCameraOn) return;
        if (e.key === 't') this.game.level.reshuffle();
        if (e.key === 'm') this.game.hero.magnet.turnOn();
        if (e.key === 'j') this.game.hero.jetpack.turnOn();
        if (e.key === 'q') this.game.hero.pogo.turnOn();
        if (e.key === 's') this.game.hero.sneakers.turnOn();
        if (e.key === 'e') this.game.hero.multiplier.turnOn();
    }

    private toggleFreeCamera(): void
    {
        this.freeCameraOn ? this.endFreeCamera() : this.beginFreeCamera();
    }

    private beginFreeCamera(): void
    {
        if (this.freeCameraOn) return;
        this.freeCameraOn = true;
        this.game.timeScale = 0;
        this.game.camera.suspend = true;
        this.game.camera.mainCamera.addComponent(FreeCameraComponent as any, {});
        console.log('[DebugSystem] begin');
    }

    private endFreeCamera(): void
    {
        if (!this.freeCameraOn) return;
        this.freeCameraOn = false;
        this.game.camera.suspend = false;
        this.game.camera.mainCamera.removeComponent(FreeCameraComponent as any);
        // this.game.camera.mainCamera.position.set(0);
        // this.game.camera.mainCamera.rotation.set(0);
        this.game.timeScale = GameConfig.timeScale;
        console.log('[DebugSystem] finish');
    }
}

function str(title: string, obj: any, fields?: string[])
{
    if (!fields) fields = Object.keys(obj);
    let str = '';

    for (const i in fields)
    {
        const k = fields[i];
        let v = obj[k];

        if (typeof (v) === 'number' && v % 1 !== 0) v = v.toFixed(3);
        str += `${k}: ${v}\n`;
    }

    return `${title.toUpperCase()}\n${str}`;
}
