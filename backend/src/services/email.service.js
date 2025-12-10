import resend from "../config/resend.js"

const FROM = process.env.FROM_EMAIL || "spotify@dhanushkumaramk.dev"

/* LOGIN OTP EMAIL */
export const sendLoginOTPEmail = async (to, otp) => {
  try {
    return await resend.emails.send({
      from: FROM,
      to,
      subject: "Spotichat | Login Verification Code",
      html: `
        <div style="max-width:420px;margin:0 auto;font-family:Segoe UI,Helvetica,Arial,sans-serif;background:#f7fdf7;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
          <div style="background:#22c55e;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#ffffff">Spotichat</h1>
          </div>
          <div style="padding:32px 24px;text-align:center">
            <h2 style="margin:0 0 8px;font-size:20px;color:#166534">Your Login Code</h2>
            <p style="margin:0 0 24px;font-size:16px;color:#555">Enter the code below to continue.</p>
            <div style="display:inline-block;background:#ffffff;border:2px solid #22c55e;border-radius:8px;padding:16px 24px;margin-bottom:24px">
              <span style="font-size:32px;font-weight:700;letter-spacing:4px;color:#166534">${otp}</span>
            </div>
            <p style="margin:0;font-size:14px;color:#777">
              This code is valid for <strong>5 minutes</strong>.
            </p>
          </div>
          <div style="background:#e9f7e9;padding:16px;text-align:center;font-size:12px;color:#16a34a">
            If you didn’t request this, you can safely ignore this email.
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error("Login OTP email failed:", error.message)
  }
}

/* FORGOT PASSWORD OTP EMAIL */
export const sendForgotPasswordOTPEmail = async (to, otp) => {
  try {
    return await resend.emails.send({
      from: FROM,
      to,
      subject: "Spotichat | Password Reset Code",
      html: `
        <div style="max-width:420px;margin:0 auto;font-family:Segoe UI,Helvetica,Arial,sans-serif;background:#fff7f7;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
          <div style="background:#ef4444;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#ffffff">Spotichat</h1>
          </div>
          <div style="padding:32px 24px;text-align:center">
            <h2 style="margin:0 0 8px;font-size:20px;color:#991b1b">Reset Your Password</h2>
            <p style="margin:0 0 24px;font-size:16px;color:#555">
              Use the code below to reset your password.
            </p>
            <div style="display:inline-block;background:#ffffff;border:2px solid #ef4444;border-radius:8px;padding:16px 24px;margin-bottom:24px">
              <span style="font-size:32px;font-weight:700;letter-spacing:4px;color:#991b1b">${otp}</span>
            </div>
            <p style="margin:0;font-size:14px;color:#777">
              This code is valid for <strong>5 minutes</strong>.
            </p>
          </div>
          <div style="background:#ffe9e9;padding:16px;text-align:center;font-size:12px;color:#dc2626">
            If you didn’t request this, please secure your account.
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error("Forgot password email failed:", error.message)
  }
}

/* WELCOME EMAIL */
export const sendWelcomeEmail = async to => {
  try {
    return await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to Spotichat 🎧",
      html: `
        <div style="max-width:420px;margin:0 auto;font-family:Segoe UI,Helvetica,Arial,sans-serif;background:#f7fdf7;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
          <div style="background:#22c55e;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#ffffff">Spotichat</h1>
          </div>
          <div style="padding:32px 24px;text-align:center">
            <h2 style="margin:0 0 8px;font-size:20px;color:#166534">Welcome to Spotichat!</h2>
            <p style="margin:0;font-size:16px;color:#555">
              Your account has been created successfully.
              Enjoy discovering and sharing music.
            </p>
          </div>
          <div style="background:#e9f7e9;padding:16px;text-align:center;font-size:12px;color:#16a34a">
            © ${new Date().getFullYear()} Spotichat. All rights reserved.
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error("Welcome email failed:", error.message)
  }
}
