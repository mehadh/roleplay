global.sP = `!{#187bcd}SERVER:!{#FFFFFF}`

let freeze = false
let string = "none!"
let spectate = null
let spectating = null

mp.events.add('client:aFreeze', () => {
    freeze = !freeze
    mp.players.local.freezePosition(freeze)
    if (freeze) { string = "frozen" }
    else { string = "unfrozen" }
    mp.gui.chat.push(`${sP} You were ${string} by an admin.`)
    if (mp.players.local.vehicle) { mp.players.local.vehicle.freezePosition(freeze) }
})

mp.events.add('client:spectate', (target) => {
    let getId = mp.players.at(target)
    if (getId && getId.handle) {
        spectate = true
        spectating = getId
    }
    else { mp.gui.chat.push(`${sP} You can not spectate that player!`) }
})

mp.events.add('render', () => {
    if (spectate && spectating != null && spectating.handle !== 0) {
        mp.game.invoke("0x8BBACBF51DA047A8", spectating.handle)
    }
    else if (spectate) {
        spectate = false
        spectating = null
        mp.gui.chat.push(`${sP} The spectated player is no longer valid.`)
    }
})