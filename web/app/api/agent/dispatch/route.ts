import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { meetingUrl, meetingTitle } = body;

  if (!meetingUrl) {
    return NextResponse.json(
      { error: "Meeting URL is required" },
      { status: 400 }
    );
  }

  // TODO: Replace with real Recall.ai API call
  // const response = await fetch('https://api.recall.ai/api/v1/bot/', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Token ${process.env.RECALL_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     meeting_url: meetingUrl,
  //     bot_name: `${session.user?.name}'s Delegate`,
  //     real_time_transcription: {
  //       destination_url: `wss://${process.env.AGENT_WS_HOST}/ws`,
  //     },
  //   }),
  // });

  // Mock response
  const mockBotId = `bot_${Date.now()}`;

  return NextResponse.json({
    botId: mockBotId,
    status: "joining",
    meetingTitle,
    message: `Delegate is joining "${meetingTitle}" (mock)`,
  });
}
