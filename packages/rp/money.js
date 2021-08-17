mp.events.addCommand("togbank", (player) => {
    player.call('client:togbank')
})

mp.events.addCommand("togcash", (player) => {
    player.call('client:togcash')
})

mp.events.add("server:loadMoney", async (player, show = false, callback = false) => {
    const [rows] = await mp.db.query('SELECT `cash`, `bank`, `paycheck`, `payTime` FROM `characters` WHERE `accId` = ? AND `charId` = ?', [player.accId, player.charId])
    player.cash = rows[0].cash
    player.bank = rows[0].bank
    player.paycheck = rows[0].paycheck
    player.payTime = rows[0].payTime
    player.call('client:money', ["cash", player.cash])
    player.call('client:money', ["bank", player.bank])
    if (show) {
        player.call('client:showBoth')
    }
    if (callback != false) {
        callback(player)
    }
})

mp.events.add("server:changeMoney", async (player, type, action, amount, reason) => {
    try {
        if (player && player.charId && type && action && amount != undefined && amount != null) {
            let query = (`UPDATE \`characters\` SET \`${type}\` = ${type} ${action} ${amount} WHERE charId = ?`)
            const [status] = await mp.db.query(query, [player.charId]);
            mp.events.call("server:loadMoney", player)
        }
    }
    catch (e) { errorHandler(e) }
})

mp.events.addCommand("add", (player) => {
    mp.events.call("server:changeMoney", player, "cash", "+", "5")
})

function money(player) {
    player.outputChatBox(`!{#FFFFFF}Cash: ${cMoney}$${player.cash}!{#FFFFFF} Bank: ${cMoney}$${player.bank}!{#FFFFFF} Paycheck: ${cMoney}$${player.paycheck}`)
}

mp.events.addCommand("money", (player) => {
    mp.events.call("server:loadMoney", player, false, money)
})

mp.events.addCommand("pay", (player, fullText, id, amount) => {
    specCmd(player, `${player.name} used command: [/pay ${fullText}]`)
    if (player.charId != undefined && player.charId != null && id != undefined && id != null && amount != undefined && amount != null && !isNaN(amount) && amount > 0) {
        let getId = findPlayer(id)
        if (getId && getId.charId != undefined && getId.charId != null) {
            if (getId.dist(player.position) < 2.5) {
                if (amount <= player.cash) {
                    mp.events.call("server:changeMoney", player, "cash", "-", amount)
                    mp.events.call("server:changeMoney", getId, "cash", "+", amount)
                    mp.players.broadcastInRange(player.position, dN, `${cRp}* ${player.name} gave some cash to ${getId.name}.`)
                    player.outputChatBox(`${cMoney} You paid $${amount} to ${getId.name}.`)
                    getId.outputChatBox(`${cMoney} You received $${amount} from ${player.name}`)
                    specChat(player, `${cRp}* ${player.name} gave some cash to ${getId.name}.`)
                    specCmd(player, `${cMoney} You paid $${amount} to ${getId.name}.`)
                    specCmd(getId, `${cMoney} You received $${amount} from ${player.name}`)
                }
                else { player.outputChatBox(`${eP} You can't pay that much!`) }
            }
            else { player.outputChatBox(sFar) }
        }
        else { player.outputChatBox(sNotFound) }
    }
    else { player.outputChatBox(`${uP} /pay [id] [amount]`) }
})