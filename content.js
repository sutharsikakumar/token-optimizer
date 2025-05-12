function estimateTokens(text) {
    // Rough GPT-style token estimation
    return Math.ceil(text.trim().split(/\s+/).length * 1.33);
  }
  
  function injectUI(textarea) {
    const form = textarea.closest("form");
    if (!form || form.querySelector(".token-score")) return;
  
    // Token Score
    const scoreEl = document.createElement("span");
    scoreEl.className = "token-score";
    scoreEl.style.cssText = `
      margin-left: 10px;
      padding: 5px 12px;
      background: #eee;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    `;
    scoreEl.textContent = "0 tokens";
    form.appendChild(scoreEl);
  
    // Optimize Button
    const optimizeBtn = document.createElement("button");
    optimizeBtn.textContent = "🔄 Optimize";
    optimizeBtn.className = "optimize-btn";
    optimizeBtn.style.cssText = `
      margin-left: 10px;
      padding: 5px 12px;
      border: none;
      background: #ffd700;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
    `;
    form.appendChild(optimizeBtn);
  
    // === Update tokens live ===
    const updateTokens = () => {
      const tokens = estimateTokens(textarea.value);
      scoreEl.textContent = `${tokens} tokens`;
      scoreEl.style.backgroundColor = tokens > 300 ? "#f88" : "#cfc";
    };
  
    textarea.addEventListener("input", updateTokens);
    updateTokens();
  
    // === Optimize logic ===
    optimizeBtn.addEventListener("click", () => {
      const prompt = textarea.value.trim();
      if (!prompt) return;
  
      chrome.storage.sync.get("openaiKey", async ({ openaiKey }) => {
        if (!openaiKey) {
          alert("Please enter your API key in the extension popup.");
          return;
        }
  
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: `You are a prompt engineer. Your task is to rewrite the user's prompt to be significantly more concise and token-efficient. 
  Keep the core intent and clarity. Avoid filler, repetition, or unnecessary detail. Only return the optimized prompt.`
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.3
            })
          });
  
          const data = await response.json();
          const optimized = data.choices?.[0]?.message?.content?.trim();
  
          if (optimized && optimized !== prompt) {
            textarea.value = optimized;
            updateTokens();
          } else {
            alert("No improved prompt was generated.");
          }
        } catch (error) {
          console.error(error);
          alert("Failed to contact OpenAI API.");
        }
      });
    });
  }
  
  const observer = new MutationObserver(() => {
    const textarea = document.querySelector("form textarea");
    if (textarea && !document.querySelector(".token-score")) {
      injectUI(textarea);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  