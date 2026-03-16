// HC Closet Chrome Extension — sidepanel.js

const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";
const STORAGE_BUCKET = "item-images";
const COLORS = ["Black","Blue","Brown","Clear","Cream","Gold","Green","Grey","Orange","Pink","Purple","Red","Silver","Tan","White","Yellow"];

// ── State ──────────────────────────────────────────────────────────────────
let dest = "closet";
let apiKey = "";
let removeBgKey = "";
let selectedImageUrl = null;
let selectedImageIsData = false;
let selectedSeasons = [];
let wishlistLists = [];     // [{id, name}] stored in chrome.storage.sync
let drafts = [];            // [{id, savedAt, dest, fields, imageUrl, imageIsData}]

// ── Utilities ─────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
async function sendToContent(type, data = {}) {
  const tab = await getActiveTab();
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type, ...data }, (res) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve(res);
    });
  });
}

// ── Storage helpers ────────────────────────────────────────────────────────
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["anthropicKey", "removeBgKey", "wishlistLists"], (d) => {
      resolve({
        anthropicKey: d.anthropicKey || "",
        removeBgKey: d.removeBgKey || "",
        wishlistLists: d.wishlistLists || [],
      });
    });
  });
}
async function saveSettings(patch) {
  return new Promise((resolve) => chrome.storage.sync.set(patch, resolve));
}

// ── UI helpers ─────────────────────────────────────────────────────────────
function setStatus(msg, type = "error") {
  const bar = document.getElementById("status-bar");
  const txt = document.getElementById("status-text");
  if (!msg) { bar.classList.remove("visible", "error", "info", "success"); return; }
  txt.textContent = msg;
  bar.className = "status-bar visible " + type;
}

function setDest(d) {
  dest = d;
  document.getElementById("btn-closet").classList.toggle("active", d === "closet");
  document.getElementById("btn-wishlist").classList.toggle("active", d === "wishlist");
  document.getElementById("submit-label").textContent = d === "closet" ? "Add to Closet" : "Add to Wishlist";
  const wishOnly = document.querySelectorAll(".wishlist-only");
  wishOnly.forEach((el) => el.classList.toggle("visible", d === "wishlist"));
}

// ── Image preview ──────────────────────────────────────────────────────────
function setImagePreview(url) {
  const img = document.getElementById("image-preview");
  const empty = document.getElementById("image-preview-empty");
  const clearBtn = document.getElementById("btn-clear-image");
  const bgBtn = document.getElementById("btn-remove-bg");
  if (url) {
    img.src = url;
    img.style.display = "block";
    empty.style.display = "none";
    clearBtn.style.display = "block";
    bgBtn.disabled = false;
    document.getElementById("btn-auto-crop").disabled = false;
  } else {
    img.src = "";
    img.style.display = "none";
    empty.style.display = "flex";
    clearBtn.style.display = "none";
    bgBtn.disabled = true;
    document.getElementById("btn-auto-crop").disabled = true;
  }
}
function setImageProcessing(loading) {
  document.getElementById("img-processing-overlay").classList.toggle("visible", loading);
}
function clearImage() {
  selectedImageUrl = null;
  selectedImageIsData = false;
  setImagePreview(null);
}
function resetImageButtons() {
  document.getElementById("btn-select-image").classList.remove("active");
  document.getElementById("btn-select-image").disabled = false;
  document.getElementById("btn-screenshot").classList.remove("active");
  document.getElementById("btn-screenshot").disabled = false;
}

// ── Seasons ────────────────────────────────────────────────────────────────
function toggleSeason(season) {
  const idx = selectedSeasons.indexOf(season);
  if (idx === -1) selectedSeasons.push(season);
  else selectedSeasons.splice(idx, 1);
  document.querySelectorAll(".season-pill").forEach((pill) => {
    pill.classList.toggle("active", selectedSeasons.includes(pill.dataset.season));
  });
}
function clearSeasons() {
  selectedSeasons = [];
  document.querySelectorAll(".season-pill").forEach((p) => p.classList.remove("active"));
}

