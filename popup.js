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
      ResumeMyLinkedin.Logger.log(`No data extracted. Experience: ${experience.length}, Education: ${education.length}, About: ${!!about}`);
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

// Format option interactivity
document.addEventListener('DOMContentLoaded', () => {

  const pdfOption = document.getElementById('pdf-option');
  const docxOption = document.getElementById('docx-option');
  const formatPdf = document.getElementById('format-pdf');
  const formatDocx = document.getElementById('format-docx');

  if (pdfOption) {
    pdfOption.addEventListener('click', function (e) {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = this.querySelector('input');
        checkbox.checked = !checkbox.checked;
      }
      this.classList.toggle('active', this.querySelector('input').checked);
    });
  }

  if (docxOption) {
    docxOption.addEventListener('click', function (e) {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = this.querySelector('input');
        checkbox.checked = !checkbox.checked;
      }
      this.classList.toggle('active', this.querySelector('input').checked);
    });
  }

  if (formatPdf) {
    formatPdf.addEventListener('change', function () {
      document.getElementById('pdf-option').classList.toggle('active', this.checked);
    });
  }

  if (formatDocx) {
    formatDocx.addEventListener('change', function () {
      document.getElementById('docx-option').classList.toggle('active', this.checked);
    });
  }
});
