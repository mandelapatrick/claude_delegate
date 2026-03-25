import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo") as File;

  if (!photo) {
    return NextResponse.json(
      { error: "No photo provided" },
      { status: 400 }
    );
  }

  // TODO: Store photo in Supabase Storage and save URL to users table
  // const { data } = await supabase.storage
  //   .from('avatars')
  //   .upload(`${session.user?.email}/avatar.jpg`, photo);

  const mockAvatarId = `avatar_${Date.now()}`;

  return NextResponse.json({
    avatarId: mockAvatarId,
    message: "Profile photo uploaded successfully (mock)",
  });
}