// ── Wishlist lists ─────────────────────────────────────────────────────────
function renderWishlistSelect() {
  const sel = document.getElementById("f-wishlist-select");
  // Keep the "— No list —" option, rebuild the rest
  sel.innerHTML = '<option value="">— No list —</option>';
  wishlistLists.forEach((list) => {
    const opt = document.createElement("option");
    opt.value = list.id;
    opt.textContent = list.name;
    sel.appendChild(opt);
  });
  // Always add "New list…" at bottom
  const newOpt = document.createElement("option");
  newOpt.value = "__new__";
  newOpt.textContent = "+ New list…";
  sel.appendChild(newOpt);
}

document.getElementById("f-wishlist-select").addEventListener("change", (e) => {
  document.getElementById("new-list-wrap").classList.toggle("visible", e.target.value === "__new__");
});

// ── Background removal ─────────────────────────────────────────────────────
async function removeBackground() {
  if (!selectedImageUrl || !removeBgKey) return;

  const btn = document.getElementById("btn-remove-bg");
  btn.classList.add("processing");
  btn.disabled = true;
  document.getElementById("bg-btn-label").textContent = "Removing…";
  setImageProcessing(true);

  try {
    let blob;
    if (selectedImageIsData) {
      const r = await fetch(selectedImageUrl);
      blob = await r.blob();
    } else {
      const r = await fetch(selectedImageUrl);
      if (!r.ok) throw new Error("fetch_failed");
      blob = await r.blob();
    }

    const formData = new FormData();
    formData.append("image_file", blob, "image.jpg");
    formData.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": removeBgKey },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.errors?.[0]?.title || "remove.bg API error");
    }

    const resultBlob = await res.blob();
    const reader = new FileReader();
    reader.onload = () => {
      selectedImageUrl = reader.result;
      selectedImageIsData = true;
      setImagePreview(selectedImageUrl);
      setImageProcessing(false);
      btn.classList.remove("processing");
      btn.disabled = false;
      document.getElementById("bg-btn-label").textContent = "Remove Background";
    };
    reader.readAsDataURL(resultBlob);
  } catch (err) {
    setImageProcessing(false);
    btn.classList.remove("processing");
    btn.disabled = false;
    document.getElementById("bg-btn-label").textContent = "Remove Background";
    setStatus("BG removal failed: " + (err.message || "Unknown error"), "error");
  }
}

// ── Auto Crop ──────────────────────────────────────────────────────────────
// Finds the bounding box of the subject (non-transparent or non-background pixels)
// and crops the image to it. Works best after BG removal (PNG with alpha).
async function autoCrop() {
  if (!selectedImageUrl) return;

  const btn = document.getElementById("btn-auto-crop");
  btn.disabled = true;
  document.getElementById("crop-spinner").style.display = "block";
  document.getElementById("crop-btn-label").textContent = "Cropping…";
  setImageProcessing(true);

  try {
    // Ensure we have a data URL to work with
    let dataUrl = selectedImageUrl;
    if (!selectedImageIsData) {
      const r = await fetch(selectedImageUrl);
      if (!r.ok) throw new Error("fetch_failed");
      const blob = await r.blob();
      dataUrl = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(blob);
      });
    }

    const cropped = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);

        // Detect whether the image has meaningful alpha (post-BG removal)
        let hasAlpha = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 245) { hasAlpha = true; break; }
        }

        let minX = w, minY = h, maxX = 0, maxY = 0;

        if (hasAlpha) {
          // Use alpha channel — find bounding box of non-transparent pixels
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              if (data[(y * w + x) * 4 + 3] > 10) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
        } else {
          // Sample background color from the four corners + edge midpoints
          const samples = [
            [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
            [Math.floor(w / 2), 0], [0, Math.floor(h / 2)],
            [w - 1, Math.floor(h / 2)], [Math.floor(w / 2), h - 1],
          ];
          let rSum = 0, gSum = 0, bSum = 0;
          samples.forEach(([sx, sy]) => {
            const i = (sy * w + sx) * 4;
            rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2];
          });
          const bgR = rSum / samples.length;
          const bgG = gSum / samples.length;
          const bgB = bSum / samples.length;
          const threshold = 25;

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = (y * w + x) * 4;
              const diff = Math.abs(data[i] - bgR) + Math.abs(data[i + 1] - bgG) + Math.abs(data[i + 2] - bgB);
              if (diff > threshold) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
        }

        if (minX >= maxX || minY >= maxY) { resolve(dataUrl); return; }

        // Add a small padding (3% of shortest side, max 16px)
        const pad = Math.min(16, Math.floor(Math.min(w, h) * 0.03));
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(w - 1, maxX + pad);
        maxY = Math.min(h - 1, maxY + pad);

        const cw = maxX - minX + 1;
        const ch = maxY - minY + 1;
        const out = document.createElement("canvas");
        out.width = cw;
        out.height = ch;
        out.getContext("2d").drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
        resolve(out.toDataURL("image/png"));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

    selectedImageUrl = cropped;
    selectedImageIsData = true;
    setImagePreview(cropped);
  } catch {
    // silently skip — leave image unchanged
  } finally {
    setImageProcessing(false);
    btn.disabled = false;
    document.getElementById("crop-spinner").style.display = "none";
    document.getElementById("crop-btn-label").textContent = "Auto Crop";
  }
}

