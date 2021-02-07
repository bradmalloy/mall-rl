import { configObject as arundelConfig, configObject } from '../config.js';
import { Game } from '../main.js';
import { Attack } from './attack.js';

class Player {
    constructor(x, y) {
        this.ac = 13;
        this.maxHealth = configObject.gameSettings.player.startingHealth;
        this.hp = this.maxHealth;
        this._x = x;
        this._y = y;
        this._draw();
    }
    _draw() {
        Game.map[this.getPositionKey()].addActor(this);
        //Game.display.draw(this._x, this._y, arundelConfig.tiles.player, arundelConfig.colors.player);
    }
    display() {
        return arundelConfig.tiles.player;
    }
    /** Called once per tick by Scheduler */
    act() {
        Game.engine.lock(); // lock while waiting for user input
        window.addEventListener("keydown", this);
        // TODO: update status bar on webpage with health, etc
    }
    getX() { return this._x; }
    getY() { return this._y; }
    getPositionKey() { return `${this._x},${this._y}`; }
    setPosition(x, y) {
        this._x = x; 
        this._y = y;
        this._draw();
    }
    beAttacked(attack) {
        if (!attack || !typeof(attack, Attack)) {
            console.error("Can't beAttacked() by a non-Attack or null");
            return;
        }
        if (attack.toHit > this.ac) {
            this.hp -= attack.damage;
            console.log("Took " + attack.damage + " damage, new HP: " + this.hp);
            if (this.hp <= 0) {
                console.log("dead!");
            }
        }
    }
    /**
     * Handle player input.
     * @param {event} e browser event? 
     */
    handleEvent(e) {
        // don't accept bad input
        var code = e.keyCode;
        if (!(code in arundelConfig.directionKeyMap)) {
            return; 
        }

        // If the player pressed wait, just draw
        if (arundelConfig.directionKeyMap[code] == 'wait') {
            this._draw();
            window.removeEventListener("keydown", this);
            Game.engine.unlock();
            return;
        }

        // Otherwise, assume we're moving
        var diff = ROT.DIRS[8][arundelConfig.directionKeyMap[code]];
        var newX = this._x + diff[0];
        var newY = this._y + diff[1];
        var newKey = `${newX},${newY}`;
        if (!(newKey in Game.map)) {
            console.log("player trying to move out of bounds to: " + newKey);
            return; // don't move
        }

        // Get the map tile we're coming from
        let origin = Game.map[this.getPositionKey()];
        // Get the map tile we're trying to move to
        let destination = Game.map[newKey];

        // Check for map exit
        if (destination.isMapExit()) {
            console.log("Player found an exit!");
            Game.finishLevel();
            return; // avoid setting location to old location
        }

        // Fill the previous tile with the thing that was underneath
        origin.removeActor(this);
        
        // Set our location and draw us in the new place
        this._x = newX;
        this._y = newY;
        destination.addActor(this);
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }
}





export { Player };