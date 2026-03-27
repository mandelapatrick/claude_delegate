import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const photo = formData.get("photo") as File;
  const email = formData.get("email") as string;

  if (!photo) {
    return NextResponse.json(
      { error: "No photo provided" },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "No email provided" },
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const buffer = Buffer.from(await photo.arrayBuffer());
  const filePath = `${email}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, buffer, {
      contentType: photo.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("[avatar] Upload error:", uploadError);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // Create Anam AI avatar from the photo
  let anamAvatarId = "";
  const anamApiKey = process.env.ANAM_API_KEY;
  if (anamApiKey) {
    try {
      const anamResp = await fetch("https://api.anam.ai/v1/avatars", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anamApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: email.split("@")[0],
          imageUrl: avatarUrl,
        }),
      });

      if (anamResp.ok) {
        const anamData = await anamResp.json();
        anamAvatarId = anamData.id || "";
        console.log("[avatar] Anam avatar created:", anamAvatarId);
      } else {
        console.error("[avatar] Anam API error:", anamResp.status, await anamResp.text());
      }
    } catch (err) {
      console.error("[avatar] Anam avatar creation failed:", err);
    }
  }

  // Update user record
  const updateData: Record<string, string> = { avatar_url: avatarUrl };
  if (anamAvatarId) {
    updateData.anam_avatar_id = anamAvatarId;
  }
  await supabase
    .from("users")
    .update(updateData)
    .eq("email", email);

  return NextResponse.json({
    avatarUrl,
    anamAvatarId,
    message: "Profile photo uploaded successfully",
  });
}
