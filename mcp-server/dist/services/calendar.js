const TOKEN_FILE = ".claude-delegate-token";
async function readTokenFile() {
    const fs = await import("fs/promises");
    const path = await import("path");
    // Look for token file in project root
    const tokenPath = path.resolve(process.cwd(), TOKEN_FILE);
    try {
        const data = await fs.readFile(tokenPath, "utf-8");
        return JSON.parse(data);
    }
    catch {
        return null;
    }
}
async function writeTokenFile(data) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const tokenPath = path.resolve(process.cwd(), TOKEN_FILE);
    await fs.writeFile(tokenPath, JSON.stringify(data, null, 2));
}
async function getAccessToken() {
    const tokenData = await readTokenFile();
    if (!tokenData?.refreshToken) {
        throw new Error("No Google Calendar credentials found. Please sign in to the web app first (http://localhost:3000) to connect your Google Calendar.");
    }
    // Return cached access token if still valid (with 60s buffer)
    if (tokenData.accessToken && tokenData.expiresAt && Date.now() < (tokenData.expiresAt - 60) * 1000) {
        return tokenData.accessToken;
    }
    // Refresh the access token
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in the MCP server environment.");
    }
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokenData.refreshToken,
            grant_type: "refresh_token",
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to refresh Google access token: ${error}. You may need to re-authenticate at http://localhost:3000.`);
    }
    const data = await response.json();
    // Cache the new access token
    await writeTokenFile({
        ...tokenData,
        accessToken: data.access_token,
        expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    });
    return data.access_token;
}
export async function listMeetings(days = 7) {
    const accessToken = await getAccessToken();
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + days);
    const params = new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
    });
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Google Calendar API error (${response.status}): ${error}`);
    }
    const data = await response.json();
    return (data.items || [])
        .filter((event) => event.start?.dateTime) // Skip all-day events
        .map((event) => {
        const meetingUrl = extractMeetingUrl(event);
        const start = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationMin = Math.round((endTime.getTime() - start.getTime()) / 60000);
        const duration = durationMin >= 60
            ? `${Math.floor(durationMin / 60)} hr${durationMin % 60 ? ` ${durationMin % 60} min` : ""}`
            : `${durationMin} min`;
        return {
            id: event.id,
            title: event.summary || "Untitled",
            start: event.start.dateTime,
            end: event.end.dateTime,
            duration,
            attendees: (event.attendees || []).map((a) => a.email),
            meetingUrl,
            platform: meetingUrl
                ? meetingUrl.includes("zoom")
                    ? "zoom"
                    : "google_meet"
                : "unknown",
            hasAgent: false,
        };
    });
}
function extractMeetingUrl(event) {
    if (event.hangoutLink) {
        return event.hangoutLink;
    }
    if (event.conferenceData?.entryPoints) {
        const videoEntry = event.conferenceData.entryPoints.find((e) => e.entryPointType === "video");
        if (videoEntry)
            return videoEntry.uri;
    }
    const text = `${event.description || ""} ${event.location || ""}`;
    const zoomMatch = text.match(/https:\/\/[\w.-]*zoom\.us\/j\/\d+[^\s)"]*/);
    if (zoomMatch)
        return zoomMatch[0];
    const meetMatch = text.match(/https:\/\/meet\.google\.com\/[a-z-]+/);
    if (meetMatch)
        return meetMatch[0];
    return null;
}
export async function getMeetingById(meetingId) {
    const meetings = await listMeetings();
    return meetings.find((m) => m.id === meetingId) ?? null;
}
