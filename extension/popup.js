// HC Closet Chrome Extension — popup.js

const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";
const STORAGE_BUCKET = "item-images";

// ── State ──────────────────────────────────────────────────────────────────
let dest = "closet";           // "closet" | "wishlist"
let pageData = null;           // scraped page data
let selectedImage = null;      // selected image URL
let apiKey = "";

// ── Utilities ──────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function show(id) { document.getElementById(id).classList.add("visible"); }
function hide(id) { document.getElementById(id).classList.remove("visible"); }
function showOnly(screenId) {
  ["state-loading", "state-success", "setup-screen", "main-screen"].forEach(hide);
  show(screenId);
}

function setLoadingLabel(text) {
  document.getElementById("loading-label").textContent = text;
}

// ── API Key management ─────────────────────────────────────────────────────
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("anthropicKey", (data) => resolve(data.anthropicKey || ""));
  });
}
async function saveApiKey(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ anthropicKey: key }, resolve);
  });
}

// ── Destination toggle ─────────────────────────────────────────────────────
function setDest(d) {
  dest = d;
  document.getElementById("btn-closet").classList.toggle("active", d === "closet");
  document.getElementById("btn-wishlist").classList.toggle("active", d === "wishlist");
  document.getElementById("btn-submit").textContent = d === "closet" ? "Add to Closet" : "Add to Wishlist";
}

// ── Image strip ────────────────────────────────────────────────────────────
function renderImages(images) {
  const strip = document.getElementById("image-strip");
  strip.innerHTML = "";

  if (!images || images.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "no-image";
    placeholder.textContent = "No images found";
    strip.appendChild(placeholder);
    return;
  }

  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.className = "img-thumb";
    img.src = src;
    img.alt = "";
    img.onerror = () => img.classList.add("error");
    img.onclick = () => {
      document.querySelectorAll(".img-thumb").forEach((t) => t.classList.remove("selected"));
      img.classList.add("selected");
      selectedImage = src;
    };
    if (i === 0) {
      img.onload = () => { img.classList.add("selected"); selectedImage = src; };
    }
    strip.appendChild(img);
  });
}

// ── Claude API call ────────────────────────────────────────────────────────
async function extractWithClaude(data) {
  if (!apiKey) return {};

  const url = data.url || "";
  const urlSlug = url
    .replace(/https?:\/\/[^/]+/, "")
    .replace(/[?#].*/, "")
    .replace(/[-_/]+/g, " ")
    .trim();
  const hostname = (url.match(/https?:\/\/([^/]+)/) || [])[1] || "";

  const promptText = [
    "Extract product info from this fashion retailer webpage and return ONLY a JSON object with these exact fields:",
    "name, brand, category (must be one of: Accessories, Activewear, Bags, Denim, Dresses, Intimates, Jewelry, Knits, Loungewear, Outerwear, Shoes, Shorts + Skirts, Sleepwear, Socks + Tights, Sweaters, Swim, Tops, Trousers), price (number only no $ sign, or null), color (main color as a single common word, or null), notes (one sentence description, or null).",
    "",
    "URL: " + url,
    "URL path (use to infer product name if nothing else available): " + urlSlug,
    "Retailer domain: " + hostname,
    "Page title: " + (data.title || "none"),
    "Site: " + (data.siteName || "none"),
    "Description: " + (data.description || "none"),
    "Structured product data: " + (data.jsonLdText || "none"),
    "",
    "Use all available signals. The URL slug is especially useful — e.g. 'bra-free-rib-90s-cami' means the product is a cami top. Return ONLY valid JSON, no markdown.",
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: promptText }],
      }),
    });
    const json = await res.json();
    if (!res.ok) return {};
    const text = (json.content || []).map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch {
    return {};
  }
}

// ── Supabase image upload ──────────────────────────────────────────────────
async function uploadImage(imageUrl) {
  if (!imageUrl) return null;
  try {
    // Fetch the image
    const res = await fetch(imageUrl);
    if (!res.ok) return imageUrl; // fall back to URL if fetch fails
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    const filename = `${uid()}.${ext}`;

    // Upload via Supabase Storage REST API
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": blob.type,
          "x-upsert": "true",
        },
        body: blob,
      }
    );

    if (!uploadRes.ok) return imageUrl; // fall back to URL if upload fails

    // Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
  } catch {
    return imageUrl; // fall back to URL on any error
  }
}

// ── Supabase insert ────────────────────────────────────────────────────────
async function insertItem(table, item) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ id: item.id, data: item }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

// ── Populate form ──────────────────────────────────────────────────────────
function populateForm(extracted, data) {
  if (extracted.name) document.getElementById("f-name").value = extracted.name;
  if (extracted.brand) document.getElementById("f-brand").value = extracted.brand;
  if (extracted.price) document.getElementById("f-price").value = String(extracted.price);
  if (extracted.color) document.getElementById("f-color").value = extracted.color;
  if (extracted.category) {
    const sel = document.getElementById("f-category");
    for (const opt of sel.options) {
      if (opt.value.toLowerCase() === extracted.category.toLowerCase()) {
        sel.value = opt.value;
        break;
      }
    }
  }
}

