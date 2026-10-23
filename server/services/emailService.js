import nodemailer from "nodemailer";

let transporter = null;

const getCredentials = () => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || "reirei.edu.ph@gmail.com";
  const emailPassRaw =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    "ofbcccujpenkpqnz";
  const emailPass = emailPassRaw ? emailPassRaw.replace(/\s+/g, "") : "";
  return { emailUser, emailPass };
};


export const createGmailTransport = (port = 465, secure = true) => {
  const { emailUser, emailPass } = getCredentials();
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 6000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const getTransporter = () => {
  if (transporter) return transporter;
  transporter = createGmailTransport(465, true);
  return transporter;
};

export const sendOtpEmail = async (toEmail, otp, customSubject) => {
  const { emailUser, emailPass } = getCredentials();

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

  // Attempt 1: Port 465 (SSL direct)
  try {
    const transport465 = createGmailTransport(465, true);
    const info = await transport465.sendMail(mailOptions);
    console.log(`[Email Service] OTP successfully sent to ${toEmail} via port 465: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err465) {
    console.warn(`[Email Service] Port 465 failed (${err465.message}), falling back to port 587 (TLS)...`);
    // Attempt 2: Port 587 (STARTTLS)
    try {
      const transport587 = createGmailTransport(587, false);
      const info = await transport587.sendMail(mailOptions);
      console.log(`[Email Service] OTP successfully sent to ${toEmail} via port 587: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err587) {
      console.error(`[Email Service] All SMTP attempts failed for ${toEmail}. 465: ${err465.message} | 587: ${err587.message}`);
      return { sent: false, error: `${err465.message} | ${err587.message}` };
    }
  }
};

export const sendAdminRegistrationNotification = async ({
  name,
  email,
  studentId,
  userType,
}) => {
  const { emailUser, emailPass } = getCredentials();
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
  const { emailUser, emailPass } = getCredentials();
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
  claimOtp,
  counterWindow,
}) => {
  const { emailUser, emailPass } = getCredentials();
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
    ? `[QueueLess] Ready for Claiming: ${document} (OTP: ${claimOtp || requestNumber})`
    : status === "Processing"
    ? `[QueueLess] In Processing: ${document} (Claim OTP: ${claimOtp || requestNumber})`
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

        ${claimOtp ? `
        <div style="background-color: #f0fdf4; border: 2px dashed #15803d; border-radius: 12px; padding: 22px 18px; margin-bottom: 20px; text-align: center;">
          <p style="color: #166534; font-size: 12px; margin: 0 0 6px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
            Official Claiming Verification OTP Code
          </p>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #15803d; background: #ffffff; padding: 12px 24px; border-radius: 8px; display: inline-block; border: 1.5px solid #86efac; font-family: monospace; margin: 4px 0 10px;">
            ${claimOtp}
          </div>
          <p style="color: #166534; font-size: 13px; margin: 0; font-weight: 600; line-height: 1.4;">
            Present this 6-digit OTP code along with your Student ID at <strong>${counterWindow || pickupDate || "Counter Window 2 (Releasing Desk)"}</strong> upon claiming.
          </p>
        </div>
        ` : ""}

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
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${pickupDate || "Standard Schedule"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Claiming Window:</td>
              <td style="padding: 6px 0; color: #183d22; font-weight: 700;">${counterWindow || "Counter Window 2 (Releasing Desk)"}</td>
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

  // Attempt 1: Port 465 (SSL direct)
  try {
    const transport465 = createGmailTransport(465, true);
    const info = await transport465.sendMail(mailOptions);
    console.log(`[Email Service] Update email sent for ${requestNumber} to ${toEmail} via 465: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err465) {
    console.warn(`[Email Service] Port 465 failed for ${requestNumber} (${err465.message}), falling back to port 587...`);
    // Attempt 2: Port 587 (TLS)
    try {
      const transport587 = createGmailTransport(587, false);
      const info = await transport587.sendMail(mailOptions);
      console.log(`[Email Service] Update email sent for ${requestNumber} to ${toEmail} via 587: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err587) {
      console.error(`[Email Service] All update email attempts failed for ${toEmail}: 465: ${err465.message} | 587: ${err587.message}`);
      return { sent: false, error: err587.message };
    }
  }
};

export const sendSecurityConfirmationEmail = async ({
  toEmail,
  userName,
  actionType,
  details,
  logoutUrl,
  resetPasswordUrl,
  securityActionUrl,
}) => {
  // Map destructured params to template variable names
  const effectiveLogoutUrl = logoutUrl || securityActionUrl || "#";
  const effectiveResetUrl = resetPasswordUrl || securityActionUrl || "#";

  const { emailUser, emailPass } = getCredentials();

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

        <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; border: 1px solid #fee2e2; margin-top: 20px; text-align: left;">
          <div style="margin-bottom: 14px;">
            <p style="color: #991b1b; font-size: 15px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.3px;">
              ⚠️ Security Alert: Was this not you?
            </p>
            <p style="color: #7f1d1d; font-size: 12px; line-height: 1.5; margin: 0;">
              Confirm unauthorized sign-in or activity. If you did not perform this action, choose an option below to secure your account immediately:
            </p>
          </div>

          <!-- Option 1: Log Out of All Devices -->
          <div style="background-color: #ffffff; border: 1px solid #fecaca; border-radius: 10px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="margin-bottom: 6px;">
              <span style="color: #b91c1c; font-size: 13px; font-weight: 700;">Log Out of All Devices</span>
              <span style="background-color: #fee2e2; color: #991b1b; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; margin-left: 6px; text-transform: uppercase;">Immediate</span>
            </div>
            <p style="color: #4b5563; font-size: 12px; line-height: 1.45; margin: 0 0 12px;">
              Instantly terminates all active sessions everywhere. The unauthorized user is kicked out immediately.
            </p>
            <a href="${effectiveLogoutUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 20px; border-radius: 6px; letter-spacing: 0.2px;">
              🔒 Log Out of All Devices
            </a>
          </div>

          <!-- Option 2: Log Out Everywhere & Change Password -->
          <div style="background-color: #ffffff; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="margin-bottom: 6px;">
              <span style="color: #166534; font-size: 13px; font-weight: 700;">Log Out Everywhere & Change Password</span>
              <span style="background-color: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; margin-left: 6px; text-transform: uppercase;">Recommended</span>
            </div>
            <p style="color: #4b5563; font-size: 12px; line-height: 1.45; margin: 0 0 12px;">
              Kicks out all sessions AND lets you set a new secure password right now so no one can access your account again.
            </p>
            <a href="${effectiveResetUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 20px; border-radius: 6px; letter-spacing: 0.2px;">
              🔑 Log Out & Change Password
            </a>
          </div>
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


