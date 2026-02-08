const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const PROFILE_URL = 'https://www.linkedin.com/in/evandrocorreia/';
const TIMEOUT = 60000; // 60 seconds

(async () => {
    console.log('🚀 Starting End-to-End Scraping Test...');
    console.log(`Target Profile: ${PROFILE_URL}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Run in headful mode to see what's happening
            defaultViewport: null,
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        // Helper to read scraper code
        const readScraper = (filename) => {
            return fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
        };

        // 1. Navigate to LinkedIn Profile
        console.log('1️⃣  Navigating to LinkedIn profile...');
        await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });

        // Check if logged in (profile page should have 'Contact info' link)
        try {
            await page.waitForSelector('a#top-card-text-details-contact-info', { timeout: 10000 });
            console.log('✅ Logged in and on profile page.');
        } catch (e) {
            console.error('❌ Could not find contact info link. Are you logged in?');
            console.error('NOTE: This test requires a logged-in browser session or manual login.');
            // Keep browser open for manual login if needed
            // await new Promise(r => setTimeout(r, 5000));
        }

        // 2. Inject Scraper Scripts
        console.log('2️⃣  Injecting scraper scripts...');

        // Define window.ResumeMyLinkedin
        await page.evaluate(() => {
            window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};
        });

        // Inject each scraper and libraries
        const scripts = [
            'jspdf.umd.min.js',
            'docx.min.js',
            'contactScraper.js',
            'aboutScraper.js',
            'experienceScraper.js',
            'educationScraper.js',
            'volunteeringScraper.js',
            'pdfGenerator.js',
            'docxGenerator.js'
        ];

        for (const script of scripts) {
            const content = readScraper(script);
            // We wrap the content in a function or execute it directly?
            // The scrapers define methods on window.ResumeMyLinkedin, so direct eval is fine.
            await page.evaluate(content);
            console.log(`   - Injected ${script}`);
        }

        // 3. Execute Scraping Logic
        console.log('3️⃣  Executing scraping logic...');

        const scrapedData = await page.evaluate(async () => {
            const results = {
                logs: []
            };

            const log = (msg) => results.logs.push(msg);

            // A. Contact Info
            log('Scraping Contact Info...');
            try {
                if (window.ResumeMyLinkedin.ContactScraper) {
                    results.contact = await window.ResumeMyLinkedin.ContactScraper.scrapeFromLivePage();
                } else {
                    log('Error: ContactScraper not found');
                }
            } catch (e) {
                log(`Contact Scraper Error: ${e.message}`);
            }

            // B. DOM Parsing for other sections
            const doc = document; // We are in the page context already

            // Helper to find section (replicated from scrapper.js logic)
            const findSection = (doc, id, titleText) => {
                let section = doc.querySelector(`#${id}`);
                if (section) return section.closest('section') || section;
                const h2s = Array.from(doc.querySelectorAll('h2 span[aria-hidden="true"]'));
                const foundH2 = h2s.find(span => span.textContent.trim() === titleText);
                if (foundH2) return foundH2.closest('section');
                return null;
            };

            // C. Experience
            log('Scraping Experience...');
            const experienceSection = findSection(doc, 'experience', 'Experience');
            const experienceEntities = experienceSection
                ? Array.from(experienceSection.querySelectorAll('div[data-view-name="profile-component-entity"]'))
                : [];

            if (window.ResumeMyLinkedin.ExperienceScraper) {
                results.experience = window.ResumeMyLinkedin.ExperienceScraper.scrape(experienceEntities, results.logs);
            }

            // D. Education
            log('Scraping Education...');
            if (window.ResumeMyLinkedin.EducationScraper) {
                results.education = window.ResumeMyLinkedin.EducationScraper.scrape(doc, results.logs);
            }

            // E. Volunteering
            log('Scraping Volunteering...');
            if (window.ResumeMyLinkedin.VolunteeringScraper) {
                results.volunteering = window.ResumeMyLinkedin.VolunteeringScraper.scrape(doc, results.logs);
            }

            // F. About
            log('Scraping About...');
            if (window.ResumeMyLinkedin.AboutScraper) {
                results.about = window.ResumeMyLinkedin.AboutScraper.scrape(doc, results.logs);
            }

            return results;
        });

        console.log('✅ Scraping phase complete.');
        console.log('--- Scraped Data Summary ---');
        console.log(`Contact Name: ${scrapedData.contact?.name}`);
        console.log(`Experience Count: ${scrapedData.experience?.length}`);
        console.log(`Education Count: ${scrapedData.education?.length}`);

        // 4. Validate Data Structure (PDF/DOCX Compatibility)
        console.log('\n4️⃣  Validating data structure...');

        let errors = 0;
        const error = (msg) => { console.error(`❌ ${msg}`); errors++; };
        const warn = (msg) => { console.warn(`⚠️  ${msg}`); };

        // Contact
        if (!scrapedData.contact) error('Contact object is missing');
        else {
            if (!scrapedData.contact.name) error('Contact: Name is missing');
            if (!scrapedData.contact.headline) warn('Contact: Headline is missing');
        }

        // Experience
        if (!Array.isArray(scrapedData.experience)) error('Experience is not an array');
        else if (scrapedData.experience.length > 0) {
            const exp = scrapedData.experience[0];
            if (!exp.title && !exp.company) error('Experience[0]: Missing title and company');
        }

        // Education
        if (!Array.isArray(scrapedData.education)) error('Education is not an array');

        // Report
        console.log('\n📊 === TEST REPORT ===');

        if (errors > 0) {
            console.error(`\n❌ TEST FAILED with ${errors} errors.`);
            process.exit(1);
        } else {
            console.log('\n✅ ALL CHECKS PASSED');
        }

        // 5. Simulate Generator Calls
        console.log('\n5️⃣  Simulating PDF and DOCX Generation...');

        // Mock Downloader and jsPDF to prevent actual downloads
        await page.evaluate(() => {
            window.ResumeMyLinkedin.Downloader = {
                download: (blob, filename) => {
                    console.log(`[MOCK] Download triggered: ${filename} (${blob.size} bytes)`);
                    window.lastDownload = { filename, type: 'docx' };
                }
            };

            // Intercept jsPDF save
            if (window.jspdf && window.jspdf.jsPDF) {
                const originalJsPDF = window.jspdf.jsPDF;
                window.jspdf.jsPDF = function (...args) {
                    const doc = new originalJsPDF(...args);
                    doc.save = (filename) => {
                        console.log(`[MOCK] PDF Save triggered: ${filename}`);
                        window.lastDownload = { filename, type: 'pdf' };
                    };
                    return doc;
                };
            }
        });

        const generatorResults = await page.evaluate(async (data) => {
            const genLogs = [];
            let pdfSuccess = false;
            let docxSuccess = false;

            // Try PDF
            try {
                console.log('Generating PDF...');
                window.ResumeMyLinkedin.PdfGenerator.generate(
                    data.contact,
                    data.about,
                    data.experience,
                    data.education,
                    data.volunteering
                );
                if (window.lastDownload && window.lastDownload.type === 'pdf') {
                    genLogs.push(`✅ PDF Generated: ${window.lastDownload.filename}`);
                    pdfSuccess = true;
                } else {
                    // Check if it's because of missing data or logic
                    if (!data.contact?.name) genLogs.push('⚠️  PDF skipped (missing name)');
                    else genLogs.push('❌ PDF Generation ran but no save triggered');
                }
            } catch (e) {
                genLogs.push(`❌ PDF Generation Error: ${e.message}`);
            }

            // Reset download mock
            window.lastDownload = null;

            // Try DOCX
            try {
                console.log('Generating DOCX...');
                // docxGenerator is async (Packer.toBlob)
                window.ResumeMyLinkedin.DocxGenerator.generate(
                    data.contact,
                    data.about,
                    data.experience,
                    data.education,
                    data.volunteering
                );

                // Wait for async download to trigger (simple timeout poll)
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (window.lastDownload && window.lastDownload.type === 'docx') {
                    genLogs.push(`✅ DOCX Generated: ${window.lastDownload.filename}`);
                    docxSuccess = true;
                } else {
                    genLogs.push('❌ DOCX Generation ran but no download triggered');
                }
            } catch (e) {
                genLogs.push(`❌ DOCX Generation Error: ${e.message}`);
            }

            return { genLogs, pdfSuccess, docxSuccess };
        }, scrapedData);

        generatorResults.genLogs.forEach(l => console.log(l));

        console.log('\n📊 === GENERATOR REPORT ===');
        if (generatorResults.pdfSuccess && generatorResults.docxSuccess) {
            console.log('✅ GENERATION SUCCESSFUL');
        } else {
            console.error('❌ GENERATION FAILED');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
