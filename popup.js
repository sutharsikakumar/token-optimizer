document.getElementById("save").addEventListener("click", () => {
    const key = document.getElementById("apiKey").value;
    chrome.storage.sync.set({ openaiKey: key }, () => {
      document.getElementById("status").textContent = "API Key saved!";
    });
  });
  