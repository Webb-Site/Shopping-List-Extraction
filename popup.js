const exportButton = document.getElementById("exportButton");
const copyButton = document.getElementById("copyButton");
const output = document.getElementById("output");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function formatItems(items) {
  const now = new Date();

  const lines = [
    "Shopping List",
    `Exported: ${now.toLocaleString()}`,
    "",
    ...items.map((item, index) => {
      const quantity = item.quantity ? `${item.quantity}x ` : "";
      const price = item.price ? ` — ${item.price}` : "";
      return `${index + 1}. ${quantity}${item.name}${price}`;
    })
  ];

  return lines.join("\n");
}

async function exportList() {
  setStatus("Reading page...");
  output.value = "";
  copyButton.disabled = true;

  const tab = await getCurrentTab();

  if (!tab?.id || !tab.url?.includes("asda.com")) {
    setStatus("Open an Asda groceries page first.");
    return;
  }

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    if (!result?.items?.length) {
      setStatus("No items found. Open your basket/list and try scrolling the full list into view.");
      return;
    }

    output.value = formatItems(result.items);
    copyButton.disabled = false;
    setStatus(`Found ${result.items.length} item(s).`);
  } catch (error) {
    console.error(error);
    setStatus("Could not read this page. Refresh Asda and try again.");
  }
}

async function copyOutput() {
  if (!output.value.trim()) return;

  await navigator.clipboard.writeText(output.value);
  setStatus("Copied to clipboard.");
}

exportButton.addEventListener("click", exportList);
copyButton.addEventListener("click", copyOutput);