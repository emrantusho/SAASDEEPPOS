import { refreshAccessToken } from "@saasdeep/google-drive-sync";
import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 400 });
    }

    const tokens = await refreshAccessToken(refreshToken, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

    return NextResponse.json({
      accessToken: tokens.access_token,
      expiryDate: Date.now() + tokens.expiry_date * 1000,
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
