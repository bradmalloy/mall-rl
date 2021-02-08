// TODO: undo importing as 2 things?
import { configObject as arundelConfig, configObject } from '../config.js';
import { Game } from '../main.js';
import { Attack } from './attack.js';

class Enemy {
    constructor(x, y) {
        this.toHitDie = configObject.gameSettings.thug.toHitDie;
        this.toHitMod = configObject.gameSettings.thug.toHitMod;
        this.dmgDie = configObject.gameSettings.thug.dmgDie;
        this.dmgMod = configObject.gameSettings.thug.dmgMod;
        this._x = x;
        this._y = y;
        this.stunned = false;
        Game.map[this.getPositionKey()].addActor(this);
    }
    /**
     * Return the tile that represents this actor.
     */
    represent() {
        return arundelConfig.tiles.enemy;
    }
    /**
     * Get the key ([x,y]) for the enemy's current position.
     */
    getPositionKey() { return `${this._x},${this._y}`; }
    /**
     * Called by the Game.engine once/turn.
     * Enemies move towards the player, then attack if they're in range.
     */
    act() {
        // Handle status conditions, DoTs, etc
        this._upkeep();
        // If stunned, skip the turn
        if (this.stunned) {
            return;
        }
        // Move and attack
        this._moveAndAttack();
    }
    /**
     * Move towards the player by one tile, or attack if
     * just one tile away.
     */
    _moveAndAttack() {
        // Find the player
        var playerX = Game.player.getX();
        var playerY = Game.player.getY();
        var path = this._computePath(playerX, playerY);
        if (!path || path == []) {
            console.error(`Enemy at ${this.getPositionKey} has no path to player!`);
        }
        // Path computation complete
        path.shift(); // remove the current position from the path
        if (path.length <= 1) {
            // Attack the player
            let attack = this._attack();
            console.log(attack);
            this.stunned = true;
            console.log("Enemy attacking, stunning self.");
            Game.player.beAttacked(attack);
        } else {
            // Try to move towards the player
            let newX = path[0][0];
            let newY = path[0][1];
            let newKey = `${newX},${newY}`;
            let destination = Game.map[newKey];
            let origin = Game.map[this.getPositionKey()];
            // Check if we can move
            if (destination.isEmpty()) {
                origin.removeActor(this);
                destination.addActor(this);
                this._x = newX;
                this._y = newY;
            }
        }
    }

    /**
     * Compute the best path towards the player.
     * @param {number} playerX player's X
     * @param {number} playerY player's Y
     */
    _computePath(playerX, playerY) {
        var path = [];
        var passableCallback = function (x, y) {
            return (`${x},${y}` in Game.map);
        };
        var astar = new ROT.Path.AStar(playerX, playerY, passableCallback, { topology: 4 });

        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this._x, this._y, pathCallback);
        return path;
    }
    /**
     * Apply any status effects, clear them out, etc.
     * Called at the start of each act(), so once/turn.
     */
    _upkeep() {
        // Check for stun
        if (this.stunned && Game.rollSimple(100) > 66) {
            console.debug("Enemy recovered from stun.");
            this.stunned = false;
        }
    }
    /**
     * Generate an attack for this monster.
     */
    _attack() {
        return new Attack(this, this.toHitDie, this.toHitMod, this.dmgDie, this.dmgMod);
    }
    /**
     * Called by other actors.
     * @param {Attack} attack the incoming attack object 
     */
    beAttacked(attack) {
        console.log("Got attacked!");
    }
}



export { Enemy };