/**
 * Proxy client — all API calls go through the hosted proxy API.
 * No secrets needed in the plugin.
 */
/**
 * Save identity to .mcp.json env vars so the MCP server can read them
 * without file I/O (avoids sandbox issues).
 */
export declare function saveIdentity(identity: {
    email: string;
    name: string;
}): Promise<void>;
export interface DispatchResult {
    botId: string;
    status: string;
    sessionId: string;
    roomName: string;
}
export declare function dispatchAgent(args: {
    meetingUrl: string;
    meetingTitle: string;
    meetingId: string;
    botName: string;
    userId: string;
    context?: string;
}): Promise<DispatchResult>;
export interface OnboardingStatus {
    completed: boolean;
    user?: {
        id: string;
        name: string;
        email: string;
        onboardingCompleted: boolean;
    };
    steps: Record<string, boolean>;
}
export declare function getOnboardingStatus(): Promise<OnboardingStatus>;
export declare function getAppUrl(): string;
