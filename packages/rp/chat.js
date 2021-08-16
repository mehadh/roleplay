mp.events.add('playerChat', (player, message) => {
    mp.players.broadcastInRange(player.position, dN, `${player.name} says: ${message}`)
})

mp.events.addCommand("pm", (player, fullText, id, ...message) => {
    if (id == null || id == undefined || message == null || message == undefined) { player.outputChatBox(`${uP} /pm [id] [message]`) }
    else {
        message = message.join(' ');
        let getId = findPlayer(id)
        if (getId != null && getId != undefined && getId.aName != null && player.aName != null && getId.aName != undefined && player.aName != undefined) {
            if (player.cName == null || player.aDuty == true) { sender = player.aName }
            else { sender = player.cName }
            if (getId.cName == null || getId.aDuty == true) { receiver = getId.aName }
            else { receiver = player.cName }
            if (player.aDuty == true) { sender = `${cAdm}${sender}${cPm}` }
            if (getId.aDuty == true) { receiver = `${cAdm}${receiver}${cPm}` }
            player.outputChatBox(`${cPm}(( PM to ${receiver} (${getId.id}): ${message} ))`)
            getId.outputChatBox(`${cPm}(( PM from ${sender} (${player.id}): ${message} ))`)
        }
        else { player.outputChatBox(sNotFound) }
    }

})

mp.events.add('playerCommand', (player, command) => {
    player.outputChatBox(`${eP} That is not a valid command!`)
})

mp.events.add('playerQuit', (player) => {
    if (player.cName && player.aDuty != true) { pName = player.cName }
    else if (player.aName) { pName = player.aName }
    else { pName = null }
    if (pName != null) {
        mp.players.broadcastInRange(player.position, dN, `${cQ}(( ${pName} has left the server. ))`) // This distance might need to change
    }
})

mp.events.addCommand("o", (player, message) => {
    if (message != undefined || message != null) {
        if (oChat == true || player.admin > 1) {
            pNamer(player)
            if (pName != null) {
                mp.players.broadcast(`(( ${pName}: ${message} ))`)
            }
            else { player.outputChatBox(sNow) }
        }
        else { player.outputChatBox(sPerm) }
    }
    else { player.outputChatBox(`${uP} /o [message]`) }
})

mp.events.addCommand("me", (player, message) => {
    if (message) {
        //pNamer(player, cRp)
        pName = player.name
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dN, `${cRp}* ${pName} ${message}`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /me [action]`) }
})

mp.events.addCommand("do", (player, message) => {
    if (message) {
        //pNamer(player, cRp)
        pName = player.name
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dN, `${cRp}* ${message} (( ${pName} ))`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /do [description]`) }
})

mp.events.addCommand("my", (player, message) => {
    if (message) {
        pName = player.name
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dN, `${cRp}* ${pName}'s ${message}`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /my [action]`) }
})

mp.events.addCommand("b", (player, message) => {
    if (message) {
        pNamer(player, cB)
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dN, `${cB}(( ${pName} (${player.id}): ${message} ))`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /b [message]`) }
})

mp.events.addCommand("s", (player, message) => {
    if (message) {
        pName = player.name
        mp.players.broadcastInRange(player.position, dN, `${cW}${pName} shouts: ${message}`)
    }
    else { `${uP} /s [message]` }
})

mp.events.addCommand("t", (player, message) => {
    pName = player.name
    mp.players.broadcastInRange(player.position, dN, `${pName} says: ${message}`)
})

mp.events.addCommand("low", (player, message) => {
    if (message) {
        pName = player.name
        mp.players.broadcastInRange(player.position, dL, `${cL}${pName} says quietly: ${message}`)
    }
    else { player.outputChatBox(`${uP} /low [message]`) }
})

mp.events.addCommand("mel", (player, message) => {
    if (message) {
        //pNamer(player, cRp)
        pName = player.name
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dL, `${cRpL}* ${pName} ${message}`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /mel [action]`) }
})

mp.events.addCommand("dol", (player, message) => {
    if (message) {
        //pNamer(player, cRp)
        pName = player.name
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dL, `${cRpL}* ${message} (( ${pName} ))`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /dol [description]`) }
})

mp.events.addCommand("myl", (player, message) => {
    if (message) {
        pName = player.name
        if (pName != null) {
            mp.players.broadcastInRange(player.position, dL, `${cRpL}* ${pName}'s ${message}`)
        }
        else { player.outputChatBox(sNow) }
    }
    else { player.outputChatBox(`${uP} /myl [action]`) }
})

mp.events.addCommand("coin", (player) => {
    pName = player.name
    let result = Math.floor(Math.random() * 101)
    if (result % 2 == 0) { coin = "heads" }
    else { coin = "tails" }
    mp.players.broadcastInRange(player.position, dN, `${cRp}* ${pName} flipped a coin and it landed on ${cW}${coin}${cRp}!`)
})

mp.events.addCommand("roll", (player) => {
    pName = player.name
    let init = Math.floor(Math.random() * 6);
    let result = ++init
    mp.players.broadcastInRange(player.position, dN, `${cRp}* ${pName} rolled a die and it landed on ${cW}${result}${cRp}!`)
})

mp.events.addCommand("id", (player, playerNameorPlayerId) => { // This one's a bit bad as it was copy pasted from my old script, forgive me.
    if (playerNameorPlayerId != null || playerNameorPlayerId != undefined) {
        let listofppl = [];
        function findRageMpPlayer(playerNameOrPlayerId) {
            if (playerNameOrPlayerId == parseInt(playerNameOrPlayerId)) {
                let foundPlayer = mp.players.at(playerNameOrPlayerId)
                listofppl.push(foundPlayer);
                return mp.players.at(playerNameOrPlayerId);
            }
            else {
                let foundPlayer = null;
                mp.players.forEach((rageMpPlayer) => {
                    if (rageMpPlayer.name.toLowerCase().includes(playerNameOrPlayerId.toLowerCase())) {
                        foundPlayer = rageMpPlayer;
                        listofppl.push(foundPlayer);
                    }
                });
                return foundPlayer;
            }
        }
        let getId = findRageMpPlayer(playerNameorPlayerId);
        for (let i = 0; i < listofppl.length; i++) {
            if (listofppl[i]) {
                player.outputChatBox(`${listofppl[i].name} is ID ${listofppl[i].id}`)
            }
            else {
                player.outputChatBox(sNotFound)
            }
        }
    }
    else {
        player.outputChatBox(`${uP} /id [name/id]`)
    }
})

mp.events.addCommand("w", (player, fullText, id, ...message) => {
    if (id && message) {
        let getId = findPlayer(id)
        if (getId) {
            if (getId.dist(player.position) <= 2.5) {
                message = message.join(' ');
                player.outputChatBox(`${cWhi} ${player.name} whispers: ${message}`)
                getId.outputChatBox(`${cWhi} ${player.name} whispers: ${message}`)
            }
            else { player.outputChatBox(sFar) }
        }
        else { player.outputChatBox(sNotFound) }
    }
    else { player.outputChatBox(`${uP} /w [id] [message]`) }
})