(() => {
  function cleanText(value) {
    return (value || "")
      .replace(/\s+/g, " ")
      .replace(/Add for delivery|Remove|Increase quantity|Decrease quantity/gi, "")
      .trim();
  }

  function isLikelyProductName(text) {
    if (!text) return false;
    if (text.length < 3 || text.length > 160) return false;

    const blocked = [
      "checkout",
      "basket",
      "trolley",
      "subtotal",
      "total",
      "delivery",
      "book a slot",
      "search",
      "sign in",
      "offers",
      "multi-buy",
      "quantity"
    ];

    return !blocked.some(word => text.toLowerCase().includes(word));
  }

  function getPriceFromText(text) {
    const match = text.match(/£\s?\d+(?:\.\d{2})?/);
    return match ? match[0].replace(/\s/g, "") : "";
  }

  function getQuantityFromText(text) {
    const patterns = [
      /quantity[:\s]+(\d+)/i,
      /qty[:\s]+(\d+)/i,
      /(\d+)\s+in basket/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return Number(match[1]);
    }

    return null;
  }

  function scoreCandidate(element) {
    const text = cleanText(element.innerText || element.textContent || "");
    let score = 0;

    if (text.includes("£")) score += 2;
    if (/quantity|qty|in basket/i.test(text)) score += 2;
    if (element.querySelector("a[href*='/product/'], a[href*='/cat/']")) score += 2;
    if (element.querySelector("button")) score += 1;
    if (text.length > 20 && text.length < 500) score += 1;

    return score;
  }

  function extractNameFromCandidate(element) {
    const selectors = [
      "[data-auto-id*='product-title']",
      "[data-auto-id*='productTitle']",
      "[data-testid*='product-title']",
      "[data-testid*='productTitle']",
      "h2",
      "h3",
      "a[href*='/product/']",
      "a[href*='/cat/']"
    ];

    for (const selector of selectors) {
      const found = element.querySelector(selector);
      const text = cleanText(found?.innerText || found?.textContent || "");
      if (isLikelyProductName(text)) return text;
    }

    const lines = cleanText(element.innerText || "")
      .split(/(?=£)|\n/)
      .map(cleanText)
      .filter(Boolean);

    return lines.find(isLikelyProductName) || "";
  }

  function getProductUrl(element) {
    const link = element.querySelector("a[href*='/product/'], a[href*='/cat/']");
    if (!link) return "";

    try {
      return new URL(link.getAttribute("href"), window.location.origin).toString();
    } catch {
      return "";
    }
  }

  function dedupeItems(items) {
    const seen = new Set();

    return items.filter(item => {
      const key = `${item.name.toLowerCase()}|${item.price}|${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const candidateSelectors = [
    "[data-auto-id*='basket'] li",
    "[data-auto-id*='basket'] [role='listitem']",
    "[data-testid*='basket'] li",
    "[data-testid*='basket'] [role='listitem']",
    "[data-auto-id*='product']",
    "[data-testid*='product']",
    "li",
    "article"
  ];

  const candidates = [...document.querySelectorAll(candidateSelectors.join(","))]
    .filter(element => scoreCandidate(element) >= 3);

  const items = dedupeItems(
    candidates
      .map(element => {
        const fullText = cleanText(element.innerText || element.textContent || "");
        const name = extractNameFromCandidate(element);
        const price = getPriceFromText(fullText);
        const quantity = getQuantityFromText(fullText);
        const url = getProductUrl(element);

        return { name, quantity, price, url };
      })
      .filter(item => isLikelyProductName(item.name))
  );

  return {
    source: window.location.href,
    count: items.length,
    items
  };
})();