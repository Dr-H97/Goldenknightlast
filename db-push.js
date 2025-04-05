/**
 * Script to push database schema changes
 */
require('dotenv').config();
const { exec } = require('child_process');

// Run drizzle-kit push
console.log('Pushing database schema changes...');
exec('npx drizzle-kit push', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  console.log(`${stdout}`);
  console.log('Database schema updated successfully!');
});