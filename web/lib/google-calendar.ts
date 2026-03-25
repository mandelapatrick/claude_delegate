export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: string[];
  meetingUrl: string | null;
  platform: "zoom" | "google_meet" | "unknown";
}

export async function getUpcomingMeetings(
  accessToken: string
): Promise<CalendarEvent[]> {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: weekEnd.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Calendar API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.items || [])
    .filter((event: any) => event.start?.dateTime) // Skip all-day events
    .map((event: any) => {
      const meetingUrl = extractMeetingUrl(event);
      return {
        id: event.id,
        title: event.summary || "Untitled",
        start: event.start.dateTime,
        end: event.end.dateTime,
        attendees: (event.attendees || []).map(
          (a: any) => a.email
        ),
        meetingUrl,
        platform: meetingUrl
          ? meetingUrl.includes("zoom")
            ? "zoom"
            : "google_meet"
          : "unknown",
      };
    });
}

function extractMeetingUrl(event: any): string | null {
  // Check for Google Meet link
  if (event.hangoutLink) {
    return event.hangoutLink;
  }

  // Check for Zoom link in conference data
  if (event.conferenceData?.entryPoints) {
    const videoEntry = event.conferenceData.entryPoints.find(
      (e: any) => e.entryPointType === "video"
    );
    if (videoEntry) return videoEntry.uri;
  }

  // Check for meeting URL in description or location
  const text = `${event.description || ""} ${event.location || ""}`;
  const zoomMatch = text.match(
    /https:\/\/[\w.-]*zoom\.us\/j\/\d+[^\s)"]*/
  );
  if (zoomMatch) return zoomMatch[0];

  const meetMatch = text.match(
    /https:\/\/meet\.google\.com\/[a-z-]+/
  );
  if (meetMatch) return meetMatch[0];

  return null;
}
