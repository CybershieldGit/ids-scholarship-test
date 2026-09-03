import { NextRequest, NextResponse } from "next/server";
import { verifyOtpToken } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, token } = body;

    if (!phone || !otp || !token) {
      return NextResponse.json(
        { success: false, error: "Phone number, OTP, and verification token are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const result = verifyOtpToken(cleanPhone, String(otp), String(token));

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.reason || "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Mobile number verified successfully",
    });
  } catch (err: any) {
    console.error("[IDS Verify OTP Exception]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
