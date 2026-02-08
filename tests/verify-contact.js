// Copy and paste this into your browser console while on your LinkedIn profile with the Contact Info modal open.

(async () => {
    console.log("🔍 Verifying Contact Extraction...");
    const modal = document.querySelector("div.artdeco-modal");

    if (!modal) {
        console.error("❌ Modal not found! Please open the 'Contact info' modal first.");
        return;
    }

    const result = {
        linkedin: null,
        email: null,
        phone: null,
        strategies: []
    };

    // 1. LinkedIn URL
    const linkedinAnchor = modal.querySelector('a[href*="linkedin.com/in/"]');
    if (linkedinAnchor) {
        result.linkedin = linkedinAnchor.href;
        result.strategies.push("LinkedIn Link found");
    }

    // 2. Email (Robust selector)
    const emailAnchor = modal.querySelector('a[href^="mailto:"]');
    if (emailAnchor) {
        result.email = emailAnchor.textContent.trim();
        result.strategies.push("Email Link found");
    } else {
        console.warn("⚠️ Email link not found using selector: a[href^='mailto:']");
    }

    // 3. Phone (Heuristic + Regex)
    console.log("Checking Phone strategies...");
    let phoneFound = false;

    // Strategy A: Class selector
    const phoneSection = modal.querySelector('section.ci-phone, .ci-phone');
    if (phoneSection) {
        const numbers = Array.from(phoneSection.querySelectorAll('ul li, span:not(.t-bold)'))
            .map(el => el.textContent.trim())
            .filter(t => /\d/.test(t) && !t.toLowerCase().includes('phone'));
        if (numbers.length > 0) {
            result.phone = numbers[0];
            result.strategies.push("Phone (Class Selector) found");
            phoneFound = true;
        }
    }

    // Strategy B: Keyword matching
    if (!phoneFound) {
        const keywords = ['Phone', 'Mobile', 'Celular', 'Telefone', 'Teléfono'];

        // Using TreeWalker for precise node traversal
        const treeWalker = document.createTreeWalker(modal, NodeFilter.SHOW_TEXT, null, false);
        let currentNode;
        while (currentNode = treeWalker.nextNode()) {
            const text = currentNode.textContent.trim();
            if (keywords.some(k => text === k)) {
                // Found a header
                const parent = currentNode.parentElement;
                // Try parent's next sibling or block
                const block = parent.closest('section') || parent.parentElement;
                if (block) {
                    const blockText = block.innerText;
                    const lines = blockText.split('\n').map(l => l.trim()).filter(l => l);
                    // Find a line that has digits and is NOT the keyword
                    const numberLine = lines.find(l => /\d+/.test(l) && !keywords.includes(l));
                    if (numberLine) {
                        result.phone = numberLine;
                        result.strategies.push("Phone via Keyword Block Logic");
                        phoneFound = true;
                        break;
                    }
                }
            }
        }
    }

    // Strategy C: Pure Regex (Fallback)
    if (!phoneFound) {
        // Broad regex for phone numbers
        const phoneRegex = /(?:\+?\d{1,3}[ -]?)?\(?\d{2,3}\)?[ -]?\d{4,5}[ -]?\d{4}/;
        if (phoneRegex.test(modal.innerText)) {
            const match = modal.innerText.match(phoneRegex);
            result.phone = match[0];
            result.strategies.push("Phone via Regex Fallback");
            phoneFound = true;
        }
    }

    console.log("--------------------------------------------------");
    console.log("✅ EXTRACTED DATA:");
    console.log(JSON.stringify(result, null, 2));
    console.log("--------------------------------------------------");

    if (result.email && result.phone) console.log("🎉 SUCCESS: Email and Phone found!");
    else if (result.email) console.log("⚠️ PARTIAL: Email found, but Phone missing.");
    else console.error("❌ FAILED: Could not extract Email or Phone.");
})();
