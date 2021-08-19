global.sP = `!{#187bcd}SERVER:!{#FFFFFF}`

let freeze = false
let string = "none!"
let spectate = null
let spectating = null
var money = 0
var bank = 0
var moneystring = ""
var bankstring = ""
var showCash = false
var showBank = false
var res_X = 1920;
var res_Y = 1080;

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

mp.events.add("client:money", (type, amount) => {
    if (type == "cash") {
        money = amount
        moneystring = "$" + numberWithCommas(money.toFixed());
    }
    else if (type == "bank") {
        bank = amount
        bankstring = "$" + numberWithCommas(bank.toFixed());
    }
})

mp.events.add("client:togbank", () => {
    showBank = !showBank
})

mp.events.add("client:togcash", () => {
    showCash = !showCash
})

mp.events.add("client:showBoth", () => {
    showBank = true
    showCash = true
})

mp.events.add("client:hideBoth", () => {
    showBank = false
    showCash = false
})

mp.events.add('client:aFreeze', () => {
    freeze = !freeze
    mp.players.local.freezePosition(freeze)
    if (freeze) { string = "frozen" }
    else { string = "unfrozen" }
    mp.gui.chat.push(`${sP} You were ${string} by an admin.`)
    if (mp.players.local.vehicle) { mp.players.local.vehicle.freezePosition(freeze) }
})

mp.events.add('client:freeze', () => {
    mp.players.local.freezePosition(true)
})

mp.events.add('client:unfreeze', () => {
    mp.players.local.freezePosition(false)
})


mp.events.add('client:spectate', (target) => {
    let getId = mp.players.atRemoteId(target)
    if (getId != undefined && getId != null && getId.handle != undefined && getId.handle != null) {
        spectate = true
        spectating = getId
    }
    else {
        // mp.gui.chat.push(`${sP} You can not spectate that player!`)
        // mp.events.callRemote('server:unspec')
        mp.gui.chat.push(`${sP} Spectate failed, retrying momentarily... (use /unspec to break this loop)`)
        setTimeout(() => { mp.events.callLocal('client:spectate', target) }, 500)
    }
})

mp.events.add('client:clearSpectate', () => {
    spectate = false
    spectating = null
})

mp.events.add('render', () => {
    if (spectate && spectating != null && spectating.handle !== 0) {
        mp.game.invoke("0x8BBACBF51DA047A8", spectating.handle)
    }
    else if (spectate) {
        spectate = false
        spectating = null
        mp.gui.chat.push(`${sP} The spectated player is no longer valid.`)
        mp.events.callRemote('server:unspec')
    }
    if (showCash == true) {
        mp.game.graphics.drawText(moneystring, [(res_X - 80) / res_X, 0.060], {
            font: 0,
            //color:[115, 186, 131, 200],
            color: [20, 176, 56, 200],
            scale: [0.6, 0.6], // 8 7
            outline: true,
            centre: true                                // should change both values for bigger monitors
        });
    }
    if (showBank == true) {                                                  // 0.01
        mp.game.graphics.drawText(bankstring, [(res_X - 80) / res_X, 0.09], {
            font: 0,
            color: [255, 255, 255, 200],
            scale: [0.5, 0.5],
            outline: true,
            centre: true
        });
    }
})

atms = [-870868698, -1126237515, 506770882, -1364697528]

mp.events.add('client:withdrawCheck', (amount) => {
    check = 0
    atms.some(type => {
        check = mp.game.object.getClosestObjectOfType(pos.x, pos.y, pos.z, 3, type, false, false, false)
        return check != 0
    })
    if (check != 0){
        mp.gui.chat.push("Near ATM")
    }
    else{mp.gui.chat.push("Not near ATM.")}
})