const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://770c0eb0-ea44-423a-bcae-0704eaf85366-00-3aex3huoublv2.worf.replit.dev/attached_assets/logo.png';
const outputPath = path.join(__dirname, 'web', 'public', 'images', 'logo.png');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: ${response.statusCode}`);
    return;
  }
  
  const fileStream = fs.createWriteStream(outputPath);
  response.pipe(fileStream);
  
  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`Downloaded logo to ${outputPath}`);
  });
  
  fileStream.on('error', (err) => {
    console.error(`Error writing file: ${err.message}`);
  });
}).on('error', (err) => {
  console.error(`Error downloading: ${err.message}`);
});