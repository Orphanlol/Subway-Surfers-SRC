import GameConfig from '../GameConfig';
import { SubwaySurfersApp } from '../SubwaySurfersApp';
import { ModelViewer } from './ModelViewer';

/**
 * Extra funcionality for the app, like model and chunk viewer
 * Only for debug and development
 */
export class AppExtras
{
    public app: SubwaySurfersApp;

    constructor(app: SubwaySurfersApp)
    {
        this.app = app;

        switch (GameConfig.extra)
        {
            case 'models':
                this.initModelViewer();
                break;
            case 'chunks':
                this.initChunkViewer();
                break;
        }
    }

    /**
     * Init the app in model viewer mode, for dev/debug only
     */
    public async initModelViewer(): Promise<void>
    {
        await this.app.resources.load('preload', 'font');
        document.body.appendChild(this.app.stage.view);
        await this.app.resources.load(
            'game-basic',
            'game-full',
            'game-idle',
            'boards',
            'characters-basic',
            'characters-idle',
            'data',
        );
        this.app.viewer = this.app.addExtension(new ModelViewer());
        this.app.hideLoadingMessage();
    }

    /**
     * Init the app in chunk viewer mode, for dev/debug only
     */
    public async initChunkViewer(): Promise<void>
    {
        await this.app.resources.load('preload', 'font');
        document.body.appendChild(this.app.stage.view);
        await this.app.resources.load(
            'chunks-idle',
            'chunks-basic',
            'chunks-full',
            'game-basic',
            'game-full',
            'game-idle',
        );
        this.app.viewer = this.app.addExtension(new ModelViewer());
        this.app.hideLoadingMessage();
    }
}
