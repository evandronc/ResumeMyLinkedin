const fs = require('fs');
const path = require('path');

// Mock Browser Environment
global.window = {
    ResumeMyLinkedin: {}
};

global.document = {
    querySelector: () => { },
    querySelectorAll: () => [],
    createTreeWalker: () => ({ nextNode: () => null }),
    readyState: 'complete'
};

global.alert = (msg) => console.log(`[ALERT MOCK]: ${msg}`);

// Mock setTimeout to run immediately or quickly
const originalSetTimeout = global.setTimeout;
global.setTimeout = (fn, delay) => {
    // console.log(`[TIMEOUT MOCK] Waiting ${delay}ms...`);
    if (delay > 1000) delay = 10; // Speed up long waits
    else delay = 1;
    return originalSetTimeout(fn, delay);
};

// Load Scraper Code
const scraperCode = fs.readFileSync(path.join(__dirname, '../contactScraper.js'), 'utf8');
eval(scraperCode);

async function runTest() {
    console.log("🧪 Starting Retry Logic Test...");

    // Test Checkpoints
    let clickCount = 0;
    let modalQueryCount = 0;

    // Mock Elements
    const mockTopCard = {
        querySelector: () => ({ innerText: "Evandro User" }),
        querySelectorAll: () => [] // Returns empty array for span search
    };

    const mockLink = {
        click: () => {
            clickCount++;
            console.log(`[MOCK] Link Clicked (Total: ${clickCount})`);
        },
        closest: () => mockTopCard // Return object with querySelectorAll
    };

    const mockModalEmpty = {
        querySelector: () => null,
        querySelectorAll: () => [],
        innerText: "Dialog content start",
        click: () => { }
    };

    const mockModalSuccess = {
        querySelector: (sel) => {
            if (sel.includes('mailto')) return { textContent: "test@example.com" };
            if (sel === 'button[aria-label="Dismiss"]') return { click: () => console.log("[MOCK] Modal Closed") };
            return null;
        },
        querySelectorAll: () => [],
        innerText: "Phone: +1 555-0199",
        click: () => { }
    };

    // Override document.querySelector to simulate state change
    global.document.querySelector = (selector) => {
        // Mock Main Content for Page Ready check
        if (selector === 'main#main-content, main, [role="main"]') return { tagName: 'MAIN' };

        if (selector === 'a#top-card-text-details-contact-info') return mockLink;

        if (selector === 'div.artdeco-modal-overlay') return {}; // Overlay exists

        if (selector === 'div.artdeco-modal') {
            modalQueryCount++;
            // On first attempt (and its polls), return empty
            // On second attempt (after retry wait), return success
            // Note: The scraper polls multiple times per attempt.
            // We need to track *which attempt logic* is running.
            // Simplified: If clickCount is 1, return empty. If clickCount is 2, return success.

            if (clickCount === 1) return mockModalEmpty;
            if (clickCount >= 2) return mockModalSuccess;

            return mockModalEmpty;
        }
        return null;
    };

    // Execute Scraper
    console.log("--- Executing scrapeFromLivePage ---");
    const result = await window.ResumeMyLinkedin.ContactScraper.scrapeFromLivePage();

    console.log("--- Test Finished ---");
    console.log("Result:", result);

    // Assertions
    let passed = true;

    if (clickCount !== 2) {
        console.error(`❌ FAIL: Expected 2 clicks (Retry), got ${clickCount}`);
        passed = false;
    } else {
        console.log("✅ PASS: Retry triggered (2 clicks)");
    }

    if (result.email !== "test@example.com") {
        console.error(`❌ FAIL: Email not extracted. Got: ${result.email}`);
        passed = false;
    } else {
        console.log("✅ PASS: Email extracted on retry");
    }

    if (!passed) process.exit(1);
    console.log("🎉 ALL TESTS PASSED");
}

runTest();
