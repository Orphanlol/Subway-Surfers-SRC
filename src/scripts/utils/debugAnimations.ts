import { Animation3D, Animator3DComponent,  getGUI } from '@goodboydigital/odie';

export default (ac: Animator3DComponent): void =>
{
    const animations = ac['_animations'] as Record<string, Animation3D>;

    const gui = getGUI();
    const controllers = gui.__controllers;

    for (let i = controllers.length - 1; i >= 0; i--)
    {
        const controller = controllers[i];

        gui.remove(controller);
    }

    const parent = document.getElementById('model-viewer');

    parent?.appendChild(gui.domElement.parentElement);

    ac.autoUpdate = false;
    for (const key in animations)
    {
        const a = animations[key] as Animation3D;

        const b = { currentTime: 0, autoPlay: false };

        const fps = 24;

        gui.add(b, 'currentTime').min(0).max(a.duration * fps).step(0.1)
            .name(key)
            .onChange((v: number) =>
            {
                ac['_animationTick'] = v / fps;
            })
            .listen();

        let interval: NodeJS.Timeout;

        gui.add(b, 'autoPlay').onChange((v: boolean) =>
        {
            if (v)
            {
                interval = setInterval(() => { b.currentTime = Math.floor(ac['_animationTick'] * fps); }, 10);
            }
            else clearInterval(interval);

            ac.autoUpdate = v;
        });
    }
};
