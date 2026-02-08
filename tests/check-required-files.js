// Check that all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'scrapper.js',
    'contactScraper.js',
    'aboutScraper.js',
    'experienceScraper.js',
    'educationScraper.js',
    'volunteeringScraper.js',
    'pdfGenerator.js',
    'jspdf.umd.min.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png'
];

let missingFiles = [];

console.log('Checking required files...\n');

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing: ${file}`);
        missingFiles.push(file);
    } else {
        console.log(`✓ ${file}`);
    }
});

if (missingFiles.length > 0) {
    console.error(`\n❌ ${missingFiles.length} required file(s) missing!`);
    process.exit(1);
} else {
    console.log('\n✅ All required files present!');
    process.exit(0);
}
