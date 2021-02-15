import { Game } from "../main";

// The <ul> to add children to
const bagUiElementTag = "bagList";
// The "window" title, should be "Inventory X/26 slots"
const bagUiTitleTag = "bagTitle";

const inventoryLimit = 26;

class Inventory {
    constructor() {
        // Things get equipped from the bag to the slots
        this.head = null;
        this.chest = null;
        this.leftHand = null;
        this.rightHand = null;
        this.feet = null;
        this.leftFinger = null;
        this.rightFinger = null;
        // Things picked up go in the bag
        this.bag = {};
        this.bagCount = 0;
    }

    /**
     * Add an item to the bag. Returns the key (ex: A, B, Z, AA) the item was stored in.
     * Stops at 26, since the _getNextItemKey breaks and I don't want to fix it.
     * @param {Item} item to be added
     */
    add(item) {
        if (this.bagCount >= 26) {
            return null;
        }
        let key = this._getNextItemKey();
        this.bag[key] = item;
        this.bagCount++;
        this._addToBagUi(key, item);
        return key;
    }

    /**
     * Add an item to the inventory.
     * @param {string} itemKey ID of the bag slot (ex: A, B, C, etc)
     * @param {string} slot head, chest, leftHand, rightHand, feet, leftFinger, rightFinger
     */
    equip(itemKey, slot) {
        let item = this.bag[itemKey];
        if (item) {
            if (this[slot] != null) {
                let putAway = this[slot];
                this[slot] = null;
                let putAwayItemKey = this.add(putAway);
                Game.addLogMessage(`Item was already equipped to slot ${slot}, put it away as ${putAwayItemKey}`);
            }
            this[slot] = item;
            this.bag[itemKey] = null;
            this.bagCount--;
            this._removeFromBagUi(itemKey);
            Game.addLogMessage(`Equipped ${item} in slot ${slot}`);
        } else {
            console.warn(`Couldn't equip itemKey ${itemKey}, was null`);
        }
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

    _getNextItemKey() {
        let existingKeys = Object.keys(this.bag);
        existingKeys.sort();
        // If this is the first item, start with lower case a
        if (existingKeys.length == 0) {
            return 'a';
        }
        let key = existingKeys[existingKeys.length - 1]; // last element is the last letter, alphabetically
        if (key === 'Z' || key === 'z') {
            return String.fromCharCode(key.charCodeAt() - 25) + String.fromCharCode(key.charCodeAt() - 25); // AA or aa
        } else {
            var lastChar = key.slice(-1);
            var sub = key.slice(0, -1);
            if (lastChar === 'Z' || lastChar === 'z') {
              // If a string of length > 1 ends in Z/z,
              // increment the string (excluding the last Z/z) recursively,
              // and append A/a (depending on casing) to it
              return this._getNextItemKey(sub) + String.fromCharCode(lastChar.charCodeAt() - 25);
            } else {
              // (take till last char) append with (increment last char)
              return sub + String.fromCharCode(lastChar.charCodeAt() + 1);
            }
          }
        return key;
    }

    /**
     * Update the parent web page with the item key and a short description.
     * @param {string} itemKey to store the item under
     * @param {Item} item to be displayed in the webpage
     */
    _addToBagUi(itemKey, item) {
        let ul = document.getElementById(bagUiElementTag);
        var li = document.createElement("li");
        li.setAttribute("id", `bagItem-${itemKey}`);
        li.innerHTML = `<div class="nes-pointer" onclick="equip('${itemKey}', '${item.getSlotType()}');">[${itemKey}] ${item.getDescription()}</div>`
        ul.appendChild(li);
        let title = document.getElementById(bagUiTitleTag);
        title.innerText = `Inventory ${this.bagCount}/26`;
    }

    /**
     * Remove the <li> associated with the item, based on the key.
     * The id of the element will be #bagItem-${itemKey}
     * @param {string} itemKey 
     */
    _removeFromBagUi(itemKey) {
        let toRemove = document.getElementById(`bagItem-${itemKey}`);
        toRemove.remove();
        let title = document.getElementById(bagUiTitleTag);
        title.innerText = `Inventory ${this.bagCount}/26`;
    }

    _updateBodyUi() {
        if (this.head != null) {

        }
    }
}

export { Inventory };