// contactScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

window.ResumeMyLinkedin.ContactScraper = {
  scrapeFromLivePage: async function () {
    console.log("[CONTACT] scrapeFromLivePage invoked");

    const waitFor = async (label, fn, tries = 30, delay = 100) => {
      for (let i = 0; i < tries; i++) {
        const res = fn();
        if (res) {
          console.log(`[CONTACT] waitFor(${label}) success`);
          return res;
        }
        await new Promise(r => setTimeout(r, delay));
      }
      console.log(`[CONTACT] waitFor(${label}) FAILED`);
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
    const topCard =
      contactLink.closest("section") ||
      contactLink.closest("div");

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
    // CONTACT INFO MODAL
    // -------------------------------------------------
    contactLink.click();
    console.log("[CONTACT] Contact link clicked");

    const overlay = await waitFor(
      "modal overlay",
      () => document.querySelector("div.artdeco-modal-overlay")
    );

    if (!overlay) {
      console.log("[CONTACT] ❌ Modal overlay not found");
      return result;
    }

    const modal = overlay.querySelector("div.artdeco-modal");
    if (!modal) return result;

    const linkedinAnchor = modal.querySelector(
      'a[href^="https://www.linkedin.com/in/"]'
    );
    if (linkedinAnchor) result.linkedin = linkedinAnchor.href;

    const emailAnchor = modal.querySelector('a[href^="mailto:"]');
    if (emailAnchor) result.email = emailAnchor.innerText.trim();

    const phoneSection = Array.from(
      modal.querySelectorAll("section")
    ).find(sec =>
      sec.querySelector("h3")?.innerText.trim() === "Phone"
    );

    if (phoneSection) {
      const phoneSpan = phoneSection.querySelector("span");
      if (phoneSpan) result.phone = phoneSpan.innerText.trim();
    }

    console.log("[CONTACT] Final extracted result:", result);

    return result;
  }
};
