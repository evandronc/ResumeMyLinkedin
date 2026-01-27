// volunteeringScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

window.ResumeMyLinkedin.VolunteeringScraper = {
  scrape(doc, logs) {
    const volunteering = [];

    const section = doc.querySelector('#volunteering_experience');
    if (!section) return volunteering;

    const entities = section
      .closest('section')
      .querySelectorAll('div[data-view-name="profile-component-entity"]');

    const getText = (el) =>
      el?.innerText?.replace(/\s+/g, " ").trim() || null;

    const extractDescription = (root) => {
      const spans = root.querySelectorAll(
        'div[class*="inline-show-more-text"] span[aria-hidden="true"]'
      );
      if (!spans.length) return null;
      return Array.from(spans)
        .map(s => s.innerText.trim())
        .join("\n")
        .trim();
    };

    entities.forEach(entity => {
      const role = getText(
        entity.querySelector('div.hoverable-link-text.t-bold span[aria-hidden="true"]')
      );

      const organization = getText(
        entity.querySelector('span.t-14.t-normal span[aria-hidden="true"]')
      );

      const dateText = getText(
        entity.querySelector('span.pvs-entity__caption-wrapper[aria-hidden="true"]')
      );

      if (!role || !organization || !dateText) return;

      let dateRange = null;
      let duration = null;

      if (dateText.includes("·")) {
        [dateRange, duration] = dateText.split("·").map(s => s.trim());
      }

      // Volunteering category / cause
      const categorySpans = entity.querySelectorAll(
        'div.pvs-entity__sub-components span[aria-hidden="true"]'
      );

      const category = categorySpans.length
        ? Array.from(categorySpans)
            .map(s => s.innerText.trim())
            .filter(Boolean)
            .join(", ")
        : null;

      volunteering.push({
        organization,
        role,
        dateRange,
        duration,
        category,
        description: extractDescription(entity)
      });
    });

    return volunteering;
  }
};
