const NativeUI = require("nativeui");

const Menu = NativeUI.Menu;
const UIMenuItem = NativeUI.UIMenuItem;
const UIMenuListItem = NativeUI.UIMenuListItem;
const UIMenuCheckboxItem = NativeUI.UIMenuCheckboxItem;
const BadgeStyle = NativeUI.BadgeStyle;
const Point = NativeUI.Point;
const ItemsCollection = NativeUI.ItemsCollection;
const Color = NativeUI.Color;

const localPlayer = mp.players.local;
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

mp.events.add("client:modMenu", (player) => { // This could be done easier for sure, but I have this old code and it works, so we'll use it here
    var garage = new Menu(`Vehicle Modifications`, "", new Point(posX, posY));
    let vehicle = localPlayer.vehicle
if (vehicle != undefined && vehicle != null){
    vehicle.freezePosition(true)
    if (vehicle.getNumMods(0) > 0){garage.AddItem(new UIMenuItem("Spoilers", "0"))}
    if (vehicle.getNumMods(1) > 0){garage.AddItem(new UIMenuItem("Front Bumper", "1"))}
    if (vehicle.getNumMods(2) > 0){garage.AddItem(new UIMenuItem("Rear Bumper", "2"))}
    if (vehicle.getNumMods(3) > 0){garage.AddItem(new UIMenuItem("Side Skirt", "3"))}
    if (vehicle.getNumMods(4) > 0){garage.AddItem(new UIMenuItem("Exhaust", "4"))}
    if (vehicle.getNumMods(5) > 0){garage.AddItem(new UIMenuItem("Frame", "5"))}
    if (vehicle.getNumMods(6) > 0){garage.AddItem(new UIMenuItem("Grille", "6"))}
    if (vehicle.getNumMods(7) > 0){garage.AddItem(new UIMenuItem("Hood", "7"))}
    if (vehicle.getNumMods(8) > 0){garage.AddItem(new UIMenuItem("Fender", "8"))}
    if (vehicle.getNumMods(9) > 0){garage.AddItem(new UIMenuItem("Right Fender", "9"))}
    if (vehicle.getNumMods(10) > 0){garage.AddItem(new UIMenuItem("Roof", "10"))}
    if (vehicle.getNumMods(11) > 0){garage.AddItem(new UIMenuItem("Engine", "11"))}
    if (vehicle.getNumMods(12) > 0){garage.AddItem(new UIMenuItem("Brakes", "12"))}
    if (vehicle.getNumMods(13) > 0){garage.AddItem(new UIMenuItem("Transmission", "13"))}
    if (vehicle.getNumMods(14) > 0){garage.AddItem(new UIMenuItem("Horns", "14"))}
    if (vehicle.getNumMods(15) > 0){garage.AddItem(new UIMenuItem("Suspension", "15"))}
    // skipping armor 16
    //if (vehicle.getNumMods(18) > 0){
    garage.AddItem(new UIMenuItem("Turbo", "18"))
    //}
    //if (vehicle.getNumMods(22) > 0){
    garage.AddItem(new UIMenuItem("Xenon", "22"))
    //}
    if (vehicle.getNumMods(23) > 0){garage.AddItem(new UIMenuItem("Front Wheels", "23"))}
    // skipping util shadow silver 20
    if (vehicle.getNumMods(24) > 0){garage.AddItem(new UIMenuItem("Back Wheels", "24"))} // only for motorcycle
    if (vehicle.getNumMods(25) > 0){garage.AddItem(new UIMenuItem("Plate Holders", "25"))}
    if (vehicle.getNumMods(27) > 0){garage.AddItem(new UIMenuItem("Trim Design", "27"))}
    if (vehicle.getNumMods(28) > 0){garage.AddItem(new UIMenuItem("Ornaments", "28"))}
    if (vehicle.getNumMods(30) > 0){garage.AddItem(new UIMenuItem("Dial Design", "30"))}
    if (vehicle.getNumMods(33) > 0){garage.AddItem(new UIMenuItem("Steering Wheel", "33"))}
    if (vehicle.getNumMods(34) > 0){garage.AddItem(new UIMenuItem("Shift Lever", "34"))}
    if (vehicle.getNumMods(35) > 0){garage.AddItem(new UIMenuItem("Plaques", "35"))}
    if (vehicle.getNumMods(38) > 0){garage.AddItem(new UIMenuItem("Hydraulics", "38"))}
    //if (vehicle.getNumMods(40) > 0){garage.AddItem(new UIMenuItem("Boost", "40"))}
    if (vehicle.getNumMods(55) > 0){garage.AddItem(new UIMenuItem("Window Tint", "55"))}
    if (vehicle.getNumMods(48) > 0){garage.AddItem(new UIMenuItem("Livery", "48"))}
    //if (vehicle.getNumMods(62) > 0){garage.AddItem(new UIMenuItem("Plate", "53"))} // change from 62 to 53
    if (vehicle.getNumMods(66) > 0){garage.AddItem(new UIMenuItem("Primary Color", "66"))}
    if (vehicle.getNumMods(67) > 0){garage.AddItem(new UIMenuItem("Secondary Color", "67"))}
    // other benny
    if (vehicle.getNumMods(26) > 0){garage.AddItem(new UIMenuItem("Vanity Plate", "26"))}
    if (vehicle.getNumMods(29) > 0){garage.AddItem(new UIMenuItem("Dashboard", "29"))}
    if (vehicle.getNumMods(31) > 0){garage.AddItem(new UIMenuItem("Door Speaker", "31"))}
    if (vehicle.getNumMods(32) > 0){garage.AddItem(new UIMenuItem("Seats", "32"))}
    if (vehicle.getNumMods(36) > 0){garage.AddItem(new UIMenuItem("Speakers", "36"))}
    if (vehicle.getNumMods(37) > 0){garage.AddItem(new UIMenuItem("Trunk", "37"))}
    if (vehicle.getNumMods(39) > 0){garage.AddItem(new UIMenuItem("Engine Block", "39"))}
    if (vehicle.getNumMods(41) > 0){garage.AddItem(new UIMenuItem("Struts", "41"))}
    if (vehicle.getNumMods(42) > 0){garage.AddItem(new UIMenuItem("Arch Cover", "42"))}
    if (vehicle.getNumMods(43) > 0){garage.AddItem(new UIMenuItem("Aerials", "43"))}
    if (vehicle.getNumMods(44) > 0){garage.AddItem(new UIMenuItem("Trim part 2", "44"))}
    if (vehicle.getNumMods(45) > 0){garage.AddItem(new UIMenuItem("Tank", "45"))}
    if (vehicle.getNumMods(46) > 0){garage.AddItem(new UIMenuItem("Windows", "46"))}
}
    garage.MenuClose.on(() => {
        if (vehicle != undefined && vehicle != null){
            vehicle.freezePosition(false)}
    });
    garage.ItemSelect.on((item, index) => {
        garage.Close();
if (vehicle != undefined && vehicle != null){
    vehicle.freezePosition(true)
        var modname = item.Text
        var modidx = item.Description
        let selection; 
        let method;
        var modder = new Menu(`Vehicle Modifications`, "", new Point(posX, posY));
        let oldmod = vehicle.getMod(parseInt(modidx))
        var selections = []
        if (modidx != 18 && modidx != 22){
        for (let i = -1; i < vehicle.getNumMods(parseInt(modidx)); i++){
            selections.push(i.toString())
        }
        modder.AddItem(new UIMenuListItem(`${modname}`, "", new ItemsCollection(selections)))
        }
        else{
            selections.push("-1")
            selections.push("0")
            modder.AddItem(new UIMenuListItem(`${modname}`, "", new ItemsCollection(selections)))
        }
        modder.AddItem(new UIMenuListItem(
            "Purchase",
            "Confirm Purchase",
            new ItemsCollection(["Cash", "Bank"])
        ));        
        // modder.AddItem(new UIMenuItem("Purchase", "Confirm Purchase"));
        modder.ListChange.on((item2, listIndex) => {
            if (item2.Text == "Purchase"){
                method = item2.SelectedValue
            }
            else{
                let numero = parseInt(item2.SelectedValue)
                vehicle.setMod(parseInt(modidx), numero)
                selection = numero
            }
        });
        modder.ItemSelect.on((item3, index3) => {
            if (item3.Text == "Purchase"){
            let player = localPlayer
            mp.events.callRemote("server:buyMod", modname, modidx, selection, method)
            modder.Close()
            }
        });
        modder.MenuClose.on(() => {
            let player = localPlayer
            if (vehicle != undefined && vehicle != null){
                vehicle.freezePosition(false)
            if (oldmod != undefined && oldmod != null){
                vehicle.setMod(parseInt(modidx), oldmod)   
            }
            mp.events.call("client:modMenu")}
        });
    }
    });
})