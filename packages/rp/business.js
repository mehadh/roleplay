let businesses = []

mp.events.add('server:initBiz', async () => {
    const [rows] = await mp.db.query('SELECT * FROM `business` WHERE `active` = ?', [true]);
    rows.forEach(business => {
        data = {
            bizId: business.bizId, 
            name: business.name, 
            bizType: business.bizType, 
            position: new mp.Vector3(JSON.parse(business.position)), 
            hasInt: business.hasInt, 
            intData: business.intData, 
            stockType: business.stockType, 
            stock: business.stock,
            blip: mp.blips.new(605, new mp.Vector3(JSON.parse(business.position)), {name: this.name, color: 69, shortRange: true})
        }
        console.log(data.position.x, data.position.y, data.position.z)
        data.colShape = mp.colshapes.newSphere(parseFloat(data.position.x), parseFloat(data.position.y), parseFloat(data.position.z), parseFloat(500))
        businesses.push(data)

    });
})

mp.events.add('playerEnterColShape', (player, shape) => {
    console.log("yes")
})