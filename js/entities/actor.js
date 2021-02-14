class Actor {
    /**
     * Create an object which the game engine can use to act(). This includes enemies as well
     * as the player.
     * Valid actorTypes:
     * - player
     * - enemy
     * @param {number} x position on the x axis (left-right)
     * @param {number} y position on the y axis (up-down)
     * @param {string} actorType one-word, lower-cased name for the 'class' of actor (player, enemy, etc)
     */
    constructor(x, y, actorType) {
        this._x = x;
        this._y = y;
        this.actorType = actorType;
    }

    act() {
        throw new Error("Child classes must implement act()!");
    }

    getActorType() {
        return this.actorType;
    }
}

export { Actor }