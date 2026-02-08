// Check for remote code references
const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'contactScraper.js',
    'aboutScraper.js',
    'experienceScraper.js',
    'educationScraper.js',
    'volunteeringScraper.js',
    'scrapper.js',
    'pdfGenerator.js'
];

const remotePatterns = [
    /https:\/\/cdnjs\.cloudflare\.com/i,
    /https:\/\/cdn\./i,
    /https:\/\/unpkg\.com/i,
    /<script[^>]+src=["']https?:\/\//i
];

let hasRemoteCode = false;

console.log('Checking for remote code references...\n');

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Skipping ${file} (not found)`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    remotePatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            console.error(`❌ ${file}: Found remote code reference: ${matches[0]}`);
            hasRemoteCode = true;
        }
    });
    
    console.log(`✓ ${file}`);
});

if (hasRemoteCode) {
    console.error('\n❌ Remote code detected! This will cause Chrome Web Store rejection.');
    process.exit(1);
} else {
    console.log('\n✅ No remote code references found!');
    process.exit(0);
}
