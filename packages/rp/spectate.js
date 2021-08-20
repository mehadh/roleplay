function specPos(player, getId) {
    let pos = getId.position
    pos.z += 50
    player.position = pos
}

mp.events.add('server:spec', (player, id) => {
    if (player.admin > 1) {
        if (player.specTarget) {
            let getId = findPlayer(player.specTarget)
            player.specTarget = undefined
            if (getId) {
                getId.specMaster = undefined
            }
        }
        if (id) {
            let getId = findPlayer(id)
            if (getId) {
                player.alpha = 0;
                player.outputChatBox(`${aP} Starting spectate on ${getId.name}!`)
                player.specTarget = getId.id
                getId.specMaster = player.id
                player.call('client:freeze')
                specPos(player, getId)
                clearInterval(player.specTimer)
                player.specTimer = undefined
                player.specTimer = setInterval(() => { specPos(player, getId) }, 2500)
                player.specOld = player.position
                let streamCheck = setInterval(() => {
                    if (player.isStreamed(getId)) {
                        player.outputChatBox(`${aP} Target in stream distance!`)
                        setTimeout(() => { player.call('client:spectate', [getId.id]) }, 250)
                        clearInterval(streamCheck)
                    }
                    else {
                        player.outputChatBox(`${aP} Streaming...`)
                    }
                }, 250)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /spec [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('spec', (player, fullText, id) => {
    mp.events.call('server:spec', player, id)
})

mp.events.add('server:unspec', (player) => {
    if (player.admin > 1) {
        player.outputChatBox(`${aP} Clearing your spectate session.`)
        player.call('client:clearSpectate')
        clearInterval(player.specTimer)
        player.specTimer = undefined
        if (player.specTarget != undefined && player.specTarget != null) {
            let getId = findPlayer(player.specTarget)
            player.specTarget = undefined
            if (getId) {
                getId.specMaster = undefined
            }
        }
        //player.position = player.specOld
        player.spawn(new mp.Vector3(-949.4786, -1484.449, 1.014465));
        player.call('client:unfreeze')
        player.alpha = 255;
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('unspec', (player) => {
    mp.events.call('server:unspec', player)
})

// specChat function located in globals.js!

mp.events.add('playerChat', (player, message) => {
    specChat(player, `${player.name} says: ${message}`)
})

mp.events.addCommand("me", (player, message) => {
    pName = player.name
    specChat(player, `${cRp}* ${pName} ${message}`)
})

mp.events.addCommand("do", (player, message) => {
    pName = player.name
    specChat(player, `${cRp}* ${message} (( ${pName} ))`)
})

mp.events.addCommand("my", (player, message) => {
    pName = player.name
    specChat(player, `${cRp}* ${pName}'s ${message}`)
})

mp.events.addCommand("b", (player, message) => {
    pNamer(player, cB)
    specChat(player, `${cB}(( ${pName} (${player.id}): ${message} ))`)
})

mp.events.addCommand("s", (player, message) => {
    pName = player.name
    specChat(player, `${cW}${pName} shouts: ${message}`)
})

mp.events.addCommand("t", (player, message) => {
    pName = player.name
    specChat(player, `${pName} says: ${message}`)
})

mp.events.addCommand("low", (player, message) => {
    pName = player.name
    specChat(player, `${cL}${pName} says quietly: ${message}`)
})

mp.events.addCommand("l", (player, message) => {
    pName = player.name
    specChat(player, `${cL}${pName} says quietly: ${message}`)
})

mp.events.addCommand("mel", (player, message) => {
    pName = player.name
    specChat(player, `${cRpL}* ${pName} ${message}`)
})

mp.events.addCommand("dol", (player, message) => {
    pName = player.name
    specChat(player, `${cRpL}* ${message} (( ${pName} ))`)
})

mp.events.addCommand("myl", (player, message) => {
    pName = player.name
    specChat(player, `${cRpL}* ${pName}'s ${message}`)
})

// mp.events.addCommand("coin", (player, message) => {
//     // This is located in chat.js due to result factor
// })

// mp.events.addCommand("roll", (player, message) => {
//     // This is located in chat.js due to result factor.
// })

// specCmd in globals.js

mp.events.add("playerCommand", (player, string) => {
    specCmd(player, `${player.name} attempted command [/${string}]`)
})

mp.events.addCommand("id", (player, message) => {
    specCmd(player, `${player.name} used command: [/id ${message}]`)
})

mp.events.addCommand("w", (player, fullText, id, ...message) => {
    if (id & message) {
        let getId = findPlayer(id)
        if (getId) {
            specCmd(player, `${cWhi} ${player.name} whispers: ${message}`)
            specCmd(getId, `${cWhi} ${player.name} whispers: ${message}`)
        }
        else {
            specCmd(player, `${player.name} attempted command [/w ${fullText}]`)
        }
    }
    else { specCmd(player, `${player.name} attempted command [/w ${fullText}]`) }
})

mp.events.addCommand("pm", (player, fullText, id, ...message) => {
    if (id == null || id == undefined || message == null || message == undefined || message.length < 1) { specCmd(player, `${player.name} attempted command [/pm ${fullText}]`) }
    else {
        message = message.join(' ');
        let getId = findPlayer(id)
        if (getId != null && getId != undefined && getId.aName != null && player.aName != null && getId.aName != undefined && player.aName != undefined) {
            if (player.cName == null || player.aDuty == true) { sender = player.aName }
            else { sender = player.cName }
            if (getId.cName == null || getId.aDuty == true) { receiver = getId.aName }
            else { receiver = getId.cName }
            if (player.aDuty == true) { sender = `${cAdm}${sender}${cPm}` }
            if (getId.aDuty == true) { receiver = `${cAdm}${receiver}${cPm}` }
            specCmd(player, `${cPm}(( PM to ${receiver} (${getId.id}): ${message} ))`)
            specCmd(getId, `${cPm}(( PM from ${sender} (${player.id}): ${message} ))`)
        }
        else { specCmd(player, `${player.name} attempted command [/pm ${fullText}]`) }
    }

})

// pay located in money.js