import { gsap } from 'gsap';
import { Container, Sprite, Texture } from 'pixi.js';
import { Button } from './Button';
export class AnimatedButton extends Button {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const view = new Container();
        super(view, options);
        this.animate = true;
        this.animateIcon = true;
        this.view = view;
        this.scales = {
            out: (_b = (_a = options.scales) === null || _a === void 0 ? void 0 : _a.out) !== null && _b !== void 0 ? _b : 1,
            over: (_d = (_c = options.scales) === null || _c === void 0 ? void 0 : _c.over) !== null && _d !== void 0 ? _d : 1.1,
            down: (_f = (_e = options.scales) === null || _e === void 0 ? void 0 : _e.down) !== null && _f !== void 0 ? _f : 0.9,
            iconOut: (_h = (_g = options.scales) === null || _g === void 0 ? void 0 : _g.iconOut) !== null && _h !== void 0 ? _h : 1,
            iconOver: (_k = (_j = options.scales) === null || _j === void 0 ? void 0 : _j.iconOver) !== null && _k !== void 0 ? _k : 1.2,
        };
        this.textures = {
            out: Texture.from(options.textures.out),
            over: options.textures.over ? Texture.from(options.textures.over) : Texture.from(options.textures.out),
            down: options.textures.down ? Texture.from(options.textures.down) : Texture.from(options.textures.out),
            icon: options.textures.icon ? Texture.from(options.textures.icon) : Texture.EMPTY,
        };
        const out = () => gsap.to(this.holder.scale, {
            duration: 0.3,
            x: this.scales.out,
            y: this.scales.out,
            ease: 'back.inOut(2)',
        });
        const over = () => gsap.to(this.holder.scale, {
            duration: 0.6,
            x: this.scales.over,
            y: this.scales.over,
            ease: 'elastic.out',
        });
        const down = () => gsap.to(this.holder.scale, {
            duration: 0.14,
            x: this.scales.down,
            y: this.scales.down,
            ease: 'back.out',
        });
        const iconOut = () => gsap.to(this.icon.scale, {
            duration: 0.34,
            x: this.scales.iconOut,
            y: this.scales.iconOut,
            ease: 'power1.inOut',
        });
        const iconOver = () => gsap.to(this.icon.scale, {
            duration: 0.8,
            x: this.scales.iconOver,
            y: this.scales.iconOver,
            ease: 'elastic.out(1.6, 0.3)',
        });
        this.animations = {
            out: ((_l = options.animations) === null || _l === void 0 ? void 0 : _l.out) || out,
            over: ((_m = options.animations) === null || _m === void 0 ? void 0 : _m.over) || over,
            down: ((_o = options.animations) === null || _o === void 0 ? void 0 : _o.down) || down,
            iconOut: ((_p = options.animations) === null || _p === void 0 ? void 0 : _p.iconOut) || iconOut,
            iconOver: ((_q = options.animations) === null || _q === void 0 ? void 0 : _q.iconOver) || iconOver,
        };
        this.currentTextures = {
            out: this.textures.out,
            over: this.textures.over,
            down: this.textures.down,
            icon: this.textures.icon,
        };
        this.holder = new Container();
        this.view.addChild(this.holder);
        this.bg = Sprite.from(this.textures.out);
        this.bg.anchor.set(0.5);
        this.holder.addChild(this.bg);
        this.holder.scale.set(this.scales.out);
        this.icon = Sprite.from(this.textures.icon);
        this.icon.anchor.set(0.5);
        this.icon.scale.set(this.scales.iconOut);
        this.holder.addChild(this.icon);
        this.view.interactive = this.view.buttonMode = true;
    }
    down() {
        this.textures.down && (this.bg.texture = this.currentTextures.down);
        if (this.animate) {
            this.stopAnimations();
            this.tween = this.animations.down();
        }
    }
    up() {
        this.bg.texture = this.currentTextures.out;
        this.stopAnimations();
        this.tween = this.animations.out();
        this.tweenIcon = this.animations.iconOut();
    }
    hover() {
        this.textures.over && (this.bg.texture = this.currentTextures.over);
        if (this.animate) {
            this.stopAnimations();
            this.tween = this.animations.over();
        }
        if (this.animateIcon) {
            this.tweenIcon = this.animations.iconOver();
        }
    }
    stopAnimations() {
        this.tween && this.tween.kill();
        this.tweenIcon && this.tweenIcon.kill();
    }
}
//# sourceMappingURL=AnimatedButton.js.map