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