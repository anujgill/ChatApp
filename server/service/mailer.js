const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: process.env.MAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_KEY,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"WhispR Chat Support" <${process.env.EMAIL}>`,
    to: email,
    subject: "WhispR Password Reset OTP Verification",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4e0eff; text-align: center; margin-top: 0; font-size: 24px;">WhispR Password Recovery</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">You requested to reset your WhispR password. Please use the following One-Time Password (OTP) code to complete verification:</p>
        
        <div style="font-size: 32px; font-weight: 800; text-align: center; color: #4e0eff; margin: 30px 0; letter-spacing: 4px; padding: 15px; background-color: #f7fafc; border-radius: 8px; border: 1px dashed #cbd5e0;">
          ${otp}
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #e53e3e; text-align: center; font-weight: 500;">
          This verification code is valid for 10 minutes.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #718096; margin-top: 30px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 11px; color: #a0aec0; text-align: center; margin-bottom: 0;">This is an automated notification. Please do not reply directly to this mail.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
};
