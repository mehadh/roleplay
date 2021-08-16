mp.events.addCommand("makeadmin", async (player, fullText, id, level) => {
    if (id && level && !isNaN(level)) {
        if (player.admin > 4) {
            let getId = findPlayer(id)
            if (getId != null) {
                if (getId.admin < player.admin && level < player.admin) {
                    const [status] = await mp.db.query('UPDATE `accounts` SET `admin` = ? WHERE username = ?', [level, getId.aName]);
                    if (status.affectedRows === 1) {
                        getId.admin = level
                        adminMsg(`${aP} ${getId.aName} (${getId.id}) has been made a Level ${level} admin by ${player.aName} (${player.id})!`)
                    }
                    else { player.outputChatBox(`${eP} The SQL query did not return any affected rows.`) }
                }
                else { player.outputChatBox(sNow) }
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(sPerm) }
    }
    else { player.outputChatBox(`${uP} /makeadmin [id] [level]`) }
})

mp.events.add("server:punish", async (admin, player, type, reason, hours = null, announce = true) => {
    if (admin && player && type && admin.admin > 1) {
        pNamer(player, cErr)
        switch (type) {
            case "kick":
                result = await mp.db.query('INSERT INTO `record` SET `accId` = ?, `type` = ?, `issued` = UNIX_TIMESTAMP() * 1000, `issuer` = ?, `reason` = ?', [player.accId, type, admin.accId, reason])
                if (result[0].affectedRows === 1) {
                    if (announce) {
                        mp.players.broadcast(`${pP} ${pName} was kicked by ${admin.aName} for reason: ${reason}`)
                    }
                    else {
                        player.outputChatBox(`${pP} ${pName} was kicked by ${admin.aName} for reason: ${reason}`)
                        aDutyMsg(`${pP} ${pName} was kicked silently by ${admin.aName} for reason: ${reason}`)
                    }
                }
                break
            case "ban":
                result = await mp.db.query('INSERT INTO `record` SET `accId` = ?, `type` = ?, `issued` = UNIX_TIMESTAMP() * 1000, `issuer` = ?, `reason` = ?, `active` = 1, `hours` = ?', [player.accId, type, admin.accId, reason, hours])
                if (result[0].affectedRows === 1) {
                    if (announce) { mp.players.broadcast(`${pP} ${pName} was banned by ${admin.aName} for ${hours} hours for reason: ${reason}`) }
                    else {
                        player.outputChatBox(`${pP} ${pName} was banned by ${admin.aName} for ${hours} hours for reason: ${reason}`)
                        aDutyMsg(`${pP} ${pName} was banned silently by ${admin.aName} for ${hours} hours for reason: ${reason}`)
                    }
                }
                break
            case "pban":
                result = await mp.db.query('INSERT INTO `record` SET `accId` = ?, `type` = ?, `issued` = UNIX_TIMESTAMP() * 1000, `issuer` = ?, `reason` = ?, `active` = 1', [player.accId, type, admin.accId, reason])
                if (result[0].affectedRows === 1) {
                    if (announce) { mp.players.broadcast(`${pP} ${pName} was permanently banned by ${admin.aName} for ${hours} hours for reason: ${reason}`) }
                    else {
                        player.outputChatBox(`${pP} ${pName} was permanently banned by ${admin.aName} for ${hours} hours for reason: ${reason}`)
                        aDutyMsg(`${pP} ${pName} was permanently banned silently by ${admin.aName} for ${hours} hours for reason: ${reason}`)
                    }
                }
                break
            case "warn":
                result = await mp.db.query('INSERT INTO `record` SET `accId` = ?, `type` = ?, `issued` = UNIX_TIMESTAMP() * 1000, `issuer` = ?, `reason` = ?', [player.accId, type, admin.accId, reason])
                if (result[0].affectedRows === 1) {
                    if (announce) { mp.players.broadcast(`${pP} ${pName} was warned by ${admin.aName} for reason: ${reason}`) }
                    else {
                        player.outputChatBox(`${pP} ${pName} was warned by ${admin.aName} for reason: ${reason}`)
                        aDutyMsg(`${pP} ${pName} was warned silently by ${admin.aName} for reason: ${reason}`)
                    }
                }
                break

            default:
                admin.outputChatBox(`${eP} Something went wrong in the punish event switch case!`)
        }
        if (type != "warn") { setTimeout(function () { player.kick() }, 500) }
    }
    else { console.log("server:punish failed!") }
})

mp.events.add('playerReady', async (player) => { // This is our first ban check which checks socialclub, we will check again when they login.
    [rows] = await mp.db.query('SELECT * FROM `accounts` WHERE `socialClubId` = ?', [player.rgscId])
    rows.forEach(async row => {
        [bans] = await mp.db.query('SELECT * FROM `record` WHERE `accId` = ? AND `active` = 1', [row.ID])
        if (bans.length > 0) {
            setTimeout(function () {
                mp.events.call('client:showChat')
                mp.events.call('server:bannedPlayer', player, bans)
            }, 1000)
        }
    })
})

mp.events.add('server:checkAccount', async (player, username) => { // TODO: Log the fact that the player passed first ban check!
    [rows] = await mp.db.query('SELECT * FROM `accounts` WHERE `username` = ?', [username])
    rows.forEach(async row => {
        [bans] = await mp.db.query('SELECT * FROM `record` WHERE `accId` = ? AND `active` = 1', [row.ID])
        if (bans.length > 0) {
            mp.events.call('client:showChat')
            mp.events.call('server:bannedPlayer', player, bans)
        }
    })
})

mp.events.add('server:bannedPlayer', async (player, ban) => {
    try {
        ban.forEach(async entry => {
            player.outputChatBox(`${pP} You were banned from the server for: ${entry.reason}`)
            if (entry.type == "pban") {
                player.outputChatBox(`${pP} If you would like to appeal this ban, you may visit http://forum.roleplay.com.`) // TODO: Where to go?
                player.outputChatBox(`${pP} Be sure to reference your ban ID, which is ${entry.recordId}.`)
                setTimeout(function () { player.kick() }, 1000)
            }
            else if (entry.type == "ban") {
                expiration = new Date(Number(entry.issued) + Number(entry.hours * 3600000))
                if (expiration < Date.now()) {
                    player.outputChatBox(`${pP} Your ban has now expired. Follow the rules and have fun!`)
                    const [unban] = await mp.db.query('UPDATE `record` SET `active` = 0 WHERE recordId = ?', [entry.recordId]);
                    if (unban.affectedRows !== 1) {
                        errorHandler(e)
                        player.outputChatBox(`${pP} There was an error while unbanning you. Please contact an administrator regarding this.`)
                    }
                }
                else {
                    player.outputChatBox(`${pP} If you would like to appeal this ban, you may visit http://forum.roleplay.com.`) // TODO: Where to go?
                    player.outputChatBox(`${pP} Be sure to reference your ban ID, which is ${entry.recordId}.`)
                    player.outputChatBox(`${pP} You are not required to appeal. The ban will expire at ${expiration.toUTCString()}.`) // TODO: Change timezone?
                    setTimeout(function () { player.kick() }, 1000)
                }
            }
        })
    }
    catch (e) {
        errorHandler(e)
        player.kick()
    }
})

mp.events.addCommand("kick", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "kick", message)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /kick [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("skick", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "kick", message, null, false)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /skick [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("warn", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "warn", message)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /warn [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("swarn", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "warn", message, null, false)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /swarn [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("ban", (player, fullText, id, hours, ...message) => {
    if (player.admin > 1) {
        if (id && hours && !isNaN(hours) && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "ban", message, hours)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /ban [id] [hours] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("sban", (player, fullText, id, hours, ...message) => {
    if (player.admin > 1) {
        if (id && hours && !isNaN(hours) && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "ban", message, hours, false)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /sban [id] [hours] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("pban", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "pban", message)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /pban [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("spban", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            let getId = findPlayer(id)
            if (getId) {
                mp.events.call('server:punish', player, getId, "pban", message, false)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /spban [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("accid", async (player, fullText, type, arg, arg2 = null) => {
    if (player.admin > 1) {
        if (type == "acc" && arg || type == "char" && arg && arg2) {
            if (type == "acc") {
                [row] = await mp.db.query('SELECT * FROM `accounts` WHERE `username` = ?', [arg])
                if (row.length > 0) { player.outputChatBox(`${aP} Account ID: ${row[0].ID} Registered: ${row[0].registerDate.toISOString().split('T')[0]} Last Active: ${row[0].lastActive.toISOString().split('T')[0]}`) }
                else { player.outputChatBox(`${aP} There was no account found based on this query.`) }
            }
            else if (type == "char") {
                [row2] = await mp.db.query('SELECT * FROM `characters` WHERE `first` = ? AND `last` = ?', [arg, arg2])
                if (row2.length > 0) {
                    [row] = await mp.db.query('SELECT * FROM `accounts` WHERE `ID` = ?', [row2[0].accId])
                    if (row.length > 0) { player.outputChatBox(`${aP} Account ID: ${row[0].ID} Registered: ${row[0].registerDate.toISOString().split('T')[0]} Last Active: ${row[0].lastActive.toISOString().split('T')[0]}`) }
                    else { player.outputChatBox(`${aP} There was no account found based on this query.`) }
                }
                else { player.outputChatBox(`${aP} There was no account found based on this query.`) }
            }
        }
        else { player.outputChatBox(`${uP} /accid [acc/char] [accName/charFirst] [charLast?]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("unban", async (player, fullText, type, id) => {
    if (player.admin > 1) {
        if (type && id) {
            if (type == "acc") {
                try {
                    [rows] = await mp.db.query('UPDATE `record` SET `active` = 0 WHERE accId = ? AND `active` = 1', [id])
                    if (rows.affectedRows > 0) { player.outputChatBox(`${aP} You have successfully revoked the ban.`) }
                    else { player.outputChatBox(`${eP} There was no entry found!`) }
                }
                catch (e) { errorHandler(e) }
            }
            else if (type == "ban") {
                try {
                    [rows] = await mp.db.query('UPDATE `record` SET `active` = 0 WHERE recordId = ? AND `active` = 1', [id])
                    if (rows.affectedRows === 1) { player.outputChatBox(`${aP} You have successfully revoked the ban.`) }
                    else { player.outputChatBox(`${eP} There was no entry found!`) }
                }
                catch (e) { errorHandler(e) }
            }
        }
        else { player.outputChatBox(`${uP} /unban [acc OR ban] [accId/banId]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("slap", (player, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId) {
                let position = getId.position
                pNamer(getId)
                mp.players.broadcastInRange(position, 5, `${pP} ${pName} was slapped by ${player.aName}.`)
                position.z += 2.5
                getId.position = position
                player.outputChatBox(`${aP} You slapped ${pName}.`)
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /slap [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("bringto", (player, fullText, id, id2 = undefined) => {
    if (player.admin > 1) {
        if (id) {
            getId = findPlayer(id)
            if (getId) {
                getId.oldPos = getId.position
                if (id2 == undefined) {
                    let name = pNamer(getId)
                    player.outputChatBox(`${aP} You brought ${name} to you!`)
                    getId.outputChatBox(`${sP} ${player.aName} brought you to them!`)
                    getId.position = player.position
                }
                else {
                    getId2 = findPlayer(id2)
                    if (getId2) { //TODO: Check if these names work properly!
                        let name = pNamer(getId)
                        let name2 = pNamer(getId2)
                        player.outputChatBox(`${aP} You brought ${name} to ${name2}!`)
                        getId.outputChatBox(`${sP} ${player.aName} brought you to ${name2}!`)
                        getId2.outputChatBox(`${sP} ${player.aName} brought ${name} to you!`)
                        getId.position = getId2.position


                    }
                    else { player.outputChatBox(`${eP} The second player was not found!`) }
                }
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /bringto [id] [id (optional)]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('bringback', (player, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId) {
                if (getId.oldPos) {
                    pNamer(getId)
                    player.outputChatBox(`${aP} You brought ${pName} back!`)
                    getId.outputChatBox(`${sP} ${player.aName} brought you back!`)
                    getId.position = getId.oldPos
                }
                else { player.outputChatBox(`${eP} They have nowhere to go!`) }
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /bringback [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('goto', (player, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId) {
                player.oldPos = player.position
                pNamer(getId)
                player.outputChatBox(`${aP} You teleported to ${pName}`)
                player.position = getId.position
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /goto [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('goback', (player) => {
    if (player.admin > 1) {
        if (player.oldPos) {
            player.outputChatBox(`${aP} You went back to where you were.`)
            player.position = player.oldPos
        }
        else { player.outputChatBox(`${eP} Your old position was not found.`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("a", (player, message) => {
    if (player.admin > 1) {
        if (message) {
            aMsg(`${cAdm}(( ${player.aName}: ${message} ))`)
        }
        else { player.outputChatBox(`${uP} /a [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("toga", (player) => {
    if (player.admin > 1) {
        if (player.aChat == false) {
            player.aChat = true
            player.outputChatBox(`${aP} You enabled admin chat.`)
        }
        else {
            player.aChat = false
            player.outputChatBox(`${aP} You disabled admin chat.`)
        }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("aduty", (player) => {
    if (player.admin > 1) {
        if (player.aDuty == true) {
            aDutyMsg(`${aP} ${player.aName} has gone off admin duty!`)
            player.aDuty = false
        }
        else {
            player.aDuty = true
            aDutyMsg(`${aP} ${player.aName} has gone on admin duty!`)
        }
    }
    else { player.outputChatBox(sPerm) }
})

var reports = []

mp.events.addCommand("report", (player, message) => {
    if (message) {
        pNamer(player)
        let report = { id: reports.length, name: pName, accName: player.aName, pId: player.id, text: message }
        aDutyMsg(`${cErr}[REPORT ID ${reports.length}]${cW} ${pName} (${player.id}): ${message}`)
        reports.push(report)
        player.outputChatBox(`${sP} Your report has been sent to the administration team.`)
    }
    else { player.outputChatBox(`${uP} /report [message]`) }
})

mp.events.addCommand("reports", (player) => {
    if (player.admin > 1) {
        if (reports.length > 0) {
            player.outputChatBox(`${cErr}----------${cW} REPORTS ${cErr}----------`) // TODO: Maket his look better?
            reports.forEach((entry, index) => {
                player.outputChatBox(`${cErr}[REPORT ID ${index}]${cW} ${entry.name} (${entry.pId}): ${entry.text}`)
            })
        }
        else { player.outputChatBox(`${aP} There are no reports in the queue.`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("ar", (player, index) => {
    if (player.admin > 1) {
        if (index) {
            if (typeof reports[index] === 'undefined') {
                player.outputChatBox(`${aP} That report ID was not found!`)
            }
            else {
                aDutyMsg(`${aP} ${player.aName} accepted report ID ${index}.`)
                if (player.aDuty != true) { player.outputChatBox(`${aP} You accepted report ID ${index}.`) }
                reports.splice(index, 1)
            }
        }
        else { player.outputChatBox(`${uP} /ar [reportId]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("record", async (player, fullText, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId && getId.accId) {
                [record] = await mp.db.query('SELECT * FROM `record` WHERE `accId` = ?', [getId.accId])
                if (record.length > 0) {
                    player.outputChatBox(`${cErr}----------${cW} RECORD ${cErr}----------`) // TODO: Make this look better
                    record.forEach(entry => {
                        time = new Date(Number(entry.issued))
                        player.outputChatBox(`ID: ${entry.recordId} Type: ${entry.type} Reason: ${entry.reason} Issued: ${time.toISOString().split('T')[0]} Issuer: ${entry.issuer}`)
                    })
                }
                else { player.outputChatBox(`${aP} That player has a clean admin record!`) }
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /record [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("freeze", (player, fullText, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId) {
                pNamer(getId)
                player.outputChatBox(`${aP} You toggled the freeze on ${pName}.`)
                getId.call('client:aFreeze')
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /freeze [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('tp', (player, _, x, y, z) => {
    if (player.admin > 1) {
        if (!isNaN(parseFloat(x)) && !isNaN(parseFloat(y)) && !isNaN(parseFloat(z)))
            player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
        else
            player.outputChatBox(`${uP} /tp [x] [y] [z]`);
    }
    else {
        player.outputChatBox(sPerm)
    }
});

mp.events.addCommand("newb", (player, message) => {
    if (player.nMute != true) {
        if (message) {
            if (player.nCooldown != true || player.admin > 0) {
                pNamer(player, cNewb)
                mp.players.forEach((entity) => {
                    if (entity.nChat != false) {
                        entity.outputChatBox(`${cNewb} (( ${pName}: ${message} ))`)
                    }
                })
                player.nCooldown = true
                setTimeout(function () { player.nCooldown }, 300000)
            }
            else { player.outputChatBox(`${sP} You still have a newb chat cooldown!`) }
        }
        else { player.outputChatBox(`${uP} /newb [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("nmute", async (player, fullText, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId && getId.accId) {
                if (getId.nMute != true) {
                    [rows] = await mp.db.query('UPDATE `accounts` SET `nMute` = 1 WHERE `ID` = ?', [getId.accId])
                    if (rows.affectedRows === 1) {
                        pNamer(getId)
                        player.outputChatBox(`${aP} You muted ${pName} from the Newbie channel.`)
                        getId.outputChatBox(`${pP} You were muted from the Newbie channel by ${player.aName}.`)
                        getId.nMute = true
                    }
                    else { player.outputChatBox(`${eP} There was an error in the nMute SQL statement. Please consult a developer.`) }
                }
                else { player.outputChatBox(`${aP} That player is already muted!`) }
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /nmute [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("nunmute", async (player, fullText, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId && getId.accId) {
                if (getId.nMute != false) {
                    [rows] = await mp.db.query('UPDATE `accounts` SET `nMute` = 0 WHERE `ID` = ?', [getId.accId])
                    if (rows.affectedRows === 1) {
                        pNamer(getId)
                        player.outputChatBox(`${aP} You unmuted ${pName} from the Newbie channel.`)
                        getId.outputChatBox(`${pP} You were unmuted from the Newbie channel by ${player.aName}.`)
                        getId.nMute = false
                    }
                    else { player.outputChatBox(`${eP} There was an error in the nUnmute SQL statement. Please consult a developer.`) }
                }
                else { player.outputChatBox(`${aP} That player is already unmuted!`) }
            }
            else { player.outputChatBox(sNotFound) }
        }
        else { player.outputChatBox(`${uP} /nunmute [id]`) }
    }
    else { player.outputChatBox(sPerm) }
})

var helpmes = []

mp.events.addCommand("helpme", (player, message) => {
    if (message) {
        pNamer(player)
        let helpme = { id: helpmes.length, name: pName, accName: player.aName, pId: player.id, text: message }
        helpMsg(`${cErr}[HELPME ID ${helpmes.length}]${cW} ${pName} (${player.id}): ${message}`)
        helpmes.push(helpme)
        player.outputChatBox(`${sP} Your question has been sent to the administration team.`)
    }
    else { player.outputChatBox(`${uP} /helpme [message]`) }
})

mp.events.addCommand("helpmes", (player) => {
    if (player.admin > 0) {
        if (helpmes.length > 0) {
            player.outputChatBox(`${cErr}----------${cW} HELPMES ${cErr}----------`) // TODO: Make this look better?
            helpmes.forEach((entry, index) => {
                player.outputChatBox(`${cErr}[HELPME ID ${index}]${cW} ${entry.name} (${entry.pId}): ${entry.text}`)
            })
        }
        else { player.outputChatBox(`${aP} There are no helpmes in the queue.`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("ah", (player, index) => {
    if (player.admin > 0) {
        if (index) {
            if (typeof helpmes[index] === 'undefined') {
                player.outputChatBox(`${aP} That helpme ID was not found!`)
            }
            else {
                helpMsg(`${aP} ${player.aName} accepted helpme ID ${index}.`)
                if (player.aDuty != true) { player.outputChatBox(`${aP} You accepted helpme ID ${index}.`) }
                helpmes.splice(index, 1)
            }
        }
        else { player.outputChatBox(`${uP} /ah [helpmeId]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.add('server:oPunish', async (admin, accId, type, reason, hours = null) => {
    if (admin && accId && type && admin.admin > 1) {
        switch (type) {
            case "ban":
                try {
                    result = await mp.db.query('INSERT INTO `record` SET `accId` = ?, `type` = ?, `issued` = UNIX_TIMESTAMP() * 1000, `issuer` = ?, `reason` = ?, `active` = 1, `hours` = ?', [accId, type, admin.accId, reason, hours])
                    if (result[0].affectedRows === 1) {
                        aDutyMsg(`${pP} Account ${accId} was banned offline by ${admin.aName} for ${hours} hours for reason: ${reason}`)
                        mp.events.call('server:oPunishPost', accId)
                    }
                }
                catch (e) {
                    errorHandler(e)
                    admin.outputChatBox(`${eP} There was an SQL error. Perhaps you entered the wrong account ID?`)
                }
                break
            case "pban":
                try {
                    result = await mp.db.query('INSERT INTO `record` SET `accId` = ?, `type` = ?, `issued` = UNIX_TIMESTAMP() * 1000, `issuer` = ?, `reason` = ?, `active` = 1', [accId, type, admin.accId, reason])
                    if (result[0].affectedRows === 1) {
                        aDutyMsg(`${pP} Account ${accId} was permanently banned offline by ${admin.aName} for ${hours} hours for reason: ${reason}`)
                        mp.events.call('server:oPunishPost', accId)
                    }
                }
                catch (e) {
                    errorHandler(e)
                    admin.outputChatBox(`${eP} There was an SQL error. Perhaps you entered the wrong account ID?`)
                }
                break
            default:
                admin.outputChatBox(`${eP} Something went wrong in the oPunish event switch case!`)
        }
    }
    else { console.log('server:oPunish failed!') }
})

mp.events.add('server:oPunishPost', (accId) => {
    mp.players.forEach(entity => {
        if (entity.accId == accId) {
            pNamer(entity)
            aDutyMsg(`${aP} ${pName} was kicked for being offline banned.`)
            player.outputChatBox(`${sP} You were offline banned by an admin!`)
            player.kick()
        }
    })
})

mp.events.addCommand("oban", (player, fullText, id, hours, ...message) => {
    if (player.admin > 1) {
        if (id && hours && !isNaN(hours) && message && message.length > 0) {
            message = message.join(' ');
            mp.events.call('server:oPunish', player, id, "ban", message, hours)
        }
        else { player.outputChatBox(`${uP} /oban [accId] [hours] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("opban", (player, fullText, id, ...message) => {
    if (player.admin > 1) {
        if (id && message && message.length > 0) {
            message = message.join(' ');
            mp.events.call('server:oPunish', player, id, "pban", message)
        }
        else { player.outputChatBox(`${uP} /opban [id] [message]`) }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand("freecam", (player) => {
    if (player.admin > 1) {
        if (player.freecam == undefined || player.freecam == null) { player.freecam = false }
        player.call('client:freecam')
        player.freecam = !player.freecam;
        if (player.freecam) {
            player.alpha = 0;
            player.outputChatBox(`${aP} Use SHIFT to speed up, LCtrl to slow down. WASD/QE moves the camera. You will be teleported when you exit freecam.`)
            aDutyMsg(`${aP} ${player.aName} entered freecam mode.`)
        }
        else {
            if (player.aDuty == false) { player.outputChatBox(`${aP} You have exited freecam mode.`) }
            aDutyMsg(`${aP} ${player.aName} exited freecam mode.`)
            player.alpha = 255;
        }
    }
    else { player.outputChatBox(sPerm) }
})

mp.events.addCommand('veh', (player, fullText, arg1, arg2, arg3, arg4) => {
    if (player.admin > 1) {
        if (arg1) {
            adminVeh = mp.vehicles.new(arg1, player.position,
                {
                    color: [[parseInt(arg2), parseInt(arg3), parseInt(arg4)], [parseInt(arg2), parseInt(arg3), parseInt(arg4)]],
                    numberPlate: "ADMIN"
                });
            adminVeh.timer = setInterval(function () {
                let occupants = adminVeh.getOccupants()
                if (occupants.length == 0) {
                    clearInterval(adminVeh.timer)
                    adminVeh.destroy();
                }
            }, 300000)
        }
        else { player.outputChatBox(`${uP} /veh [model] [color] [color] [color]`) }

    }
    else { player.outputChatBox(sPerm) }
});

function specPos(player, getId) {
    let pos = getId.position
    pos.z += 50
    player.position = pos
}

mp.events.addCommand('spec', (player, fullText, id) => {
    if (player.admin > 1) {
        if (id) {
            let getId = findPlayer(id)
            if (getId) {
                player.alpha = 0;
                player.outputChatBox(`${aP} Starting spectate on ${getId.name}!`)
                player.specTarget = getId.id
                getId.specMaster = player.id
                player.call('client:freeze')
                specPos(player, getId)
                player.specTimer = setInterval(() => { specPos(player, getId) }, 5000)
                player.specOld = player.position
                let streamCheck = setInterval(() => {
                    if (player.isStreamed(getId)) {
                        player.outputChatBox(`${aP} Target in stream distance!`)
                        player.call('client:spectate', [getId.id])
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

mp.events.addCommand('unspec', (player) => {
    if (player.admin > 1) {
        player.outputChatBox(`${aP} Clearing your spectate session.`)
        player.call('client:clearSpectate')
        clearInterval(player.specTimer)
        player.specTimer = undefined
        if (player.specTarget) {
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