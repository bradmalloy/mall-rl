class Item {
    constructor(statType, statModifier, slotType) {
        this[statType] = statModifier;
        this.statType = statType;
        this.slotType = slotType;
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

    getSlotType() {
        return this.slotType;
    }

    /**
     * Return item's icon
     */
    represent() {
        return "*";
    }

    getDescription() {
        return `Item: slot ${this.slotType}, grants ${this[this.statType]} ${this.statType}`;
    }
}

export { Item };