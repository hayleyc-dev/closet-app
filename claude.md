# Wardrobe App — Claude Project Context
_Last updated: 2026-03-07_

---

## Project Overview
React wardrobe app (Create React App) with Supabase backend.
- **Live URL:** https://closet-app-ten.vercel.app
- **GitHub:** https://github.com/hayleyc-dev/closet-app
- **Deploy command:** `git add . && git commit -m "..." && git push && npx vercel --prod`
- **vercel.json:** `{"buildCommand":"DISABLE_ESLINT_PLUGIN=true react-scripts build","outputDirectory":"build"}`
- **Current output file:** `/mnt/user-data/outputs/App.js` (~8,000 lines)

---

## Supabase Config
- **URL:** https://gucqffnjwvcbvycfqvtcw.supabase.co
- **Tables:** `items`, `wishlist`, `outfits`, `lookbooks`, `moodboards`

### Moodboards table (must be created if missing):
```sql
create table moodboards (
  id text primary key,
  data jsonb,
  created_at timestamptz default now()
);
alter table moodboards enable row level security;
create policy "Allow all" on moodboards for all using (true) with check (true);
```

### useSupabaseTable update behavior:
- Tries wrapped schema first: `supabase.from(table).update({ data: item }).eq("id", item.id)`
- Falls back to flat schema: `supabase.from(table).update(rest).eq("id", id)`
- On success: updates local rows state immediately

---

## Fonts
- **Body:** DM Sans
- **Display:** Cormorant Garamond (light italic)

---

## App Architecture

### Key App State (App component)
- `tab, setTab` — active nav tab (useState "closet")
- `moodboardActiveIdx, setMoodboardActiveIdx` — active moodboard index
- `activeLookbook, setActiveLookbook` — currently open lookbook
- `activeLookbookView, setActiveLookbookView` — useState("editorial") — "editorial" | "grid" | "moodboard"
- `moodboardsDb` — useMoodboardsDb() hook (Supabase-backed)
- `monthlyBudget`, `annualBudget`, `customCategories`, `customOccasions`, `customSeasons`, `density`, `activeTheme`, `showNavLabels` — localStorage

### Nav
- Sidebar: 160px wide
- NAV_ITEMS: closet, outfits, lookbooks, wishlist, moodboard, seller, stats, settings
- Custom SVG icons (user-uploaded)
- HC initials monogram logo

### Layout
- `.app-right-rail { width: 272px; overflow-y: auto }`

---

## useMoodboardsDb Hook
**Lines:** ~303–393

- TABLE = "moodboards", LS_KEY = "wardrobe_moodboards_v1"
- Loads from Supabase on mount, merges with localStorage-only boards, uploads local-only to Supabase
- Mirrors to localStorage on every change
- **Returns:** `{ boards, updateBoards, updateBoardById, removeBoardById, loaded }`
- `updateBoardById(id, patch)` — functional updater, no stale closure, saves single board to Supabase
- `saveBoard(board)` — upsert to Supabase with `{id, data: board}` then flat fallback
- `updateBoards(updaterOrArray)` — diffs and saves changed boards

---

## Moodboard Component
**Line:** ~5139

**Props:** `{ closetItems, activeIdx, setActiveIdx, boards: boardsProp, updateBoards, removeBoardById }`
- Uses `boardsProp` if provided (Supabase-backed), else falls back to localStorage
- `setBoards = updateBoards` when prop provided
- `updateBoard(updater)` — only touches items field, preserves all other board fields (linkedLb, palette, etc.)
- `updateBoardMeta(patch)` — spreads patch onto board, preserves other fields
- STORAGE_KEY = "wardrobe_moodboards_v1" (localStorage mirror)

### Features:
- Drag/resize/rotate/opacity/text notes/bg colors
- Export to PNG
- Inline text editing
- Flip horizontal
- Keyboard shortcuts (delete, undo/redo)
- Rotation handles
- Board reordering
- URL image import + closet pin
- Right-rail: boards dropdown, lookbook linking, archive

---

## MoodboardInfoPanel
**Line:** ~4856

