Daily email job

This project includes a scheduled job that sends a simple daily email to every user in the database.

Environment variables required:

- SMTP_HOST — SMTP server hostname (e.g., smtp.gmail.com)
- SMTP_PORT — SMTP server port (e.g., 587)
- SMTP_USER — SMTP username
- SMTP_PASS — SMTP password
- EMAIL_FROM — Sender address used in "From" header (optional, default: no-reply@example.com)

Resend (alternative to SMTP):

- RESEND_API_KEY — Your Resend API key. If set, the project will use Resend to send emails instead of SMTP. Set `EMAIL_FROM` as the sender address as well.

Optional:

- SMTP_SECURE — set to "true" to use an SSL/TLS connection (commonly used for port 465)
- DAILY_EMAIL_CRON — cron expression for schedule (default: '0 8 * * *' => every day at 08:00 server time)
- TIMEZONE — timezone string for the cron scheduler (e.g., 'America/New_York')

How it works:

- When the app boots it requires `jobs/dailyEmailJob.js`, which schedules the cron job.
- The job queries the `users` collection and sends a plain-text email to each user's `email`.

Testing locally:

- You can use a test SMTP server like Mailtrap, Ethereal, or Gmail (with an App Password) during development.
- Alternatively, set `DAILY_EMAIL_CRON` to a short-running cron like `*/1 * * * *` (every minute) while testing, then revert it.

Security:

- Do not commit credentials to source control. Use environment variables or a secrets manager.