// Auto-remove BG + crop when image is selected (if API key exists)
async function onImageSelected(url, isData = false) {
  selectedImageUrl = url;
  selectedImageIsData = isData;
  setImagePreview(url);

  if (removeBgKey && url) {
    document.getElementById("bg-auto-badge").style.display = "inline";
    await removeBackground();
    document.getElementById("bg-auto-badge").style.display = "none";
    // Auto-crop after BG removal
    document.getElementById("crop-auto-badge").style.display = "inline";
    await autoCrop();
    document.getElementById("crop-auto-badge").style.display = "none";
  }
}

// ── Draft Queue ────────────────────────────────────────────────────────────
const DRAFTS_KEY = "hc_drafts";
const MAX_DRAFTS = 20;

async function loadDrafts() {
  return new Promise((resolve) => {
    chrome.storage.local.get([DRAFTS_KEY], (d) => {
      resolve(d[DRAFTS_KEY] || []);
    });
  });
}
async function saveDraftsToStorage() {
  return new Promise((resolve) => chrome.storage.local.set({ [DRAFTS_KEY]: drafts }, resolve));
}

function getDraftFields() {
  return {
    name: document.getElementById("f-name").value.trim(),
    brand: document.getElementById("f-brand").value.trim(),
    price: document.getElementById("f-price").value.trim(),
    spent: document.getElementById("f-spent").value.trim(),
    category: document.getElementById("f-category").value,
    color: document.getElementById("f-color").value,
    size: document.getElementById("f-size").value,
    seasons: [...selectedSeasons],
    notes: document.getElementById("f-notes").value.trim(),
    url: document.getElementById("f-url").value.trim(),
    store: document.getElementById("f-store") ? document.getElementById("f-store").value.trim() : "",
    wishlistId: document.getElementById("f-wishlist-select") ? document.getElementById("f-wishlist-select").value : "",
  };
}

async function saveDraft() {
  const fields = getDraftFields();
  if (!fields.name && !fields.brand && !selectedImageUrl) {
    setStatus("Fill in at least a name or brand before saving a draft.", "info");
    return;
  }
  const draft = {
    id: uid(),
    savedAt: new Date().toISOString(),
    dest,
    fields,
    imageUrl: selectedImageUrl,
    imageIsData: selectedImageIsData,
  };
  drafts.unshift(draft);
  if (drafts.length > MAX_DRAFTS) drafts = drafts.slice(0, MAX_DRAFTS);
  await saveDraftsToStorage();
  renderDrafts();
  setStatus("Draft saved.", "success");
  setTimeout(() => setStatus(""), 1800);
}

