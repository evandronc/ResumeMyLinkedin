window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};
ResumeMyLinkedin.Downloader = {
  download(blob, filename) {
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename });
  }
};
