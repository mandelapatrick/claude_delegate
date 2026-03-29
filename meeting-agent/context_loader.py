"""
Context Loader for the Meeting Agent

Builds meeting context headers for the delegate's system prompt.
"""


def load_meeting_context(meeting_title: str, meeting_description: str = "") -> str:
    """Build context header for a meeting."""
    parts = [f"Meeting: {meeting_title}"]
    if meeting_description:
        parts.append(f"Description: {meeting_description}")
    return "\n".join(parts)
