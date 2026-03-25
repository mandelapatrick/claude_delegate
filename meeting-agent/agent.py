"""
Claude Delegate - Meeting Agent

Real-time AI agent that joins meetings via Recall.ai,
listens for when the user is addressed, and responds
with the user's cloned voice using ElevenLabs TTS.

Pipeline: Recall.ai STT -> Claude API -> ElevenLabs TTS -> Recall.ai audio
"""

import asyncio
import json
import os
from dataclasses import dataclass

import anthropic
import websockets
from dotenv import load_dotenv

load_dotenv()


@dataclass
class AgentConfig:
    user_name: str
    voice_clone_id: str
    anthropic_api_key: str
    elevenlabs_api_key: str
    recall_bot_id: str
    context: str = ""


@dataclass
class TranscriptEntry:
    speaker: str
    text: str
    timestamp: float


class MeetingAgent:
    """
    Agent that listens to a meeting transcript stream and responds
    when the user is addressed.
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.transcript: list[TranscriptEntry] = []
        self.client = anthropic.AsyncAnthropic(api_key=config.anthropic_api_key)
        self.is_speaking = False

    def should_respond(self, entry: TranscriptEntry) -> bool:
        """Determine if the agent should respond to this transcript entry."""
        text_lower = entry.text.lower()
        name_lower = self.config.user_name.lower()

        # Direct name mention
        if name_lower in text_lower:
            return True

        # Delegate invocation
        if "delegate" in text_lower or "hey delegate" in text_lower:
            return True

        # Direct question patterns after name
        recent = self.transcript[-3:] if len(self.transcript) >= 3 else self.transcript
        recent_text = " ".join(e.text.lower() for e in recent)
        if name_lower in recent_text and text_lower.rstrip().endswith("?"):
            return True

        return False

    async def generate_response(self, question: str) -> str:
        """Generate a response using Claude with the user's context."""
        transcript_context = "\n".join(
            f"{e.speaker}: {e.text}" for e in self.transcript[-20:]
        )

        system_prompt = f"""You are acting as {self.config.user_name}'s delegate in a meeting.
Respond as if you are {self.config.user_name}. Be concise, professional, and natural.
Use first person ("I think...", "In my experience...").

User's context and knowledge:
{self.config.context}

Recent meeting transcript:
{transcript_context}"""

        response = await self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=system_prompt,
            messages=[{"role": "user", "content": question}],
        )

        return response.content[0].text

    async def synthesize_speech(self, text: str) -> bytes:
        """Convert text to speech using ElevenLabs with the cloned voice."""
        # TODO: Replace with real ElevenLabs API call
        # import httpx
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(
        #         f"https://api.elevenlabs.io/v1/text-to-speech/{self.config.voice_clone_id}/stream",
        #         headers={"xi-api-key": self.config.elevenlabs_api_key},
        #         json={
        #             "text": text,
        #             "model_id": "eleven_turbo_v2_5",
        #             "voice_settings": {"stability": 0.5, "similarity_boost": 0.8},
        #         },
        #     )
        #     return response.content
        return b""  # Mock

    async def handle_transcript_event(self, event: dict):
        """Process a real-time transcript event from Recall.ai."""
        entry = TranscriptEntry(
            speaker=event.get("speaker", "Unknown"),
            text=event.get("text", ""),
            timestamp=event.get("timestamp", 0),
        )
        self.transcript.append(entry)

        if self.is_speaking:
            return

        if self.should_respond(entry):
            self.is_speaking = True
            try:
                response_text = await self.generate_response(entry.text)
                audio = await self.synthesize_speech(response_text)

                # TODO: Send audio back to Recall.ai bot
                # await self.inject_audio(audio)

                print(f"[DELEGATE] Response: {response_text}")
            finally:
                self.is_speaking = False

    async def connect_to_recall(self, ws_url: str):
        """Connect to Recall.ai WebSocket for real-time transcription."""
        async for websocket in websockets.connect(ws_url):
            try:
                async for message in websocket:
                    event = json.loads(message)
                    if event.get("type") == "transcript":
                        await self.handle_transcript_event(event)
            except websockets.ConnectionClosed:
                print("[DELEGATE] WebSocket disconnected, reconnecting...")
                continue

    def get_meeting_summary(self) -> dict:
        """Generate a post-meeting summary."""
        return {
            "transcript": [
                {"speaker": e.speaker, "text": e.text, "timestamp": e.timestamp}
                for e in self.transcript
            ],
            "total_entries": len(self.transcript),
        }


async def main():
    """Entry point for the meeting agent."""
    config = AgentConfig(
        user_name=os.getenv("DELEGATE_USER_NAME", "User"),
        voice_clone_id=os.getenv("DELEGATE_VOICE_ID", ""),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
        elevenlabs_api_key=os.getenv("ELEVEN_API_KEY", ""),
        recall_bot_id=os.getenv("RECALL_BOT_ID", ""),
    )

    agent = MeetingAgent(config)

    ws_url = os.getenv("RECALL_WS_URL", "ws://localhost:8080/ws")
    print(f"[DELEGATE] Connecting to {ws_url}...")
    await agent.connect_to_recall(ws_url)


if __name__ == "__main__":
    asyncio.run(main())
