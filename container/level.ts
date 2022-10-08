import { Collection } from "discord.js";

export type level = {
    guild_id: string;
    user_id: string;
    messages: number;
    level: number;
    total: number;
    objectif: number;
};
export type CacheType = Collection<string, Collection<string, level>>