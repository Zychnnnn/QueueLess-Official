import nodemailer from "nodemailer";

let transporter = null;

export const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPassRaw =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;
  const emailPass = emailPassRaw ? emailPassRaw.replace(/\s+/g, "") : "";

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: emailUser || "",
        pass: emailPass || "",
      },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (toEmail, otp) => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;

  if (!emailUser || !emailPass) {
    console.warn(
      `[Email Service] EMAIL_USER and EMAIL_PASS are not configured in server/.env. OTP for ${toEmail} is: ${otp}`
    );
    return { sent: false, reason: "credentials_not_configured" };
  }

  const transport = getTransporter();

  const mailOptions = {
    from: `"QueueLess Registrar" <${emailUser}>`,
    to: toEmail,
    subject: `QueueLess - Verification Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #183d22; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">QueueLess Registrar</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">PHINMA University of Pangasinan</p>
        </div>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #f3f4f6;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 12px; font-weight: 500;">Your 6-digit password reset verification code is:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #183d22; background: #ffffff; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 2px dashed #183d22; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; text-align: center;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`[Email Service] OTP successfully sent to ${toEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send email to ${toEmail}:`, err.message);
    return { sent: false, error: err.message };
  }
};

export const sendAdminRegistrationNotification = async ({
  name,
  email,
  studentId,
  userType,
}) => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPassRaw =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;
  const emailPass = emailPassRaw ? emailPassRaw.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) {
    console.warn(
      `[Email Service] Registration notification skipped (credentials not configured) for ${name} (${email}).`
    );
    return { sent: false, reason: "credentials_not_configured" };
  }

  const transport = getTransporter();
  const adminTarget = process.env.ADMIN_EMAIL || emailUser;

  const mailOptions = {
    from: `"QueueLess Registrar" <${emailUser}>`,
    to: adminTarget,
    subject: `[QueueLess] Review Required: New Account (${name})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #183d22; margin: 0; font-size: 24px; font-weight: 800;">QueueLess Registrar</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">PHINMA University of Pangasinan</p>
        </div>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border: 1px solid #f3f4f6;">
          <h3 style="color: #183d22; margin: 0 0 12px; font-size: 16px;">New Account Registration Awaiting Review</h3>
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">A new user has submitted registration and awaits your decision:</p>
          <ul style="color: #374151; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0 0 16px;">
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Student / Visitor ID:</strong> ${studentId || "None"}</li>
            <li><strong>Type:</strong> ${userType === "priority" ? "Student Priority (.edu.ph / phinmaed)" : "Normal User (Personal Gmail)"}</li>
          </ul>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">Please log into the Admin Portal to <strong>Admit</strong> or <strong>Reject</strong> this registration.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`[Email Service] Admin notification sent: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email Service] Failed to send admin notification:", err.message);
    return { sent: false, error: err.message };
  }
};

export const sendAccountStatusNotification = async ({
  toEmail,
  name,
  status,
}) => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPassRaw =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;
  const emailPass = emailPassRaw ? emailPassRaw.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) return { sent: false };

  const isApproved = status === "approved";
  const transport = getTransporter();

  const mailOptions = {
    from: `"QueueLess Registrar" <${emailUser}>`,
    to: toEmail,
    subject: isApproved
      ? `QueueLess - Account Approved!`
      : `QueueLess - Registration Status Update`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #183d22; margin: 0; font-size: 24px; font-weight: 800;">QueueLess Registrar</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">PHINMA University of Pangasinan</p>
        </div>
        
        <div style="background-color: ${isApproved ? "#f0fdf4" : "#fef2f2"}; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid ${isApproved ? "#bbf7d0" : "#fecaca"};">
          <h3 style="color: ${isApproved ? "#166534" : "#991b1b"}; margin: 0 0 12px; font-size: 18px;">
            ${isApproved ? "Account Approved!" : "Registration Update"}
          </h3>
          <p style="color: #374151; font-size: 14px; margin: 0 0 16px; line-height: 1.5;">
            ${isApproved
              ? `Hello ${name}, your QueueLess account registration has been reviewed and approved by the administrator. You may now log in to request documents.`
              : `Hello ${name}, your QueueLess registration could not be approved at this time. If you believe this is a mistake, please reach out to the university registrar office.`}
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email Service] Failed to send status email:", err.message);
    return { sent: false, error: err.message };
  }
};

