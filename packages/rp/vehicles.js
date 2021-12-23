// VEHICLE
// vehicle.owner == player.charId

// TODO: Dupkey systems, shared vehicle stuff 

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