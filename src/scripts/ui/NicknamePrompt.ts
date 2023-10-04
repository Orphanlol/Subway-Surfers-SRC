import { i18n } from '@goodboydigital/astro';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';

type Callback = (...args: any[]) => void;

export default class NicknamePrompt
{
    public w = 400;
    public h = 120;
    public maxChars = 10;
    public useDefault = false;
    public element?: HTMLElement;
    public bg?: HTMLElement;
    public panel?: HTMLElement;
    public title?: HTMLElement;
    public input?: HTMLInputElement;
    public opened = false;
    public callback?: Callback;
    public titleId: string;

    protected _onKeyDownBind = this.onKeyUp.bind(this);

    constructor(titleId: string, maxChars = 10)
    {
        this.titleId = titleId;
        this.w = 400;
        this.h = 120;
        this.maxChars = maxChars;
        this.useDefault = GameConfig.useDefaultPrompt;

        this.build();
    }

    build(): void
    {
        if (this.element) return;
        const el = document.createElement('div');

        el.id = 'nickname-prompt';
        el.style.position = 'absolute';
        el.style.width = '100%';
        el.style.height = '100%';

        const bg = document.createElement('div');

        bg.id = 'nickname-prompt-bg';
        bg.style.position = 'absolute';
        bg.style.width = '100%';
        bg.style.height = '100%';
        bg.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        el.appendChild(bg);

        const panel = document.createElement('div');

        panel.id = 'nickname-prompt-panel';
        panel.style.position = 'absolute';
        panel.style.width = `${this.w}px`;
        panel.style.height = `${this.h}px`;
        panel.style.marginLeft = '50%';
        panel.style.left = `${-this.w / 2}px`;
        panel.style.top = `50%`;
        panel.style.marginTop = `${-this.h / 2}px`;
        panel.style.backgroundColor = '#eeeeee';
        panel.style.fontFamily = 'Lilita One';
        panel.style.textAlign = 'center';
        panel.style.color = '#004a80';
        panel.style.display = 'block';
        panel.style.overflow = 'hidden';
        panel.style.borderRadius = '16px';
        el.appendChild(panel);

        const title = document.createElement('div');

        title.id = 'nickname-prompt-title';
        title.style.fontSize = '1.5em';
        title.style.width = '100%';
        title.style.marginTop = '15px';
        title.style.textAlign = 'center';
        title.style.pointerEvents = 'none';
        title.style.userSelect = 'none';
        panel.appendChild(title);

        const input = document.createElement('input');

        input.id = 'nickname-prompt-input';
        input.style.fontSize = '2em';
        input.type = 'text';
        input.maxLength = this.maxChars;
        input.style.width = '80%';
        input.style.height = '30pt';
        input.style.textAlign = 'center';
        input.style.fontFamily = 'Lilita One';
        input.style.color = '#3a8bbf';
        input.style.margin = '5px';
        input.style.backgroundColor = '#FFFFFF';
        input.style.border = '0';
        panel.appendChild(input);

        this.bg = bg;
        this.panel = panel;
        this.title = title;
        this.input = input;
        this.element = el;

        this.input.addEventListener('input', this.onNameChange.bind(this));
        this.panel.addEventListener('mouseup', () => this.highlight());
        this.panel.addEventListener('touchend', () => this.highlight());
        this.bg.addEventListener('mouseup', () => this.hide());
        this.bg.addEventListener('touchend', () => this.hide());

        app.user.onGameSettingsChange.add(this.onUserChange, this);
    }

    onUserChange(): void
    {
        if (this.input) this.input.value = app.user.name;
    }

    show(): void
    {
        if (this.opened) return;
        this.opened = true;

        document.addEventListener('keyup', this._onKeyDownBind);

        if (this.title) this.title.innerText = i18n.translate(this.titleId);
        if (this.input) this.input.value = app.user.name;
        if (this.element) document.body.appendChild(this.element);
        this.input?.select();
        this.input?.focus();
    }

    hide(): void
    {
        if (!this.opened) return;
        app.sound.play('gui-tap');
        this.opened = false;
        document.removeEventListener('keyup', this._onKeyDownBind);
        if (this.input) this.input.blur();
        if (this.element) document.body.removeChild(this.element);
    }

    onKeyUp(e: KeyboardEvent): void
    {
        if (e.code === 'Enter' && !e.repeat) this.hide();
    }

    onNameChange(): void
    {
        if (!this.input || !this.input.value) return;
        app.user.nameSetByUser = true;
        app.user.name = this.input.value;
        app.user.save();
    }

    onCancel(): void
    {
        // this.close();
        if (this.callback) this.callback();
    }

    highlight(): void
    {
        if (!this.input) return;
        this.input.focus();
        // this.input.value = '';
        if (this.input.select) this.input.select();
        if (this.input.setSelectionRange)
        {
            this.input.setSelectionRange(0, this.input.value.length);
        }
    }
}
