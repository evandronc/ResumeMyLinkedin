window.ResumeMyLinkedin = window.ResumeMyLinkedin || {};
ResumeMyLinkedin.Logger = (() => {
  let logEl = null;

  function init() {
    logEl = document.getElementById("log");
    if (logEl) logEl.textContent = "";
  }

  function log(message) {
    const line = `[${new Date().toISOString()}] ${message}`;
    if (logEl) {
      logEl.textContent += line + "\n";
      logEl.scrollTop = logEl.scrollHeight;
    }
    console.log(line);
  }

  return { init, log };
})();
