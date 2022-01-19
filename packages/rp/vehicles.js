// VEHICLE
// vehicle.owner == player.charId

// TODO: Dupkey systems, shared vehicle stuff 

var spawnedCars = [];

mp.events.add("playerStartEnterVehicle", (player, vehicle, seat) => {
    if (player.vehicle.getVariable('Engine') != false && player.vehicle.getVariable('Engine') != true) { player.vehicle.setVariable('Engine', false) }
    player.vehicle.setVariable('Engine', player.vehicle.getVariable('Engine'))
    player.vehicle.engine = player.vehicle.getVariable('Engine')
})

mp.events.add("playerExitVehicle", (player, vehicle, seat) => {
    if (player.vehicle.getVariable('Engine') != false && player.vehicle.getVariable('Engine') != true) { player.vehicle.setVariable('Engine', false) }
    player.vehicle.setVariable('Engine', player.vehicle.getVariable('Engine'))
    player.vehicle.engine = player.vehicle.getVariable('Engine')
})

mp.events.add('server:engine', player => {
    if (player.vehicle && player.vehicle.owner == player.charId) { // This is the defining factor on whether you are allowed to engine the vehicle. 
        if (player.vehicle.getVariable('Engine') != false && player.vehicle.getVariable('Engine') != true) { player.vehicle.setVariable('Engine', false) }
        player.vehicle.setVariable('Engine', !player.vehicle.getVariable('Engine'))
        player.vehicle.engine = player.vehicle.getVariable('Engine')
    }
})

mp.events.add('server:lock', player => {
    let nearbyVehicles = []
    if (player.vehicle == undefined || player.vehicle == null){
        mp.vehicles.forEachInRange(player.position, 5, (vehicle) => {nearbyVehicles.push(vehicle)})
        nearbyVehicles.sort(function(a, b){return b.dist(player.position)-a.dist(player.position)});
        if (nearbyVehicles[0]){                          
        if (nearbyVehicles[0].owner == player.charId){ // This is the defining factor on whether you are allowed to lock or unlock the vehicle. 
            nearbyVehicles[0].locked = !nearbyVehicles[0].locked
            nearbyVehicles[0].setVariable("locked", nearbyVehicles[0].locked)
            // TODO: Add lock notification
        }}
    }
})

mp.events.addCommand('vs', async (player) => {
    [rows] = await mp.db.query('SELECT * FROM `vehicles` WHERE `charId` = ? AND `active` = ?', [player.charId, true])
    if (rows.length > 0){
        player.call('client:vehMenu', [rows])
    }
    else{player.outputChatBox(`${eP} You have no vehicles to spawn!`)}
})

mp.events.addCommand('vp', async (player) => {
    if (player.vehicle != null && player.vehicle != undefined && player.vehicle.owner == player.charId){
        [car] = await mp.db.query('UPDATE `vehicles` SET `position` = ?, `rotation` = ? WHERE `vehId` = ?', [JSON.stringify(player.vehicle.position), player.vehicle.rotation.z, player.vehicle.vehId]) 
        mp.events.call('server:despawnVeh', player.vehicle)
        player.outputChatBox(`${sP} You have parked your vehicle.`)
    }
    else{player.outputChatBox(`${eP} You can not do that!`)}
})

mp.events.add('server:despawnVeh', vehicle => {
    let vehicleId = parseInt(vehicle.vehId)
    const index = spawnedCars.indexOf(vehicleId)
    if (index > -1){
        spawnedCars.splice(index, 1)
        let occupants = vehicle.getOccupants();
        for(let i = 0; i < occupants.length; i++) {
            occupants[i].removeFromVehicle();
        }
        setTimeout(() => {
            vehicle.destroy()
        }, 500);
    }

})

mp.events.add('server:spawnVeh', async (player, vehId) => {
    if (spawnedCars.indexOf(parseInt(vehId)) !== -1){player.outputChatBox(`${eP} That vehicle is already spawned!`)}
    else {
        spawnedCars.push(parseInt(vehId))
        let [vRows] = await mp.db.query('SELECT * FROM `vehicles` WHERE `charId` = ? AND `vehId` = ?', [player.charId, vehId])
        if (vRows.length == 1){ // this check is probably broken!
            if (vRows[0].position == null){vRows[0].position = player.position}
            else{vRows[0].position = new mp.Vector3(JSON.parse(vRows[0].position))} 
            if(vRows[0].rotation == null){vRows[0].rotation == player.heading}
            let veh = mp.vehicles.new(vRows[0].model, vRows[0].position, 
                {
                    heading: vRows[0].rotation, 
                    color: [[vRows[0].primaryColor, 0, 0], [vRows[0].secondaryColor, 0, 0]],
                    locked: true,
                    engine: false
                }
            )
            veh.setVariable("locked", true) // might not be necessary
            veh.locked = true // because above was being weird
            veh.model = vRows[0].model
            veh.owner = vRows[0].charId
            veh.vehId = vRows[0].vehId
            veh.setVariable("fuel", vRows[0].fuel)
            veh.setVariable("mileage", vRows[0].mileage)
            veh.numberPlate = vRows[0].numberPlate
            // Mods go here
            // veh.mods = what is this here????
            veh.modObj = JSON.parse(vRows[0].mods) 
            for (var type in veh.modObj){
                veh.setMod(parseInt(type), parseInt(veh.modObj[type]))
            }
            if (veh.modObj == null || veh.modObj == undefined){veh.modObj = {}}
        }
        else{player.outputChatBox(`${eP} There was an error while spawning your vehicle.`)}
    }
})

