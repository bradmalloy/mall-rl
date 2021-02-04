import { configObject as arundelConfig } from './config.js';
import { Enemy } from './entities/enemy.js';
import { Player } from './entities/player.js';

window.loadGame = function() {
    console.log("Initializing Game...");
    Game.init();
}

const Game = {

        display: null,
        map: {},
        walkableCells: [],
        mapExit: null,
        player: null,
        engine: null,
        loot: [],
        enemies: [],
    
    init: function() {
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
    },

    _generateMap: function() {
        // Clear any old stuff
        this.walkableCells = [];
        this.map = {};
        this.mapExit = null;
        this.enemies = [];

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
    },

    _placeActors: function() {
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
            console.log(this.player);
        }
        for (let i = 0; i < arundelConfig.enemiesPerLevel; i++) {
            this.enemies.push(this._createBeing(Enemy));
        }
    },

    _createBeing: function(being) {
        var index = Math.floor(ROT.RNG.getUniform() * this.walkableCells.length);
        var key = this.walkableCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        console.log("Placing being at: " + key);
        return new being(x, y, this);
    },

    _generateLootables: function() {
        for (var i = 0; i < arundelConfig.maxLootableSpots; i++) {
            var key = this._spliceEmptyWalkableCell();
            this.map[key] = arundelConfig.tiles.lootable;
        }
    },

    finishLevel: function() {
        this.engine.lock();
        this._generateMap();
        this.engine.unlock();
    },

    _placeMapExit: function() {
        var key = this._spliceEmptyWalkableCell();
        this.map[key] = arundelConfig.tiles.stairs;
        this.mapExit = key;
    },

    _drawWholeMap: function() {
        // clear the map beforehand
        this.display.clear();
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    },

    _spliceEmptyWalkableCell: function() {
        var index = Math.floor(ROT.RNG.getUniform() * this.walkableCells.length);
        var key = this.walkableCells.splice(index, 1)[0];
        return key;
    }
}

export { Game };