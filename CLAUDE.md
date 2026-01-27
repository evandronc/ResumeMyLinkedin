# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResumeMyLinkedin is a Chrome Extension (Manifest v3) that generates professional DOCX resumes from LinkedIn profiles. Written in vanilla JavaScript with no build system or external dependencies (except bundled docx.min.js).

## Development

No build commands - load directly as unpacked extension in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

Test HTML fixtures in `HTML/` directory can be used for scraper development without needing live LinkedIn access.

## Architecture

All modules attach to the `window.ResumeMyLinkedin` namespace:

```
popup.js (entry point)
    ↓
scrapper.js (orchestrator)
    ↓
┌─────────────────────────────────────────────────┐
│ Scrapers (parse LinkedIn DOM)                   │
│ - contactScraper.js (opens/scrapes contact modal)│
│ - experienceScraper.js                          │
│ - educationScraper.js                           │
│ - volunteeringScraper.js                        │
└─────────────────────────────────────────────────┘
    ↓
docxGenerator.js (builds DOCX using docx library)
    ↓
downloader.js (triggers browser download)
```

**Key execution flow:**
1. `popup.js` validates user is on LinkedIn profile, injects content scripts
2. `scrapper.js` snapshots page DOM, coordinates scrapers
3. Scrapers parse DOM using CSS selectors targeting LinkedIn's `data-view-name`, `.hoverable-link-text`, and `aria-hidden` attributes
4. `docxGenerator.js` creates formatted DOCX document
5. `downloader.js` uses `chrome.downloads.download()` to save file

## Code Conventions

- Module pattern: each file creates `window.ResumeMyLinkedin.ModuleName`
- DOM parsing via `DOMParser()` for snapshots, direct queries on live page
- Logger utility (`ResumeMyLinkedin.Logger`) displays timestamped logs in popup UI
- All data processing is local - no external servers
