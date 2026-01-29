// pdfGenerator.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

ResumeMyLinkedin.PdfGenerator = {
  generate(contact, about, experience, education, volunteering) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20; // Start position
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 6;

    const checkPageBreak = (neededSpace) => {
      if (y + neededSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = 20;
      }
    };

    const addText = (text, options = {}) => {
      if (!text) return;
      const {
        fontSize = 10,
        fontStyle = 'normal',
        color = [0, 0, 0],
        align = 'left' // 'left', 'center', 'right'
      } = options;

      doc.setFontSize(fontSize);
      doc.setFont(undefined, fontStyle); // 'normal', 'bold', 'italic'
      doc.setTextColor(...color);

      // Split text to fit width
      const lines = doc.splitTextToSize(text, contentWidth);

      checkPageBreak(lines.length * (fontSize * 0.45)); // Approx height calc

      lines.forEach(line => {
        let x = margin;
        if (align === 'center') {
          x = pageWidth / 2;
        } else if (align === 'right') {
          x = pageWidth - margin;
        }

        doc.text(line, x, y, { align });
        y += (fontSize * 0.45) + 1; // Line spacing
      });

      y += 2; // Extra spacing after block
    };

    // ===============================
    // HEADER — NAME
    // ===============================
    if (contact?.name) {
      addText(contact.name, { fontSize: 24, fontStyle: 'bold' });
    }

    // ===============================
    // HEADLINE
    // ===============================
    if (contact?.headline) {
      addText(contact.headline, { fontSize: 12 });
    }
    y += 5;

    // ===============================
    // CONTACT INFO
    // ===============================
    const contactStyle = { fontSize: 10, color: [100, 100, 100] };

    if (contact?.location) addText(contact.location, contactStyle);
    if (contact?.phone) addText(contact.phone, contactStyle);
    if (contact?.email) addText(contact.email, contactStyle);
    if (contact?.linkedin) addText(contact.linkedin, contactStyle);

    y += 5;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // ===============================
    // SUMMARY
    // ===============================
    if (about) {
      checkPageBreak(25);
      addText("Summary", { fontSize: 16, fontStyle: 'bold' });
      y += 2;
      addText(about, { fontSize: 10 });
      y += 5;
    }

    // ===============================
    // PROFESSIONAL EXPERIENCE
    // ===============================
    if (experience && experience.length > 0) {
      checkPageBreak(20);
      addText("Professional Experience", { fontSize: 16, fontStyle: 'bold' });
      y += 2;

      experience.forEach(company => {
        checkPageBreak(15);
        // Company Name
        addText(`${company.company} (${company.companyDuration})`, { fontSize: 12, fontStyle: 'bold' });

        company.roles.forEach(role => {
          checkPageBreak(15);
          // Role Title
          addText(`${role.title} (${role.dateRange} · ${role.duration})`, { fontSize: 11, fontStyle: 'italic' });

          // Description
          if (role.description) {
            checkPageBreak(20); // Heuristic
            addText(role.description, { fontSize: 10 });
          }
          y += 3;
        });
        y += 2;
      });
      y += 5;
    }

    // ===============================
    // VOLUNTEERING
    // ===============================
    if (volunteering && volunteering.length > 0) {
      checkPageBreak(20);
      addText("Volunteering", { fontSize: 16, fontStyle: 'bold' });
      y += 2;

      volunteering.forEach(v => {
        checkPageBreak(15);
        addText(v.organization, { fontSize: 12, fontStyle: 'bold' });
        addText(`${v.role} (${v.dateRange} · ${v.duration})`, { fontSize: 11, fontStyle: 'italic' });

        if (v.description) {
          checkPageBreak(20);
          addText(v.description, { fontSize: 10 });
        }
        y += 5;
      });

      y += 5;
    }

    // ===============================
    // EDUCATION
    // ===============================
    if (education && education.length > 0) {
      checkPageBreak(20);
      addText("Education", { fontSize: 16, fontStyle: 'bold' });
      y += 2;

      education.forEach(e => {
        checkPageBreak(15);
        addText(e.institution, { fontSize: 12, fontStyle: 'bold' });
        addText(e.degree, { fontSize: 11 });

        if (e.details) {
          checkPageBreak(10);
          addText(e.details, { fontSize: 10, color: [80, 80, 80] });
        }
        y += 5;
      });
    }

    const safeName = contact?.name?.replace(/[^a-zA-Z]/g, "") || "ResumeMyLinkedin";

    // Save generated PDF
    doc.save(`${safeName}.pdf`);
  }
};