function loadDraft(id) {
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return;
  const f = draft.fields;
  document.getElementById("f-name").value = f.name || "";
  document.getElementById("f-brand").value = f.brand || "";
  document.getElementById("f-price").value = f.price || "";
  document.getElementById("f-spent").value = f.spent || "";
  document.getElementById("f-category").value = f.category || "";
  document.getElementById("f-color").value = f.color || "";
  document.getElementById("f-size").value = f.size || "";
  document.getElementById("f-notes").value = f.notes || "";
  document.getElementById("f-url").value = f.url || "";
  if (document.getElementById("f-store")) document.getElementById("f-store").value = f.store || "";
  if (document.getElementById("f-wishlist-select")) {
    document.getElementById("f-wishlist-select").value = f.wishlistId || "";
  }
  // Seasons
  selectedSeasons = [...(f.seasons || [])];
  document.querySelectorAll(".season-pill").forEach((pill) => {
    pill.classList.toggle("active", selectedSeasons.includes(pill.dataset.season));
  });
  // Destination
  setDest(draft.dest || "closet");
  // Image
  if (draft.imageUrl) {
    onImageSelected(draft.imageUrl, draft.imageIsData);
  } else {
    clearImage();
  }
  setStatus("Draft loaded.", "success");
  setTimeout(() => setStatus(""), 1800);
}

