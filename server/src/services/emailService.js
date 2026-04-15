const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT);
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"EOPANSE" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to EOPANSE</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Event Organizers & Practitioners Association of Nigeria South/East</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Dear <strong>${user.name}</strong>,</p>
        <p style="color: #6b7280;">Your membership registration has been approved. Welcome to EOPANSE!</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px;"><strong>Member Code:</strong> <span style="color: #7c3aed; font-size: 18px;">${user.userCode}</span></p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 0;"><strong>State:</strong> ${user.state}</p>
        </div>
        <p style="color: #6b7280;">You can now log in to your dashboard and participate in votes.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Login to Dashboard</a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">© 2024 EOPANSE. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Welcome to EOPANSE - Registration Approved', html });
};

const sendVotingLinkEmail = async (user, vote, votingUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Vote Now!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">EOPANSE Voting Portal</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Dear <strong>${user.name}</strong>,</p>
        <p style="color: #6b7280;">You have been invited to vote in the following election:</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; border-left: 4px solid #7c3aed;">
          <h3 style="margin: 0 0 8px; color: #1f2937;">${vote.title}</h3>
          <p style="margin: 0; color: #6b7280;">${vote.description || ''}</p>
          <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">
            Deadline: <strong>${new Date(vote.endDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </p>
        </div>
        <a href="${votingUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Cast Your Vote</a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Your Member Code: <strong>${user.userCode}</strong></p>
        <p style="color: #9ca3af; font-size: 12px;">© 2024 EOPANSE. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: user.email, subject: `EOPANSE Vote: ${vote.title}`, html });
};

const sendRegistrationPendingEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Registration Received</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">EOPANSE</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Dear <strong>${user.name}</strong>,</p>
        <p style="color: #6b7280;">Thank you for registering with EOPANSE. Your registration is currently under review.</p>
        <p style="color: #6b7280;">Once your payment is confirmed and your account is activated by an admin, you will receive a confirmation email.</p>
        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #fbbf24;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Note:</strong> Please ensure your registration payment of ₦${user.registrationFee || process.env.REGISTRATION_FEE} has been made to activate your account.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">© 2024 EOPANSE. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'EOPANSE - Registration Received', html });
};

module.exports = { sendEmail, sendWelcomeEmail, sendVotingLinkEmail, sendRegistrationPendingEmail };
