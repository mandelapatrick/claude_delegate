export interface Meeting {
  id: string;
  title: string;
  start: string;
  end: string;
  duration: string;
  attendees: string[];
  meetingUrl: string | null;
  platform: "zoom" | "google_meet" | "unknown";
  hasAgent: boolean;
}

// Mock meetings for development — replace with Google Calendar API
const MOCK_MEETINGS: Meeting[] = [
  {
    id: "evt_001",
    title: "Team Standup",
    start: getNextWeekday(1, "09:00"),
    end: getNextWeekday(1, "09:30"),
    duration: "30 min",
    attendees: ["alice@company.com", "bob@company.com", "carol@company.com"],
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    platform: "google_meet",
    hasAgent: false,
  },
  {
    id: "evt_002",
    title: "Sprint Planning",
    start: getNextWeekday(2, "14:00"),
    end: getNextWeekday(2, "15:00"),
    duration: "1 hr",
    attendees: ["alice@company.com", "dave@company.com", "eve@company.com"],
    meetingUrl: "https://zoom.us/j/123456789",
    platform: "zoom",
    hasAgent: false,
  },
  {
    id: "evt_003",
    title: "1:1 with Manager",
    start: getNextWeekday(3, "10:00"),
    end: getNextWeekday(3, "10:30"),
    duration: "30 min",
    attendees: ["manager@company.com"],
    meetingUrl: "https://meet.google.com/klm-nopq-rst",
    platform: "google_meet",
    hasAgent: false,
  },
  {
    id: "evt_004",
    title: "Product Review",
    start: getNextWeekday(4, "15:00"),
    end: getNextWeekday(4, "16:00"),
    duration: "1 hr",
    attendees: [
      "product@company.com",
      "design@company.com",
      "alice@company.com",
      "bob@company.com",
    ],
    meetingUrl: "https://zoom.us/j/987654321",
    platform: "zoom",
    hasAgent: false,
  },
  {
    id: "evt_005",
    title: "All Hands",
    start: getNextWeekday(5, "11:00"),
    end: getNextWeekday(5, "12:00"),
    duration: "1 hr",
    attendees: ["all-staff@company.com"],
    meetingUrl: "https://meet.google.com/uvw-xyza-bcd",
    platform: "google_meet",
    hasAgent: false,
  },
];

function getNextWeekday(dayOffset: number, time: string): string {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  const target = new Date(startOfWeek);
  target.setDate(startOfWeek.getDate() + dayOffset - 1);
  const [hours, minutes] = time.split(":").map(Number);
  target.setHours(hours, minutes, 0, 0);
  // If the date has passed, move to next week
  if (target < now) {
    target.setDate(target.getDate() + 7);
  }
  return target.toISOString();
}

export async function listMeetings(): Promise<Meeting[]> {
  // TODO: Replace with Google Calendar API call using stored OAuth token
  // const calendar = google.calendar({ version: 'v3', auth: oauthClient });
  // const response = await calendar.events.list({ ... });
  return MOCK_MEETINGS;
}

export async function getMeetingById(
  meetingId: string
): Promise<Meeting | null> {
  const meetings = await listMeetings();
  return meetings.find((m) => m.id === meetingId) ?? null;
}
