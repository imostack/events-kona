import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "EventsKona <noreply@eventskona.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

// =====================
// Email Templates
// =====================

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email/${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your EventsKona account",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:#7c3aed;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;">EventsKona</h1>
        </div>
        <div style="padding:32px 24px;">
          <h2>Verify your email address</h2>
          <p>Thanks for signing up! Please click the button below to verify your email address.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${verifyUrl}" style="background:#7c3aed;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color:#666;font-size:14px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Reset your EventsKona password",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:#7c3aed;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;">EventsKona</h1>
        </div>
        <div style="padding:32px 24px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to choose a new one.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="background:#7c3aed;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
        </div>
      </div>
    `,
  });
}

export async function sendTicketConfirmationEmail(
  email: string,
  details: {
    buyerName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    ticketCount: number;
    orderNumber: string;
    totalAmount: string;
    currency: string;
  }
) {
  return sendEmail({
    to: email,
    subject: `Your tickets for ${details.eventTitle} - Order #${details.orderNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:#7c3aed;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;">EventsKona</h1>
        </div>
        <div style="padding:32px 24px;">
          <h2>Booking Confirmed!</h2>
          <p>Hi ${details.buyerName}, your tickets have been confirmed.</p>
          <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:24px 0;">
            <p style="margin:8px 0;"><strong>Event:</strong> ${details.eventTitle}</p>
            <p style="margin:8px 0;"><strong>Date:</strong> ${details.eventDate}</p>
            <p style="margin:8px 0;"><strong>Time:</strong> ${details.eventTime}</p>
            <p style="margin:8px 0;"><strong>Location:</strong> ${details.eventLocation}</p>
            <p style="margin:8px 0;"><strong>Tickets:</strong> ${details.ticketCount}</p>
            <p style="margin:8px 0;"><strong>Order:</strong> #${details.orderNumber}</p>
            <p style="margin:8px 0;"><strong>Total:</strong> ${details.currency} ${details.totalAmount}</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/my-events" style="background:#7c3aed;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
              View My Tickets
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to EventsKona!",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:#7c3aed;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;">EventsKona</h1>
        </div>
        <div style="padding:32px 24px;">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been verified. You can now discover events, purchase tickets, and connect with organizers.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${APP_URL}" style="background:#7c3aed;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
              Explore Events
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
