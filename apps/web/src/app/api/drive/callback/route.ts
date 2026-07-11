import { exchangeCodeForTokens } from "@saasdeep/google-drive-sync";
import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/admin/storefront?error=drive_denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/storefront?error=no_code", request.url));
  }

  try {
    const redirectUri = new URL("/api/drive/callback", request.url).toString();
    const tokens = await exchangeCodeForTokens(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

    const tokenData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? "",
      expiryDate: Date.now() + tokens.expiry_date * 1000,
    };

    const response = NextResponse.redirect(new URL("/admin/storefront?drive=connected", request.url));
    response.cookies.set("drive_tokens", JSON.stringify(tokenData), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error("Drive OAuth error:", err);
    return NextResponse.redirect(new URL("/admin/storefront?error=auth_failed", request.url));
  }
}
