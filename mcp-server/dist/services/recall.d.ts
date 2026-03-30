export interface RecallBot {
    id: string;
    meetingUrl: string;
    botName: string;
    status: "joining" | "in_waiting_room" | "active" | "completed" | "failed";
}
export declare function createBot(meetingUrl: string, botName: string, agentUrl?: string, roomName?: string): Promise<RecallBot>;
export declare function getBotStatus(botId: string): Promise<RecallBot | null>;
