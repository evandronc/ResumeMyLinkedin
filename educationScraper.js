// educationScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};
window.ResumeMyLinkedin.EducationScraper = {
  scrape(doc, logs) {
    const education = [];

    // Helper to find section by ID or Title
    const findSection = (doc, id, titleText) => {
      let sc = doc.querySelector(`#${id}`);
      if (sc) return sc.closest('section') || sc;

      const h2s = Array.from(doc.querySelectorAll('h2 span[aria-hidden="true"]'));
      const foundH2 = h2s.find(span => span.textContent.trim() === titleText);
      return foundH2 ? foundH2.closest('section') : null;
    };

    const section = findSection(doc, 'education', 'Education');
    if (!section) return education;

    const entities = section
      .querySelectorAll('div[data-view-name="profile-component-entity"]');

    const getText = (el) =>
      el?.textContent?.replace(/\s+/g, " ").trim() || null;

    const extractDetails = (root) => {
      const spans = root.querySelectorAll(
        'div[class*="inline-show-more-text"] span[aria-hidden="true"]'
      );
      if (!spans.length) return null;
      return Array.from(spans)
        .map(s => s.textContent.trim())
        .join("\n")
        .trim();
    };

    entities.forEach(entity => {
      const institution = getText(
        entity.querySelector('div.hoverable-link-text.t-bold span[aria-hidden="true"]')
      );
      const degree = getText(
        entity.querySelector('span.t-14.t-normal span[aria-hidden="true"]')
      );
      if (!institution || !degree) return;

      education.push({
        institution,
        degree,
        details: extractDetails(entity)
      });
    });

    return education;
  }
};
