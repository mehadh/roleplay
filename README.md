# roleplay
#### This project is not complete, and as such, some features may not be completely functional at the moment!
A simple roleplay gamemode for RAGE:MP. This project uses Node.js, SQL, and the RAGE:MP API to create a gamemode in which players interact with each other while acting as a fictional character in a parallel universe. 

The server uses MrPancakers2's RAGE Accounts resource (https://github.com/RageMpOpenSource/RAGE-Accounts) for handling accounts and logins along with the initial database schema. 

Features:
- Admin system: synced with db. Functionality includes kicks, bans, teleporting, spectating, reports, newb channel,
- Character system: characters can be created, change between them, position is saved on logout. /mask functionality.
- Chat system: PMS, ooc chat, RP commands, coin & roll, whispers, car speech, all compatible with spectate.
- Money: Banking system is complete with bank locations, payday hourly, on hand and bank money. Deposit, withdraw, can transfer to users whether online or offline. Transfers saved in db.
- Vehicles: engine, lock, save position on park. Sell car to a specific player or put a sign on it to leave it for sale (Anyone can walk by and buy it even if you are offline!). Vehicle modding system complete.
