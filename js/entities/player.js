import { configObject as arundelConfig } from '../config.js';

class Player {
    constructor(x, y, game) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._draw();
    }
    _draw() {
        this._game.display.draw(this._x, this._y, arundelConfig.tiles.player, arundelConfig.colors.player);
    }
    act() {
        this._game.engine.lock(); // lock while waiting for user input
        window.addEventListener("keydown", this);
    }
    getX() { return this._x; }
    getY() { return this._y; }
    getPosition() { return [this._x, this._y]; }
    setPosition(x, y) {
        this._x = x; 
        this._y = y;
        this._draw();
        console.log("Player is at: " + this._x + "," + this._y);
    }
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
        if (!(newKey in this._game.map)) {
            console.log("player trying to move out of bounds to: " + newKey);
            return; // don't move
        }

        // Check for map exit
        if (newKey == this._game.mapExit) {
            console.log("Play found an exit!");
            this._game.finishLevel();
        }

        // Fill the previous tile with the thing that was underneath
        this._game.display.draw(this._x, this._y, this._game.map[`${this._x},${this._y}`]);
        
        // Set our location and draw us in the new place
        this._x = newX;
        this._y = newY;
        this._draw();
        window.removeEventListener("keydown", this);
        this._game.engine.unlock();
    }
}





export { Player };