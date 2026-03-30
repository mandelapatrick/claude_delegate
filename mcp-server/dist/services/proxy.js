/**
 * Proxy client — all API calls go through the hosted proxy API.
 * No secrets needed in the plugin.
 */
const PROXY_URL = process.env.PROXY_URL || "https://meeting-agent-h4ny.onrender.com";
/**
 * Read identity from env vars (set in .mcp.json by onboarding).
 * Falls back to legacy file locations for backward compat.
 */
async function readIdentity() {
    // Primary: env vars injected into .mcp.json (always works in sandbox)
    if (process.env.DELEGATE_EMAIL) {
        return {
            email: process.env.DELEGATE_EMAIL,
            name: process.env.DELEGATE_NAME,
        };
    }
    // Legacy fallback: read from file
    const fs = await import("fs/promises");
    const os = await import("os");
    const path = await import("path");
    const locations = [
        path.join(os.homedir(), ".claude-delegate", "identity.json"),
        path.resolve(process.cwd(), ".claude-delegate", "identity.json"),
        path.resolve(process.cwd(), ".claude-delegate-token"),
    ];
    for (const loc of locations) {
        try {
            const data = await fs.readFile(loc, "utf-8");
            return JSON.parse(data);
        }
        catch { }
    }
    return null;
}
/**
 * Save identity to .mcp.json env vars so the MCP server can read them
 * without file I/O (avoids sandbox issues).
 */
export async function saveIdentity(identity) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    // Always save to ~/.claude-delegate/identity.json (works in both plugin and standalone)
    const identityDir = path.join(os.homedir(), ".claude-delegate");
    const identityPath = path.join(identityDir, "identity.json");
    try {
        await fs.mkdir(identityDir, { recursive: true });
        await fs.writeFile(identityPath, JSON.stringify(identity, null, 2) + "\n");
    }
    catch (e) {
        console.error("[saveIdentity] Failed to write identity file:", e);
    }
    // Also update .mcp.json env vars when running standalone (not as plugin)
    if (!process.env.CLAUDE_PLUGIN_ROOT) {
        const mcpPath = path.resolve(process.cwd(), ".mcp.json");
        let config;
        try {
            config = JSON.parse(await fs.readFile(mcpPath, "utf-8"));
        }
        catch {
            config = { mcpServers: {} };
        }
        const server = config.mcpServers?.["meeting-agent"] ||
            config.mcpServers?.["claude-delegate"];
        if (server) {
            server.env = {
                ...server.env,
                DELEGATE_EMAIL: identity.email,
                DELEGATE_NAME: identity.name,
            };
            delete server.env.DELEGATE_GOOGLE_ID;
            await fs.writeFile(mcpPath, JSON.stringify(config, null, 2) + "\n");
        }
    }
}
export async function dispatchAgent(args) {
    const response = await fetch(`${PROXY_URL}/api/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to dispatch agent: ${error}`);
    }
    return response.json();
}
export async function getOnboardingStatus() {
    const tokenData = await readIdentity();
    if (!tokenData) {
        return {
            completed: false,
            steps: {
                profile: false,
                voiceClone: false,
                avatar: false,
                connectors: false,
                paraSetup: false,
            },
        };
    }
    const response = await fetch(`${PROXY_URL}/api/onboarding/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenData),
    });
    if (!response.ok) {
        throw new Error("Failed to get onboarding status");
    }
    return response.json();
}
export function getAppUrl() {
    return process.env.APP_URL || "https://meeetingagent.vercel.app";
}
