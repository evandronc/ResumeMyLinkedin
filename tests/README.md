# ResumeMyLinkedin Tests

This directory contains automated tests to validate the extension's functionality.

## 1. Static Validation Tests (`run by default`)
These tests run automatically whenever you package the extension using `./package-extension.sh`.
- **File Existence**: Checks that all required files (manifest, HTML, JS, icons) are present.
- **Scraper Structure**: Validates syntax and namespace definitions in scraper files.
- **Remote Code Detection**: Ensures no remote code (e.g., CDN links) is included, which would violate Chrome Web Store policies.

## 2. End-to-End (E2E) Scraping Test (`optional`)
This test opens a real browser, navigates to your LinkedIn profile, and:
1. Executes the actual scraping logic to verify data extraction.
2. **Simulates PDF and DOCX generation** using the scraped data to ensure the generators don't crash and the data structure is valid.

## 3. Manual Verification
**Option A: Verify Extraction Logic (if modal is open)**
Run `tests/verify-contact.js` in the console.

**Option B: Verify Full Flow (Click + Wait + Extract)**
If the modal fails to open or load, run `tests/debug-contact-flow.js` in the console. This simulates the exact behavior of the extension.

### Prerequisites
You need Node.js and Puppeteer installed:
```bash
npm install puppeteer
```

### Running the E2E Test
```bash
node tests/e2e-scrape-test.js
```
*Note: You must be logged into LinkedIn in the browser instance that Puppeteer launches, or the test might fail to find the "Contact info" link. The script launches a headful browser, so you can log in manually if needed.*

### Integration with Packaging
The `package-extension.sh` script will automatically detect if Puppeteer is installed and run this test before creating the zip file.
