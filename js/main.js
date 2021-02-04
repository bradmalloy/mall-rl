import { configObject as arundelConfig } from './config.js';
import { Enemy } from './entities/enemy.js';
import { Player } from './entities/player.js';

window.loadGame = function() {
    console.log("Initializing Game...");
    let g = new Game();
}

class Game {
    constructor() {
        this.display = null;
        this.map = {};
        this.walkableCells = [];
        this.mapExit = null;
        this.player = null;
        this.engine = null;
        this.loot = [];
        this.enemies = [];
        this.init();
    }
    
    init() {
        this.display = new ROT.Display();
        document.getElementById("gameContainer").appendChild(this.display.getContainer());
        this._generateMap();
        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.enemies.forEach((enemy) => {
            scheduler.add(enemy, true);
        });
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    }

    _generateMap() {
        // Clear any old stuff
        this.walkableCells = [];
        this.map = {};
        this.mapExit = null;
        this.enemies = [];
        if (this.player) {
            let oldPlayerPos = this.player.getPosition();
            console.log("oldPlayerPos: " + oldPlayerPos);
        }

        // Create the map-gen algo
        var digger = new ROT.Map.Digger();
    
        var digCallback = function(x, y, value) {
            if (value) {
                return; // don't store walls
            }
    
            var key = `${x},${y}`;
            this.walkableCells.push(key);
            this.map[key] = arundelConfig.tiles.floor;
        }
        digger.create(digCallback.bind(this));
        this._generateLootables();
        this._placeMapExit();
        this._placeActors();
        this._drawWholeMap();
    }

    _placeActors() {
        if (!this.player) {
            console.log("Player doesn't exist, spawning.");
            this.player = this._createBeing(Player);
        } else {
            var key = this._spliceEmptyWalkableCell();
            console.log("Player already exists, repositioning to: " + key);
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.player.setPosition(x, y);
        }
        for (let i = 0; i < arundelConfig.enemiesPerLevel; i++) {
            this.enemies.push(this._createBeing(Enemy));
        }
    }

    _createBeing(being) {
        var index = Math.floor(ROT.RNG.getUniform() * this.walkableCells.length);
        var key = this.walkableCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        console.log("Placing being at: " + key);
        return new being(x, y, this);
    }

    _generateLootables() {
        for (var i = 0; i < arundelConfig.maxLootableSpots; i++) {
            var key = this._spliceEmptyWalkableCell();
            this.map[key] = arundelConfig.tiles.lootable;
        }
    }

    finishLevel() {
        this.engine.lock();
        this._generateMap();
        this.engine.unlock();
    }

    _placeMapExit() {
        var key = this._spliceEmptyWalkableCell();
        this.map[key] = arundelConfig.tiles.stairs;
        this.mapExit = key;
    }

    _drawWholeMap() {
        // clear the map beforehand
        this.display.clear();
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    }

    _spliceEmptyWalkableCell() {
        var index = Math.floor(ROT.RNG.getUniform() * this.walkableCells.length);
        var key = this.walkableCells.splice(index, 1)[0];
        console.log("spliced an empty walkable at: " + key);
        return key;
    }
}

export { Game };