async function deleteDraft(id) {
  drafts = drafts.filter((d) => d.id !== id);
  await saveDraftsToStorage();
  renderDrafts();
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function renderDrafts() {
  const section = document.getElementById("drafts-section");
  const list = document.getElementById("drafts-list");
  const countEl = document.getElementById("drafts-count");

  if (drafts.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  countEl.textContent = `(${drafts.length})`;

  list.innerHTML = "";
  drafts.forEach((draft) => {
    const row = document.createElement("div");
    row.className = "draft-row";

    // Thumbnail
    if (draft.imageUrl) {
      const thumb = document.createElement("img");
      thumb.className = "draft-thumb";
      thumb.src = draft.imageUrl;
      thumb.onerror = () => { thumb.style.display = "none"; };
      row.appendChild(thumb);
    } else {
      const empty = document.createElement("div");
      empty.className = "draft-thumb-empty";
      empty.textContent = "✦";
      row.appendChild(empty);
    }

    // Info
    const info = document.createElement("div");
    info.className = "draft-info";
    const nameEl = document.createElement("div");
    nameEl.className = "draft-name";
    nameEl.textContent = draft.fields.name || draft.fields.brand || "Untitled";
    const metaEl = document.createElement("div");
    metaEl.className = "draft-meta";
    const destLabel = draft.dest === "wishlist" ? "Wishlist" : "Closet";
    metaEl.textContent = `${destLabel} · ${timeAgo(draft.savedAt)}`;
    info.appendChild(nameEl);
    info.appendChild(metaEl);
    row.appendChild(info);

    // Actions
    const actions = document.createElement("div");
    actions.className = "draft-actions";
    const loadBtn = document.createElement("button");
    loadBtn.className = "draft-load-btn";
    loadBtn.textContent = "Load";
    loadBtn.onclick = () => loadDraft(draft.id);
    const delBtn = document.createElement("button");
    delBtn.className = "draft-del-btn";
    delBtn.textContent = "×";
    delBtn.onclick = () => deleteDraft(draft.id);
    actions.appendChild(loadBtn);
    actions.appendChild(delBtn);
    row.appendChild(actions);

    list.appendChild(row);
  });
}

// ── Claude extraction ──────────────────────────────────────────────────────
async function extractWithClaude(pageData) {
  if (!apiKey) return {};
  const url = pageData.url || "";
  const urlSlug = url.replace(/https?:\/\/[^/]+/, "").replace(/[?#].*/, "").replace(/[-_/]+/g, " ").trim();
  const hostname = (url.match(/https?:\/\/([^/]+)/) || [])[1] || "";

  const prompt = [
    "Extract product info from this fashion retailer webpage and return ONLY a JSON object with these exact fields:",
    `name, brand, category (must be one of: Accessories, Activewear, Bags, Denim, Dresses, Intimates, Jewelry, Knits, Loungewear, Outerwear, Shoes, Shorts + Skirts, Sleepwear, Socks + Tights, Sweaters, Swim, Tops, Trousers), salePrice (the discounted/current price as a number, or null if not on sale), originalPrice (the original/full retail price as a number — if there is a strikethrough price use that; if only one price exists put it here and leave salePrice null), color (must be one of: ${COLORS.join(", ")} — pick closest match or null), notes (one sentence description or null).`,
    "",
    "URL: " + url,
    "URL path: " + urlSlug,
    "Retailer domain: " + hostname,
    "Page title: " + (pageData.title || "none"),
    "Site: " + (pageData.siteName || "none"),
    "Description: " + (pageData.description || "none"),
    "Structured product data: " + (pageData.jsonLdText || "none"),
    "",
    "Return ONLY valid JSON, no markdown.",
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
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const json = await res.json();
    if (!res.ok) return {};
    const text = (json.content || []).map((b) => b.text || "").join("");
    const match = text.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch {
    return {};
  }
}

// ── Get Product ────────────────────────────────────────────────────────────
async function getProduct() {
  setStatus("");
  const btn = document.getElementById("btn-get-product");
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const pageData = await sendToContent("GET_PAGE_DATA");
    if (!pageData) { setStatus("Could not read this page. Try refreshing.", "error"); return; }

    document.getElementById("f-url").value = pageData.url || "";

    // Pre-fill first image if none selected
    if (!selectedImageUrl && pageData.images && pageData.images.length > 0) {
      await onImageSelected(pageData.images[0], false);
    }

    const extracted = await extractWithClaude(pageData);

    if (extracted.name)  document.getElementById("f-name").value  = extracted.name;
    if (extracted.brand) document.getElementById("f-brand").value = extracted.brand;
    if (extracted.notes) document.getElementById("f-notes").value = extracted.notes;
    if (extracted.brand && dest === "wishlist") {
      document.getElementById("f-store").value = extracted.brand;
    }

    // Prices — Claude or DOM fallback
    const salePrice = extracted.salePrice || pageData.detectedSalePrice || null;
    const origPrice = extracted.originalPrice || pageData.detectedOriginalPrice || null;
    // If only one price came back, treat it as the original (retail) price
    if (salePrice) document.getElementById("f-spent").value = String(salePrice);
    if (origPrice) document.getElementById("f-price").value = String(origPrice);
    else if (!salePrice && extracted.originalPrice) document.getElementById("f-price").value = String(extracted.originalPrice);

    // Color — match to select options
    if (extracted.color) {
      const colorSel = document.getElementById("f-color");
      const match = COLORS.find(
        (c) => c.toLowerCase() === String(extracted.color).toLowerCase()
      );
      if (match) colorSel.value = match;
    }

    // Category
    if (extracted.category) {
      const sel = document.getElementById("f-category");
      for (const opt of sel.options) {
        if (opt.value.toLowerCase() === String(extracted.category).toLowerCase()) {
          sel.value = opt.value; break;
        }
      }
    }

    // Size — auto-fill from page detection
    if (pageData.detectedSize) {
      const sizeSel = document.getElementById("f-size");
      const detected = String(pageData.detectedSize).trim().toUpperCase();
      for (const opt of sizeSel.options) {
        if (opt.value.toUpperCase() === detected || opt.value.toUpperCase().startsWith(detected + "/")) {
          sizeSel.value = opt.value; break;
        }
      }
    }

    const got = extracted.name || extracted.brand || extracted.category;
    if (!got) setStatus("Couldn't auto-fill details — fill in manually.", "info");
  } catch {
    setStatus("Error reading page. Fill in manually.", "info");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// ── Image picker ───────────────────────────────────────────────────────────
async function handleSelectImage() {
  document.getElementById("btn-select-image").classList.add("active");
  document.getElementById("btn-select-image").disabled = true;
  document.getElementById("btn-screenshot").disabled = true;
  setStatus("");
  await sendToContent("SHOW_IMAGE_PICKER");
}

// ── Screenshot ─────────────────────────────────────────────────────────────
async function handleScreenshot() {
  document.getElementById("btn-screenshot").classList.add("active");
  document.getElementById("btn-screenshot").disabled = true;
  document.getElementById("btn-select-image").disabled = true;
  setStatus("Draw a selection on the page…", "info");
  await sendToContent("SHOW_SCREENSHOT_SELECTOR");
}

async function captureAndCrop(coords) {
  try {
    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "CAPTURE_TAB" }, resolve);
    });
    if (!result || result.error || !result.dataUrl) { setStatus("Screenshot failed.", "error"); return; }

    await new Promise((r) => setTimeout(r, 80));

    const img = new Image();
    img.onload = async () => {
      const { x, y, w, h, dpr } = coords;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, Math.round(x * dpr), Math.round(y * dpr), Math.round(w * dpr), Math.round(h * dpr), 0, 0, Math.round(w * dpr), Math.round(h * dpr));
      const dataUrl = canvas.toDataURL("image/png");
      await onImageSelected(dataUrl, true);
      setStatus("");
    };
    img.src = result.dataUrl;
  } catch {
    setStatus("Screenshot failed.", "error");
  }
}

// ── Messages from content script ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SELECTED_IMAGE") {
    resetImageButtons();
    if (msg.url) {
      onImageSelected(msg.url, false);
      setStatus("");
    } else if (msg.error) {
      setStatus(msg.error, "error");
    }
  }
  if (msg.type === "SCREENSHOT_COORDS") {
    setStatus("");
    if (msg.cancelled) { resetImageButtons(); return; }
    captureAndCrop(msg.coords).finally(resetImageButtons);
  }
});

