import mapManager from './mapManager.js';

class SpriteManager {
    constructor() {
        this.image = new Image();
        this.sprites = [];
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.characters = [];
    }

    loadAtlas(atlasJson, atlasImg) {
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                this.parseAtlas(request.responseText);
            }
        };
        request.open('GET', atlasJson, true);
        request.send();
        this.loadImage(atlasImg);
    }

    parseAtlas(atlasJSON) {
        const atlas = JSON.parse(atlasJSON);
        for (const name in atlas.frames) {
            const frame = atlas.frames[name].frame;
            this.sprites.push({name, x: frame.x, y: frame.y, w: frame.w, h: frame.h});
        }
        this.jsonLoaded = true;
    }

    loadImage(imgName) {
        this.image.onload = () => {
            this.imgLoaded = true;
        };
        this.image.src = imgName;
    }

    getSprite(name) {
        for (let i = 0; i < this.sprites.length; i++) {
            let s = this.sprites[i];
            if (s.name === name) {
                return s;
            }
        }
        return null;
    }

    drawSprite(ctx, name, x, y, dx = 0, dy = 0) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => this.drawSprite(ctx, name, x, y, dx, dy), 100);
        } else {
            const sprite = this.getSprite(name);
            if (!mapManager.isVisible(x, y, sprite.w, sprite.h))
                return;
            x -= mapManager.view.x;
            y -= mapManager.view.y;

            ctx.drawImage(this.image, sprite.x + dx, sprite.y + dy, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
        }
    }
}

const spriteManager = new SpriteManager();
export default spriteManager;