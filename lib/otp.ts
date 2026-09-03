import crypto from "crypto";

const OTP_SECRET = process.env.OTP_SECRET_KEY || "ids_scholarship_secure_otp_key_2026";
const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a cryptographically random 6-digit numeric OTP
 */
export function generateRandomOtp(): string {
  // Random integer between 100000 and 999999
  const otpNumber = crypto.randomInt(100000, 999999);
  return otpNumber.toString();
}

/**
 * Creates a signed, tamper-proof HMAC verification token
 * Structure: base64(phone:otp_hash:expires_at).signature
 */
export function createOtpVerificationToken(phone: string, otp: string): string {
  const expiresAt = Date.now() + OTP_EXPIRATION_MS;
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  // Hash the OTP with salt
  const otpHash = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${cleanPhone}:${otp}:${expiresAt}`)
    .digest("hex");

  const payload = `${cleanPhone}:${otpHash}:${expiresAt}`;
  const payloadB64 = Buffer.from(payload).toString("base64url");

  // Sign the payload
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates the entered OTP against the signed token
 */
export function verifyOtpToken(
  phone: string,
  enteredOtp: string,
  token: string
): { valid: boolean; reason?: string } {
  if (!token || !enteredOtp || !phone) {
    return { valid: false, reason: "Missing verification parameters" };
  }

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const cleanOtp = enteredOtp.trim();

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "Invalid verification token structure" };
  }

  const [payloadB64, signature] = parts;

  // 1. Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(payloadB64)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
  ) {
    return { valid: false, reason: "Tampered verification token" };
  }

  // 2. Decode payload
  let payloadStr: string;
  try {
    payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { valid: false, reason: "Malformed token payload" };
  }

  const [tokenPhone, tokenOtpHash, expiresAtStr] = payloadStr.split(":");
  if (!tokenPhone || !tokenOtpHash || !expiresAtStr) {
    return { valid: false, reason: "Invalid token data" };
  }

  // 3. Verify phone matches
  if (tokenPhone !== cleanPhone) {
    return { valid: false, reason: "Phone number mismatch" };
  }

  // 4. Verify expiration
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }

  // 5. Verify OTP hash
  const expectedOtpHash = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${cleanPhone}:${cleanOtp}:${expiresAt}`)
    .digest("hex");

  const hashBuffer = Buffer.from(tokenOtpHash);
  const expectedHashBuffer = Buffer.from(expectedOtpHash);

  if (
    hashBuffer.length !== expectedHashBuffer.length ||
    !crypto.timingSafeEqual(hashBuffer, expectedHashBuffer)
  ) {
    return { valid: false, reason: "Incorrect OTP entered. Please check and try again." };
  }

  return { valid: true };
}