**Props:** `{ activeIdx, setActiveIdx, boards: boardsProp, updateBoards, updateBoardById, removeBoardById, lookbooksDb, createLookbook, addMoodboardToLookbook, onGoToLookbook }`
- `data = boardsProp || []`
- `board = data[activeIdx] || null`
- `palette = board?.palette || []`
- `linkedLb = board?.linkedLb || null` — DERIVED from board data, not useState
- `setLinkedLb(lb)` — calls `updateBoardById(board.id, { linkedLb: lb })` — persists to Supabase
- Archive: saves to localStorage archive key, calls `removeBoardById`
- ARCHIVE_KEY = "wardrobe_moodboards_archived_v1"

---

## LookbookViewer
**Line:** ~2079

**Props:** `{ lookbook, outfits, allItems, closetItems, onClose, onUpdate, onOpenOutfit, markOutfitWorn, moodboardsProp, initialView }`

### State:
- `view` — useState(initialView || "editorial") — "editorial" | "grid" | "moodboard"
- `linkedMoodboardId` — DERIVED from `lookbook.moodboardId`, not useState
- `lbDateStart, lbDateEnd` — useState(lookbook.dateStart/dateEnd) — editable in sidebar
- `showAddLooks, setShowAddLooks` — controls Add Looks modal
- `outfitSearch, outfitTagFilter` — filter state for Add Looks modal

### Key functions:
- `save(overrides)` — wrapped in try/catch, saves all fields including `dateStart`, `dateEnd`
- `saveTripDetails(patch)` — saves trip detail patches
- `fetchWeather()` — strips ", State" suffix before geocoding API call (fixes "City not found" for "Orlando, FL")
- `tripDays` — derived from `lbDateStart || lookbook.dateStart`
- `tripNights` — `Math.max(0, tripDays - 1)`

### Right sidebar sections (top to bottom):
1. **Stats grid** — Looks, Pieces, Value, Days, Nights
2. **Tags** — Travel, Work Week, Event, Disney, Sport, Weekend, Vacation
3. **Trip Weather** — city input (strips ", State" for API), weather forecast
4. **Pack List** — collapsible, checkbox progress
5. **Lookbook Notes** — textarea
6. **Looks** — list with drag reorder + "+" Add button (opens modal)
7. **Lookbook Details** — name input, start/end date pickers (editable inline)
8. **Trip Details** — hotel, activities, other notes

### Add Looks Modal:
- Full-screen overlay with grid of outfit cards
- Search bar (filters by outfit name)
- Tag filter dropdown (populated from all outfit tags)
- Click card to add immediately; modal stays open for multi-add
- Shows "All outfits already added" or "No outfits match" empty states

### Moodboard tab:
- `moodboards = moodboardsProp` (from App) || localStorage poll fallback
- Empty state shows count: "Choose one of your X boards:" or "No boards found — create one in the Moodboard tab first."
- Board picker: clicking a board calls `onUpdate({ ...lookbook, moodboardId: mb.id, ... })` wrapped in try/catch
- Linked state: renders `<Moodboard>` canvas with `activeIdx=linkedMoodboardIdx`

### Back/Save behavior:
- `save()` is wrapped in try/catch — will never crash React
- "Save & Close" button: `save(); onClose()` — always closes regardless of save error
- Back arrow: `try { save(); } catch(e) {} onClose()`

---

## App JSX Wiring

### Moodboard component call (~line 7439):
```jsx
<Moodboard closetItems={...} activeIdx={moodboardActiveIdx} setActiveIdx={setMoodboardActiveIdx}
  boards={moodboardsDb.boards} updateBoards={moodboardsDb.updateBoards} removeBoardById={moodboardsDb.removeBoardById} />
```

