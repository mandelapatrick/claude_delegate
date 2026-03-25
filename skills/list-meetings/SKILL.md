---
name: list-meetings
description: List upcoming meetings for the current week from Google Calendar. Use when the user asks to see their meetings, schedule, or calendar.
disable-model-invocation: false
allowed-tools:
  - mcp__claude-delegate__list_meetings
  - mcp__claude-delegate__get_onboarding_status
---

# List Meetings

Fetch and display the user's upcoming meetings from Google Calendar for the current week.

## Workflow

1. First check onboarding status with `get_onboarding_status`. If not onboarded, tell the user to run `/onboard` first.
2. Call `list_meetings` to fetch upcoming meetings.
3. Display results in a clean table format showing:
   - Meeting title
   - Date and time
   - Duration
   - Attendees
   - Meeting link (Zoom/Google Meet)
   - Whether a delegate agent is assigned

## Output Format

Present meetings grouped by day, in chronological order. Highlight any meetings that already have a delegate agent assigned.
