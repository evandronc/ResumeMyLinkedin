ResumeMyLinkedin.Logger.init();

document.getElementById("generate").onclick = async () => {
  ResumeMyLinkedin.Logger.log("Starting ResumeMyLinkedin…");

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.url?.startsWith("https://www.linkedin.com/in")) {
    ResumeMyLinkedin.Logger.log("ERROR: Not a LinkedIn profile");
    return;
  }

  try {
    const {
      contact,
      experience,
      education,
      volunteering,
      logs
    } = await ResumeMyLinkedin.Scraper.run(tab.id);

    console.log("CONTACT final:", contact);

    if (!experience.length && !education.length) {
      ResumeMyLinkedin.Logger.log("No data extracted");
      return;
    }

    ResumeMyLinkedin.Logger.log("Generating resume…");

    ResumeMyLinkedin.DocxGenerator.generate(
      contact,
      experience,
      education,
      volunteering,
      logs
    );

  } catch (err) {
    ResumeMyLinkedin.Logger.log(`ERROR: ${err.message}`);
    console.error(err);
  }
};
