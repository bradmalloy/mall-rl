const configObject = {
    maxLootableSpots: 0,
    tiles: {
        floor: ".",
        lootable: "*",
        player: "@",
        enemy: "t",
        stairs: "#"
    },
    colors: {
        player: "#ff0",
        enemy: "#cc0000",
        stairs: "#00cccc"
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
    },
    enemiesPerLevel: 2,
    gameSettings: {
        player: {
            startingHealth: 10,
            toHitDie: 20,
            toHitMod: 1,
            dmgDie: 8,
            dmgMod: 0
        },
        thug: {
            startingHealth: 2,
            toHitDie: 20,
            toHitMod: -3,
            dmgDie: 6,
            dmgMod: -1
        }
    }
}

export{ configObject };