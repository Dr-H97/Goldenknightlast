/**
 * Script to generate database migrations
 */
require('dotenv').config();
const { exec } = require('child_process');

// Run drizzle-kit generate
console.log('Generating database migration files...');
exec('npx drizzle-kit generate', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  console.log(`${stdout}`);
  console.log('Database migration files generated successfully!');
});