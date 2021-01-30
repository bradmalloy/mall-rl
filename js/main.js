import { configObject as arundelConfig } from './config.js';
import { Enemy } from './entities/enemy.js';
import { Player } from './entities/player.js';

window.loadGame = function() {
    console.log("Initializing Game...");
    Game.init();
}

var Game = {
    display: null,
    map: {},
    mapExit: null,
    player: null,
    engine: null,
    loot: null,
    enemies: [],

    init: function() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();
        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.enemies.forEach((enemy) => {
            scheduler.add(enemy, true);
        });
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
    this._placeMapExit(walkableCells);
    this._drawWholeMap();
    this.player = this._createBeing(Player, walkableCells);
    for (let i = 0; i < arundelConfig.enemiesPerLevel; i++) {
        this.enemies.push(this._createBeing(Enemy, walkableCells));
    }
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
    for (var i = 0; i < arundelConfig.maxLootableSpots; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * walkableCells.length);
        var key = walkableCells.splice(index, 1)[0];
        this.map[key] = arundelConfig.tiles.lootable;
    }
}

Game.finishLevel = function() {
    // todo
}

Game._placeMapExit = function(walkableCells) {
    var index = Math.floor(ROT.RNG.getUniform() * walkableCells.length);
    var key = walkableCells.splice(index, 1)[0];
    this.map[key] = arundelConfig.tiles.stairs;
    this.mapExit = key;
}

Game._drawWholeMap = function() {
    for (var key in this.map) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.display.draw(x, y, this.map[key]);
    }
}

export { Game };