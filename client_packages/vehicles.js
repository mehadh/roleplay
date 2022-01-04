const NativeUI = require("nativeui");

const Menu = NativeUI.Menu;
const UIMenuItem = NativeUI.UIMenuItem;
const Point = NativeUI.Point;
let player = mp.players.local;
var posX = 1920 * 0.75;
var posY = 1080 * 0.3;
mp.game.vehicle.defaultEngineBehaviour = false;
mp.players.local.setConfigFlag(429, true);


mp.events.addDataHandler('Engine', function (entity, value, oldValue) {
    if (entity.type === 'vehicle') {
        entity.setEngineOn(value, true, true);
    }
});

mp.events.addDataHandler('SirenState', function (entity, value, oldValue) {
    if (entity.type === 'vehicle') {
        if (entity.getClass() === 18) entity.setSiren(value);
    }
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type === 'vehicle') {
        if (entity.getVariable("Engine") !== undefined) {
            entity.setEngineOn(entity.getVariable("Engine"), true, true);
        }

    }
});

mp.keys.bind(0x59, true, function () {
    mp.events.callRemote('server:engine');
});

mp.keys.bind(0x4C, true, function() {
    mp.events.callRemote('server:lock');
});


mp.events.add('client:vehMenu', (vehicles) => {
    let vehMenu = new Menu("Vehicles", "Select a vehicle!", new Point(posX, posY)); // Create the menu

    vehMenu.Visible = true; // Make it visible
    vehMenu.Open() // Open it
    mp.gui.cursor.show(false, false); // Hide the cursor
    vehicles.forEach(veh => { // List all the cars
        vehMenu.AddItem(new UIMenuItem(`${veh.model}`, `Press Enter to spawn this vehicle! ID: ${veh.vehId}`))
    })

    vehMenu.ItemSelect.on((item, index) => {
        vehMenu.Close()
        let vehId = item.Description.replace(/\D/g, "");
        mp.events.callRemote("server:spawnVeh", vehId)
    })
})