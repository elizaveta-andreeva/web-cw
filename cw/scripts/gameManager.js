import {Player, GoldCoin, GreenCoin, SilverCoin, Bee, Chest} from './entitiesManager.js';
import eventsManager from "./eventsManager.js";
import mapManager from "./mapManager.js";
import spriteManager from "./spriteManager.js";
import soundManager from "./soundManager.js";

const canvas = document.getElementById("canvasId");
const ctx = canvas.getContext("2d");

const playerScoreCanvas = document.getElementById("playerScoreCanvasId");
const playerScoreCtx = playerScoreCanvas.getContext("2d");

const rulesCanvas = document.getElementById("rulesCanvasId");
const rulesCtx = rulesCanvas.getContext("2d");

class GameManager {
    constructor() {
        this.factory = {};
        this.level = localStorage.getItem("mygame.level");
        this.entities = [];
        this.player = null;
        this.laterKill = [];
        this.coinsDrawCounter = 0;
        this.playerDrawCounter = 0;
        this.dyPlayerCounter = 0;
        this.end = false;
        this.interval = null;
        this.user = {};
    }

    initPlayer(obj) {
        this.player = obj;
        this.player.win = false;
    }

    initUser() {
        this.user.name = localStorage.getItem("mygame.username");
        let info = localStorage.getItem(`mygame.${this.user.name}`);
        if (!info) {
            this.user.score = 0;
        } else {
            info = JSON.parse(info);
            this.user.score = 0;
        }
    }

    saveUserInfo() {
        console.log(this.user.score)
        const info = {
            username: this.user.name,
            score: this.user.score,
        }
        let currentScore = JSON.parse(localStorage.getItem(`mygame.${this.user.name}`));
        if (!currentScore) {
            localStorage.setItem(`mygame.${this.user.name}`, JSON.stringify(info));
        }
        currentScore = JSON.parse(localStorage.getItem(`mygame.${this.user.name}`));
        console.log(this.user.score)
        if (currentScore.score < this.user.score && this.player.win)
            localStorage.setItem(`mygame.${this.user.name}`, JSON.stringify(info));
    }

    printHighestScore() {
        const keys = Object.keys(localStorage);
        let usersData = [];
        keys.forEach((key) => {
            console.log(key);
            if (key !== 'mygame.username' && key !== 'mygame.level') {
                usersData.push(JSON.parse(localStorage.getItem(key)));
            }
        });
        usersData.sort((a, b) => b.score - a.score);

        ctx.font = '30px Dots';
        ctx.fillStyle = "yellow";
        ctx.fillText("Local records:", 200, 100);
        ctx.fillStyle = "white";
        let length = usersData.length >= 3 ? 3 : usersData.length;
        for (let i = 0; i < length; i++) {
            ctx.fillText(usersData[i].username + " " + usersData[i].score, 150, 140 + i * 40);
        }
    }

    kill(obj) {
        this.laterKill.push(obj);
    }

    draw(ctx) {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(ctx, this.coinsDrawCounter, this.dyPlayerCounter, this.player, this.user);
        }
    }

    update() {
        if (this.player === null)
            return;
        this.player.move_x = 0;
        this.player.move_y = 0;

        if (eventsManager.action["up"]) {
            this.player.move_y = -1;
            this.player.move();
        }
        if (eventsManager.action["down"]) {
            this.player.move_y = 1;
            this.player.move();
        }
        if (eventsManager.action["left"]) {
            this.player.move_x = -1;
            this.player.move();
        }
        if (eventsManager.action["right"]) {
            this.player.move_x = 1;
            this.player.move();
        }

        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        mapManager.draw(ctx);
        this.draw(ctx);

        this.coinsDrawCounter = (this.coinsDrawCounter + 1) % 4;
        this.playerDrawCounter = (this.playerDrawCounter + 1) % 4;
        this.dyPlayerCounter = (this.dyPlayerCounter + 1) % 2;

        this.updatePlayerScoreCanvas();
        this.printRules();

        this.saveUserInfo();

        if (this.player.life <= 0 || this.player.win) {
            console.log("end")
            this.endGame();
        }
    }

    updatePlayerScoreCanvas() {
        playerScoreCtx.clearRect(0, 0, playerScoreCanvas.width, playerScoreCanvas.height);
        playerScoreCtx.font = "22px Dots";

        playerScoreCtx.fillText("Username: " + this.user.name, 20, 50);
        playerScoreCtx.fillText("Points: " + this.player.points, 20, 90);
        playerScoreCtx.fillText("Life: " + this.player.life, 20, 130);
        playerScoreCtx.fillText("Level: " + this.level, 20, 170);
    }

    printRules() {
        rulesCtx.clearRect(0, 0, rulesCanvas.width, rulesCanvas.height);
        rulesCtx.font = "20px Dots";
        rulesCtx.fillText("You need to collect 200 points", 5, 20);
        rulesCtx.fillText("to fill the chest and win.", 5, 60);
        rulesCtx.fillText("Good luck!", 5, 100);

        rulesCtx.fillText("A - move left", 35, 200);
        rulesCtx.fillText("D - move right", 35, 230);
        rulesCtx.fillText("W - move up", 35, 260);
        rulesCtx.fillText("S - move down", 35, 290);
    }

    loadAll() {
        this.initUser();
        if (this.level === "1")
            mapManager.loadMap("http://localhost:63342/cw/maps/game_map.json");
        else
            mapManager.loadMap("http://localhost:63342/cw/maps/game_map2.json");
        spriteManager.loadAtlas('../maps/sprites.json', '../maps/spritesheet.png');
        this.factory["Player"] = Player;
        this.factory["GoldCoin"] = GoldCoin;
        this.factory["SilverCoin"] = SilverCoin;
        this.factory["GreenCoin"] = GreenCoin;
        this.factory["Bee"] = Bee;
        this.factory["Chest"] = Chest;
        mapManager.parseEntities();
        mapManager.draw();
        eventsManager.setup(canvas);

        soundManager.init();
        soundManager.loadArray(soundManager.sounds.map(fileName => `../sounds/${fileName}`));
        this.play();
    }

    endGame() {
        if (!this.player.win) {
            this.user.score = 0;
        }
        else {
            if (Number(this.level) === 2)
                this.user.score += this.player.life * 2;
            else {
                localStorage.setItem("mygame.level", "2");
                location.reload();
            }
        }
        this.saveUserInfo();

        clearInterval(this.interval);
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";

        ctx.font = '40px Dots';
        if (this.player.win) {
            soundManager.play('../sounds/success.wav', { looping: false, volume: 0.8 })
            ctx.fillStyle = "green";
            ctx.fillText("You won!", 240, 55);
        }
        else {
            soundManager.play('../sounds/fail.wav', { looping: false, volume: 0.8 })
            ctx.fillStyle = "red";
            ctx.fillText("Game over", 220, 55);
        }

        this.printHighestScore();

        const restartButton = document.getElementById('restartButton');
        restartButton.style.display = 'block';

        restartButton.addEventListener('click', () => {
            location.reload();
        });

        const exitButton = document.getElementById('exitButton');
        exitButton.style.display = 'block';

        exitButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    play() {
        this.interval = setInterval(updateWorld, 100);
    }
}

function updateWorld() {
    gameManager.update();
}

const gameManager = new GameManager();

gameManager.loadAll();
export default gameManager;