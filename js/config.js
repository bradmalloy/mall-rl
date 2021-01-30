const configObject = {
    max_lootable_spots: 10,
    tiles: {
        floor: ".",
        lootable: "*",
        player: "@",
        enemy: "t"
    },
    colors: {
        player: "#ff0",
        enemy: "#cc0000"
    },
    // rot.js 8-topology, clockwise, starting at the top
    directionKeyMap: {
        87: 0, // w
        69: 1, // e
        68: 2, // d
        67: 3, // c
        88: 4, // x
        90: 5, // z
        65: 6, // a
        81: 7, // q
    }
}

export default configObject;