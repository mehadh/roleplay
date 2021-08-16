require('./login.js');
require('/nativeui/index.js');

mp.events.add('playerReady', () => {
    mp.events.call('client:showLoginScreen');
});

require("/custom-chat/index.js")

require('./seats.js');
require('./character.js');

mp.events.add('render', () => {
    mp.game.player.restoreStamina(100);
});

require('./events.js');
require('./cam.js');