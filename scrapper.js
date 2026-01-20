// scrapper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

ResumeMyLinkedin.Scraper = {
  async run(tabId) {
    console.log("[SCRAPPER] run started");

    // Snapshot DOM
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

    // -------------------------------------------------
    // CONTACT
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
    // EXPERIENCE / EDUCATION / VOLUNTEERING
    // -------------------------------------------------
    const experienceSection = doc.querySelector("#experience");
    const experienceEntities = experienceSection
      ? Array.from(
          experienceSection
            .closest("section")
            .querySelectorAll(
              'div[data-view-name="profile-component-entity"]'
            )
        )
      : [];

    const experience =
      ResumeMyLinkedin.ExperienceScraper.scrape(experienceEntities, logs);

    const education =
      ResumeMyLinkedin.EducationScraper.scrape(doc, logs);

    const volunteering =
      ResumeMyLinkedin.VolunteeringScraper.scrape(doc, logs);

    return { contact, experience, education, volunteering, logs };
  }
};
