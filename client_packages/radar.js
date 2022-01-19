radarEnabled = false // to toggle this so it's not always on whenever you're aiming! we could also go about this by checking what wep is in player hand
                    //we should make radar wep or aim with tazer?


mp.events.add('client:radar', () => {
    radarEnabled = !radarEnabled
    mp.gui.chat.push(radarEnabled)
})

const player = mp.players.local

mp.events.add('render', () => {
    if (radarEnabled && player.isPlayerFreeAiming() == true){ // is he aiming?
        entity = player.getEntityIsFreeAimingAt() // who's he aiming at?
        if (entity != undefined && entity.type == 'vehicle'){ // is it a vehicle? 
            speed = entity.getSpeed(); // raw speed
            mph = speed*2.236936 // convert to mph
            mp.gui.chat.push(mph)
        }
    }
})