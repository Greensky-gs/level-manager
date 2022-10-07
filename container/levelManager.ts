import { Client } from "discord.js";
import { config } from "dotenv";
import { createConnection } from 'mysql';
import type { level } from './level';
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
    public start() {
        this.fillCache();
    }
    private async fillCache() {
        this.cache = await query<level>(`SELECT * FROM levels`);
    }
    private async event() {
        this.client.on('messageCreate', ({ guild, author, channel, ...opts }) => {
            if (!guild || author.bot || opts.webhookId) return;

            const data = this.getData(guild.id, author.id);
        });
    }
    private getData(g: string, u: string): level | undefined {
        return this.cache.find(x => x.guild_id === g && x.user_id === u);
    }
    private setData(g: string, u: string, lvl: level): level {
        const data = this.getData(g, u);
        if (!data) {
            this.cache.push(lvl);
            return lvl;
        };

        const index = this.cache.indexOf(data);
        this.cache.splice(index, 1, lvl);
        return lvl;
    }
    private generateSQL(lvl: level, exists?: boolean): string {
        let sql = '';
    }
}