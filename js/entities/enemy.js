import { configObject as arundelConfig } from '../config.js';

class Enemy {
    constructor(x, y, game) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._draw();
    }
    _draw() {
        this._game.display.draw(this._x, this._y, arundelConfig.tiles.enemy, arundelConfig.colors.enemy);
    }
    act() {
        var x = this._game.player.getX();
        var y = this._game.player.getY();
        var passableCallback = function (x, y) {
            return (`${x},${y}` in this._game.map);
        };
        var astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 });

        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this._x, this._y, pathCallback);
        // Path computation complete
        path.shift(); // remove the current position
        if (path.length == 1) {
            // Attack the player
            alert("BAM! POW!");
        } else {
            x = path[0][0];
            y = path[0][1];
            this._game.display.draw(this._x, this._y, this._game.map[`${this._x},${this._y}`]);
            this._x = x;
            this._y = y;
            this._draw();
        }
    }
}



export { Enemy };