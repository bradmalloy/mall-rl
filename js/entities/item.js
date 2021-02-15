class Item {
    constructor(statType, statModifier) {
        this[statType] = statModifier;
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

    /**
     * Return item's icon
     */
    represent() {
        return "*";
    }

    getDescription() {
        return `An item.`
    }
}

export { Item };