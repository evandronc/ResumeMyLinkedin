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
      about,
      experience,
      education,
      volunteering,
      logs
    } = await ResumeMyLinkedin.Scraper.run(tab.id);

    console.log("CONTACT final:", contact);

    if (!experience.length && !education.length && !about) {
      ResumeMyLinkedin.Logger.log("No data extracted");
      return;
    }

    const usePdf = document.getElementById("format-pdf").checked;
    const useDocx = document.getElementById("format-docx").checked;

    if (!usePdf && !useDocx) {
      ResumeMyLinkedin.Logger.log("Please select at least one output format.");
      return;
    }

    ResumeMyLinkedin.Logger.log("Generating resume…");

    if (usePdf) {
      ResumeMyLinkedin.Logger.log("Creating PDF...");
      ResumeMyLinkedin.PdfGenerator.generate(
        contact,
        about,
        experience,
        education,
        volunteering,
        logs
      );
    }

    if (useDocx) {
      ResumeMyLinkedin.Logger.log("Creating DOCX...");
      ResumeMyLinkedin.DocxGenerator.generate(
        contact,
        about,
        experience,
        education,
        volunteering,
        logs
      );
    }

  } catch (err) {
    ResumeMyLinkedin.Logger.log(`ERROR: ${err.message}`);
    console.error(err);
  }
};