mp.events.add('server:changeCarOwner', async (vehId, id) => {
    // I always think back to the fact that RAGE:MP events can be exploited. I'm not adding checks here, but it's probably a good idea to add checks at every step of the process. 
    // The reason for that is because with a simple hole in your clientside code or through the development of a RAGE:MP exploit, you can inject clientside code. 
    // Clientside code can of course call serverside code, so in theory you could change every car's ownership through this. 
    // What is the probability this server even launched though? That's not an excuse to do things wrong, but pretty much every serverside event is exploitable in one way or another. 
    // So you might as well keep it the way it is as long as you're not making blatant holes in the code. 

    const [status] = await mp.db.query('UPDATE `vehicles` SET `charId` = ? WHERE vehId = ?', [id, vehId]);
    mp.vehicles.forEach(veh => {
        if(veh.vehId == vehId){mp.events.call('server:despawnVeh', veh)}
    })
    // if (status.affectedRows === 1) {
    //     //callback
    // }
})

mp.events.addCommand('vsell', (player, id, price) => {
    if (player.saleData == null || player.saleData == undefined){
        if (player.vehicle == null || player.vehicle == undefined){player.outputChatBox(`${eP} You are not in a vehicle.`)}
        else{
            if(player.vehicle.vehId > 0 && player.vehicle.charId == player.charId){
                let getId = findPlayer(id)
                if (getId != null) {
                    if (getId.saleData == null || getId.saleData == undefined && getId.dist(player.position) <= dN){
                        if (!price.isNaN() && price > -1){
                            player.outputChatBox(`${sP} You have offered ${getId.name} your ${player.vehicle.model} for $${price}. Use /vcancel to cancel.`)
                            getId.outputChatBox(`${sP} ${player.name} has offered you their ${player.vehicle.model} for $${price}. Use /vaccept [bank/cash], or /vcancel to cancel.`)
                            data = {owner: player.charId, buyer: getId.charId, price: price, vehicle: player.vehicle.vehId}
                            player.saleData = data
                            getId.saleData = data
                        }
                        else{player.outputChatBox(`${eP} That is an invalid price.`)}
                    }
                    else{player.outputChatBox(`${eP} You can not sell to that player.`)}
                }
                else { player.outputChatBox(sNotFound) }
            }
            else{player.outputChatBox(`${eP} You can not sell this vehicle.`)}
        }
    }
    else{player.outputChatBox(`${eP} You have a pending transaction already. Use /vcancel to cancel.`)}
})

mp.events.addCommand('vaccept', (player, method) => {
    if (player.saleData != null && player.saleData != undefined){
        let owner = undefined
        mp.players.forEach((_player) => {if (_player.charId == data.owner.charId){owner = _player}})
        if (owner == undefined){
            player.outputChatBox(`${eP} The owner of the vehicle could not be found.`)
            mp.events.call('server:vcancel', player)
        }
        else{
            if (method.toLowerCase() == "bank"){
                if (player.bank >= player.saleData.price){
                    mp.events.call("server:changeMoney", player, "bank", "-", player.saleData.price, `Bought ${player.saleData.vehicle} from ${player.saleData.owner}`)
                    mp.events.call("server:changeMoney", owner, "bank", "+", player.saleData.price, `Sold ${player.saleData.vehicle} to ${player.charId}`)
                    mp.events.add('server:changeCarOwner', player.saleData.vehicle, player.charId)
                    player.saleData = undefined
                    owner.saleData = undefined
                }
            }
            else if (method.toLowerCase() == "cash"){
                if (player.cash >= player.saleData.price){
                    mp.events.call("server:changeMoney", player, "cash", "-", player.saleData.price, `Bought ${player.saleData.vehicle} from ${player.saleData.owner}`)
                    mp.events.call("server:changeMoney", owner, "cash", "+", player.saleData.price, `Sold ${player.saleData.vehicle} to ${player.charId}`)
                    mp.events.add('server:changeCarOwner', player.saleData.vehicle, player.charId)
                    player.saleData = undefined
                    owner.saleData = undefined
                }

            }
            else if (method.toLowerCase() == "bank/cash" || method.toLowerCase() == "[bank/cash]"){
                player.outputChatBox(`You got me there, bucko. PM the server owner for a free prize.`) // lol, there is no prize.
            }
            else{player.outputChatBox(`${uP} /vaccept [bank/cash]`)}
        }
    }
    else{player.outputChatBox(`${sP} You do not have a vehicle sale pending.`)}
})

