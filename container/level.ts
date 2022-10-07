import { LevelManager } from "./levelManager";

export type level = {
    guild_id: string;
    user_id: string;
    messages: number;
    level: number;
    total: number;
};