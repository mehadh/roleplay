global.sP = `!{#187bcd}SERVER:!{#FFFFFF}`
global.cErr = "!{#FF0000}" // error
global.eP = `${cErr}ERROR:!{#FFFFFF}` // error 
global.sFar = `${eP} You are too far to do that!`


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
var trySpec = false
var showSpeedo = true

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
    trySpec = false
    spectate = false
    spectating = null
})

function getMinimapAnchor() 
{
    let sfX = 1.0 / 20.0;
    let sfY = 1.0 / 20.0;
    let safeZone = mp.game.graphics.getSafeZoneSize();
    let aspectRatio = mp.game.graphics.getScreenAspectRatio(false);
    let resolution = mp.game.graphics.getScreenActiveResolution(0, 0);
    let scaleX = 1.0 / resolution.x;
    let scaleY = 1.0 / resolution.y;

    let minimap = {
        width: scaleX * (resolution.x / (4 * aspectRatio)),
        height: scaleY * (resolution.y / 5.674),
        scaleX: scaleX,
        scaleY: scaleY,
        leftX: scaleX * (resolution.x * (sfX * (Math.abs(safeZone - 1.0) * 10))),
        bottomY: 1.0 - scaleY * (resolution.y * (sfY * (Math.abs(safeZone - 1.0) * 10))),
    };

    minimap.rightX = minimap.leftX + minimap.width;
    minimap.topY = minimap.bottomY - minimap.height;

    return minimap;
}


function drawText(text, drawXY, font, color, scale) 
{
	mp.game.ui.setTextEntry("STRING");
	mp.game.ui.addTextComponentSubstringPlayerName(text);
	mp.game.ui.setTextFont(font);
	mp.game.ui.setTextScale(scale, scale);
	mp.game.ui.setTextColour(color[0], color[1], color[2], color[3]);
	mp.game.invoke("0x2513DFB0FB8400FE"); // SET_TEXT_OUTLINE
	mp.game.ui.setTextRightJustify(true);
	mp.game.ui.setTextWrap(0, drawXY[0]);
	mp.game.ui.drawText(drawXY[0], drawXY[1]);
}

setInterval(() => {

	// radar visible and not hidden
	if(mp.game.invoke("0xAF754F20EB5CD51A") && !mp.game.invoke("0x157F93B036700462"))
	{
		if(localPlayer.vehicle)
		{
			if(localPlayer.vehicle.getPedInSeat(-1) == localPlayer.handle)
			{
				if(localPlayer.vehicle.model != mp.game.joaat("submersible") && localPlayer.vehicle.model != mp.game.joaat("submersible2"))
				{
					if(showSpeedo == false)
					{
						isMetric = mp.game.gameplay.getProfileSetting(227) == 1;
						minimap = getMinimapAnchor();

						showSpeedo = true;
					}

					return true;
				}
			}
		}
	}
	
	if(showSpeedo == true)
	{
		showSpeedo = false;
	}

}, 200);

mp.events.add('render', () => {
    if (spectate && spectating != null && spectating.handle !== 0) {
        mp.game.invoke("0x8BBACBF51DA047A8", spectating.handle)
        trySpec = false
    }
    else if (spectate) {
        if (!trySpec) {
            setTimeout(() => { trySpec = true }, 5000)
        }
        else {
            mp.gui.chat.push(`${sP} The spectated player is no longer valid.`)
            trySpec = false
            spectate = false
            spectating = null
            mp.events.callRemote('server:unspec')
        }
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

    const vehicle = localPlayer.vehicle;
    if (vehicle){
        if(showSpeedo == true) 
		{
			drawText(
				`${(vehicle.getSpeed() * (isMetric ? 3.6 : 2.236936)).toFixed(0)} ${(isMetric) ? "km/h" : "mph"}`, 
				[minimap.rightX + 0.010, minimap.bottomY - 0.0485], 4, [176, 176, 176, 255], 0.45
            );                                                              // rightX - 0.003
            if (vehicle.getVariable("mileage") != undefined){
                drawText(`${vehicle.getVariable("mileage")} miles`, [minimap.rightX + 0.010, minimap.bottomY - 0.185], 4, [176, 176, 176, 255], 0.45)
            }
            else{
                drawText(`0 miles`, [minimap.rightX + 0.010, minimap.bottomY - 0.185], 4, [176, 176, 176, 255], 0.45)
            }
            if (vehicle.getVariable("fuel") != undefined && vehicle.getVariable("fuel") != "exempt"){
                drawText(`${vehicle.getVariable("fuel")}%`, [minimap.leftX + 0.032, minimap.bottomY - 0.185], 4, [176, 176, 176, 255], 0.45)
            }
            else{
                drawText(`100%`, [minimap.leftX + 0.032, minimap.bottomY - 0.185], 4, [176, 176, 176, 255], 0.45)
            }
		}
    }
})

atms = [-870868698, -1126237515, 506770882, -1364697528]

mp.events.add('client:withdrawCheck', (amount) => {
    let pos = mp.players.local.position
    check = 0
    atms.some(type => {
        check = mp.game.object.getClosestObjectOfType(pos.x, pos.y, pos.z, 3, type, false, false, false)
        return check != 0
    })
    if (check != 0) { mp.events.callRemote('server:withdraw', amount, true) }
    else { mp.gui.chat.push(sFar) }
})