mp.events.addCommand('vcancel', (player) => {
    mp.events.call('server:vcancel', player)
})

mp.events.addCommand('server:vcancel', (player) => {
    if (player.saleData != null && player.saleData != undefined){
        data = player.saleData
        if (!data.owner.charId.isNaN()){
            mp.players.forEach((_player) => {
                if (_player.charId == data.owner.charId){
                    _player.saleData = undefined
                    _player.outputChatBox(`${sP} Your vehicle sale has been cancelled.`)
                }
            })
        }
        if (!data.buyer.charId.isNaN()){
            mp.players.forEach((_player) => {
                if (_player.charId == data.buyer.charId){
                    _player.saleData = undefined
                    _player.outputChatBox(`${sP} Your vehicle sale has been cancelled.`)
                }
            })
        }
    }
})

mp.events.addCommand('vsale', (player, price) => {
    if (player.vehicle == null || player.vehicle == undefined){player.outputChatBox(`${eP} You are not in a vehicle.`)}
    else{
        if (player.vehicle.saleData != undefined && player.vehicle.saleData != null){
            if(player.vehicle.vehId > 0 && player.vehicle.charId == player.charId){
                player.vehicle.saleData = {owner: player.charId, price: price, vehicle: player.vehicle.vehId}
                player.vehicle.setVariable('vstring', `FOR SALE: $${price} (( Use /vbuy ${player.vehicle.vehId} ))`)
                player.outputChatBox(`${sP} Your vehicle is now for sale. You can use /vend to stop the sale.`)
            }
            else{player.outputChatBox(`${eP} You can not sell this vehicle.`)}
        }
        else{
            player.outputChatBox(`${eP} This vehicle is already for sale. Use /vend to stop the sale.`)
        }
    }
})

mp.events.addCommand('vend', (player) => {
    if (player.vehicle == null || player.vehicle == undefined){player.outputChatBox(`${eP} You are not in a vehicle.`)}
    else{
        if (player.vehicle.saleData != undefined && player.vehicle.saleData != null){
            player.vehicle.saleData = undefined
            player.vehicle.setVariable('vstring', undefined)
            player.outputChatBox(`${sP} Your vehicle is no longer for sale.`)
        }
        else{player.outputChatBox(`${eP} This vehicle has no pending sale.`)}
    }
})

mp.events.addCommand('vbuy', (player, fullText, vehId, option="cash") => {
    if (vehId.isNaN() || option.toLowerCase() != "cash" && option.toLowerCase() != "bank"){
        player.outputChatBox(`${uP} /vbuy [vehId] [cash/bank]`)
    }
    else{
        vehicle = undefined
        mp.vehicles.forEach(veh => {
            if (veh.vehId == vehId){
                vehicle = veh
            }
        })
        if (vehicle == undefined){player.outputChatBox(`${sP} That vehicle was not found.`)}
        else if (vehicle.saleData == undefined || vehicle.saleData == null){player.outputChatBox(`${sP} That vehicle is not for sale.`)}
        else{
            if (option.toLowerCase() == "cash"){
                if (vehicle.saleData.price <= player.cash){
                    mp.events.call("server:changeMoney", player, "cash", "-", vehicle.saleData.price, `Bought ${vehId} from ${vehicle.saleData.owner}`)
                    mp.events.call("server:oChangeMoney", vehicle.saleData.owner, "cash", "+", vehicle.saleData.price, `Sold ${vehId} to ${player.charId}`)
                    mp.events.add('server:changeCarOwner', vehicle.vehId, player.charId)
                }
            }
            if (option.toLowerCase() == "bank"){
                if (vehicle.saleData.price <= player.bank){
                    mp.events.call("server:changeMoney", player, "bank", "-", vehicle.saleData.price, `Bought ${vehId} from ${vehicle.saleData.owner}`)
                    mp.events.call("server:oChangeMoney", vehicle.saleData.owner, "bank", "+", vehicle.saleData.price, `Sold ${vehId} to ${player.charId}`)
                    mp.events.add('server:changeCarOwner', vehicle.vehId, player.charId)
                }
            }
        }

    }
})

mp.events.addCommand('mod', player => {
    player.call('client:modMenu')
})

