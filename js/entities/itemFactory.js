import { Item } from "./item.js";

const slots = ['head', 'chest', 'leftHand', 'rightHand', 'feet', 'leftFinger', 'rightFinger'];
const statTypes = ['toHit', 'damage', 'ac', 'maxHp'];

class ItemFactory {
    /**
     * Creates items for the current level of the dungeon.
     * @param {number} depth the "level" of the dungeon. higher number/deeper means better items. 
     */
    constructor(depth) {
        this.depth = depth;
    }

    /**
     * Returns a new random Item.
     */
    getRandomItem() {
        let statType = this._chooseRandomStatType();
        let slot = this._chooseRandomSlot();
        let mod = this._chooseRandomStatMod(statType);
        let output = new Item(statType, mod, slot);
        console.debug(output);
        return output;
    }

    /**
     * Return a string representing a body slot, at random.
     */
    _chooseRandomSlot() {
        return slots[Math.floor(Math.random() * slots.length)];
    }

    /**
     * Return a string representing a stat type.
     */
    _chooseRandomStatType() {
        return statTypes[Math.floor(Math.random() * statTypes.length)];
    }

    /**
     * Get a random small int, no more than depth * 5;
     */
    _chooseRandomStatMod(statType) {
        var mod = 1;
        if (statType == 'toHit') {
            mod += (this.depth * 1);
        } else if (statType == 'damage') {
            mod += (this.depth * 2);
        } else if (statType == 'ac') {
            mod += (this.depth * 0.5);
        } else if (statType == 'maxHp') {
            mod += (this.depth * 3);
        } else {
            mod = 0;
        }
        return Math.floor(Math.random() * Math.floor(mod));
    }
}

export { ItemFactory };