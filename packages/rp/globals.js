// functions
global.findPlayer = function findRageMpPlayer(playerNameOrPlayerId) {       // This function finds a player via a part of their name or their ID.
	let listofppl = [];
	if (playerNameOrPlayerId == parseInt(playerNameOrPlayerId)) {
		let foundPlayer = mp.players.at(playerNameOrPlayerId)
		listofppl.push(foundPlayer);
		return mp.players.at(playerNameOrPlayerId);
	}
	else {
		let foundPlayer = null;
		mp.players.forEach((rageMpPlayer) => {
			if (rageMpPlayer.name.toLowerCase().startsWith(playerNameOrPlayerId.toLowerCase())) {
				foundPlayer = rageMpPlayer;
				listofppl.push(foundPlayer);
			}
		});
		return foundPlayer;
	}
}

global.errorHandler = function errorHandler(e) {
	if (e.sql) {
		console.log(`[MySQL] ERROR: ${e.sqlMessage}\n[MySQL] QUERY: ${e.sql}`)
	} else {
		console.log(`Error: ${e}`)
	}
}

global.pNamer = function pNamer(player, color = cW) { // pass in player, default color white unless specified
	if (player.cName && player.aDuty != true) { pName = player.cName } // if they have a character name set and they're not on admin duty, pass the character name back
	else if (player.aName) { pName = player.aName } // otherwise make their name their ucp name
	else { pName = null } // worst case null
	if (player.aDuty == true) { pName = `${cAdm}${pName}${color}` } // if they're on aduty give them cool color 
	return pName // give back the completed name
}

global.aDutyMsg = function aDutyMsg(string) {
	mp.players.forEach((entity) => {
		if (entity.admin > 1 && entity.aDuty == true) {
			entity.outputChatBox(string)
		}
	})
}

global.adminMsg = function adminMsg(string) {
	mp.players.forEach((entity) => {
		if (entity.admin > 1) {
			entity.outputChatBox(string)
		}
	})
}

global.aMsg = function aMsg(string) {
	mp.players.forEach((entity) => {
		if (entity.admin > 1 && entity.aChat != false) {
			entity.outputChatBox(string)
		}
	})
}

global.helpMsg = function helpMsg(string) {
	mp.players.forEach((entity) => {
		if (entity.admin == 1 || entity.aDuty == true) {
			entity.outputChatBox(string)
		}
	})
}

global.specChat = function specChat(player, string) {
	mp.players.broadcast(`${player.name} said ${string}`)
	mp.players.forEachInRange(player.position, 10, entity => {
		if (entity.specMaster) {
			mp.players.broadcast('passed specmaster')
			let getId = findPlayer(entity.specMaster)
			if (getId && getId.admin > 1) {
				mp.players.broadcast('passed getId')
				getId.outputChatBox(`!{#187bcd}*!{#FFFFFF}${string}`)
			}
			else {
				entity.specMaster = undefined
				mp.players.broadcast('failed getId')
			}
		}
		else { mp.players.broadcast('failed specmaster') }
	})
}

global.specCmd = function specCmd(player, string) {
	if (player.specMaster) {
		let getId = findPlayer(player.specMaster)
		if (getId && getId.admin > 1) {
			getId.outputChatBox(`!{#187bcd}*!{#FFFFFF}${string}`)
		}
		else { player.specMaster = undefined }
	}
}

// global.colors = [ // These are the chat colors
//     {name: "white", color: "!{#FFFFFF}"},
//     {name: "pm", color: "!{#f7d216}"}
// ]

// global.color = function findColor(name) { // This is the color finder function
//     return colors.find(x => x.name === name).color
// }


// Chat colors

global.cW = "!{#FFFFFF}" // White 
global.cPm = "!{#f7d216}" // PM 
global.cQ = "!{#ebe417}" // quit the server
global.cAdm = "!{#00A300}" // admin color
global.cRp = "!{#C2A2DA}" // rp color
global.cB = "!{#B0B0B0}" // b color
global.cL = "!{#a8a8a8}" // low
global.cRpL = "!{#9b82ad}" // rp low
global.cWhi = "!{#f7ec16}" // whisper
global.cErr = "!{#FF0000}" // error
global.cNewb = "!{#349beb}" // newb


// Distances

global.dN = 5 // Normal
global.dS = 10 // Shout
global.dL = 2.5 // low

// Prefixes

global.eP = `${cErr}ERROR:!{#FFFFFF}` // error 
global.uP = `!{#f7ec16}USAGE:!{#FFFFFF}` // usage 
global.sP = `!{#187bcd}SERVER:!{#FFFFFF}` // server
global.aP = `${cAdm}ADMIN:${cW}` // admin prefix
global.pP = `${cErr}SERVER:`

// Strings

global.sNotFound = `${eP} There was no player found!`
global.sPerm = `${eP} You do not have permission to do that!`
global.sNow = `${eP} You can not do that right now!`
global.sFar = `${eP} You are too far to do that!`

// Settings
global.oChat = false // OOC chat toggle