### MoodboardInfoPanel call (~line 7547):
```jsx
<MoodboardInfoPanel
  activeIdx={moodboardActiveIdx} setActiveIdx={setMoodboardActiveIdx}
  boards={moodboardsDb.boards} updateBoards={moodboardsDb.updateBoards}
  updateBoardById={moodboardsDb.updateBoardById} removeBoardById={moodboardsDb.removeBoardById}
  lookbooksDb={lookbooksDb.rows}
  createLookbook={async ({id: newId, name, moodboardId}) => { ... }}
  addMoodboardToLookbook={async (lookbookId, board) => {
    const lb = lookbooksDb.rows.find(l => l.id === lookbookId);
    // tries wrapped then flat Supabase update
    // calls lookbooksDb.update(updated), setActiveLookbook(updated), lookbooksDb.refresh()
  }}
  onGoToLookbook={(lb) => {
    const fresh = lookbooksDb.rows.find(r => r.id === lb.id) || lb;
    const withMb = fresh.moodboardId ? fresh : { ...fresh, moodboardId: lb.moodboardId };
    setActiveLookbookView("moodboard");
    setTab("lookbooks");
    setActiveLookbook(withMb);
  }} />
```

### LookbookViewer call (~line 7950):
```jsx
<LookbookViewer
  key={activeLookbook.id + "_" + activeLookbookView}
  lookbook={activeLookbook} ... moodboardsProp={moodboardsDb.boards}
  initialView={activeLookbookView}
  onClose={() => { setActiveLookbook(null); setActiveLookbookView("editorial"); }}
  onUpdate={updateLookbook} ... />
```

### updateLookbook (~line 6874):
```js
const updateLookbook = async (lb) => {
  try {
    await lookbooksDb.update(lb);
    setActiveLookbook(lb);
  } catch(e) {
    console.error("updateLookbook error:", e);
    setActiveLookbook(lb); // still update local state
  }
};
```

---

## Settings Tab
- **3 tabs:** Appearance / Preferences / Data
- **Appearance:** Themes (removed Midnight/Slate/Sand, added Sky/Lilac), nav labels toggle, density
- **Preferences:** Budget/spending targets (monthly + annual), custom categories/occasions/seasons
- **Data:** Wear counts, tag lists, archived moodboards restore/delete
- ARCHIVE_KEY = "wardrobe_moodboards_archived_v1"
- MB_ACTIVE_KEY = "wardrobe_moodboards_v1"

---

## Themes
Available: Default, Rose, Sky, Lilac (Midnight, Slate, Sand removed)

---

## Stats / Style Profile Tab
- **4 tabs:** Overview, Style DNA, Wardrobe Gaps, Archetype Quiz
- Style archetype quiz
- Color DNA panel
- Weekly wear strip
- Categories / brands / seasons / occasions breakdown
- Most worn / most valuable items

---

## Outfits Tab
- Left sidebar: search, season/occasion filters, sort
- Calendar view with weather
- Outfit detail popup (wear history, similar tab)
- Builder: floating toolbar, auto-arrange, live preview, click-to-deselect, undo/redo, lock layers
- Outfit drafts panel
- Capsule tab in builder

---

## Closet Tab
- Zoom slider
- Multi-category filter
- What's New section
- Color swatches
- Capsules (right panel replaces wardrobe stats)
- Bulk actions
- Item fields: name, category, color, size, price (spent), purchase date, worn count, seasons, occasions, tags, notes, image
- URL-based product auto-fill via Claude API (multi-proxy fallback)
- BG removal: canvas-based + MaskEditor paint erase/restore

---

## Wishlist Tab
- Multiple lists
- Store field
- Purchase button
- Sort by store/category
- Priority levels
- Square grid matching closet style

---

## Seller Dashboard Tab
- List items for sale
- Status tracking (listed, sold, etc.)
- Sold history chart

---

## Lookbook Tab
- Search, sort, delete
- Date range, value on cards
- Zoom slider
- Create lookbook modal
- Tags on cards

---

## Bugs Fixed (this session: 2026-03-07 moodboard-to-lookbook + lookbook viewer)
1. `linkedMoodboardId` was useState (stale) → now derived from `lookbook.moodboardId` directly
2. `linkedLb` was useState (died on unmount) → now derived from `board?.linkedLb` (Supabase-backed)
3. `setLinkedLb` had stale closure bug → now uses `updateBoardById` functional updater
4. LookbookViewer always opened on "Looks" tab → now accepts `initialView` prop
5. Back arrow caused page reload → wrapped `save()` in try/catch, `onClose()` always called
6. `palette` 'not defined' ESLint error → moved board/palette declarations after useState hooks
7. `board before initialization` ReferenceError → fixed useEffect to not reference board
8. Moodboard data was localStorage-only → added `useMoodboardsDb` with Supabase sync
9. `update()` only tried wrapped schema → added flat schema fallback
10. Weather "City not found" for "Orlando, FL" → now strips `, State` before geocoding API call
11. Add Looks was a small inline list → replaced with full modal (search + tag filter + grid)
12. No nights stat → added Nights tile to stats grid
13. No way to edit dates/name inside lookbook → added Lookbook Details section to right sidebar

