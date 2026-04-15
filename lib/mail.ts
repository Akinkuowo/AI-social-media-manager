import nodemailer from 'nodemailer';

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'mock_user',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'mock_pass',
  },
});

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SocialAI" <noreply@socialai.com>',
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code is: <strong>${token}</strong></p>`
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SocialAI" <noreply@socialai.com>',
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SocialAI" <noreply@socialai.com>',
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email address.</p>`
  });
};
