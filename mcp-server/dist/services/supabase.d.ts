export interface User {
    id: string;
    googleId: string;
    email: string;
    name: string;
    voiceCloneId: string | null;
    avatarId: string | null;
    onboardingCompleted: boolean;
    connectors: {
        calendar: boolean;
        github: boolean;
        slack: boolean;
    };
}
export interface AgentSession {
    id: string;
    userId: string;
    meetingId: string;
    meetingTitle: string;
    recallBotId: string;
    status: "pending" | "joining" | "active" | "completed" | "failed";
}
export declare function getUser(): Promise<User | null>;
export declare function getOnboardingStatus(): Promise<{
    completed: boolean;
    steps: Record<string, boolean>;
}>;
export declare function createAgentSession(session: Omit<AgentSession, "id">): Promise<AgentSession>;
export declare function getAgentSessions(): Promise<AgentSession[]>;
