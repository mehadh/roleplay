// banks in globals.js

// checkBank function in globals.js

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

mp.events.add("server:changeMoney", async (player, type, action, amount, reason) => { // TODO: Logging reason
    try {
        if (player && player.charId && type && action && amount != undefined && amount != null) {
            let query = (`UPDATE \`characters\` SET \`${type}\` = ${type} ${action} ${amount} WHERE charId = ?`)
            const [status] = await mp.db.query(query, [player.charId]);
            mp.events.call("server:loadMoney", player)
        }
    }
    catch (e) { errorHandler(e) }
})

mp.events.add("server:oChangeMoney", async (charId, type, action, amount, string, reason) => { // TODO: Logging reason
    try {
        if (charId && type && action && amount != undefined && amount != null) {
            let query = (`UPDATE \`characters\` SET \`${type}\` = ${type} ${action} ${amount} WHERE charId = ?`)
            const [status] = await mp.db.query(query, [charId]);
            mp.players.forEach(entity => {
                if (entity.charId == charId) {
                    mp.events.call("server:loadMoney", entity)
                    if (string != undefined && string != null) { entity.outputChatBox(string) }
                }
            })
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

mp.events.add("server:withdraw", (player, amount, atm = false) => {
    if (player.charId != undefined && player.charId != null && amount != undefined && amount != null && !isNaN(amount) && amount > 0) {
        mp.events.call("server:loadMoney", player)
        if (checkBank(player) || atm == true) {
            if (amount <= player.bank) {
                mp.events.call("server:changeMoney", player, "bank", "-", amount)
                mp.events.call("server:changeMoney", player, "cash", "+", amount)
                player.outputChatBox(`${cMoney} You withdrew $${amount}.`)
            }
            else { player.outputChatBox(`${eP} You can't withdraw that much!`) }
        }
        else { player.outputChatBox(sFar) }
    }
    else { player.outputChatBox(`${uP} /withdraw [amount]`) }

})

mp.events.addCommand("withdraw", (player, fullText, amount) => {
    if (checkBank(player)) { mp.events.call('server:withdraw', player, amount) }
    else { player.call('client:withdrawCheck', [amount]) }
})

mp.events.addCommand("deposit", (player, fullText, amount) => {
    if (player.charId != undefined && player.charId != null && amount != undefined && amount != null && !isNaN(amount) && amount > 0) {
        mp.events.call("server:loadMoney", player)
        if (checkBank(player)) {
            if (amount <= player.cash) {
                mp.events.call("server:changeMoney", player, "cash", "-", amount)
                mp.events.call("server:changeMoney", player, "bank", "+", amount)
                player.outputChatBox(`${cMoney} You deposited $${amount}.`)
            }
            else { player.outputChatBox(`${eP} You can't deposit that much!`) }
        }
        else { player.outputChatBox(sFar) }
    }
    else { player.outputChatBox(`${uP} /deposit [amount]`) }

})

mp.events.addCommand("transfer", async (player, fullText, first, last, amount, ...reason) => {
    if (player.charId && first != undefined && first != null && last != undefined && last != null && amount != undefined && amount != null && !isNaN(amount) && amount > 0) {
        mp.events.call("server:loadMoney", player)
        if (checkBank(player)) { // TOOD: Allow access to this command if the player has a phone (and is on?)
            if (amount <= player.bank) {
                const [row] = await mp.db.query('SELECT * FROM `characters` WHERE `first` = ? AND `last` = ?', [first, last])
                if (row.length > 0) {
                    recipient = row[0].charId
                    mp.events.call("server:changeMoney", player, "bank", "-", amount)
                    player.outputChatBox(`${cMoney} You sent $${amount} to ${row[0].first} ${row[0].last}.`)
                    mp.events.call("server:oChangeMoney", recipient, "bank", "+", amount, `${cMoney} You received $${amount} from ${player.cName}.`)
                    if (reason == undefined) { reason = null }
                    if (reason != undefined && reason != null) { reason = reason.join(' '); }
                    const [transfer] = await mp.db.query('INSERT INTO `transfers` SET `sender` = ?, `receiver` = ?, `amount` = ?, `reason` = ?', [player.charId, recipient, amount, reason])

                }
                else { player.outputChatBox(`${eP} The recipient was not located!`) }
            }
            else { player.outputChatBox(`${eP} You can't transfer that much!`) }
        }
        else { player.outputChatBox(sFar) }
    }
    else { player.outputChatBox(`${uP} /transfer [first] [last] [amount] [reason?]`) }
})

mp.events.addCommand("mytransfers", async (player) => {
    if (player.charId) {
        const [results] = await mp.db.query('SELECT * FROM `transfers` WHERE `sender` = ? OR `receiver` = ?', [player.charId, player.charId])
        if (results.length > 0) {
            results.forEach(async entry => {
                if (entry.sender != player.charId) {
                    [row] = await mp.db.query('SELECT * FROM `characters` WHERE `charId` = ?', [entry.sender])
                    sender = `${row[0].first} ${row[0].last}`
                    if (entry.reason) { player.outputChatBox(`${cMoney} Transfer ID: ${entry.transferId} Sender: ${sender} Amount: $${entry.amount} Reason: ${entry.reason}`) }
                    else { player.outputChatBox(`${cMoney} Transfer ID: ${entry.transferId} Sender: ${sender} Amount: $${entry.amount}`) }
                }
                else if (entry.receiver != player.charId) {
                    [row] = await mp.db.query('SELECT * FROM `characters` WHERE `charId` = ?', [entry.receiver])
                    receiver = `${row[0].first} ${row[0].last}`
                    if (entry.reason) { player.outputChatBox(`${cMoney} Transfer ID: ${entry.transferId} Receiver: ${receiver} Amount: $${entry.amount} Reason: ${entry.reason}`) }
                    else { player.outputChatBox(`${cMoney} Transfer ID: ${entry.transferId} Receiver: ${receiver} Amount: $${entry.amount}`) }
                }
            })
        }
        else { player.outputChatBox(`${eP} You have no transfer history.`) }
    }
    else { player.outputChatBox(sNow) }
})