var modprices = [{name: "spoilers", price: 500}, {name: "front bumper", price: 1000}] 

mp.events.add('server:buyMod', async (player, name, index, choice=-1, method="Cash") => {
    //player.outputChatBox(`We got ${name} and ${index} and ${choice} and ${method}`)
    // Most of this event is code from an older project. It could be done better, but it's functional. 
    let namecheck = name.toLowerCase()
    let modprice = 250
    if (choice == undefined || choice == null){choice = -1}
    if (method == undefined || method == null){method = "Cash"}
    if (namecheck != "engine" && namecheck != "transmission" && namecheck != "brakes" && namecheck != "suspension"){ // Static price if it's not engine/trans/brakes/susp
        modprices.forEach(obj => {
            if (obj.name.toLowerCase() == namecheck){
                modprice = obj.price
            }
        })
    }
    else{
        switch(namecheck){ // Right now this is like this, in future engine, trans, brakes, susp should all have diff prices, but also according to diff level
            case "engine": // if it's gonna be static difference we can +- from base price, let's consider changing this later 
                if (parseInt(choice) == -1){modprice = 200}
                if (parseInt(choice) == 0){modprice = 400}
                if (parseInt(choice) == 1){modprice = 600}
                if (parseInt(choice) == 2){modprice = 800}
                if (parseInt(choice) == 3){modprice = 1000}
                break;
            case "transmission":
                if (parseInt(choice) == -1){modprice = 200}
                if (parseInt(choice) == 0){modprice = 400}
                if (parseInt(choice) == 1){modprice = 600}
                if (parseInt(choice) == 2){modprice = 800}
                if (parseInt(choice) == 3){modprice = 1000}
                break;
            case "brakes":
                if (parseInt(choice) == -1){modprice = 200}
                if (parseInt(choice) == 0){modprice = 400}
                if (parseInt(choice) == 1){modprice = 600}
                if (parseInt(choice) == 2){modprice = 800}
                if (parseInt(choice) == 3){modprice = 1000}
                break;
            case "suspension":
                if (parseInt(choice) == -1){modprice = 200}
                if (parseInt(choice) == 0){modprice = 400}
                if (parseInt(choice) == 1){modprice = 600}
                if (parseInt(choice) == 2){modprice = 800}
                if (parseInt(choice) == 3){modprice = 1000}
                break;
        }
    } // 
    if (player.vehicle != undefined && player.vehicle != null && player.vehicle.owner == player.charId && !isNaN(player.vehicle.vehId)){
        if (method.toLowerCase() == "cash"){
            if (player.cash >= modprice){
                mp.events.call("server:changeMoney", player, "cash", "-", modprice, `Bought mods for veh ${player.vehicle.vehId}`)
                player.vehicle.setMod(parseInt(index), choice) // add the mod
                // access mod json
                if (player.vehicle.modObj.hasOwnProperty(index)){ // if it's already there get rid of it
                    delete player.vehicle.modObj.index
                }
                player.vehicle.modObj[index] = choice // then add it
                const [car] = await mp.db.query('UPDATE `vehicles` SET `mods` = ?', [JSON.stringify(player.vehicle.modObj)])
                // if ([car].affectedRows === 1) player.outputChatBox(`${name} purchased for $${modprice}. Enjoy!`);
                // else{player.outputChatBox(`${eP} Oopsies! Please report this error to an admin. You purchased a ${name} for $${modprice} but did not receive it.`)} 
                player.outputChatBox(`${name} purchased for $${modprice}. Enjoy!`);
            }
            else{player.outputChatBox(`${sAfford}`)}
        }
        if (method.toLowerCase() == "bank"){
            if (player.bank >= modprice){
                mp.events.call("server:changeMoney", player, "bank", "-", modprice, `Bought mods for veh ${player.vehicle.vehId}`)
                player.vehicle.setMod(parseInt(index), choice) // add the mod
                // access mod json
                if (player.vehicle.modObj.hasOwnProperty(index)){ // if it's already there get rid of it
                    delete player.vehicle.modObj.index
                }
                player.vehicle.modObj[index] = choice // then add it
                const [car] = await mp.db.query('UPDATE `vehicles` SET `mods` = ?', [JSON.stringify(player.vehicle.modObj)])
                // if ([car].affectedRows === 1) player.outputChatBox(`${name} purchased for $${modprice}. Enjoy!`);
                // else{player.outputChatBox(`${eP} Oopsies! Please report this error to an admin. You purchased a ${name} for $${modprice} but did not receive it.`)} 
                player.outputChatBox(`${name} purchased for $${modprice}. Enjoy!`);
            }
            else{player.outputChatBox(`${sAfford}`)}
        }
    }
    else{player.outputChatBox(sPerm)}
})