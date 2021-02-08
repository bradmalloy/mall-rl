import { configObject as arundelConfig } from './config.js';
import { Enemy } from './entities/enemy.js';
import { Player } from './entities/player.js';
import { Tile } from './entities/tile.js';

window.loadGame = function() {
    console.log("Initializing Game...");
    Game.init();
}

const Game = {
        // DOM node where the map is displayed
        display: null,
        // map of keys in 'x,y' format to Tile objects
        map: {},
        walkableCells: [],
        // The key ([x,y]) of map exit
        // TODO: drop this!
        mapExit: null,
        player: null,
        // Simply runs act() on objects the scheduler sends it
        engine: null,
        loot: [],
        // Holds enemy actors
        enemies: [],
        // Current "level" of the dungeon
        depth: 1,
    
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

    /**
     * Roll a die and get a result.
     * @param {number} dieSize the number sides on the dice
     */
    rollSimple: function(dieSize) {
        return 1 + Math.floor(Math.random() * Math.floor(dieSize));
    },

    /**
     * Generate a new map with a random layout, then place loot and actors.
     */
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
            this.map[key] = new Tile("floor", x, y);
        }
        digger.create(digCallback.bind(this));
        // Modify the map
        this._generateLootables();
        this._placeMapExit();
        // Draw the map
        this._drawWholeMap();
        // Draw actors last so we layer them on top of map
        this._placeAndDrawActors();
    },

    /**
     * Create or reposition all actors on the map.
     */
    _placeAndDrawActors: function() {
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

    /**
     * Create a being which can draw itself on the map. This includes
     * enemies and the player.
     * @param {class} being a class that has a _draw(), act(), etc. 
     */
    _createBeing: function(being) {
        var index = Math.floor(ROT.RNG.getUniform() * this.walkableCells.length);
        var key = this.walkableCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new being(x, y);
    },

    /**
     * Change the map to put down items (not used currently).
     */
    _generateLootables: function() {
        for (var i = 0; i < arundelConfig.maxLootableSpots; i++) {
            var key = this._spliceEmptyWalkableCell();
            this.map[key] = arundelConfig.tiles.lootable;
        }
    },

    /**
     * Called by the Player when they reach the level exit.
     */
    finishLevel: function() {
        // disallow actions while this is happening
        this.engine.lock();
        // create a new map and place actors, etc
        this._generateMap();
        // increment the level counter
        this.depth++;
        // draw stats (level, hp, etc) on the web page
        this.updateGUI();
        // allow the game to continue
        this.engine.unlock();
    },

    /**
     * Changes the map tile for the exit, and saves the coordinates.
     */
    _placeMapExit: function() {
        var key = this._spliceEmptyWalkableCell();
        this.map[key].setMapExit();
        this.mapExit = key;
    },

    /**
     * Update the web page with the current important stats, including:
     * - dungeon level
     * - player HP
     * - player kills
     * - etc
     */
    updateGUI: function() {
        document.getElementById("levelHeader").innerText = `Level ${this.depth}`;
    },

    /**
     * Draws the map, including the walkable tiles and the exit.
     * Doesn't include actors or other entities.
     */
    _drawWholeMap: function() {
        // clear the map beforehand
        this.display.clear();
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            let charToDisplay = this.map[key].display();
            this.display.draw(x, y, charToDisplay);
        }
    },

    /**
     * Pick a random walkable tile from the map, remove it from the list of 
     * walkable tiles, and return it. Used to place enemies, the player, and 
     * the map exit.
     */
    _spliceEmptyWalkableCell: function() {
        var index = Math.floor(ROT.RNG.getUniform() * this.walkableCells.length);
        var key = this.walkableCells.splice(index, 1)[0];
        return key;
    }
}

export { Game };