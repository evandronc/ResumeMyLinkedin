// Basic validation test for scraper files
const fs = require('fs');
const path = require('path');

const scrapers = [
    'contactScraper.js',
    'aboutScraper.js',
    'experienceScraper.js',
    'educationScraper.js',
    'volunteeringScraper.js',
    'scrapper.js',
    'pdfGenerator.js'
];

let hasErrors = false;

console.log('Validating scraper files...\n');

scrapers.forEach(scraper => {
    const filePath = path.join(__dirname, '..', scraper);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing file: ${scraper}`);
        hasErrors = true;
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for basic structure
    if (!content.includes('window.ResumeMyLinkedin')) {
        console.error(`❌ ${scraper}: Missing ResumeMyLinkedin namespace`);
        hasErrors = true;
    }
    
    // Check for syntax errors (basic)
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        console.error(`❌ ${scraper}: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
        hasErrors = true;
    }
    
    console.log(`✓ ${scraper}`);
});

if (hasErrors) {
    console.error('\n❌ Validation failed!');
    process.exit(1);
} else {
    console.log('\n✅ All scrapers validated successfully!');
    process.exit(0);
}