// ── Image upload to Supabase Storage ──────────────────────────────────────
async function uploadImage() {
  if (!selectedImageUrl) return null;
  try {
    let blob;
    if (selectedImageIsData) {
      blob = await (await fetch(selectedImageUrl)).blob();
    } else {
      const r = await fetch(selectedImageUrl);
      if (!r.ok) return selectedImageUrl;
      blob = await r.blob();
    }
    const ext = blob.type.includes("png") ? "png" : "jpg";
    const filename = `${uid()}.${ext}`;
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": blob.type, "x-upsert": "true" },
      body: blob,
    });
    if (!up.ok) return selectedImageIsData ? null : selectedImageUrl;
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
  } catch {
    return selectedImageIsData ? null : selectedImageUrl;
  }
}

// ── Supabase insert ────────────────────────────────────────────────────────
async function insertItem(table, item) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ id: item.id, data: item }),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ── Submit ────────────────────────────────────────────────────────────────
async function submit() {
  const name = document.getElementById("f-name").value.trim();
  if (!name) { setStatus("Name is required.", "error"); return; }

  setStatus("");
  const btn = document.getElementById("btn-submit");
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    document.getElementById("submit-label").textContent = "Saving image…";
    const imageUrl = await uploadImage();
    document.getElementById("submit-label").textContent = dest === "closet" ? "Add to Closet" : "Add to Wishlist";

    // Resolve wishlist ID
    let wishlistId;
    if (dest === "wishlist") {
      const sel = document.getElementById("f-wishlist-select").value;
      if (sel === "__new__") {
        const newName = document.getElementById("f-new-list-name").value.trim();
        if (newName) {
          wishlistId = uid();
          wishlistLists.push({ id: wishlistId, name: newName });
          await saveSettings({ wishlistLists });
          renderWishlistSelect();
        }
      } else if (sel) {
        wishlistId = sel;
      }
    }

    const colorVal = document.getElementById("f-color").value;
    const spentVal = document.getElementById("f-spent").value.trim();
    const priceVal = document.getElementById("f-price").value.trim();

    const item = {
      id: uid(),
      name,
      brand: document.getElementById("f-brand").value.trim(),
      category: document.getElementById("f-category").value || "",
      price: priceVal || spentVal,   // original/retail price; fall back to sale price if only one entered
      spent: spentVal,               // actual amount paid (sale price)
      color: colorVal,
      colors: colorVal ? [colorVal] : [],
      size: document.getElementById("f-size").value || "",
      seasons: [...selectedSeasons],
      occasions: [],
      notes: document.getElementById("f-notes").value.trim(),
      image: imageUrl || "",
      link: document.getElementById("f-url").value.trim(),
      purchaseDate: "",
      wornCount: 0,
      forSale: false,
      saleStatus: "",
      ...(dest === "wishlist"
        ? {
            store: document.getElementById("f-store").value.trim() || "",
            addedAt: new Date().toISOString(),
            ...(wishlistId ? { wishlistId } : {}),
          }
        : {}),
    };

    const table = dest === "closet" ? "items" : "wishlist";
    await insertItem(table, item);

    document.getElementById("success-title").textContent = dest === "closet" ? "Added to Closet" : "Added to Wishlist";
    document.getElementById("success-sub").textContent = name;
    document.getElementById("success-panel").classList.add("visible");
    document.getElementById("form-content").style.display = "none";
    document.getElementById("footer").style.display = "none";
  } catch (err) {
    setStatus("Save failed: " + (err.message || "Unknown error"), "error");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
    document.getElementById("submit-label").textContent = dest === "closet" ? "Add to Closet" : "Add to Wishlist";
  }
}

