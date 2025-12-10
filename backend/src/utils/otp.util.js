import crypto from "crypto";

/* Generate secure 6-digit OTP */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/* Hash OTP using SHA256 */
export const hashOTP = otp => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/* Safe compare to avoid timing attacks */
export const safeCompare = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
};
