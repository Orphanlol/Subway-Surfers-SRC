import { CameraComponent, Component, Entity3D, Euler, Quaternion, Vector2, Vector3 } from '@goodboydigital/odie';

export interface FreeCameraOptions
{
    speed: number;
    rotationSensitivity: number;
    acceleration: number;
}

const defaultFreeCameraOptions: FreeCameraOptions = {
    speed: 1,
    rotationSensitivity: 0.02,
    acceleration: 1,
};

export class FreeCameraComponent extends Component<FreeCameraOptions>
{
    private _enabled: boolean;
    private axis: Vector3;
    private mouse: Vector2;
    private mouseDelta: Vector2;
    private mousePos: Vector2;
    private originalRotation: Vector3;
    private originalUpdateProjection?: (this: any, w: number, h: number) => void;
    public entity: Entity3D;

    constructor(entity: Entity3D, data: Partial<FreeCameraOptions> = {})
    {
        super(entity, { ...defaultFreeCameraOptions, ...data });

        this.entity = entity;
        this._enabled = false;
        this.axis = new Vector3();
        this.mouse = new Vector2();
        this.mousePos = new Vector2();
        this.mouseDelta = new Vector2();
        this.originalRotation = new Vector3();

        this.enable();
    }

    public enable(): void
    {
        if (this._enabled) return;
        this._enabled = true;

        console.log(this.entity.parent.parent.rotation);
        this.originalRotation.set(this.entity.rx, this.entity.ry, this.entity.rz);

        const camera = this.entity.getComponent(CameraComponent as any) as any;

        this.originalUpdateProjection = camera.updateProjection;
        camera.updateProjection = updateProjection;

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousemove', this.onMouseMove);
    }

    public disable(): void
    {
        if (!this._enabled) return;
        this._enabled = false;
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousemove', this.onMouseMove);

        this.entity.rotation.copyFrom(this.originalRotation);

        const camera = this.entity.getComponent(CameraComponent as any) as any;

        camera.updateProjection = this.originalUpdateProjection;
        camera.dirty++;
        // TODO just checking this is still needed as it is a bit smelly :P
        this.entity.transform['_onChange']();
    }

    public update(): void
    {
        if (!this._enabled) return;

        this.mouseDelta.x = this.mouse.x - this.mousePos.x;
        this.mouseDelta.y = this.mouse.y - this.mousePos.y;

        const target = this.entity;

        target.ry -= this.mouseDelta.x * this.data.rotationSensitivity;
        target.rx -= this.mouseDelta.y * this.data.rotationSensitivity;

        this.mousePos.x = this.mouse.x;
        this.mousePos.y = this.mouse.y;

        const matrix = target.transform.worldTransform;

        // FORWARD AND BACK
        const forward = matrix.extractForward(new Vector3());

        forward.multiplyScalar(-this.axis.z);
        target.x += forward.x;
        target.y += forward.y;
        target.z += forward.z;

        // LEFT AND RIGHT
        const right = matrix.extractRight(new Vector3());

        right.multiplyScalar(this.axis.x);
        target.x += right.x;
        target.y += right.y;
        target.z += right.z;

        // UP AND DOWN
        const up = matrix.extractUp(new Vector3());

        up.multiplyScalar(this.axis.y);
        target.x += up.x;
        target.y += up.y;
        target.z += up.z;
    }

    protected onMouseMove = (e: MouseEvent): void =>
    {
        this.mouse.x = e.clientX - (window.innerWidth / 2);
        this.mouse.y = e.clientY - (window.innerHeight / 2);
        if (!this.mousePos.x) this.mousePos.x = this.mouse.x;
        if (!this.mousePos.y) this.mousePos.y = this.mouse.y;
    };

    protected onKeyDown = (e: KeyboardEvent): void =>
    {
        if (e.repeat) return;
        switch (e.key)
        {
            case 'w':
                this.axis.z = -1;
                break;
            case 's':
                this.axis.z = 1;
                break;
            case 'a':
                this.axis.x = -1;
                break;
            case 'd':
                this.axis.x = 1;
                break;
            case 'q':
                this.axis.y = -1;
                break;
            case 'e':
                this.axis.y = 1;
                break;
        }
    };

    protected onKeyUp = (e: KeyboardEvent): void =>
    {
        switch (e.key)
        {
            case 'w':
                if (this.axis.z === -1) this.axis.z = 0;
                break;
            case 's':
                if (this.axis.z === 1) this.axis.z = 0;
                break;
            case 'a':
                if (this.axis.x === -1) this.axis.x = 0;
                break;
            case 'd':
                if (this.axis.x === 1) this.axis.x = 0;
                break;
            case 'q':
                if (this.axis.y === -1) this.axis.y = 0;
                break;
            case 'e':
                if (this.axis.y === 1) this.axis.y = 0;
                break;
        }
    };
}

const rot = new Quaternion();
const eul = new Euler(0, 0, 0, 'YXZ');
const sca = new Vector3(1, 1, 1);
const pos = new Vector3();

function updateProjection(this: any, w: number, h: number)
{
    eul.x = this.entity.rx;
    eul.y = this.entity.ry;
    eul.z = this.entity.rz;
    rot.setFromEuler(eul);

    this.entity.transform.worldTransform.extractPosition(pos);
    this.entity.transform.worldTransform.compose(pos, rot, sca);

    this.view.getInverse(this.entity.transform.worldTransform);
    this.projection.makePerspective(this.fov, w / h, this.near, this.far);

    this.dirty++;
}
