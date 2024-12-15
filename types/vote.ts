import type { Motion } from './motion';

export type Vote = {
    id: number;
    deputy_id: number;
    motion_id: number;
    vote: number
    date: string;
    motion: Motion;
}