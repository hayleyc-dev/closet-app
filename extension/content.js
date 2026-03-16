// HC Closet — content script
// Handles: page scraping, image picker overlay, screenshot selection overlay

let activeOverlay = null;

function removeOverlay() {
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
}

// ── Image Picker Overlay ───────────────────────────────────────────────────
function showImagePicker() {
  removeOverlay();

  // Collect candidate images from the page
  const seen = new Set();
  const images = [];

  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg && ogImg.content) { seen.add(ogImg.content); images.push(ogImg.content); }

  document.querySelectorAll("img").forEach((img) => {
    const src = img.src || img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || "";
    if (!src || src.startsWith("data:") || seen.has(src)) return;
    const rect = img.getBoundingClientRect();
    const w = img.naturalWidth || rect.width || 0;
    const h = img.naturalHeight || rect.height || 0;
    if (w >= 150 || h >= 150) { seen.add(src); images.push(src); }
  });

  if (images.length === 0) {
    chrome.runtime.sendMessage({ type: "SELECTED_IMAGE", url: null, error: "No images found on this page." });
    return;
  }

  // Overlay backdrop
  const overlay = document.createElement("div");
  overlay.style.cssText = [
    "position:fixed;top:0;left:0;width:100vw;height:100vh",
    "background:rgba(0,0,0,0.72);z-index:2147483647",
    "display:flex;align-items:center;justify-content:center",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  ].join(";");

  const box = document.createElement("div");
  box.style.cssText = [
    "background:#fff;border-radius:14px;padding:20px",
    "max-width:580px;width:90vw;max-height:78vh",
    "display:flex;flex-direction:column;gap:14px",
    "box-shadow:0 24px 60px rgba(0,0,0,0.35)",
  ].join(";");

  // Header
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;flex-shrink:0";

  const title = document.createElement("div");
  title.style.cssText = "font-size:15px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em";
  title.textContent = "Select an image";

  const closeBtn = document.createElement("button");
  closeBtn.style.cssText = [
    "background:#f2f2f2;border:none;border-radius:50%",
    "width:28px;height:28px;font-size:16px;cursor:pointer",
    "color:#555;display:flex;align-items:center;justify-content:center",
    "flex-shrink:0",
  ].join(";");
  closeBtn.textContent = "×";
  closeBtn.onclick = () => {
    removeOverlay();
    chrome.runtime.sendMessage({ type: "SELECTED_IMAGE", url: null });
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Grid
  const grid = document.createElement("div");
  grid.style.cssText = [
    "display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr))",
    "gap:8px;overflow-y:auto;padding-right:4px",
    "max-height:calc(78vh - 72px)",
  ].join(";");

  images.slice(0, 24).forEach((src) => {
    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "aspect-ratio:3/4;border-radius:8px;overflow:hidden",
      "cursor:pointer;border:2.5px solid transparent",
      "transition:border-color 0.12s,transform 0.12s",
      "background:#f5f3f0;flex-shrink:0",
    ].join(";");
    wrap.onmouseenter = () => { wrap.style.borderColor = "#c4856a"; wrap.style.transform = "scale(1.02)"; };
    wrap.onmouseleave = () => { wrap.style.borderColor = "transparent"; wrap.style.transform = "scale(1)"; };
    wrap.onclick = () => {
      removeOverlay();
      chrome.runtime.sendMessage({ type: "SELECTED_IMAGE", url: src });
    };

    const img = document.createElement("img");
    img.src = src;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    img.onerror = () => { wrap.style.display = "none"; };

    wrap.appendChild(img);
    grid.appendChild(wrap);
  });

  box.appendChild(header);
  box.appendChild(grid);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  activeOverlay = overlay;

  // Backdrop click = cancel
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      removeOverlay();
      chrome.runtime.sendMessage({ type: "SELECTED_IMAGE", url: null });
    }
  });

  // ESC = cancel
  const escHandler = (e) => {
    if (e.key === "Escape") {
      removeOverlay();
      chrome.runtime.sendMessage({ type: "SELECTED_IMAGE", url: null });
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

// ── Screenshot Selection Overlay ───────────────────────────────────────────
function showScreenshotSelector() {
  removeOverlay();

  const dpr = window.devicePixelRatio || 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = vw * dpr;
  canvas.height = vh * dpr;
  canvas.style.cssText = [
    "position:fixed;top:0;left:0;width:100vw;height:100vh",
    "z-index:2147483647;cursor:crosshair",
  ].join(";");

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  function drawState(sx, sy, ex, ey) {
    ctx.clearRect(0, 0, vw, vh);
    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, vw, vh);

    if (sx !== undefined) {
      const x = Math.min(sx, ex), y = Math.min(sy, ey);
      const w = Math.abs(ex - sx), h = Math.abs(ey - sy);
      // Clear selection
      ctx.clearRect(x, y, w, h);
      // White border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
      // Corner handles
      const hs = 6;
      ctx.fillStyle = "#ffffff";
      [[x, y], [x + w - hs, y], [x, y + h - hs], [x + w - hs, y + h - hs]].forEach(([cx, cy]) => {
        ctx.fillRect(cx, cy, hs, hs);
      });
      // Size label
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(x, y - 22, 80, 18);
      ctx.fillStyle = "#fff";
      ctx.font = "11px -apple-system,sans-serif";
      ctx.fillText(`${Math.round(w)} × ${Math.round(h)}`, x + 4, y - 9);
    }

    // Instruction pill
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    const pill = "Click and drag to capture  •  ESC to cancel";
    ctx.font = "12px -apple-system,sans-serif";
    const tw = ctx.measureText(pill).width;
    const px = vw / 2 - tw / 2 - 10, py = 12;
    ctx.beginPath();
    ctx.roundRect(px, py, tw + 20, 26, 13);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fillText(pill, px + 10, py + 17);
  }

  drawState();
  document.body.appendChild(canvas);
  activeOverlay = canvas;

  let startX, startY, dragging = false;

  canvas.addEventListener("mousedown", (e) => {
    startX = e.clientX; startY = e.clientY; dragging = true;
    e.preventDefault();
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    drawState(startX, startY, e.clientX, e.clientY);
    e.preventDefault();
  });
  canvas.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;

    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);

    removeOverlay();

    if (w < 8 || h < 8) {
      chrome.runtime.sendMessage({ type: "SCREENSHOT_COORDS", cancelled: true });
      return;
    }
    chrome.runtime.sendMessage({ type: "SCREENSHOT_COORDS", coords: { x, y, w, h, dpr } });
  });

  const escHandler = (e) => {
    if (e.key === "Escape") {
      removeOverlay();
      chrome.runtime.sendMessage({ type: "SCREENSHOT_COORDS", cancelled: true });
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

// ── Auto-sync wishlist lists when on the app ────────────────────────────────
(function syncWishlistListsIfOnApp() {
  try {
    if (window.location.hostname !== "closet-app-ten.vercel.app") return;
    const raw = localStorage.getItem("wardrobe_wishlists_v1");
    if (!raw) return;
    const lists = JSON.parse(raw);
    if (Array.isArray(lists) && lists.length > 0) {
      chrome.storage.sync.set({ wishlistLists: lists });
    }
  } catch {}
})();

// ── Message handler ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_WISHLIST_LISTS") {
    try {
      const lists = JSON.parse(localStorage.getItem("wardrobe_wishlists_v1") || "[]");
      sendResponse({ lists });
    } catch {
      sendResponse({ lists: [] });
    }
    return true;
  }

  if (msg.type === "GET_PAGE_DATA") {
    const getMeta = (prop) => {
      const el =
        document.querySelector(`meta[property="${prop}"]`) ||
        document.querySelector(`meta[name="${prop}"]`);
      return el ? el.getAttribute("content") || "" : "";
    };

    const title = getMeta("og:title") || getMeta("twitter:title") || document.title || "";
    const description = getMeta("og:description") || getMeta("description") || "";
    const siteName = getMeta("og:site_name") || "";
    const ogImage = getMeta("og:image") || getMeta("twitter:image") || "";

    const seen = new Set();
    const images = [];
    if (ogImage) { seen.add(ogImage); images.push(ogImage); }

    document.querySelectorAll("img").forEach((img) => {
      const src = img.src || img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || "";
      if (!src || src.startsWith("data:") || seen.has(src)) return;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w >= 200 || h >= 200 || /product|item|pdp|main|hero|front/i.test(src)) {
        seen.add(src);
        images.push(src);
      }
    });

    let jsonLdText = "";
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      const txt = s.textContent || "";
      if (!jsonLdText && (txt.includes("Product") || txt.includes("price") || txt.includes("offers"))) {
        jsonLdText = txt.slice(0, 3000);
      }
    });

    // ── Sale price detection ───────────────────────────────────────────────
    // Returns the numeric value of a price string, or null
    const parsePrice = (str) => {
      if (!str) return null;
      const n = parseFloat(str.replace(/[^0-9.]/g, ""));
      return isNaN(n) || n <= 0 ? null : n;
    };
    const priceText = (el) => el ? (el.getAttribute("content") || el.textContent || "").trim() : "";

    // Try strikethrough / was-price elements for original price
    const strikeSelectors = ["s", "del", ".original-price", ".was-price", ".compare-at-price",
      ".price--compare", ".product-price__was", "[data-compare-price]", ".regular-price",
      ".price__regular", ".price-item--regular"];
    let detectedOriginalPrice = null;
    for (const sel of strikeSelectors) {
      const el = document.querySelector(sel);
      const p = parsePrice(priceText(el));
      if (p) { detectedOriginalPrice = p; break; }
    }

    // Try sale price elements
    const salePriceSelectors = [".sale-price", ".price--sale", ".product-price__sale",
      ".price__sale", ".price-item--sale", "[data-sale-price]", ".special-price",
      ".price-box .price"];
    let detectedSalePrice = null;
    for (const sel of salePriceSelectors) {
      const el = document.querySelector(sel);
      const p = parsePrice(priceText(el));
      if (p) { detectedSalePrice = p; break; }
    }

    // ── Size detection ─────────────────────────────────────────────────────
    const KNOWN_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "OS", "ONE SIZE",
      "00", "0", "2", "4", "6", "8", "10", "12", "24", "25", "26", "27", "28", "29", "30", "31", "32",
      "34B", "34C", "32B", "36B", "S/M", "M/L", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"];
    const looksLikeSize = (txt) => {
      const t = txt.trim().toUpperCase();
      return KNOWN_SIZES.some(s => t === s) || /^\d+$/.test(t) || /^(XS|S|M|L|XL|XXL)$/i.test(t);
    };

    let detectedSize = null;

    // 1. aria-selected / aria-pressed / aria-checked on size buttons
    for (const attr of ["aria-selected", "aria-pressed", "aria-checked"]) {
      const el = document.querySelector(`[${attr}="true"]`);
      if (el && looksLikeSize(el.textContent)) { detectedSize = el.textContent.trim(); break; }
    }

    // 2. Selected/active class on elements whose text looks like a size
    if (!detectedSize) {
      const activeSelectors = [".size--selected", ".size-option--selected", ".is-selected",
        ".swatch--selected", ".selected-size", "[data-selected='true']",
        ".btn--active", ".size-btn.active", ".pdp-size.selected"];
      for (const sel of activeSelectors) {
        const el = document.querySelector(sel);
        if (el && looksLikeSize(el.textContent)) { detectedSize = el.textContent.trim(); break; }
      }
    }

    // 3. Selected <option> in a size <select>
    if (!detectedSize) {
      const sizeSelects = document.querySelectorAll("select");
      for (const sel of sizeSelects) {
        const lbl = (sel.getAttribute("aria-label") || sel.name || sel.id || "").toLowerCase();
        if (/size/.test(lbl) && sel.value && looksLikeSize(sel.value)) {
          detectedSize = sel.value.trim(); break;
        }
      }
    }

    // 4. data-size or data-value on .selected elements
    if (!detectedSize) {
      const el = document.querySelector(".selected[data-size], .active[data-size], .selected[data-value]");
      if (el) {
        const v = el.getAttribute("data-size") || el.getAttribute("data-value") || "";
        if (looksLikeSize(v)) detectedSize = v.trim();
      }
    }

    sendResponse({
      url: window.location.href,
      title,
      description: description.slice(0, 400),
      siteName,
      images: images.slice(0, 20),
      jsonLdText,
      detectedOriginalPrice,
      detectedSalePrice,
      detectedSize,
    });
    return true;
  }

  if (msg.type === "SHOW_IMAGE_PICKER") {
    showImagePicker();
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "SHOW_SCREENSHOT_SELECTOR") {
    showScreenshotSelector();
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "CANCEL_OVERLAY") {
    removeOverlay();
    sendResponse({ ok: true });
    return true;
  }
});
