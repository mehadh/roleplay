// banks in globals.js

// checkBank function in globals.js

mp.events.addCommand("togbank", (player) => {
    player.call('client:togbank')
})

mp.events.addCommand("togcash", (player) => {
    player.call('client:togcash')
})

mp.events.add("server:loadMoney", async (player, show = false, callback = false) => {
    const [rows] = await mp.db.query('SELECT `cash`, `bank`, `paycheck`, `payTime`, `paycheckAmt` FROM `characters` WHERE `accId` = ? AND `charId` = ?', [player.accId, player.charId])
    player.cash = rows[0].cash
    player.bank = rows[0].bank
    player.paycheck = rows[0].paycheck
    player.payTime = rows[0].payTime
    player.paycheckAmt = rows[0].paycheckAmt
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
            let query = (`UPDATE \`characters\` SET \`${type}\` = ${type} ${action} ${amount} WHERE charId = ?`) // TODO: this is actually a TERRIBLE idea, rewrite with switch case instead.
            // example of why you shouldn't do this: if player injects clientside and then calls mp.events.call('server:changeMoney', player, "admin", "+", "10"), now he changed admin row!
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
                    player.outputChatBox(`${cMoney} You sent $${amount} to ${row[0].first} ${row[0].last} via bank transfer.`)
                    mp.events.call("server:oChangeMoney", recipient, "bank", "+", amount, `${cMoney} You received $${amount} from ${player.cName} via bank transfer.`)
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

global.startPayFunc = function startPayFunc(player) {
    if (player.charId != undefined && player.charId != null && player.payTime != undefined && player.payTime != null) {
        clearInterval(player.payTimer)
        player.payTimer = setInterval(() => {
            payFunc(player)
        }, 60000)
    }
}

async function payFunc(player) {
    if (player.payTime < 60) {
        player.payTime++
        if (player.payTime % 5 === 0) {
            const [updater] = await mp.db.query('UPDATE `characters` SET `payTime` = ? WHERE `charId` = ?', [player.payTime, player.charId])
        }
    }
    else {
        player.payTime = 0
        previous = player.paycheck
        paycheck = "ERROR"
        const [updater2] = await mp.db.query('UPDATE `characters` SET `payTime` = ?, `paycheckAmt` = paycheckAmt + 1 WHERE `charId` = ?', [0, player.charId])
        if (player.paycheckAmt > 50) { // pay them less
            mp.events.call("server:changeMoney", player, "paycheck", "+", 500)
            paycheck = "500"
        }
        else { // pay them more
            mp.events.call("server:changeMoney", player, "paycheck", "+", 2000)
            paycheck = "2000"
        }
        setTimeout(() => {
            player.outputChatBox("========= PAYDAY =========") // TODO: Better string
            player.outputChatBox(`Old balance: ${cMoney}$${previous}`)
            player.outputChatBox(`Paycheck: ${cMoney}$${paycheck}`)
            player.outputChatBox(`New balance: ${cMoney}$${player.paycheck}`)
        }, 1000)
    }
}

mp.events.add('playerQuit', async (player) => {
    if (player.charId != undefined && player.charId != null && player.payTime != undefined && player.payTime != null) {
        const [updater] = await mp.db.query('UPDATE `characters` SET `payTime` = ? WHERE `charId` = ?', [player.payTime, player.charId])
    }
})

mp.events.addCommand("payday", async (player) => {
    if (checkBank()) {
        let amount = player.paycheck
        if (amount > 0) {
            mp.events.call("server:changeMoney", player, "paycheck", "-", amount)
            mp.events.call("server:changeMoney", player, "bank", "+", amount)
            player.outputChatBox(`${cMoney}$${amount} has been transferred to your bank account.`)
        }
        else { player.outputChatBox(`${eP} You don't have any money to transfer!`) }
    }
    else { player.outputChatBox(sFar) }
})

mp.events.addCommand("force", (player) => {
    if (player.admin > 9) {
        player.payTime = 60
        payFunc(player)
    }
})