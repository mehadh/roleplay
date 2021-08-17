var loginBrowser, loginCam;

mp.events.add('client:loginData', (username, password) => {
    mp.events.callRemote("server:loginAccount", username, password);
})

mp.events.add('client:registerData', (username, email, password) => {
    mp.events.callRemote("server:registerAccount", username, email, password);
})

mp.events.add('client:loginHandler', (handle) => {
    switch (handle) {
        case 'success':
        case 'registered':
            loginBrowser.destroy();
            //mp.events.call('client:hideLoginScreen'); // Instead of this, we'll go over to the character menu. 
            //mp.events.callRemote('server:characterMenu'); // Let's call this on serverside instead?
            break;
        default:
            loginBrowser.call('b.throwError', handle);
            break;
    }
})

mp.events.add('client:showLoginScreen', () => {
    loginBrowser = mp.browsers.new('package://cef/login/index.html');
    mp.players.local.freezePosition(true);
    mp.game.ui.setMinimapVisible(true);
    setTimeout(() => {
        mp.gui.chat.activate(false);
        mp.gui.chat.show(false);
    }, 500)
    setTimeout(() => { mp.gui.cursor.show(true, true); }, 500);
    mp.game.ui.displayRadar(false);
    mp.events.call('client:enableLoginCamera');
});

mp.events.add('client:hideLoginScreen', () => {
    //loginBrowser.destroy(); // We're moving this to the loginHandler so we can add the character menu.
    mp.players.local.freezePosition(false);
    mp.game.ui.setMinimapVisible(false);
    mp.gui.chat.activate(true);
    mp.gui.chat.show(true);
    mp.gui.cursor.show(false, false);
    mp.game.ui.displayRadar(true);
    mp.events.call("client:disableLoginCamera");
});

mp.events.add('client:enableLoginCamera', () => {
    loginCam = mp.cameras.new('default', new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0), 40);
    mp.players.local.position = new mp.Vector3(-1411.260498046875, -687.9657592773438, 125.98267364501953);
    mp.players.local.freezePosition(true);

    loginCam.setActive(true);
    loginCam.setCoord(-1411.260498046875, -687.9657592773438, 105.98267364501953);
    loginCam.pointAtCoord(-1835, -1224, 16);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
});

mp.events.add('client:disableLoginCamera', () => {
    loginCam.destroy();
    mp.game.cam.renderScriptCams(false, false, 0, false, false);
    mp.players.local.freezePosition(false);
});

mp.events.add('client:showChat', () => {
    mp.gui.chat.activate(true);
    mp.gui.chat.show(true);
})