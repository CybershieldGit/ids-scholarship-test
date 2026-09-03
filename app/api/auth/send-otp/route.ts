import { NextRequest, NextResponse } from "next/server";
import { generateRandomOtp, createOtpVerificationToken } from "@/lib/otp";

// In-memory rate-limiter: stores last request timestamp and attempt count per phone
const rateLimitMap = new Map<string, { lastSent: number; count: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = body?.phone;

    if (!rawPhone || typeof rawPhone !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    // Rate Limiting Check
    const now = Date.now();
    const rateData = rateLimitMap.get(cleanPhone);

    if (rateData) {
      const elapsedSecs = Math.floor((now - rateData.lastSent) / 1000);
      // Enforce 30-second cooldown between OTP sends
      if (elapsedSecs < 30) {
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${30 - elapsedSecs}s before requesting a new OTP.`,
            cooldown: 30 - elapsedSecs,
          },
          { status: 429 }
        );
      }

      // Max 5 OTPs per 10 minutes
      if (now - rateData.lastSent < 10 * 60 * 1000 && rateData.count >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many OTP attempts. Please try again after 10 minutes.",
          },
          { status: 429 }
        );
      }

      rateLimitMap.set(cleanPhone, {
        lastSent: now,
        count: now - rateData.lastSent < 10 * 60 * 1000 ? rateData.count + 1 : 1,
      });
    } else {
      rateLimitMap.set(cleanPhone, { lastSent: now, count: 1 });
    }

    // Generate 6-Digit OTP and signed HMAC token
    const otpCode = generateRandomOtp();
    const verificationToken = createOtpVerificationToken(cleanPhone, otpCode);

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const templateName = process.env.WHATSAPP_AUTH_TEMPLATE_NAME || "ids_scholarship_otp";
    const isMockMode =
      process.env.WHATSAPP_MOCK_DEV_MODE === "true" || !phoneNumberId || !accessToken;

    if (!isMockMode) {
      // Direct Meta WhatsApp Cloud API Call
      const metaApiUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

      const sendToMeta = async (payload: any) => {
        return fetch(metaApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      };

      // Payload 1: Standard Meta Auth Template (en_US with Body & Button)
      let metaPayload: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `91${cleanPhone}`,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: otpCode }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: otpCode }],
            },
          ],
        },
      };

      let response = await sendToMeta(metaPayload);
      let responseData = await response.json();

      // If failed, check if language or button format caused rejection
      if (!response.ok) {
        console.warn("[IDS WhatsApp Primary Attempt Failed]:", responseData);

        // Fallback 1: Try language code "en" instead of "en_US"
        if (responseData?.error?.error_data?.details?.includes("language") || responseData?.error?.message?.includes("language")) {
          metaPayload.template.language.code = "en";
          response = await sendToMeta(metaPayload);
          responseData = await response.json();
        }

        // Fallback 2: If button component failed, try simple body-only template
        if (!response.ok && (responseData?.error?.message?.includes("button") || responseData?.error?.message?.includes("parameter") || responseData?.error?.message?.includes("component"))) {
          const bodyOnlyPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `91${cleanPhone}`,
            type: "template",
            template: {
              name: templateName,
              language: { code: metaPayload.template.language.code || "en_US" },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: otpCode }],
                },
              ],
            },
          };
          response = await sendToMeta(bodyOnlyPayload);
          responseData = await response.json();

          // Fallback 3: If still language error on body-only, try "en"
          if (!response.ok && responseData?.error?.message?.includes("language")) {
            bodyOnlyPayload.template.language.code = "en";
            response = await sendToMeta(bodyOnlyPayload);
            responseData = await response.json();
          }
        }

        if (!response.ok) {
          console.error("[IDS WhatsApp API Final Error]:", responseData);
          return NextResponse.json(
            {
              success: false,
              error:
                responseData?.error?.message ||
                "Unable to send WhatsApp OTP. Please check your phone number.",
            },
            { status: 502 }
          );
        }
      }

      console.log(`[IDS WhatsApp OTP Sent Successfully] +91${cleanPhone}`, responseData?.messages?.[0]?.id);
    } else {
      // Dev / Mock Mode (Active until real credentials are plugged into .env.local)
      console.log("==================================================");
      console.log(`[IDS WHATSAPP MOCK OTP] Target: +91 ${cleanPhone}`);
      console.log(`[IDS WHATSAPP MOCK OTP] Verification Code: ${otpCode}`);
      console.log("==================================================");
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your WhatsApp number",
      token: verificationToken,
      cooldown: 30,
      isMock: isMockMode,
      ...(isMockMode ? { mockOtp: otpCode } : {}),
    });
  } catch (err: any) {
    console.error("[IDS Send OTP Exception]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error while dispatching OTP" },
      { status: 500 }
    );
  }
}
