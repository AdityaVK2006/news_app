const cron = require('node-cron');
const User = require('../models/user');
const resend = require('../config/resend');
const newsapi = require('../config/newsapi');

// Fetches top news articles
async function getTopNews() {
  try {
    const response = await newsapi.v2.topHeadlines({
      language: 'en',
      pageSize: 5
    });
    return response.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

// Formats news articles into HTML
function formatNewsHtml(articles) {
  if (!articles || articles.length === 0) {
    return '<p>No news articles available at the moment.</p>';
  }

  return articles.map(article => `
    <div style="margin-bottom: 20px;">
      <h3><a href="${article.url}" style="color: #1a73e8; text-decoration: none;">${article.title}</a></h3>
      ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" style="max-width: 100%; height: auto; margin: 10px 0;">` : ''}
      <p>${article.description || ''}</p>
      <p><small>Source: ${article.source.name} | Published: ${new Date(article.publishedAt).toLocaleDateString()}</small></p>
    </div>
  `).join('');
}

// Sends a daily email with top news to every user in the DB
async function sendDailyEmails() {
  try {
    const users = await User.find({});
    if (!users || users.length === 0) {
      console.log('No users found for daily emails.');
      return;
    }

    for (const user of users) {
      const categories = (user.categories && user.categories.length) ? user.categories.join(', ') : 'none';
      const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';  // Use Resend's default sender for testing
      const subject = 'Daily News Update';
      
      // Fetch top news
      const articles = await getTopNews();
      const newsHtml = formatNewsHtml(articles);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Daily News Update</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Here are today's top news stories:</p>
          ${newsHtml}
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            Your subscribed categories: <em>${categories}</em>
          </p>
          <p>— News App</p>
        </div>
      `;

      try {
        console.log(`Attempting to send email to ${user.email} from ${from}`);
        const result = await resend.emails.send({
          from,
          to: user.email,
          subject,
          html
        });
        console.log(`Email sent to ${user.email}, Resend ID: ${result.id || 'unknown'}`);
      } catch (sendErr) {
        console.error(`Failed to send email to ${user.email}:`, sendErr && (sendErr.message || sendErr.toString()));
      }
    }
  } catch (err) {
    console.error('Error while sending daily emails:', err && err.message);
  }
}

// Schedule: default daily at 08:00 server time. Customize via DAILY_EMAIL_CRON env var
// Example cron strings:
// - '0 8 * * *' => every day at 08:00
// - '0 0 * * *' => every day at 00:00

const cronExpression = process.env.DAILY_EMAIL_CRON || '0 8 * * *';

const task = cron.schedule(cronExpression, () => {
  console.log('Running daily email job');
  sendDailyEmails();
}, {
  scheduled: true,
  timezone: process.env.TIMEZONE || undefined
});

module.exports = task;
