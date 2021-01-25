const Config = {
    max_lootable_spots: 10,
    tiles: {
        floor: ".",
        lootable: "*",
        player: "@",
        enemy: "t"
    },
    colors: {
        player: "#ff0",
        enemy: "#cc0000"
    },
    // rot.js 8-topology, clockwise, starting at the top
    directionKeyMap: {
        87: 0, // w
        69: 1, // e
        68: 2, // d
        67: 3, // c
        88: 4, // x
        90: 5, // z
        65: 6, // a
        81: 7, // q
    }
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
        this.map[key] = Config.tiles.floor;
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
    for (var i = 0; i < Config.max_lootable_spots; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * walkableCells.length);
        var key = walkableCells.splice(index, 1)[0];
        this.map[key] = Config.tiles.lootable;
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
    Game.display.draw(this._x, this._y, Config.tiles.player, Config.colors.player);
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
    if (!(code in Config.directionKeyMap)) {
        return; // don't accept bad input
    }

    var diff = ROT.DIRS[8][Config.directionKeyMap[code]];
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

var Enemy = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Enemy.prototype._draw = function() {
    Game.display.draw(this._x, this._y, Config.tiles.enemy, Config.colors.enemy);
}

Enemy.prototype.act = function() {
    var x = Game.player.getX();
    var y = Game.player.getY();
    var passableCallback = function(x, y) {
        return (`${x},${y}` in Game.map);
    }
    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology: 4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);
    // Path computation complete
    path.shift(); // remove the current position
    if (path.length == 1) {
        // Attack the player
        alert("BAM! POW!")
    } else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[`${this._x},${this._y}`]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}