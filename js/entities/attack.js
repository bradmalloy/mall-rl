class Attack {
    /**
     * 
     * @param {object} origin the thing doing the attacking
     * @param {number} toHitDie die size, normally 1d20 -> 20
     * @param {number} toHitMod positive or negative modifier to hit
     * @param {number} dmgDie  die size, eg: for 1d12, 12
     * @param {number} dmgMod positive or negative damage modifier
     */
    constructor(origin, toHitDie, toHitMod, dmgDie, dmgMod) {
        this.toHit = this._roll(toHitDie) + toHitMod;
        this.damage = this._roll(dmgDie) + dmgMod;
    }

    /* Returns a number between 1 and max, inclusive */
    _roll = function getRandomInt(max) {
        return 1 + Math.floor(Math.random() * Math.floor(max));
    }

    getToHit() { return this.toHit; }
    getDamage() { return this.damage; }
}

export { Attack }