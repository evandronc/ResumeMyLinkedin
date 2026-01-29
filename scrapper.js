// scrapper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

ResumeMyLinkedin.Scraper = {
  async run(tabId) {
    console.log("[SCRAPPER] run started");

    // -------------------------------------------------
    // CONTACT (First, to allow page load/wait)
    // -------------------------------------------------
    console.log("[SCRAPPER] Executing contact scraper");

    const contactResult = await chrome.scripting.executeScript({
      target: { tabId },
      func: ResumeMyLinkedin.ContactScraper.scrapeFromLivePage
    });

    console.log("[SCRAPPER] Raw contactResult:", contactResult);

    const contact = contactResult?.[0]?.result || null;

    console.log("[SCRAPPER] Contact after execution:", contact);

    // -------------------------------------------------
    // SNAPSHOT DOM (Now that we waited for contact)
    // -------------------------------------------------
    const domResult = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({
        html: document.documentElement.outerHTML
      })
    });

    console.log(
      "[SCRAPPER] Snapshot received:",
      !!domResult?.[0]?.result?.html
    );

    const parser = new DOMParser();
    const doc = parser.parseFromString(
      domResult[0].result.html,
      "text/html"
    );
    const logs = [];

    // Helper to find section by ID or Title
    const findSection = (doc, id, titleText) => {
      // 1. Try ID
      let section = doc.querySelector(`#${id}`);
      if (section) return section.closest('section') || section;

      // 2. Try Title (H2 > span[aria-hidden="true"])
      const h2s = Array.from(doc.querySelectorAll('h2 span[aria-hidden="true"]'));
      const foundH2 = h2s.find(span => span.textContent.trim() === titleText);
      if (foundH2) {
        return foundH2.closest('section');
      }
      return null;
    };

    // -------------------------------------------------
    // EXPERIENCE / EDUCATION / VOLUNTEERING
    // -------------------------------------------------
    const experienceSection = findSection(doc, 'experience', 'Experience');
    const experienceEntities = experienceSection
      ? Array.from(
        experienceSection
          .querySelectorAll(
            'div[data-view-name="profile-component-entity"]'
          )
      )
      : [];

    const experience =
      ResumeMyLinkedin.ExperienceScraper.scrape(experienceEntities, logs);

    // Pass the found section logic helper or the root doc?
    // EducationScraper and AboutScraper take 'doc'. 
    // We can just rely on them doing their own robust lookup?
    // No, better to pass the section directly or update them to do robust lookup.
    // For now, let's update them to accept the 'doc' but implement robust lookup inside them.

    const education =
      ResumeMyLinkedin.EducationScraper.scrape(doc, logs);

    const volunteering =
      ResumeMyLinkedin.VolunteeringScraper.scrape(doc, logs);

    const about =
      ResumeMyLinkedin.AboutScraper.scrape(doc, logs);

    return { contact, about, experience, education, volunteering, logs };
  }
};
