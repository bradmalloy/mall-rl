import { configObject as arundelConfig, configObject } from '../config.js';
import { Game } from '../main.js';
import { Attack } from './attack.js';
import { Actor } from './actor.js';
import { Inventory } from './inventorySystem.js';

class Player extends Actor {
    constructor(x, y) {
        super(x, y, "player");
        // Stats
        this.ac = 13;
        this.maxHealth = configObject.gameSettings.player.startingHealth;
        this.hp = this.maxHealth;
        this.toHitDie = configObject.gameSettings.player.toHitDie;
        this.toHitMod = configObject.gameSettings.player.toHitMod;
        this.dmgDie = configObject.gameSettings.player.dmgDie;
        this.dmgMod = configObject.gameSettings.player.dmgMod;

        // Items & inventory
        this.inventory = new Inventory();

        // Put self on map
        this._placeSelf();
    }
    _placeSelf() {
        Game.map[this.getPositionKey()].addActor(this);
    }
    represent() {
        return arundelConfig.tiles.player;
    }
    /** Called once per tick by Scheduler */
    act() {
        Game.engine.lock(); // lock while waiting for user input
        window.addEventListener("keydown", this); // handleEvent when the player presses a key
    }
    getX() { return this._x; }
    getY() { return this._y; }
    getPositionKey() { return `${this._x},${this._y}`; }
    /**
     * Set our internal position and place us in the Tile.
     * @param {number} x 
     * @param {number} y 
     */
    setPosition(x, y) {
        this._x = x; 
        this._y = y;
        this._placeSelf();
    }
    /**
     * Called by external actors, or the Game, when attempting
     * to hurt the Player.
     * @param {Attack} attack 
     */
    beAttacked(attack) {
        if (!attack || !typeof(attack, Attack)) {
            console.error("Can't beAttacked() by a non-Attack or null");
            return;
        }
        if (attack.toHit > this.ac) {
            this.hp -= attack.damage;
            Game.addLogMessage("You took " + attack.damage + " damage, new HP: " + this.hp);
            if (this.hp <= 0) {
                Game.addLogMessage("You died! Game over, man.");
                Game.endGame();
            }
        }
    }
    /**
     * Generate an Attack based off of stats, items, etc.
     */
    _attack() {
        let itemToHitMod = this.inventory.getAllItemStats("toHit");
        let totalToHitMod = this.toHitMod + itemToHitMod
        console.debug(`Player has a toHitMod of ${totalToHitMod} (inc ${itemToHitMod} from items)`);
        return new Attack(this, this.toHitDie, totalToHitMod, this.dmgDie, this.dmgMod);
    }
    /**
     * Handle player input.
     * @param {event} e browser event? 
     */
    handleEvent(e) {
        // Reject bad input early
        var code = e.keyCode;
        if (!(code in arundelConfig.directionKeyMap)) {
            return; 
        }

        // If the player pressed wait, just draw
        if (arundelConfig.directionKeyMap[code] == 'wait') {
            window.removeEventListener("keydown", this);
            Game.engine.unlock();
            return;
        }

        // If the player pressed "get" (pickup item), then just do that
        if (arundelConfig.directionKeyMap[code] == 'get') {
            let item = Game.map[this.getPositionKey()].pickupItem();
            this.inventory.add(item);
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
            console.debug("player trying to move out of bounds to: " + newKey);
            return; // don't move, don't stop listening for player input or advance turn
        }

        // Get the map tile we're coming from
        let origin = Game.map[this.getPositionKey()];
        // Get the map tile we're trying to move to
        let destination = Game.map[newKey];

        // Check for map exit
        if (destination.isMapExit() && destination.isEmpty()) {
            Game.addLogMessage("Congrats, descending deeper...");
            Game.finishLevel();
            return; // avoid setting location to old location
        }

        // Check for enemies
        if (destination.containsEnemy()) {
            Game.addLogMessage("Player is attacking an enemy!");
            let attack = this._attack();
            destination.actor.beAttacked(attack);
        }
        
        // Add us to the new tile, if it's empty
        if (destination.isEmpty()) {
            // Set our location
            destination.addActor(this);
            origin.removeActor(this);
            this._x = newX;
            this._y = newY;
        }

        // Cleanup the game engine
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }
}





export { Player };