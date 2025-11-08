#!/usr/bin/env node

/**
 * Generate Ethereal Email Test Account
 * This script creates a free test email account for development
 */

const nodemailer = require('nodemailer');

console.log('🚀 Generating Ethereal Email test account...\n');

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('❌ Failed to create test account:', err.message);
    process.exit(1);
  }

  console.log('✅ Test account created successfully!\n');
  console.log('📧 Email Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`User:     ${account.user}`);
  console.log(`Password: ${account.pass}`);
  console.log(`Host:     ${account.smtp.host}`);
  console.log(`Port:     ${account.smtp.port}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📝 Update your .env file with these values:\n');
  console.log('EMAIL_SERVER_HOST="smtp.ethereal.email"');
  console.log('EMAIL_SERVER_PORT="587"');
  console.log(`EMAIL_SERVER_USER="${account.user}"`);
  console.log(`EMAIL_SERVER_PASSWORD="${account.pass}"`);
  console.log('EMAIL_FROM="Pacific Explorer <noreply@pacificexplorer.com>"\n');

  console.log('🌐 View sent emails at: https://ethereal.email/messages');
  console.log(`   Login with: ${account.user} / ${account.pass}\n`);
  
  console.log('💡 Tip: After updating .env, restart your dev server:');
  console.log('   Press Ctrl+C in the terminal running npm run dev');
  console.log('   Then run: npm run dev\n');
});