// ── Reset form ─────────────────────────────────────────────────────────────
function resetForm() {
  ["f-name", "f-brand", "f-price", "f-spent", "f-notes", "f-url", "f-store", "f-new-list-name"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("f-category").value = "";
  document.getElementById("f-color").value = "";
  document.getElementById("f-size").value = "";
  document.getElementById("f-wishlist-select").value = "";
  document.getElementById("new-list-wrap").classList.remove("visible");
  clearImage();
  clearSeasons();
  setStatus("");
  document.getElementById("success-panel").classList.remove("visible");
  document.getElementById("form-content").style.display = "block";
  document.getElementById("footer").style.display = "block";
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && tab.url.startsWith("http")) {
      document.getElementById("f-url").value = tab.url;
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────
async function init() {
  const settings = await loadSettings();
  apiKey = settings.anthropicKey;
  removeBgKey = settings.removeBgKey;
  wishlistLists = settings.wishlistLists;

  drafts = await loadDrafts();
  renderDrafts();

  // Try to pull fresh wishlist lists from the app tab (if open)
  try {
    const appTabs = await chrome.tabs.query({ url: "https://closet-app-ten.vercel.app/*" });
    if (appTabs.length > 0) {
      const res = await new Promise((resolve) => {
        chrome.tabs.sendMessage(appTabs[0].id, { type: "GET_WISHLIST_LISTS" }, (r) => {
          if (chrome.runtime.lastError) resolve(null);
          else resolve(r);
        });
      });
      if (res && Array.isArray(res.lists) && res.lists.length > 0) {
        wishlistLists = res.lists;
        await saveSettings({ wishlistLists });
        renderWishlistSelect();
      }
    }
  } catch {}

  // Show "auto" badge hint on BG button if key is set
  if (removeBgKey) {
    document.getElementById("bg-auto-badge").style.display = "inline";
  }

  renderWishlistSelect();

  if (!apiKey) {
    document.getElementById("setup-screen").style.display = "block";
    return;
  }

  document.getElementById("main-screen").style.display = "block";
  document.getElementById("footer").style.display = "block";
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && tab.url.startsWith("http")) {
      document.getElementById("f-url").value = tab.url;
    }
  });
}

