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
    if (player.vehicle) {
        if (player.vehicle.getVariable('Engine') != false && player.vehicle.getVariable('Engine') != true) { player.vehicle.setVariable('Engine', false) }
        player.vehicle.setVariable('Engine', !player.vehicle.getVariable('Engine'))
        player.vehicle.engine = player.vehicle.getVariable('Engine')
    }
})