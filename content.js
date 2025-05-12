console.log("Highlight script loaded!");

function highlightTextNodes(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: node => node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    if (node.parentNode && node.parentNode.style?.backgroundColor === "yellow") continue;

    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    span.textContent = node.textContent;
    node.parentNode.replaceChild(span, node);
  }

  console.log(`Highlighted ${textNodes.length} text nodes`);
}

const interval = setInterval(() => {
  highlightTextNodes(document.body);
}, 2000);

setTimeout(() => clearInterval(interval), 30000);
