#!/bin/bash

# test-scrapers.sh
# Automated tests for LinkedIn scraping functionality

set -e

echo "🧪 Testing ResumeMyLinkedin Scrapers..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_file="$2"
    
    echo -n "Testing $test_name... "
    
    if node "$test_file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Check if test files exist
if [ ! -d "tests" ]; then
    echo -e "${YELLOW}⚠️  No tests directory found. Creating basic validation tests...${NC}"
    mkdir -p tests
fi

# Create basic syntax validation test
cat > tests/validate-scrapers.js << 'EOF'
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
EOF

# Create test for remote code detection
cat > tests/check-remote-code.js << 'EOF'
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
EOF

# Create test for required files
cat > tests/check-required-files.js << 'EOF'
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
EOF

# Run tests
echo "Running validation tests..."
echo ""

run_test "File existence" "tests/check-required-files.js"
run_test "Scraper structure" "tests/validate-scrapers.js"
run_test "Remote code detection" "tests/check-remote-code.js"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Some tests failed. Please fix the issues before packaging.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi
