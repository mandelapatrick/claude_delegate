"""
Context Loader for the Meeting Agent

Loads relevant context from the user's second brain (PARA structure),
Slack channels, and GitHub repos to inform the delegate's responses.
"""

import os
from pathlib import Path


def load_para_context(second_brain_path: str = "second-brain") -> str:
    """Load relevant entries from the local PARA structure."""
    context_parts = []
    base = Path(second_brain_path)

    for category in ["projects", "areas", "resources"]:
        category_path = base / category
        if not category_path.exists():
            continue

        for file in sorted(category_path.glob("*.md")):
            content = file.read_text(encoding="utf-8")
            context_parts.append(
                f"[{category.upper()}] {file.stem}:\n{content[:500]}"
            )

    return "\n\n".join(context_parts)


def load_meeting_context(meeting_title: str, meeting_description: str = "") -> str:
    """Build context specific to a meeting."""
    parts = [
        f"Meeting: {meeting_title}",
    ]
    if meeting_description:
        parts.append(f"Description: {meeting_description}")

    # Load PARA context
    para = load_para_context()
    if para:
        parts.append(f"\nKnowledge Base:\n{para}")

    return "\n".join(parts)


# TODO: Add Slack context loader
# async def load_slack_context(channel_ids: list[str], token: str) -> str:
#     """Load recent messages from relevant Slack channels."""
#     pass

# TODO: Add GitHub context loader
# async def load_github_context(repo: str, token: str) -> str:
#     """Load recent PRs and issues from relevant repos."""
#     pass
