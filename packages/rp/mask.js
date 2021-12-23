mp.events.addCommand('mask', player => {
    if (player.masked == true){
        player.masked == false
        player.name = `${player.fName} ${player.lName}`
        player.outputChatBox(`You've taken your mask off!`)
        // TODO: Removes mask object
    }
    else{
        // TODO: Does player have mask item?
        // TODO: Adds mask object
        player.masked = true
        player.name = `Stranger ${player.charId}`
        player.outputChatBox(`You've put your mask on!`)
    }
})