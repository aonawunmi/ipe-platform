/**
 * Password Hash Generator for Production Setup
 *
 * Usage:
 *   node generate-password.js "YourPassword123!"
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: No password provided');
  console.log('\nUsage:');
  console.log('  node generate-password.js "YourPassword123!"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n🔐 Password Hash Generated:\n');
  console.log(hash);
  console.log('\n📋 Use this in your SQL INSERT statement:');
  console.log(`\npassword_hash: '${hash}'`);
  console.log('\n');
}).catch((error) => {
  console.error('❌ Error generating hash:', error);
  process.exit(1);
});
