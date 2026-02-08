#!/bin/bash

# Chrome Extension Packaging Script
# This script creates a clean zip file for Chrome Web Store upload

echo "🚀 Creating Chrome Extension Package..."
echo ""

# Run automated tests first
echo "Running automated tests..."
if bash test-scrapers.sh; then
    echo ""
else
    echo "❌ Tests failed! Fix the issues before packaging."
    exit 1
fi

# Run Retry Logic Unit Test
echo "Running Retry Logic Unit Test..."
if node tests/test-retry-logic.js; then
    echo ""
else
    echo "❌ Retry Logic Test failed!"
    exit 1
fi

# Run E2E test if Puppeteer is available
if npm list puppeteer >/dev/null 2>&1; then
    echo "Running End-to-End Scraping Test..."
    if node tests/e2e-scrape-test.js; then
        echo ""
    else
        echo "❌ E2E Test failed! Fix the issues before packaging."
        exit 1
    fi
else
    echo "⚠️  Skipping E2E test (Puppeteer not installed). Run 'npm install puppeteer' to enable."
    echo ""
fi

# Define the output zip file name
OUTPUT_ZIP="ResumeMyLinkedin-v1.0.3.zip"

# Remove old zip if it exists
if [ -f "$OUTPUT_ZIP" ]; then
    rm "$OUTPUT_ZIP"
    echo "✓ Removed old zip file"
fi

# Create zip with only necessary files, excluding development files
zip -r "$OUTPUT_ZIP" \
    manifest.json \
    popup.html \
    popup.js \
    logger.js \
    scrapper.js \
    contactScraper.js \
    aboutScraper.js \
    experienceScraper.js \
    educationScraper.js \
    volunteeringScraper.js \
    pdfGenerator.js \
    docxGenerator.js \
    downloader.js \
    jspdf.umd.min.js \
    docx.min.js \
    icons/icon16.png \
    icons/icon32.png \
    icons/icon48.png \
    icons/icon128.png \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    -x ".git/*" \
    -x "*.md" \
    -x "HTML/*" \
    -x "images/*" \
    -x "PrintScreen/*"

echo ""
echo "✅ Package created: $OUTPUT_ZIP"
echo ""
echo "📦 Package contents:"
unzip -l "$OUTPUT_ZIP"
echo ""
echo "📊 Package size:"
ls -lh "$OUTPUT_ZIP"
echo ""
echo "🎉 Ready to upload to Chrome Web Store!"
