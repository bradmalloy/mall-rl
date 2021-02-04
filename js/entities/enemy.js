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
        this._draw();
    }
    _draw() {
        Game.display.draw(this._x, this._y, arundelConfig.tiles.enemy, arundelConfig.colors.enemy);
    }
    act() {
        // Monsters are stunned after taking a swing at the player
        if (this.stunned) {
            if (Game.rollSimple(100) > 66) {
                console.debug("Enemy recovered from stun.");
                this.stunned = false;
            } else {
                console.debug("Enemy still stunned...");
            }
            this._draw();
            return;
        }
        var x = Game.player.getX();
        var y = Game.player.getY();
        var passableCallback = function (x, y) {
            return (`${x},${y}` in Game.map);
        };
        var astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 });

        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this._x, this._y, pathCallback);
        // Path computation complete
        path.shift(); // remove the current position
        if (path.length <= 1) {
            // Attack the player
            let attack = this._attack();
            console.log(attack);
            this.stunned = true;
            console.log("Enemy attacking, stunning self.");
            Game.player.beAttacked(attack);
        } else {
            x = path[0][0];
            y = path[0][1];
            Game.display.draw(this._x, this._y, Game.map[`${this._x},${this._y}`]);
            this._x = x;
            this._y = y;
            this._draw();
        }
    }
    _attack() {
        return new Attack(this, this.toHitDie, this.toHitMod, this.dmgDie, this.dmgMod);
    }

    beAttacked(attack) {
        console.log("Got attacked!");
    }
}



export { Enemy };