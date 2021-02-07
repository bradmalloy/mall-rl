import { configObject as arundelConfig } from '../config.js';
import { Game } from '../main.js';

class Tile {
    constructor(tileType, x, y) {
        if (!tileType in arundelConfig.tiles) {
            console.error("Invalid tileType: " + tileType);
            return;
        }
        this.tileType = tileType;
        this._x = x;
        this._y = y;

        this.actor = null;
        this._isMapExit = false;
        this.walkable = true;
    }
    isMapExit() { return this._isMapExit; }
    setMapExit() {
        this.tileType = "stairs";
        this._isMapExit = true;
    }
    addActor(actor) {
        this.actor = actor;
        Game.display.draw(this._x, this._y, this.display());
    }
    removeActor(actor) {
        if (actor == this.actor) {
            this.actor = null;
        } else {
            console.error("Tried to remove the wrong actor?");
        }
        Game.display.draw(this._x, this._y, this.display());
    }
    display() {
        let output = arundelConfig.tiles[this.tileType];
        // overrides, like if the player or an enemy is in this tile
        if (this.actor) {
            output = this.actor.display();
        }
        return output;
    }
}

export { Tile };