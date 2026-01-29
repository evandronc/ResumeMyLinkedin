// aboutScraper.js
window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};

ResumeMyLinkedin.AboutScraper = {
    scrape(doc, logs) {
        const sectionAnchor = doc.querySelector('#about');
        if (!sectionAnchor) return null;

        const section = sectionAnchor.closest('section');
        if (!section) return null;

        // Helper to extract text preserving line breaks from <br>
        const getTextWithNewlines = (node) => {
            let text = '';
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    text += child.textContent;
                } else if (child.nodeName === 'BR') {
                    text += '\n';
                }
            });
            // Clean up extra whitespace but keep newlines
            return text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');
        };

        // Find the description span. 
        // It usually has aria-hidden="true" and is NOT the header.
        const allSpans = Array.from(section.querySelectorAll('span[aria-hidden="true"]'));
        const candidates = allSpans.filter(span => !span.closest('h2'));

        // Heuristic: The "About" text should be the longest text block in this section.
        candidates.sort((a, b) => b.textContent.length - a.textContent.length);

        if (candidates.length > 0) {
            return getTextWithNewlines(candidates[0]);
        }

        return null;
    }
};
