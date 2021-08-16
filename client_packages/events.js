global.sP = `!{#187bcd}SERVER:!{#FFFFFF}`

let freeze = false
let string = "none!"

mp.events.add('client:aFreeze', () => {
    freeze = !freeze
    mp.players.local.freezePosition(freeze)
    if (freeze) { string = "frozen" }
    else { string = "unfrozen" }
    mp.gui.chat.push(`${sP} You were ${string} by an admin.`)
    if (mp.players.local.vehicle) { mp.players.local.vehicle.freezePosition(freeze) }
})