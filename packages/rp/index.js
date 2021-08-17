mp.events.add("playerJoin", player => { // This is so that the custom chat will load properly. Without it, the default RAGE:MP chat will be used. 
    setTimeout(function () {
        player.call("InitiateCustomChat");
    }, 1000);
})

require('./globals.js'); // Global functions
require('./chat.js'); // Chat commands. 
require('./character.js');
require('./admin.js');
require('./spectate.js');
require('./money.js')