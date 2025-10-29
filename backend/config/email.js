const nodemailer = require('nodemailer');

// Configure transporter using environment variables.
// Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Optional: SMTP_SECURE ("true"/"false"), EMAIL_FROM

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: process.env.SMTP_SECURE === 'true' || false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter (will attempt a connection when required)
transporter.verify().then(() => {
  console.log('Email transporter is ready');
}).catch(err => {
  console.warn('Email transporter verification failed:', err && err.message);
});

module.exports = transporter;
