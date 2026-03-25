import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUpcomingMeetings } from "@/lib/google-calendar";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token. Please re-authenticate." },
      { status: 401 }
    );
  }

  try {
    const meetings = await getUpcomingMeetings(accessToken);
    return NextResponse.json({ meetings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
