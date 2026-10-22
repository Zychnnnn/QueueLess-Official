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

export const sendOtpEmail = async (toEmail, otp, customSubject) => {
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
    subject: customSubject || `QueueLess - Verification Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #183d22; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">QueueLess Registrar</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">PHINMA University of Pangasinan</p>
        </div>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #f3f4f6;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 12px; font-weight: 500;">Your 6-digit verification code is:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #183d22; background: #ffffff; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 2px dashed #183d22; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; text-align: center;">
          If you did not request this code, you can safely ignore this email.
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

export const sendRequestUpdateNotification = async ({
  toEmail,
  studentName,
  requestNumber,
  document,
  status,
  pickupDate,
  paymentStatus,
  remarks,
  lineNumber,
  copies,
}) => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPassRaw =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;
  const emailPass = emailPassRaw ? emailPassRaw.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) {
    console.warn(
      `[Email Service] Status update notification skipped (credentials not configured) for ${toEmail} (${requestNumber} -> ${status}).`
    );
    return { sent: false, reason: "credentials_not_configured" };
  }

  if (!toEmail) {
    console.warn(`[Email Service] No recipient email specified for request ${requestNumber}.`);
    return { sent: false, reason: "missing_recipient" };
  }

  const transport = getTransporter();

  // Color theme based on status
  let themeColor = "#183d22";
  let themeBg = "#f0fdf4";
  let themeBorder = "#bbf7d0";
  let statusHeadline = "Request Update";
  let statusDescription = "Your document request has been updated by the Registrar Staff.";

  if (status === "Ready for Claiming") {
    themeColor = "#15803d";
    themeBg = "#f0fdf4";
    themeBorder = "#86efac";
    statusHeadline = "Ready for Claiming!";
    statusDescription = "Good news! Your document has been prepared and is now ready for pick-up at the Registrar Window.";
  } else if (status === "Processing") {
    themeColor = "#0369a1";
    themeBg = "#f0f9ff";
    themeBorder = "#bae6fd";
    statusHeadline = "Now In Processing";
    statusDescription = "The Registrar Staff is currently preparing and processing your document.";
  } else if (status === "Claimed") {
    themeColor = "#334155";
    themeBg = "#f8fafc";
    themeBorder = "#cbd5e1";
    statusHeadline = "Document Claimed & Released";
    statusDescription = "Your requested document has been officially claimed. Thank you for using QueueLess!";
  } else if (status === "Needs Correction") {
    themeColor = "#b45309";
    themeBg = "#fffbeb";
    themeBorder = "#fde68a";
    statusHeadline = "Needs Correction / Follow-up";
    statusDescription = "There is an issue or additional requirement needed for your document request. Please check the remarks below.";
  }

  const subject = status === "Ready for Claiming"
    ? `[QueueLess] Ready for Claiming: ${document} (${requestNumber})`
    : status === "Processing"
    ? `[QueueLess] In Processing: ${document} (${requestNumber})`
    : status === "Claimed"
    ? `[QueueLess] Document Released: ${document} (${requestNumber})`
    : status === "Needs Correction"
    ? `[QueueLess] Action Required: ${document} (${requestNumber})`
    : `[QueueLess] Request Update (${status}): ${requestNumber}`;

  const mailOptions = {
    from: `"QueueLess Registrar" <${emailUser}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #183d22; padding-bottom: 16px;">
          <h2 style="color: #183d22; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">QueueLess Registrar</h2>
          <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">PHINMA University of Pangasinan</p>
        </div>

        <p style="color: #1f2937; font-size: 15px; margin: 0 0 16px;">
          Hello <strong>${studentName || "Student"}</strong>,
        </p>

        <div style="background-color: ${themeBg}; border: 1px solid ${themeBorder}; border-radius: 10px; padding: 18px; margin-bottom: 20px; text-align: center;">
          <span style="display: inline-block; background-color: ${themeColor}; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px;">
            ${status}
          </span>
          <h3 style="color: ${themeColor}; margin: 6px 0 6px; font-size: 18px; font-weight: 700;">
            ${statusHeadline}
          </h3>
          <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.5;">
            ${statusDescription}
          </p>
        </div>

        <div style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px; color: #111827; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Document Details</h4>
          
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; width: 40%;">Request ID:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${requestNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Document:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${document}${copies ? ` (${copies} copy/copies)` : ""}</td>
            </tr>
            ${lineNumber ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Queue Line Position:</td>
              <td style="padding: 6px 0; color: #183d22; font-weight: 700;">Line #${lineNumber}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">When to Claim:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${pickupDate || "Standard Schedule • Registrar Counter 2"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Payment Requirement:</td>
              <td style="padding: 6px 0; color: #b45309; font-weight: 600;">${paymentStatus || "Proceed to Registrar Staff"}</td>
            </tr>
            ${remarks ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Staff Remarks:</td>
              <td style="padding: 6px 0; color: #111827; font-style: italic; background-color: #f3f4f6; border-radius: 4px; padding-left: 8px;">${remarks}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        <div style="background-color: #f8fafc; border-left: 3px solid #183d22; padding: 12px 14px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
            <strong>Important Reminder:</strong> Please present your valid Student ID and digital receipt at the Registrar Window upon claiming. Office hours are Monday to Saturday, 8:00 AM – 5:00 PM.
          </p>
        </div>

        <p style="color: #9ca3af; font-size: 11px; margin: 20px 0 0; text-align: center; border-top: 1px solid #f3f4f6; pt-3;">
          PHINMA University of Pangasinan • College Building Ground Floor
        </p>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`[Email Service] Update email sent for ${requestNumber} to ${toEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send update email to ${toEmail}:`, err.message);
    return { sent: false, error: err.message };
  }
};

