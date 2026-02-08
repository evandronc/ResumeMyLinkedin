// contactScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

window.ResumeMyLinkedin.ContactScraper = {
  scrapeFromLivePage: async function () {
    console.log("[CONTACT] scrapeFromLivePage invoked");

    const waitFor = async (label, fn, tries = 50, delay = 200) => {
      for (let i = 0; i < tries; i++) {
        const res = fn();
        if (res) {
          console.log(`[CONTACT] waitFor(${label}) success on attempt ${i + 1}`);
          return res;
        }
        await new Promise(r => setTimeout(r, delay));
      }
      console.log(`[CONTACT] waitFor(${label}) FAILED after ${tries} attempts`);
      return null;
    };

    const result = {
      name: null,
      headline: null,
      location: null,
      linkedin: null,
      phone: null,
      email: null
    };

    // -------------------------------------------------
    // WAIT FOR PAGE TO BE FULLY LOADED
    // -------------------------------------------------
    console.log("[CONTACT] Checking page readiness...");

    // Wait for document to be fully loaded
    const waitForPageReady = async () => {
      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        // Check if document is complete
        if (document.readyState === 'complete') {
          console.log("[CONTACT] Document readyState is complete");

          // Additional check: ensure main content is loaded
          const mainContent = document.querySelector('main#main-content, main, [role="main"]');
          if (mainContent) {
            console.log("[CONTACT] Main content found");
            // Wait a bit more for dynamic content to settle
            await new Promise(r => setTimeout(r, 1500));
            return true;
          }
        }

        console.log(`[CONTACT] Page not ready yet (attempt ${attempts + 1}/${maxAttempts}), readyState: ${document.readyState}`);
        await new Promise(r => setTimeout(r, 200));
        attempts++;
      }

      console.log("[CONTACT] ⚠️ Page readiness timeout, proceeding anyway");
      return false;
    };

    await waitForPageReady();

    // -------------------------------------------------
    // ANCHOR: Contact Info link (stable)
    // -------------------------------------------------
    const contactLink = await waitFor(
      "contact link",
      () => document.querySelector('a#top-card-text-details-contact-info')
    );

    if (!contactLink) {
      console.log("[CONTACT] ❌ Contact link not found");
      return result;
    }

    console.log("[CONTACT] ✅ Contact link found");

    // -------------------------------------------------
    // TOP CARD CONTAINER (walk upward)
    // -------------------------------------------------
    let topCard = contactLink.closest("section");

    if (!topCard) {
      let candidate = contactLink.closest("div");
      // Walk up to find the container with the name (H1)
      let levels = 0;
      while (candidate && levels < 15) {
        if (candidate.tagName === 'BODY') break;
        if (candidate.querySelector("h1")) {
          topCard = candidate;
          break;
        }
        candidate = candidate.parentElement;
        levels++;
      }
    }

    if (!topCard) {
      console.log("[CONTACT] ❌ Top card container not found");
    } else {
      console.log("[CONTACT] ✅ Top card container resolved");
    }

    if (topCard) {
      const getText = el =>
        el?.innerText?.replace(/\s+/g, " ").trim() || null;

      result.name = getText(topCard.querySelector("h1"));

      result.headline = getText(
        topCard.querySelector("div.text-body-medium")
      );

      const locationCandidates = Array.from(
        topCard.querySelectorAll("span")
      ).map(getText);

      result.location =
        locationCandidates.find(t => t && t.includes(",")) || null;
    }

    console.log("[CONTACT] After top card extraction:", result);

    // -------------------------------------------------
    // HELPER: Single Scraping Attempt
    // -------------------------------------------------
    const attemptScrape = async (attemptIndex) => {
      console.log(`[DEBUG] Scrape Attempt ${attemptIndex + 1} started...`);

      let localResult = { ...result }; // Clone base structure

      // 1. Locate and Click Link
      const contactLink = document.querySelector('a#top-card-text-details-contact-info');
      if (!contactLink) {
        console.error("[DEBUG] ❌ Contact link not found");
        return null;
      }
      contactLink.click();
      console.log("[DEBUG] Contact link clicked. Waiting for modal...");

      // 2. Wait for Modal Container
      const modal = await waitFor(
        "modal container",
        () => document.querySelector("div.artdeco-modal")
      );

      if (!modal) {
        console.error("[DEBUG] ❌ Modal container NOT found!");
        return null;
      }
      console.log("[DEBUG] ✅ Modal container found. Polling for content...");

      // 3. Poll for Content
      const maxRetries = 20; // 20 * 100ms = 2 seconds polling per attempt (Reduced from 4s)
      let attempts = 0;
      let success = false;

      while (attempts < maxRetries) {
        // A. LinkedIn URL
        const linkedinAnchor = modal.querySelector('div.pv-contact-info__ci-container.t-14 a[href^="https://www.linkedin.com/in/"]');
        if (linkedinAnchor) localResult.linkedin = linkedinAnchor.href;

        // B. Email
        const emailSection = modal.querySelector('section.ci-email');
        if (emailSection) {
          const a = emailSection.querySelector('a');
          if (a) localResult.email = a.textContent.trim();
        } else {
          const a = modal.querySelector('a[href^="mailto:"]');
          if (a) localResult.email = a.textContent.trim();
        }

        // C. Phone
        const phoneSection = modal.querySelector('section.ci-phone');
        if (phoneSection) {
          // Try multiple spans/list items
          const nums = Array.from(phoneSection.querySelectorAll('ul li span:not(.t-bold)'));
          if (nums.length > 0) localResult.phone = nums.map(s => s.textContent.trim()).join(', ');
          else {
            const s = phoneSection.querySelector('span:not(.t-bold)');
            if (s) localResult.phone = s.textContent.trim();
          }
        }

        // Phone Fallback (Regex)
        if (!localResult.phone) {
          const match = modal.innerText.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{2,3}\)?[ -]?\d{4,5}[ -]?\d{4}/);
          if (match) localResult.phone = match[0];
        }

        // Success Condition: Email OR Phone found
        if (localResult.email || localResult.phone) {
          success = true;
          break;
        }
        await new Promise(r => setTimeout(r, 100)); // OPTIMIZED: 100ms poll
        attempts++;
        if (attempts > 5 && (localResult.email || localResult.phone)) break; // Early exit if we found something but not everything? No, condition above handles it.
      }

      // Debug Log on Failure
      if (!success) {
        console.log(`[DEBUG] Attempt ${attemptIndex + 1} failed. Modal Text: ${modal.innerText.substring(0, 50)}...`);
      }

      // Close Modal to reset state for next attempt or cleanup
      const closeBtn = modal.querySelector('button[aria-label="Dismiss"]');
      if (closeBtn) closeBtn.click();
      else {
        // Fallback close
        const overlay = document.querySelector('.artdeco-modal-overlay');
        if (overlay) overlay.click();
      }

      // Ensure modal is gone before returning (optional but safer)
      await new Promise(r => setTimeout(r, 50)); // OPTIMIZED: 50ms cleanup

      return success ? localResult : null;
    };

    // -------------------------------------------------
    // MAIN EXECUTION LOOP (2 Attempts)
    // -------------------------------------------------
    let finalResult = null;

    for (let i = 0; i < 2; i++) {
      finalResult = await attemptScrape(i);
      if (finalResult) {
        console.log(`[DEBUG] ✅ Attempt ${i + 1} successful!`);
        break;
      }

      if (i === 0) {
        console.log(`[DEBUG] ⚠️ Attempt 1 failed. Retrying in 500ms...`);
        await new Promise(r => setTimeout(r, 500)); // OPTIMIZED: 500ms retry wait
      }
    }

    if (!finalResult) {
      const msg = "[ResumeMyLinkedin] Error: Could not extract contact info after 2 attempts.\nPlease check your internet connection or if the profile has public contact info.";
      console.error(msg);
      // alert(msg);
      return result; // Return empty structure
    }

    console.log("[CONTACT] Final Result:", finalResult);
    // alert("Success! Contact info extracted."); 

    return finalResult;
  }
};
