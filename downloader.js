window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};
ResumeMyLinkedin.Downloader = {
  download(blob, filename, openInTab = false) {
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename }, () => {
      if (openInTab) {
        chrome.tabs.create({ url });
      }
    });
  }
};
