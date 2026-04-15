import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 as the default for DNS resolution to avoid EHOSTUNREACH on IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const isEmailConfigured = 
  (process.env.EMAIL_SERVER_USER || process.env.SMTP_USER) && 
  (process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS);

const transporter = isEmailConfigured 
  ? nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
      secure: process.env.EMAIL_SERVER_PORT === '465' || !process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS,
      },
      family: 4,
    } as any)
  : null;

const sendMail = async (options: nodemailer.SendMailOptions) => {
  if (transporter) {
    return await transporter.sendMail(options);
  } else {
    console.log("------------------------------------------");
    console.log("📧 EMAIL FALLBACK (Dev Mode)");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.html}`);
    console.log("------------------------------------------");
    return { messageId: "dev-mode-fake-id" };
  }
};

const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || '"SocialAI" <noreply@socialai.com>';

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await sendMail({
    from: fromEmail,
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code is: <strong>${token}</strong></p>`
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  await sendMail({
    from: fromEmail,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/verify-email?token=${token}`;

  await sendMail({
    from: fromEmail,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email address.</p>`
  });
};
