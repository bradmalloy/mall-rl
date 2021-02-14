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
        total += this.head.getStatMod(statType);
        total += this.chest.getStatMod(statType);
        total += this.leftHand.getStatMod(statType);
        total += this.rightHand.getStatMod(statType);
        total += this.feet.getStatMod(statType);
        total += this.leftFinger.getStatMod(statType);
        total += this.rightFinger.getStatMod(statType);
        return total;
    }
}

export { Inventory };