// ── Main scan flow ─────────────────────────────────────────────────────────
async function scan() {
  showOnly("state-loading");
  setLoadingLabel("Scanning page…");
  document.getElementById("submit-error").textContent = "";
  selectedImage = null;

  try {
    // Ask content script for page data
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    pageData = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_DATA" }, (response) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(response);
      });
    });

    // Render images immediately
    renderImages(pageData.images || []);

    // Call Claude
    setLoadingLabel("Extracting details with AI…");
    const extracted = await extractWithClaude(pageData);

    // Show form
    showOnly("main-screen");
    populateForm(extracted, pageData);
    setDest(dest); // refresh button label
  } catch (err) {
    // Content script may not be injected on special pages
    showOnly("main-screen");
    renderImages([]);
    document.getElementById("f-name").placeholder = "Enter item name";
    setDest(dest);
  }
}

// ── Submit ─────────────────────────────────────────────────────────────────
async function submit() {
  const name = document.getElementById("f-name").value.trim();
  if (!name) {
    document.getElementById("submit-error").textContent = "Name is required.";
    return;
  }

  const btn = document.getElementById("btn-submit");
  btn.disabled = true;
  document.getElementById("submit-error").textContent = "";

  showOnly("state-loading");
  setLoadingLabel("Saving image…");

  try {
    // Upload image to Supabase Storage
    const storedImageUrl = await uploadImage(selectedImage);

    setLoadingLabel("Saving item…");

    const now = new Date().toISOString().slice(0, 10);
    const item = {
      id: uid(),
      name,
      brand: document.getElementById("f-brand").value.trim(),
      category: document.getElementById("f-category").value || "",
      price: document.getElementById("f-price").value.trim(),
      spent: "",
      color: document.getElementById("f-color").value.trim(),
      colors: document.getElementById("f-color").value.trim()
        ? [document.getElementById("f-color").value.trim()]
        : [],
      size: "",
      seasons: [],
      occasions: [],
      notes: "",
      image: storedImageUrl || "",
      link: pageData ? pageData.url : "",
      purchaseDate: "",
      wornCount: 0,
      forSale: false,
      saleStatus: "",
      ...(dest === "wishlist"
        ? {
            store: document.getElementById("f-brand").value.trim() || "",
            addedAt: new Date().toISOString(),
          }
        : {}),
    };

    const table = dest === "closet" ? "items" : "wishlist";
    await insertItem(table, item);

    // Show success
    document.getElementById("success-msg").textContent =
      dest === "closet" ? "Added to Closet" : "Added to Wishlist";
    document.getElementById("success-sub").textContent = name;
    showOnly("state-success");
  } catch (err) {
    showOnly("main-screen");
    document.getElementById("submit-error").textContent =
      "Save failed: " + (err.message || "Unknown error");
  } finally {
    btn.disabled = false;
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  apiKey = await getApiKey();

  if (!apiKey) {
    showOnly("setup-screen");
    return;
  }

  await scan();
}

// ── Event listeners ────────────────────────────────────────────────────────
document.getElementById("btn-closet").addEventListener("click", () => setDest("closet"));
document.getElementById("btn-wishlist").addEventListener("click", () => setDest("wishlist"));
document.getElementById("btn-submit").addEventListener("click", submit);
document.getElementById("btn-refresh").addEventListener("click", scan);
document.getElementById("btn-add-another").addEventListener("click", scan);

// Setup screen
document.getElementById("btn-save-setup-key").addEventListener("click", async () => {
  const key = document.getElementById("setup-key-input").value.trim();
  if (!key.startsWith("sk-ant-")) {
    document.getElementById("setup-error").textContent =
      "Key should start with sk-ant-";
    return;
  }
  await saveApiKey(key);
  apiKey = key;
  document.getElementById("setup-error").textContent = "";
  await scan();
});

// Inline settings panel
document.getElementById("btn-toggle-settings").addEventListener("click", () => {
  const panel = document.getElementById("settings-panel");
  panel.classList.toggle("visible");
  if (panel.classList.contains("visible")) {
    document.getElementById("settings-key-input").value = apiKey
      ? apiKey.slice(0, 12) + "…"
      : "";
  }
});
document.getElementById("btn-save-key").addEventListener("click", async () => {
  const key = document.getElementById("settings-key-input").value.trim();
  if (!key || key.includes("…")) return; // not a new key
  if (!key.startsWith("sk-ant-")) {
    alert("Key should start with sk-ant-");
    return;
  }
  await saveApiKey(key);
  apiKey = key;
  const saved = document.getElementById("key-saved");
  saved.classList.add("visible");
  setTimeout(() => saved.classList.remove("visible"), 2000);
});

// Enter key on setup screen
document.getElementById("setup-key-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btn-save-setup-key").click();
});

// Start
init();
