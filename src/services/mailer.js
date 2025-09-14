import nodemailer from 'nodemailer';
import 'dotenv/config';
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendResetEmail = async (to, link) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Password reset',
      html: `<p>Щоб скинути пароль, перейдіть за посиланням:</p>
             <a href="${link}">${link}</a>
             <p>Посилання дійсне 5 хвилин.</p>`,
    });
    console.log('Email sent: ', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};