// ── Event listeners ────────────────────────────────────────────────────────

// Setup
document.getElementById("btn-save-setup-key").addEventListener("click", async () => {
  const key = document.getElementById("setup-key-input").value.trim();
  if (!key.startsWith("sk-ant-")) { document.getElementById("setup-error").textContent = "Key should start with sk-ant-"; return; }
  await saveSettings({ anthropicKey: key });
  apiKey = key;
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("footer").style.display = "block";
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && tab.url.startsWith("http")) document.getElementById("f-url").value = tab.url;
  });
});
document.getElementById("setup-key-input").addEventListener("keydown", (e) => { if (e.key === "Enter") document.getElementById("btn-save-setup-key").click(); });

// Destination
document.getElementById("btn-closet").addEventListener("click", () => setDest("closet"));
document.getElementById("btn-wishlist").addEventListener("click", () => setDest("wishlist"));

// Save Draft
document.getElementById("btn-save-draft").addEventListener("click", saveDraft);

// Drafts panel toggle
document.getElementById("drafts-header").addEventListener("click", () => {
  const list = document.getElementById("drafts-list");
  const chevron = document.getElementById("drafts-chevron");
  const isOpen = list.style.display !== "none";
  list.style.display = isOpen ? "none" : "block";
  chevron.classList.toggle("open", !isOpen);
});

// Get Product
document.getElementById("btn-get-product").addEventListener("click", getProduct);

// Image tools
document.getElementById("btn-select-image").addEventListener("click", handleSelectImage);
document.getElementById("btn-screenshot").addEventListener("click", handleScreenshot);
document.getElementById("btn-clear-image").addEventListener("click", clearImage);
document.getElementById("btn-remove-bg").addEventListener("click", removeBackground);
document.getElementById("btn-auto-crop").addEventListener("click", autoCrop);

// Season pills
document.querySelectorAll(".season-pill").forEach((pill) => {
  pill.addEventListener("click", () => toggleSeason(pill.dataset.season));
});

// Refresh
document.getElementById("btn-refresh").addEventListener("click", () => {
  setStatus("");
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url && tab.url.startsWith("http")) document.getElementById("f-url").value = tab.url;
  });
});

// Submit
document.getElementById("btn-submit").addEventListener("click", submit);

// Add another
document.getElementById("btn-add-another").addEventListener("click", resetForm);

// Settings panel
document.getElementById("btn-settings-toggle").addEventListener("click", () => {
  const body = document.getElementById("settings-body");
  const toggle = document.getElementById("btn-settings-toggle");
  body.classList.toggle("visible");
  toggle.classList.toggle("open");
  if (body.classList.contains("visible")) {
    document.getElementById("settings-key-input").value = apiKey ? apiKey.slice(0, 14) + "…" : "";
    document.getElementById("settings-removebg-input").value = removeBgKey ? removeBgKey.slice(0, 8) + "…" : "";
  }
});
document.getElementById("btn-save-key").addEventListener("click", async () => {
  const key = document.getElementById("settings-key-input").value.trim();
  if (!key || key.includes("…")) return;
  if (!key.startsWith("sk-ant-")) { setStatus("Key should start with sk-ant-", "error"); return; }
  await saveSettings({ anthropicKey: key });
  apiKey = key;
  document.getElementById("key-saved").classList.add("visible");
  setTimeout(() => document.getElementById("key-saved").classList.remove("visible"), 2000);
});
document.getElementById("btn-save-removebg").addEventListener("click", async () => {
  const key = document.getElementById("settings-removebg-input").value.trim();
  if (!key || key.includes("…")) return;
  await saveSettings({ removeBgKey: key });
  removeBgKey = key;
  document.getElementById("bg-auto-badge").style.display = removeBgKey ? "inline" : "none";
  document.getElementById("key-saved").classList.add("visible");
  setTimeout(() => document.getElementById("key-saved").classList.remove("visible"), 2000);
});

// Start
init();
