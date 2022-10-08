## Documentation
Here is the documentation of the level Manager by Greensky

## Creation
First you need to create a client and to initilise the manager on the client

#### JavaScript
```js
const { Client, GatewayIntentBits } = require('discord.js');
const { LevelManager } = require('./levelManager.ts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.levelManager = new levelManager(client);
client.levelManager.start();
```

#### TypeScript
```ts
import { Client, GatewayIntentBits } from 'discord.js';
import { LevelManager } from './levelManager.ts';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.levelManager = new levelManager(client);
client.levelManager.start();
```

## Methods
Here is the list of manager's methods

### serverData()
```js
const data = message.client.levelManager(message.guild.id);
// Return an array of levels
```

This method returns all levels data from a server by its id

### start()
```js
client.levelManager.start();
```

It starts the manager.
Use it once

## Propreties
Here is the list of manager's propreties

### datas
It returns the cache with a special form :
```ts
Collection<string, Collection<string, level>>
```
Concretely it's this :
```js
const serverID = 'a server ID';
const userID = 'an user ID';

const guild = client.levelManager.datas.get(serverID);
// This is a collection of levels

const user = guild.get(userID);
// This is a level data
```

## Handle levelUp
Maybe you've noticed this little thing at the bottom of the manager

```ts
declare module 'discord.js' {
    interface ClientEvents {
        levelUp: [message: Message<boolean>, level: level]
    }
};
```

This is a module declaration that allows you to handle level up.
When a member got a level up, an event is emitted on the client.

This event is called `levelUp` and has 2 arguments :
1. `message` : this is the last message he sent and made him level up
2. `level` : This is the [level data](#level-form), updated, with it's actual level, actual amount of messages and actual message goal

### Example
```js
client.on('levelUp', (message, level) => {
    message.channel.send(`🎉 Congrats ${message.author}! You're now level ${level.level}!`);
});
```

## Upgrader
Did you know that the upgrader is customizable ?
The upgrader is a function that calculates the new message goal when a user levels up

```ts
private upgrader(n: number): number {
    return Math.floor(n * 135 / 100) + 25;
}
```

As you can see, by default I made it `new = (35% of old) + 25`
You can customise it as you want by modifiying the return.

## Level form
The main form is the "level form"
These form has all level data of an user, it's an object that look like this :
```ts
{
    guild_id: string;
    user_id: string;
    messages: number;
    level: number;
    total: number;
    objectif: number;
}
```

## Thanks
Thanks for using the level Manager by Greensky
Come on the [support server](https://discord.gg/fHyN5w84g6), we'll give you a cookie 🍪