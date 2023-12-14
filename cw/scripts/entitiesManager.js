import spriteManager from "./spriteManager.js";
import mapManager from "./mapManager.js";
import soundManager from "./soundManager.js";
import physicManager from "./physicManager.js";

class Entity {
    constructor() {
        this.pos_x = 0;
        this.pos_y = 0;
        this.size_x = 0;
        this.size_y = 0;
    }

    extend(extendProto) {
        const object = Object.create(this);
        for (const property in extendProto) {
            if (this.hasOwnProperty(property) || typeof object[property] === 'undefined') {
                object[property] = extendProto[property];
            }
        }
        return object;
    }
}

export class Player extends Entity {
    constructor() {
        super();
        this.life = 100;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 10;
        this.points = 0;
    }

    move() {
        if (this.move_x === 1 && physicManager.update(this) === "move") {
            this.pos_x += this.speed;
        }
        if (this.move_x === -1 && physicManager.update(this) === "move") {
            this.pos_x -= this.speed;
        }
        if (this.move_y === 1 && physicManager.update(this) === "move") {
            this.pos_y += this.speed;
        }
        if (this.move_y === -1 && physicManager.update(this) === "move") {
            this.pos_y -= this.speed;
        }
    }

    draw(ctx, drawCounter, dyCounter) {
        if (this.move_x === 1) {
            spriteManager.drawSprite(ctx, 'Player', this.pos_x, this.pos_y, drawCounter * 64, dyCounter * 64 + 320);
            return;
        }
        if (this.move_x === -1) {
            spriteManager.drawSprite(ctx, 'Player', this.pos_x, this.pos_y, drawCounter * 64, dyCounter * 64 + 192);
            return;
        }
        if (this.move_y === -1) {
            spriteManager.drawSprite(ctx, 'Player', this.pos_x, this.pos_y, drawCounter * 64, dyCounter * 64 + 448);
            return;
        }
        if (this.move_y === 1) {
            spriteManager.drawSprite(ctx, 'Player', this.pos_x, this.pos_y, drawCounter * 64, dyCounter * 64 + 64);
            return;
        }
        spriteManager.drawSprite(ctx, 'Player', this.pos_x, this.pos_y);
    }
}

export class Bee extends Entity {
    constructor() {
        super();
        this.damage = 5;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 3;
    }

    draw(ctx, counter, dy, player) {
        this.checkPlayer(player);
        spriteManager.drawSprite(ctx, 'Bee', this.pos_x, this.pos_y, counter * 64);
    }

    checkPlayer(player) {
        if (this.pos_x - 60 <= player.pos_x && this.pos_x + 60 >= player.pos_x
            && this.pos_y - 60 <= player.pos_y && this.pos_y + 60 >= player.pos_y) {
            const direction = {
                x: player.pos_x - this.pos_x,
                y: player.pos_y - this.pos_y
            };

            if (this.pos_x - 60 <= player.pos_x && this.pos_x + 60 >= player.pos_x)
                if (direction.x > 0)
                    this.move_x = 1;
                else
                    this.move_x = -1;
            if (this.pos_y - 60 <= player.pos_y && this.pos_y + 60 >= player.pos_y)
                if (direction.y > 0)
                    this.move_y = 1;
                else
                    this.move_y = -1;

            if (this.move_x === 1) {
                this.pos_x += this.speed;
            }
            if (this.move_x === -1) {
                this.pos_x -= this.speed;
            }
            if (this.move_y === 1) {
                this.pos_y += this.speed;
            }
            if (this.move_y === -1) {
                this.pos_y -= this.speed;
            }

        }
        if (this.pos_x - 10 <= player.pos_x && this.pos_x + 10 >= player.pos_x
            && this.pos_y - 10 <= player.pos_y && this.pos_y + 10 >= player.pos_y) {
            if (player.life > 0)
                player.life -= this.damage;
            soundManager.play('../sounds/hit.wav', {looping: false, volume: 0.8});
        }
    }
}

export class GreenCoin extends Entity {
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.points = 30;
        this.health = 10;
        this.isVisible = true;
    }

    draw(ctx, counter, dy, player, user) {
        this.checkPlayer(player, user);
        if (this.isVisible)
            spriteManager.drawSprite(ctx, 'GreenCoin', this.pos_x, this.pos_y, counter * 32);
    }

    checkPlayer(player, user) {
        if (this.pos_x - 20 - this.size_x <= player.pos_x && this.pos_x + 20 >= player.pos_x
            && this.pos_y - this.size_y - 20 <= player.pos_y && this.pos_y + 20 >= player.pos_y && this.isVisible) {
            player.points += this.points;
            user.score += this.points;
            player.life += this.health;
            soundManager.play('../sounds/bonus.wav', {looping: false, volume: 0.8});
            this.isVisible = false;
            console.log(player.points, player.life);
        }
    }
}

export class GoldCoin extends Entity {
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.points = 20;
        this.isVisible = true;
    }

    draw(ctx, counter, dy, player, user) {
        this.checkPlayer(player, user);
        if (this.isVisible)
            spriteManager.drawSprite(ctx, 'GoldCoin', this.pos_x, this.pos_y, counter * 32);
    }

    checkPlayer(player, user) {
        if (this.pos_x - 20 - this.size_x <= player.pos_x && this.pos_x + 20 >= player.pos_x
            && this.pos_y - this.size_y - 20 <= player.pos_y && this.pos_y + 20 >= player.pos_y && this.isVisible) {
            player.points += this.points;
            user.score += this.points;
            soundManager.play('../sounds/bonus.wav', {looping: false, volume: 0.8});
            this.isVisible = false;
            console.log(player.points);
        }
    }
}

export class SilverCoin extends Entity {
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.points = 10;
        this.isVisible = true;
    }

    draw(ctx, counter, dy, player, user) {
        this.checkPlayer(player, user);
        if (this.isVisible)
            spriteManager.drawSprite(ctx, 'SilverCoin', this.pos_x, this.pos_y, counter * 32);
    }

    checkPlayer(player, user) {
        if (this.pos_x - 20 - this.size_x <= player.pos_x && this.pos_x + 20 >= player.pos_x
            && this.pos_y - this.size_y - 20 <= player.pos_y && this.pos_y + 20 >= player.pos_y && this.isVisible) {
            player.points += this.points;
            user.score += this.points;
            soundManager.play('../sounds/bonus.wav', {looping: false, volume: 0.8});
            this.isVisible = false;
            console.log(player.points);
        }
    }
}

export class Chest extends Entity {
    constructor() {
        super();
        this.isFull = false;
        this.coins = 0;
        this.isOpen = false;
    }

    draw(ctx, counter, dy, player) {
        this.checkPlayer(player);
        if (this.isOpen && !this.isFull)
            spriteManager.drawSprite(ctx, 'Chest', this.pos_x, this.pos_y, 48);
        else if (this.isFull)
            spriteManager.drawSprite(ctx, 'Chest', this.pos_x, this.pos_y, 96);
        else
            spriteManager.drawSprite(ctx, 'Chest', this.pos_x, this.pos_y);
    }

    checkPlayer(player) {
        if (this.pos_x - 10 - this.size_x <= player.pos_x && this.pos_x + 10 >= player.pos_x
            && this.pos_y - this.size_y - 10 <= player.pos_y && this.pos_y + 10 >= player.pos_y) {
            this.isOpen = true;
            if (player.points >= 200) {
                this.isFull = true;
                player.win = true;
            }
        } else {
            this.isOpen = false;
        }
    }
}