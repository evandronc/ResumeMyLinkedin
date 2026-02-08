// Copy and paste this into your browser console on your LinkedIn profile page.
// This script simulates the full "Generate PDF" contact extraction flow.

(async () => {
    console.log("🚀 Starting Debug Contact Flow...");

    // Helper: Wait function
    const waitFor = async (label, fn, tries = 50, delay = 200) => {
        for (let i = 0; i < tries; i++) {
            const res = fn();
            if (res) return res;
            await new Promise(r => setTimeout(r, delay));
        }
        console.error(`❌ Timeout waiting for: ${label}`);
        return null;
    };

    // 1. Find Link
    const contactLink = document.querySelector('a#top-card-text-details-contact-info');
    if (!contactLink) {
        console.error("❌ Contact link NOT found (Selector: a#top-card-text-details-contact-info)");
        return;
    }
    console.log("✅ Contact link found.");

    // 2. Click Link
    contactLink.click();
    console.log("🖱️ Clicked contact link. Waiting for modal...");

    // 3. Wait for Modal
    const modal = await waitFor("modal", () => document.querySelector("div.artdeco-modal"));
    if (!modal) {
        console.error("❌ Modal did not appear!");
        return;
    }
    console.log("✅ Modal appeared.");

    // 4. Poll for Content
    let attempts = 0;
    const maxRetries = 30; // 6 seconds

    while (attempts < maxRetries) {
        const email = modal.querySelector('a[href^="mailto:"]');
        const phoneSection = modal.innerText.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{2,3}\)?[ -]?\d{4,5}[ -]?\d{4}/);
        const keywords = ['Phone', 'Mobile', 'Celular'].some(k => modal.innerText.includes(k));

        if (email || phoneSection || keywords) {
            console.log(`✅ Content found on attempt ${attempts + 1}`);
            console.log("   - Email:", email ? email.innerText : "Not found");
            console.log("   - Phone Regex:", phoneSection ? phoneSection[0] : "Not found");

            // Close modal
            const closeBtn = modal.querySelector('button[aria-label="Dismiss"]');
            if (closeBtn) closeBtn.click();
            return;
        }

        await new Promise(r => setTimeout(r, 200));
        attempts++;
    }

    console.error("❌ Timed out waiting for content (Email/Phone) inside modal.");
    console.log("Modal Text Content:", modal.innerText);
})();
