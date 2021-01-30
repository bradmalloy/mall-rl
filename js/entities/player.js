import { Game } from '../main.js';
import { configObject as arundelConfig } from '../config.js';

class Player {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._draw();
    }
    _draw() {
        Game.display.draw(this._x, this._y, arundelConfig.tiles.player, arundelConfig.colors.player);
    }
    act() {
        Game.engine.lock(); // lock while waiting for user input
        window.addEventListener("keydown", this);
    }
    getX() { return this._x; }
    getY() { return this._y; }
    handleEvent(e) {
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

        if (newKey == Game.mapExit) {
            console.log("Play found an exit!");
            Game.finishLevel();
        }

        Game.display.draw(this._x, this._y, Game.map[`${this._x},${this._y}`]);
        this._x = newX;
        this._y = newY;
        this._draw();
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }
}





export { Player };