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
var charBrowser

mp.events.add('client:characterMenu', (characters) => {
    mp.gui.chat.activate(true); // show the chat
    mp.gui.chat.show(true);


    let characterMenu = new Menu("Characters", "Select a character!", new Point(posX, posY)); // Create the menu

    characterMenu.Visible = true; // Make it visible
    characterMenu.Open() // Open it

    mp.gui.cursor.show(false, false); // Hide the cursor
    //characters = [{ name: "Hardcoded String" }, { name: "Other Hardcoded String" }] // Hardcoded test
    characters.forEach(char => { // List all the characters
        characterMenu.AddItem(new UIMenuItem(`${char.first} ${char.last}`, `Press Enter to play as this character! ID: ${char.charId}`))
    })
    characterMenu.AddItem(new UIMenuItem('New Character', 'Press Enter to create a new character!')) // This will call the create character event!


    characterMenu.ItemSelect.on((item, index) => {
        characterMenu.Close() // Close the menu
        if (item.Text == "New Character") { // This means they pressed create a new character.
            mp.events.call("client:createCharacter")
        }
        else { // This means they want to play an existing character.
            let descId = item.Description.replace(/\D/g, "");
            mp.events.callRemote("server:selectCharacter", descId)
        }
    })
})

mp.events.add('client:createCharacter', () => {
    charBrowser = mp.browsers.new('package://cef/login/character.html');
    setTimeout(() => { mp.gui.cursor.show(true, true); }, 500);
})

mp.events.add('client:characterHandler', (handle) => {
    switch (handle) {
        case 'success':
        case 'close':
            charBrowser.destroy();
            mp.events.callRemote('server:characterMenu')
            // Here we should do something about what comes after creating a character. 
            break;
        default:
            charBrowser.call('b.throwError', handle);
            break;
    }
})

mp.events.add('client:attemptRegister', (first, last) => {
    mp.events.callRemote('server:attemptRegister', first, last)
})

mp.events.add('client:enableCharScreen', () => {
    mp.players.local.freezePosition(true);
    mp.game.ui.setMinimapVisible(true);
    mp.game.ui.displayRadar(false);
    mp.events.call('client:enableLoginCamera');
})

mp.events.add('client:spawnMenu', (list) => {
    let spawnMenu = new Menu("Spawn", "Select a spawn point!", new Point(posX, posY)); // Create the menu

    spawnMenu.Visible = true; // Make it visible
    spawnMenu.Open() // Open it
    mp.gui.cursor.show(false, false); // Hide the cursor

    list.forEach(location => { // List all the characters
        spawnMenu.AddItem(new UIMenuItem(`${location.name}`, `Press Enter to spawn here!`))
    })


    spawnMenu.ItemSelect.on((item, index) => {
        spawnMenu.Close() // Close the menu
        list.forEach(location => {
            if (location.name == item.Text) {
                player.position = location.position
                mp.events.callRemote('server:afterCharPos')
                mp.events.call('client:hideLoginScreen');
            }
        })
    })
})

mp.keys.bind(0x72, true, (player) => { // F3
    mp.gui.cursor.visible = !mp.gui.cursor.visible;
    if (mp.gui.cursor.visible) {
        // BOOL _SET_CURSOR_LOCATION(float x, float y);
        mp.game.invoke('0xFC695459D4D0E219', 0.5, 0.5);
    }
});