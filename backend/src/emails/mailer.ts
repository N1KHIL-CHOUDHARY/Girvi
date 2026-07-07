import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../common/logger';

// Create a transporter using nodemailer
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER && env.SMTP_PASSWORD ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      } : undefined
    });
  }
  return transporter;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const isSmtpConfigured = !!(env.SMTP_USER && env.SMTP_PASSWORD);

  if (!isSmtpConfigured) {
    logger.warn(
      { to: options.to, subject: options.subject },
      'SMTP credentials not configured. Console Email Log Fallback below:\n' +
      '---------------------------------------------------\n' +
      `TO: ${options.to}\n` +
      `SUBJECT: ${options.subject}\n` +
      `BODY:\n${options.text}\n` +
      '---------------------------------------------------'
    );
    return;
  }

  try {
    const client = getTransporter();
    await client.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    });
    logger.info({ to: options.to, subject: options.subject }, '✓ Email dispatched successfully');
  } catch (error) {
    logger.error(
      { error, to: options.to, subject: options.subject },
      'Email dispatch failed. Logging body to console fallback:\n' +
      `BODY:\n${options.text}`
    );
  }
};
