const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `"WhispR Chat Support" <whispr@shergill.codes>`,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send email via Resend API");
  }
  return response.json();
};

// ─── Registration / Email Verification OTP ───────────────────────────────────
const sendRegistrationOTPEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "WhispR – Verify Your Email Address",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h2 style="color: #4e0eff; text-align: center; margin-top: 0; font-size: 24px;">👋 Welcome to WhispR!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          Thanks for signing up! To complete your registration, please verify your email address using the One-Time Password (OTP) below:
        </p>
        <div style="font-size: 32px; font-weight: 800; text-align: center; color: #4e0eff; margin: 30px 0; letter-spacing: 4px; padding: 15px; background-color: #f7fafc; border-radius: 8px; border: 1px dashed #cbd5e0;">
          ${otp}
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #e53e3e; text-align: center; font-weight: 500;">
          ⏰ This verification code is valid for 10 minutes.
        </p>
        <p style="font-size: 13px; color: #718096; text-align: center; margin-top: 20px;">
          If you didn't create a WhispR account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">WhispR – Secure & Private Messaging</p>
      </div>
    `,
  });
};

// ─── Password Reset OTP ───────────────────────────────────────────────────────
const sendPasswordResetOTPEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "WhispR – Password Reset OTP Verification",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h2 style="color: #4e0eff; text-align: center; margin-top: 0; font-size: 24px;">🔐 WhispR Password Recovery</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          You requested to reset your WhispR password. Please use the following One-Time Password (OTP) to complete verification:
        </p>
        <div style="font-size: 32px; font-weight: 800; text-align: center; color: #4e0eff; margin: 30px 0; letter-spacing: 4px; padding: 15px; background-color: #f7fafc; border-radius: 8px; border: 1px dashed #cbd5e0;">
          ${otp}
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #e53e3e; text-align: center; font-weight: 500;">
          ⏰ This verification code is valid for 10 minutes.
        </p>
        <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 12px 16px; border-radius: 4px; margin: 20px 0;">
          <p style="font-size: 13px; color: #c53030; margin: 0;">
            🛡️ <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">WhispR – Secure & Private Messaging</p>
      </div>
    `,
  });
};

// ─── Unified entry point (kept for backward compatibility) ────────────────────
// purpose: 'registration' | 'reset'  (defaults to 'reset' to match old behaviour)
const sendOTPEmail = async (email, otp, purpose = "reset") => {
  if (purpose === "registration") {
    return sendRegistrationOTPEmail(email, otp);
  }
  return sendPasswordResetOTPEmail(email, otp);
};

module.exports = {
  sendOTPEmail,
  sendRegistrationOTPEmail,
  sendPasswordResetOTPEmail,
};
