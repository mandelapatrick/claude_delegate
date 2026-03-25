import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET: Check connector status
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // TODO: Check actual OAuth tokens in Supabase
  return NextResponse.json({
    connectors: {
      calendar: true, // Connected via Google OAuth
      github: false,
      slack: false,
    },
  });
}

// POST: Initiate connector OAuth
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { connector } = await request.json();

  // TODO: Return actual OAuth URLs
  const oauthUrls: Record<string, string> = {
    github: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,read:org`,
    slack: `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=channels:history,chat:write`,
  };

  const url = oauthUrls[connector];
  if (!url) {
    return NextResponse.json(
      { error: `Unknown connector: ${connector}` },
      { status: 400 }
    );
  }

  return NextResponse.json({ authUrl: url });
}
