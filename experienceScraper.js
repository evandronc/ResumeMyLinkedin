// experienceScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

window.ResumeMyLinkedin.ExperienceScraper = {
  scrape(entities, logs) {
    const companies = [];
    const consumed = new Set();

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

    const hasDuration = (dateText) =>
      !!dateText && dateText.includes("·") && !dateText.includes("null");

    const isVolunteering = (text) =>
      !!text && /volunt|voluntári|volunteer/i.test(text);

    // -------- Multi-role companies --------
    entities.forEach(entity => {
      if (consumed.has(entity)) return;

      const company = getText(
        entity.querySelector('div.hoverable-link-text.t-bold span[aria-hidden="true"]')
      );
      const companyDuration = getText(
        entity.querySelector('span.t-14.t-normal span[aria-hidden="true"]')
      );

      if (!company || !companyDuration) return;

      const roleEntities = entity.querySelectorAll(
        ':scope div[data-view-name="profile-component-entity"]'
      );
      if (!roleEntities.length) return;

      const roles = [];

      roleEntities.forEach(roleEl => {
        const title = getText(
          roleEl.querySelector('div.hoverable-link-text.t-bold span[aria-hidden="true"]')
        );
        const dateText = getText(
          roleEl.querySelector('span.pvs-entity__caption-wrapper[aria-hidden="true"]')
        );
        const description = extractDescription(roleEl);

        if (!title || !hasDuration(dateText)) return;
        if (isVolunteering(description)) return;

        const [dateRange, duration] =
          dateText.split("·").map(s => s.trim());

        roles.push({
          title,
          dateRange,
          duration,
          description
        });

        consumed.add(roleEl);
      });

      if (!roles.length) return;

      companies.push({ company, companyDuration, roles });
      consumed.add(entity);
    });

    // -------- Single-role companies --------
    entities.forEach(entity => {
      if (consumed.has(entity)) return;

      const title = getText(
        entity.querySelector('div.hoverable-link-text.t-bold span[aria-hidden="true"]')
      );
      const company = getText(
        entity.querySelector('span.t-14.t-normal span[aria-hidden="true"]')
      );
      const dateText = getText(
        entity.querySelector('span.pvs-entity__caption-wrapper[aria-hidden="true"]')
      );
      const description = extractDescription(entity);

      if (!title || !company || !hasDuration(dateText)) return;
      if (isVolunteering(description)) return;

      const [dateRange, duration] =
        dateText.split("·").map(s => s.trim());

      companies.push({
        company,
        companyDuration: duration,
        roles: [{
          title,
          dateRange,
          duration,
          description
        }]
      });

      consumed.add(entity);
    });

    return companies;
  }
};
