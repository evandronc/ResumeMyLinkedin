// docxGenerator.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

ResumeMyLinkedin.DocxGenerator = {
  generate(contact, experience, education, volunteering) {
    const {
      Document,
      Paragraph,
      HeadingLevel,
      TextRun,
      Packer
    } = window.docx;

    const content = [];

    // ===============================
    // HEADER — NAME
    // ===============================
    if (contact?.name) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contact.name,
              bold: true,
              size: 32
            })
          ]
        })
      );
    }

    // ===============================
    // HEADLINE
    // ===============================
    if (contact?.headline) {
      content.push(new Paragraph({ text: contact.headline }));
    }

    // ===============================
    // CONTACT INFO
    // ===============================
    if (contact?.location) content.push(new Paragraph({ text: contact.location }));
    if (contact?.phone) content.push(new Paragraph({ text: contact.phone }));
    if (contact?.email) content.push(new Paragraph({ text: contact.email }));
    if (contact?.linkedin) content.push(new Paragraph({ text: contact.linkedin }));

    content.push(new Paragraph({}));

    // ===============================
    // SEPARATOR
    // ===============================
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "────────────────────────",
            color: "999999"
          })
        ]
      })
    );

    content.push(new Paragraph({}));

    // ===============================
    // PROFESSIONAL EXPERIENCE
    // ===============================
    content.push(
      new Paragraph({
        text: "Professional Experience",
        heading: HeadingLevel.HEADING_1
      })
    );

    experience.forEach(company => {
      // Company
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${company.company} (${company.companyDuration})`,
              bold: true
            })
          ]
        })
      );

      company.roles.forEach(role => {
        // Role header
        content.push(
          new Paragraph({
            text: `${role.title} (${role.dateRange} · ${role.duration})`
          })
        );

        // Description as bullet
        if (role.description) {
          content.push(
            new Paragraph({
              text: role.description,
              bullet: { level: 0 }
            })
          );
        }

        content.push(new Paragraph({}));
      });
    });

    // ===============================
    // VOLUNTEERING
    // ===============================
    if (volunteering?.length) {
      content.push(new Paragraph({}));

      content.push(
        new Paragraph({
          text: "Volunteering",
          heading: HeadingLevel.HEADING_1
        })
      );

      volunteering.forEach(v => {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: v.organization,
                bold: true
              })
            ]
          })
        );

        content.push(
          new Paragraph({
            text: `${v.role} (${v.dateRange} · ${v.duration})`
          })
        );

        if (v.description) {
          content.push(
            new Paragraph({
              text: v.description,
              bullet: { level: 0 }
            })
          );
        }

        content.push(new Paragraph({}));
      });
    }

    // ===============================
    // EDUCATION
    // ===============================
    if (education?.length) {
      content.push(new Paragraph({}));

      content.push(
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_1
        })
      );

      education.forEach(e => {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: e.institution,
                bold: true
              })
            ]
          })
        );

        content.push(new Paragraph({ text: e.degree }));

        if (e.details) {
          content.push(
            new Paragraph({
              text: e.details,
              bullet: { level: 0 }
            })
          );
        }

        content.push(new Paragraph({}));
      });
    }

    // ===============================
    // DOCUMENT + FILENAME
    // ===============================
    const doc = new Document({
      sections: [{ children: content }]
    });

    const safeName =
      contact?.name?.replace(/[^a-zA-Z]/g, "") || "ResumeMyLinkedin";

    Packer.toBlob(doc).then(blob =>
      ResumeMyLinkedin.Downloader.download(blob, `${safeName}.docx`)
    );
  }
};
