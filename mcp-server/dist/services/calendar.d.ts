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
export declare function listMeetings(days?: number): Promise<Meeting[]>;
export declare function getMeetingById(meetingId: string): Promise<Meeting | null>;
