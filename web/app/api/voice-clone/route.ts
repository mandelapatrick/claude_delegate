import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  // TODO: Replace with real ElevenLabs API call
  // const elevenLabsForm = new FormData();
  // elevenLabsForm.append('name', `${session.user?.name}'s Voice`);
  // elevenLabsForm.append('files', audioFile);
  // const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
  //   method: 'POST',
  //   headers: { 'xi-api-key': process.env.ELEVEN_API_KEY! },
  //   body: elevenLabsForm,
  // });
  // const data = await response.json();

  // Mock response
  const mockVoiceId = `voice_${Date.now()}`;

  // TODO: Store voice_id in Supabase users table
  // await supabase.from('users').update({ voice_clone_id: mockVoiceId }).eq('email', session.user?.email);

  return NextResponse.json({
    voiceId: mockVoiceId,
    message: "Voice clone created successfully (mock)",
  });
}