---

## Pending / Possible Next Steps
- Verify `moodboards` table exists in Supabase (SQL above)
- PNG export option for moodboard
- Lookbook: cover photo from outfit image, duplicate lookbook, export as image collage
- Outfit calendar packing lists
- Seller dashboard improvements
- Cost-per-wear tracking
- Outfit suggestions / AI styling
- Board background color picker (removed from right rail — may want to re-add)

---

## Transcript Archive
All session transcripts at `/mnt/transcripts/`. See `journal.txt` for catalog.

| Date | File | Summary |
|------|------|---------|
| 2026-03-06 | outfit-builder-features | Full-screen outfit builder, drag-and-drop canvas, layering |
| 2026-03-06 | wardrobe-app-features-update | Outfit builder filters, seasons, lookbooks, SVG icons, Supabase setup |
| 2026-03-06 | wardrobe-app-closet-features | 4:5 canvas, PNG preview, lookbook fixes, outfits tab redesign |
| 2026-03-06 | wardrobe-app-closet-features (2) | Closet redesign, item fields, ClosetStats, category/color/size overhaul |
| 2026-03-06 | wardrobe-app-item-form-image-tools | AddItemModal unified, BG removal, MaskEditor, image tools, item card redesign |
| 2026-03-07 | wardrobe-app-outfits-lookbooks-builder | Item/outfit/lookbook popups redesign, outfit builder undo/redo, Supabase bug fix |
| 2026-03-07 | wardrobe-app-lookbooks-moodboard | ESLint fixes, OutfitDetailPopup, lookbook overhaul, Moodboard tab, Vercel deploy |
| 2026-03-07 | wardrobe-app-features-visual | Seller dashboard, bulk actions, Stats tab, global search, pack list, visual refresh |
| 2026-03-07 | wardrobe-app-wishlist-nav-ui | Wishlist overhaul, nav labels, toolbar dropdowns, Story→Stats rename, SVG icons |
| 2026-03-07 | wardrobe-app-svg-icons-ui-fixes | Emoji→SVG global, wishlist card redesign, moodboard sync, dropdown fixes |
| 2026-03-07 | wardrobe-app-features-session2 | Icon spacing, color palette panel, wishlist popup, Settings tab, capsules, URL auto-fill |
| 2026-03-07 | wardrobe-app-session3 | ItemDetailPopup redesign, capsules panel, URL import proxy fix |
| 2026-03-07 | wardrobe-app-session4 | Outfits calendar view + weather, wear history, builder improvements |
| 2026-03-07 | wardrobe-app-session5 | Lookbook editorial view, drag reorder, weather, packing list, PDF export |
| 2026-03-07 | wardrobe-app-session6 | Lookbook toolbar, Style Profile tab, Settings tab overhaul, nav sidebar 160px |
| 2026-03-07 | wardrobe-app-session6-icons | Custom SVG nav icon replacement |
| 2026-03-07 | wardrobe-app-session7-icons-empty-states | Custom icons implemented, logo, empty states, weekly wear strip |
| 2026-03-07 | wardrobe-app-session8-nav-fixes | JSX syntax fix, HC monogram logo, nav tab reorder |
| 2026-03-07 | wardrobe-app-session9-settings-moodboard | Settings restructure, budget targets, themes, moodboard audit |
| 2026-03-07 | wardrobe-app-moodboard-overhaul | Moodboard overhaul: inline edit, flip, keyboard shortcuts, undo/redo, linking |
| 2026-03-07 | (this session) | Moodboard↔lookbook linking, Supabase sync, LookbookViewer fixes, Add Looks modal, weather fix, nights stat, date/name editing |
