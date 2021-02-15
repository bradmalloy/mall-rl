// TODO: undo importing as 2 things?
import { configObject as arundelConfig } from '../config.js';
import { Game } from '../main.js';
import { Attack } from './attack.js';
import { Actor } from './actor.js';

class Enemy extends Actor {
    constructor(x, y) {
        super(x, y, "enemy");
        this.ac = 10;
        this.maxHealth = arundelConfig.gameSettings.thug.startingHealth;
        this.hp = this.maxHealth;
        this.toHitDie = arundelConfig.gameSettings.thug.toHitDie;
        this.toHitMod = arundelConfig.gameSettings.thug.toHitMod;
        this.dmgDie = arundelConfig.gameSettings.thug.dmgDie;
        this.dmgMod = arundelConfig.gameSettings.thug.dmgMod;
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
        // Check for death and cleanup if so
        this._postTurnCleanup();
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
            console.debug(attack);
            this.stunned = true;
            Game.addLogMessage("Enemy attacks! The enemy is recovering from it's swing.");
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
     * Check if we're dead, and remove us from the game.
     */
    _postTurnCleanup() {
        if (this.hp <= 0) {
            Game.addLogMessage("Enemy died! 💀");
            // Remove us from the board
            Game.map[this.getPositionKey()].removeActor(this);
            // Remove us from the Game engine
            Game.killEnemy(this);
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
        if (!attack || !typeof(attack, Attack)) {
            console.error("Can't beAttacked() by a non-Attack or null");
            return;
        }
        if (attack.toHit > this.ac) {
            this.hp -= attack.damage;
            Game.addLogMessage("Enemy took " + attack.damage + " damage, new HP: " + this.hp);
            // If we get hit, immediately check for death
            this._postTurnCleanup();
        } else {
            Game.addLogMessage("Enemy dodged the attack.");
        }
    }
}



export { Enemy };