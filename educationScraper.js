// educationScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};
window.ResumeMyLinkedin.EducationScraper = {
  scrape(doc, logs) {
    const education = [];

    const section = doc.querySelector('#education');
    if (!section) return education;

    const entities = section
      .closest('section')
      .querySelectorAll('div[data-view-name="profile-component-entity"]');

    const getText = (el) =>
      el?.innerText?.replace(/\s+/g, " ").trim() || null;

    const extractDetails = (root) => {
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
