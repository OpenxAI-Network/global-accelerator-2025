import nodemailer from 'nodemailer';

// Create a single test account and transporter instance to be reused.
let transporter: nodemailer.Transporter;
let testAccount: nodemailer.TestAccount;

async function initializeEmailService() {
  if (transporter) {
    return;
  }
  
  // Generate a test account with Ethereal
  testAccount = await nodemailer.createTestAccount();

  console.log('********************************************************');
  console.log('** Ethereal Email Account for Development **');
  console.log(`** User: ${testAccount.user}`);
  console.log(`** Pass: ${testAccount.pass}`);
  console.log('** View emails at: https://ethereal.email/login');
  console.log('********************************************************');

  // Create a transporter object using the Ethereal account
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Call initialization to set up the service when the module is loaded.
initializeEmailService();

/**
 * Sends a 6-digit OTP to the specified email address.
 * @param to The recipient's email address.
 * @param otp The 6-digit one-time password.
 */
export const sendOtpEmail = async (to: string, otp: string) => {
  if (!transporter) {
    console.error('Email service is not initialized. Retrying...');
    await initializeEmailService();
    if (!transporter) {
      throw new Error('Failed to initialize email service after retry.');
    }
  }

  const mailOptions = {
    from: '"Campus Marketplace" <no-reply@campusmarketplace.com>',
    to: to,
    subject: 'Your One-Time Password (OTP)',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2>Your One-Time Password</h2>
        <p>Use the following code to complete your action. This code is valid for 10 minutes.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
          ${otp}
        </p>
        <p style="font-size: 12px; color: #888;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}.`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
};