export const sendSecurityConfirmationEmail = async ({
  toEmail,
  userName,
  actionType,
  details,
  securityActionUrl,
}) => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;

  if (!emailUser || !emailPass) {
    console.log(
      `[Email Service (Local/Mock)] Security notice for ${toEmail} [${actionType}]: ${details}`
    );
    return { sent: true, mock: true };
  }

  const transport = getTransporter();

  const mailOptions = {
    from: `"QueueLess Security" <${emailUser}>`,
    to: toEmail,
    subject: `QueueLess Security Notice: ${actionType}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #183d22; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">QueueLess System</h2>
          <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Security & Account Verification</p>
        </div>
        
        <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; text-align: left; border: 1px solid #bbf7d0; margin-bottom: 20px;">
          <p style="color: #166534; font-size: 15px; margin: 0 0 8px; font-weight: 700;">
            Confirming that this is you
          </p>
          <p style="color: #374151; font-size: 13px; margin: 0; line-height: 1.5;">
            Hello <strong>${userName || "QueueLess User"}</strong>, this is an automated confirmation regarding recent activity on your QueueLess account (<strong>${toEmail}</strong>):
          </p>
          <div style="margin-top: 12px; padding: 10px 14px; background: #ffffff; border-radius: 6px; border: 1px solid #dcfce7; font-size: 13px; color: #1e293b;">
            <strong>Activity:</strong> ${actionType}<br/>
            ${details ? `<strong>Details:</strong> ${details}` : ""}
          </div>
        </div>

        <p style="color: #4b5563; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
          If this was you, you can continue using the <strong>QueueLess System</strong> safely. No further action is required.
        </p>

        <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; border: 1px solid #fee2e2; margin-bottom: 4px; text-align: left;">
          <p style="color: #991b1b; font-size: 13px; font-weight: 700; margin: 0 0 6px;">
            ⚠️ Didn't make this request? (That wasn't me)
          </p>
          <p style="color: #7f1d1d; font-size: 12px; line-height: 1.5; margin: 0 0 12px;">
            If you did not authorize this sign-in or recent activity, please secure your account immediately. You can log out of all active sessions and change your password:
          </p>
          ${
            securityActionUrl
              ? `<div style="text-align: center; margin-top: 8px;">
                   <a href="${securityActionUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 22px; border-radius: 6px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(220,38,38,0.25);">
                     ⚠ That wasn't me — Log Out & Secure Account
                   </a>
                 </div>`
              : `<p style="color: #b91c1c; font-size: 11px; margin: 0; font-style: italic;">
                   Please secure your account immediately or contact the Registrar's Office.
                 </p>`
          }
        </div>

        <p style="color: #9ca3af; font-size: 11px; margin: 24px 0 0; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          PHINMA University of Pangasinan • QueueLess Automated Notification
        </p>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`[Email Service] Security confirmation email sent to ${toEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send security email to ${toEmail}:`, err.message);
    return { sent: false, error: err.message };
  }
};



