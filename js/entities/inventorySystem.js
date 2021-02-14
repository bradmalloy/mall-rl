class Inventory {
    constructor() {
        this.head = null;
        this.chest = null;
        this.leftHand = null;
        this.rightHand = null;
        this.feet = null;
        this.leftFinger = null;
        this.rightFinger = null;
    }

    /**
     * Add an item to the inventory.
     * @param {Item} item to be added 
     * @param {string} slot head, chest, leftHand, rightHand, feet, leftFinger, rightFinger
     */
    add(item, slot) {
        this[slot] = item;
    }

    /**
     * Get the sum of all the modifiers for the given stat type.
     * Valid statTypes:
     * - toHit
     * @param {string} statType name of the stat type
     */
    getAllItemStats(statType) {
        let total = 0;
        total += this.head ? this.head.getStatMod(statType) : 0;
        total += this.chest ? this.chest.getStatMod(statType) : 0;
        total += this.leftHand ? this.leftHand.getStatMod(statType) : 0;
        total += this.rightHand ? this.rightHand.getStatMod(statType) : 0;
        total += this.feet ? this.feet.getStatMod(statType) : 0;
        total += this.leftFinger ? this.leftFinger.getStatMod(statType) : 0;
        total += this.rightFinger ? this.rightFinger.getStatMod(statType) : 0;
        return total;
    }
}

export { Inventory };