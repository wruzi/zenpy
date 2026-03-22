const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', '..', 'database', 'data');
const scrubFiles = [
  'activity_log.json',
  'banned.json',
  'direct_messages.json',
  'follows.json',
  'global_chat_messages.json',
  'progress.json',
  'users.json'
];
for (const file of scrubFiles) {
  fs.writeFileSync(path.join(base, file), '[]', 'utf8');
}
console.log('cleared', scrubFiles.length, 'files');
