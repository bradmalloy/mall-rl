import { configObject as arundelConfig } from './config.js';
import { Enemy } from './entities/enemy.js';

window.loadGame = function() {
    console.log("Initializing Game...");
    Game.init();
}

var Game = {
    display: null,
    map: {},
    player: null,
    engine: null,
    loot: null,

    init: function() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();
        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.enemy, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    }
}

Game._generateMap = function() {
    var digger = new ROT.Map.Digger();
    var walkableCells = [];

    var digCallback = function(x, y, value) {
        if (value) {
            return; // don't store walls
        }

        var key = `${x},${y}`;
        walkableCells.push(key);
        this.map[key] = arundelConfig.tiles.floor;
    }
    digger.create(digCallback.bind(this));
    this._generateLootables(walkableCells);
    this._drawWholeMap();
    this.player = this._createBeing(Player, walkableCells);
    this.enemy = this._createBeing(Enemy, walkableCells);
}

Game._createBeing = function(being, walkableCells) {
    var index = Math.floor(ROT.RNG.getUniform() * walkableCells.length);
    var key = walkableCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    return new being(x, y);
}

Game._generateLootables = function(walkableCells) {
    for (var i = 0; i < arundelConfig.max_lootable_spots; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * walkableCells.length);
        var key = walkableCells.splice(index, 1)[0];
        this.map[key] = arundelConfig.tiles.lootable;
    }
}

Game._drawWholeMap = function() {
    for (var key in this.map) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.display.draw(x, y, this.map[key]);
    }
}

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, arundelConfig.tiles.player, arundelConfig.colors.player);
}

Player.prototype.act = function() {
    Game.engine.lock(); // lock while waiting for user input
    window.addEventListener("keydown", this);
}

Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

Player.prototype.handleEvent = function(e) {
    // process user input
    var code = e.keyCode;
    if (!(code in arundelConfig.directionKeyMap)) {
        return; // don't accept bad input
    }

    var diff = ROT.DIRS[8][arundelConfig.directionKeyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];

    var newKey = `${newX},${newY}`;
    if (!(newKey in Game.map)) {
        return; // don't move
    }

    Game.display.draw(this._x, this._y, Game.map[`${this._x},${this._y}`]);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

export { Game };