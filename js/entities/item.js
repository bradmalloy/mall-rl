class Item {
    constructor(toHitMod) {
        this.toHitMod = toHitMod;
    }

    /**
     * Get the modifier for the given stat.
     * @param {string} statType the stat to get. if the item doesn't have it, returns 0
     */
    getStatMod(statType) {
        let output = 0;
        if (this.hasOwnProperty(statType)) {
            output = this[statType];
        }
        return output;
    }
}

export { Item };