import { Client, Collection } from "discord.js";
import { config } from "dotenv";
import { createConnection } from 'mysql';
import type { CacheType, level } from './level';
import { query } from './query';

config();
export const database = createConnection({
    host: process.env.DATABASE_H, // Database host
    database: process.env.DATABASE_D, // Database name
    user: process.env.DATABASE_U, // Database user
    password: process.env.DATABASE_P // Password
});

database.connect((error: string) => {
    if (error) throw error;
});

export class LevelManager {
    readonly client: Client;
    private cache: level[] = [];

    constructor(client: Client) {
        this.client = client;
    }
    get datas(): CacheType {
        const value: CacheType = new Collection();

        this.cache.forEach((lvl) => {
            if (!value.has(lvl.guild_id)) {
                value.set(lvl.guild_id, new Collection());
            };

            value.get(lvl.guild_id)?.set(lvl.user_id, lvl);
        });

        return value;
    }
    public serverData(g: string): level[] {
        return this.cache.filter(x => x.guild_id === g);
    }
    public start() {
        this.fillCache();
        this.event();
    }
    private async fillCache() {
        this.cache = await query<level>(`SELECT * FROM levels`);
    }
    private async event() {
        this.client.on('messageCreate', (message) => {
            if (!message.guild || message.author.bot || message.webhookId) return;

            let data = this.getData(message.guild.id, message.author.id) || this.generateDefaultData(message.guild.id, message.author.id);
            
            data.total++;
            data.messages++;

            if (data.messages === data.objectif) {
                data.level++;
                data.messages = 0;

                data.objectif = this.upgrader(data.objectif);

                this.client.emit('levelUp', message, data);
            };
            this.setData(message.guild.id, message.author.id, data);
        });
    }
    private getData(g: string, u: string): level | undefined {
        return this.cache.find(x => x.guild_id === g && x.user_id === u);
    }
    private setData(g: string, u: string, lvl: level): level {
        const data = this.getData(g, u);
        if (!data) {
            this.cache.push(lvl);
            query(this.generateSQL(lvl));
            return lvl;
        };

        const index = this.cache.indexOf(data);
        this.cache.splice(index, 1, lvl);

        query(this.generateSQL(lvl, true));
        return lvl;
    }
    private generateSQL(lvl: level, exists?: boolean): string {
        let sql = `INSERT INTO levels (guild_id, user_id, messages, level, total, objectif) VALUES
        ('${lvl.guild_id}', '${lvl.user_id}', '${lvl.messages}', '${lvl.level}', '${lvl.total}', '${lvl.objectif}')`;

        if (exists) sql = `UPDATE levels SET messages='${lvl.messages}', level='${lvl.level}', total='${lvl.total}', objectif='${lvl.objectif}' WHERE guild_id='${lvl.guild_id}' AND user_id='${lvl.user_id}'`;

        return sql;
    }
    private generateDefaultData(g: string, u: string): level {
        return {
            guild_id: g,
            user_id: u,
            messages: 0,
            total: 0,
            objectif: 100,
            level: 0
        };
    }
    private upgrader(n: number): number {
        // Increase message goal by 35% + 25 messages
        // For 100 : 160 messages is the new goal
        // For 160 : 241 is the new message goal
        
        return Math.floor(n * 135 / 100) + 25;
    }
}

declare module 'discord.js' {
    interface ClientEvents {
        levelUp: [message: Message<boolean>, level: level]
    }
};
