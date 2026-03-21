/**
 * One-time migration: upload all base64 images from Supabase to Cloudinary.
 * Run with: node migrate-images-to-cloudinary.mjs
 * Requires Node 18+ (uses native fetch + FormData + Blob).
 *
 * Covers: items.image, wishlist.image, lookbooks.coverImage, moodboards items[].src
 * Skips rows that already have a URL (not base64). Safe to re-run.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";
const CLOUD_NAME = "dfboya5nx";
const UPLOAD_PRESET = "closet-app";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Convert a base64 data URL to a Buffer + mime type
function dataUrlToBuffer(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
  const buffer = Buffer.from(base64, "base64");
  return { buffer, mime };
}

async function uploadToCloudinary(dataUrl) {
  const { buffer, mime } = dataUrlToBuffer(dataUrl);
  const fd = new FormData();
  fd.append("file", new Blob([buffer], { type: mime }), "image.png");
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.secure_url;
}

// Parse a raw Supabase row (handles both wrapped-data and flat schemas)
function parseRow(row) {
  if (row.data && typeof row.data === "object") return { ...row.data, id: row.id };
  const { created_at, ...rest } = row;
  return rest;
}

// Fetch all rows in pages to avoid statement timeouts on large tables
async function fetchAllRows(table, pageSize = 20) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
    await sleep(100);
  }
  return rows;
}

// Migrate a simple table where one field holds a base64 image
async function migrateSimpleTable(table, imageField) {
  console.log(`\n── ${table}.${imageField} ──`);
  let data;
  try {
    data = await fetchAllRows(table);
  } catch (e) {
    console.error(`  Fetch failed: ${e.message}`);
    return;
  }

  let migrated = 0, skipped = 0, failed = 0;

  for (const row of data) {
    const parsed = parseRow(row);
    const image = parsed[imageField];

    if (!image || !image.startsWith("data:")) {
      skipped++;
      continue;
    }

    try {
      const url = await uploadToCloudinary(image);
      const updated = { ...parsed, [imageField]: url };
      const { error: updateErr } = await supabase
        .from(table)
        .update({ data: updated })
        .eq("id", row.id);
      if (updateErr) throw new Error(updateErr.message);
      migrated++;
      console.log(`  ✓ ${row.id} → ${url.slice(0, 70)}…`);
    } catch (e) {
      failed++;
      console.error(`  ✗ ${row.id}: ${e.message}`);
    }

    await sleep(250); // avoid rate limits
  }

  console.log(`  ${migrated} migrated, ${skipped} already URL / empty, ${failed} failed`);
}

// Migrate moodboards — each board has items[].src
async function migrateMoodboards() {
  console.log(`\n── moodboards (canvas items) ──`);
  let data;
  try { data = await fetchAllRows("moodboards"); }
  catch (e) { console.error(`  Fetch failed: ${e.message}`); return; }

  let boardsMigrated = 0, imagesMigrated = 0, skipped = 0;

  for (const row of data) {
    const board = row.data && typeof row.data === "object" ? row.data : null;
    if (!board || !Array.isArray(board.items)) { skipped++; continue; }

    let changed = false;
    const newItems = [];

    for (const item of board.items) {
      if (!item.src || !item.src.startsWith("data:")) {
        newItems.push(item);
        continue;
      }
      try {
        const url = await uploadToCloudinary(item.src);
        newItems.push({ ...item, src: url });
        changed = true;
        imagesMigrated++;
        await sleep(250);
      } catch (e) {
        console.error(`  ✗ board ${row.id} item ${item.id}: ${e.message}`);
        newItems.push(item);
      }
    }

    if (changed) {
      const { error: updateErr } = await supabase
        .from("moodboards")
        .update({ data: { ...board, items: newItems } })
        .eq("id", row.id);
      if (updateErr) {
        console.error(`  ✗ board ${row.id} save failed: ${updateErr.message}`);
      } else {
        boardsMigrated++;
        console.log(`  ✓ board ${row.id} (${newItems.filter(i => !i.src?.startsWith("data:")).length} images updated)`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`  ${boardsMigrated} boards updated, ${imagesMigrated} images migrated, ${skipped} skipped`);
}

async function main() {
  console.log("Starting Cloudinary image migration…\n");
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Cloudinary: ${CLOUD_NAME} / ${UPLOAD_PRESET}\n`);

  await migrateSimpleTable("items", "image");
  await migrateSimpleTable("wishlist", "image");
  await migrateSimpleTable("lookbooks", "coverImage");
  await migrateMoodboards();

  console.log("\n✅ Migration complete! Re-run anytime — already-migrated rows are skipped.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
