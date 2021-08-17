mp.events.add('server:characterMenu', async (player) => { // Called after account vars are loaded.
    try {
        const [rows] = await mp.db.query('SELECT * FROM `characters` WHERE `accId` = ? AND `active` = 1', [player.accId]); // Get all characters belonging to the player
        player.call('client:characterMenu', [rows]) // Pass this to the clientside where a NativeUI menu is created.
    } catch (e) { errorHandler(e) };
});

mp.events.add('server:selectCharacter', async (player, charId) => { // Called from client:characterMenu
    try {
        const [rows] = await mp.db.query('SELECT * FROM `characters` WHERE `accId` = ? AND `charId` = ?', [player.accId, charId]) // Double check that this character belongs to the player
        if (rows.length === 0) { // We do this check because of potential exploits. 
            player.outputChatBox(`${eP} There was an error while loading your character! Please reconnect.`) // TODO: Log event, perhaps ban for this.
            setTimeout(function () { // Give the player time to read the message.
                player.kick()
            }, 1000)
        }
        else { // If we do get a result, we're good to load the character.
            mp.events.call('server:loadCharacter', player, charId)
        }
    } catch (e) { errorHandler(e) };
})

mp.events.add('server:loadCharacter', async (player, charId) => {
    try {
        const [rows] = await mp.db.query('SELECT * FROM `characters` WHERE `accId` = ? AND `charId` = ?', [player.accId, charId])
        // All character vars should be set here!
        let name = `${rows[0].first} ${rows[0].last}`
        player.name = name
        player.fName = rows[0].first
        player.lName = rows[0].last
        player.cName = name
        player.charId = charId
        mp.events.call('server:spawnMenu', player, charId)
        //player.call('client:hideLoginScreen') // This should only happen when loadCharacter has completed.

    } catch (e) { errorHandler(e) }
})

mp.events.add('server:attemptRegister', async (player, first, last) => {
    // Check if they have enough slots
    try {
        const [rows] = await mp.db.query('SELECT * FROM `characters` WHERE `accId` = ? AND `active` = 1', [player.accId])
        canCreate = player.slots - rows.length
        if (canCreate < 1) {
            player.outputChatBox(`${eP} You do not have enough slots to create a new character.`) // TODO: Tell them they can purchase it
            player.call('client:characterHandler', ['close'])
        }
        else {
            try {
                const [rows] = await mp.db.query('SELECT * FROM `characters` WHERE `first` = ? AND `last` = ?', [first, last])
                if (rows.length === 0) {
                    // TODO: Maybe add an "Are you sure?" here.
                    mp.events.call('server:createCharacter', player, first, last)
                }
                else {
                    player.outputChatBox(`${eP} That name is already taken!`)
                    player.call('client:characterHandler', ['taken'])
                }
            }
            catch (e) { errorHandler(e) }
        }

    } catch (e) { errorHandler(e) }
})

mp.events.add('server:createCharacter', async (player, first, last) => {
    try {
        const result = await mp.db.query('INSERT INTO `characters` SET `accId` = ?, `first` = ?, `last` = ?', [player.accId, first, last])
        if (result[0].affectedRows === 1) {
            player.call('client:characterHandler', ['close'])
        }
        else {
            player.outputChatBox(`${eP} There was an error while creating your character!`)
            player.call('client:characterHandler', ['close'])
        }

    }
    catch (e) { errorHandler(e) }
})

mp.events.add('server:spawnMenu', async (player, charId) => {
    // TODO: Can they spawn at their house?
    // TODO: Can they spawn at their faction HQ?
    // TODO: Can they spawn at their business? 
    try {
        const [rows] = await mp.db.query('SELECT `position` FROM `characters` WHERE `accId` = ? AND `charId` = ?', [player.accId, charId])
        spawnList = [] // If this starts to get out of order, we can use a priority key that is hardcoded.
        spawnList.push({ name: "Los Santos International Airport", position: new mp.Vector3(mp.settings.defaultSpawnPosition) })
        if (rows[0].position != null) {
            player.lastPos = rows[0].position
            spawnList.push({ name: "Last Position", position: new mp.Vector3(JSON.parse(rows[0].position)) })
        }
        player.call('client:spawnMenu', [spawnList])


    }
    catch (e) {
        errorHandler(e)
    }
})

mp.events.addCommand('changechar', (player) => {
    // We likely want to unload the character as well.
    pNamer(player)
    mp.players.broadcastInRange(player.position, dN, `${sP} ${pName} has changed characters.`)
    player.call('client:enableCharScreen')
    mp.events.call('server:characterMenu', player);
})

mp.events.add('server:afterCharPos', (player) => {
    //player.outputChatBox('server:afterCharPos')
})