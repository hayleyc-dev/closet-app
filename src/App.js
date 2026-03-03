import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories", "Other"];
const COLORS = ["Black", "White", "Grey", "Beige", "Brown", "Navy", "Blue", "Green", "Red", "Pink", "Purple", "Yellow", "Orange", "Multicolor"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season"];

const uid = () => Math.random().toString(36).slice(2);

const C = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#2a2a2a",
  borderHover: "#404040",
  accent: "#e8d5b0",
  accentDim: "#e8d5b015",
  text: "#f0f0f0",
  textMuted: "#555",
  textDim: "#888",
  danger: "#e05555",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; color: #f0f0f0; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-up { animation: fadeUp 0.35s ease forwards; }
  .fade-in { animation: fadeIn 0.25s ease forwards; }
  .card-hover { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
  .card-hover:hover { border-color: #404040 !important; transform: translateY(-2px); box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important; }
  .btn-hover { transition: all 0.15s; }
  .btn-hover:hover { opacity: 0.8; }
  .tab-line { position: relative; }
  .tab-line::after { content: ''; position: absolute; bottom: 0; left: 50%; right: 50%; height: 1px; background: #e8d5b0; transition: all 0.25s ease; }
  .tab-line.active::after { left: 0; right: 0; }
  input:focus, select:focus { border-color: #e8d5b0 !important; outline: none; }
`;

function useSupabaseTable(table) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from(table).select("*").order("created_at");
      if (!error) setRows(data.map(r => ({ ...r.data, id: r.id })));
      setLoading(false);
    }
    load();
  }, [table]);
  const add = async (item) => {
    const { error } = await supabase.from(table).insert({ id: item.id, data: item });
    if (!error) setRows(r => [...r, item]);
  };
  const update = async (item) => {
    const { error } = await supabase.from(table).update({ data: item }).eq("id", item.id);
    if (!error) setRows(r => r.map(i => i.id === item.id ? item : i));
  };
  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) setRows(r => r.filter(i => i.id !== id));
  };
  return { rows, loading, add, update, remove };
}

const Tag = ({ label }) => (
  <span style={{
    background: "#e8d5b015", color: "#e8d5b0",
    border: "1px solid #e8d5b025",
    borderRadius: 4, padding: "2px 8px",
    fontSize: 10, letterSpacing: "0.08em",
    textTransform: "uppercase", fontWeight: 500
  }}>{label}</span>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fade-in" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      backdropFilter: "blur(6px)"
    }}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#141414", borderRadius: 16, padding: "28px 24px", width: "100%",
        maxWidth: 480, maxHeight: "85vh", overflowY: "auto",
        border: "1px solid #2a2a2a", boxShadow: "0 40px 80px rgba(0,0,0,0.7)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#f0f0f0", fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1px solid #2a2a2a", borderRadius: 8,
  background: "#0a0a0a", color: "#f0f0f0",
  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
  transition: "border-color 0.2s"
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>{label}</label>}
    <input style={inputStyle} {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>{label}</label>}
    <select style={{ ...inputStyle, appearance: "none" }} {...props}>
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", style: extra = {}, ...props }) => {
  const base = { padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", border: "none" };
  const variants = {
    primary: { background: "#e8d5b0", color: "#0a0a0a" },
    outline: { background: "transparent", color: "#f0f0f0", border: "1px solid #2a2a2a" },
    ghost: { background: "transparent", color: "#888", border: "none" },
    danger: { background: "transparent", color: "#e05555", border: "1px solid #e0555533", padding: "5px 12px", fontSize: 11 },
    small: { background: "transparent", color: "#888", border: "1px solid #2a2a2a", padding: "5px 12px", fontSize: 11 },
  };
  return <button className="btn-hover" style={{ ...base, ...variants[variant], ...extra }} {...props}>{children}</button>;
};

const BLANK = { name: "", category: "", color: "", season: "", brand: "", notes: "", image: "", price: "" };

function ItemForm({ initial = BLANK, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const imgRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleImg = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("image", ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div onClick={() => imgRef.current.click()} style={{
          width: 88, height: 108, borderRadius: 10, flexShrink: 0,
          border: `1px dashed ${form.image ? "transparent" : "#2a2a2a"}`,
          background: form.image ? `url(${form.image}) center/cover` : "#0a0a0a",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#333", overflow: "hidden"
        }}>
          {!form.image && <span style={{ fontSize: 24 }}>+</span>}
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Silk blouse" />
          <Input label="Brand" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="optional" />
        </div>
      </div>
      <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Select label="Category" options={CATEGORIES} value={form.category} onChange={e => set("category", e.target.value)} />
        <Select label="Color" options={COLORS} value={form.color} onChange={e => set("color", e.target.value)} />
        <Select label="Season" options={SEASONS} value={form.season} onChange={e => set("season", e.target.value)} />
        <Input label="Price" value={form.price} onChange={e => set("price", e.target.value)} placeholder="$" />
      </div>
      <Input label="Notes" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="fabric, fit, occasions…" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={() => form.name && onSave(form)}>Save piece</Btn>
      </div>
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete, selectable, selected, onSelect }) {
  return (
    <div className="card-hover" onClick={selectable ? () => onSelect(item.id) : undefined} style={{
      background: "#141414", borderRadius: 12, overflow: "hidden",
      border: `1px solid ${selected ? "#e8d5b0" : "#2a2a2a"}`,
      cursor: selectable ? "pointer" : "default",
      boxShadow: selected ? "0 0 0 1px #e8d5b0" : "none",
    }}>
      <div style={{
        height: selectable ? 100 : 190, position: "relative",
        background: item.image ? `url(${item.image}) center/cover` : "#0d0d0d",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!item.image && <span style={{ fontSize: 28, opacity: 0.08, color: "#fff" }}>◈</span>}
        {selected && (
          <div style={{
            position: "absolute", top: 8, right: 8, width: 20, height: 20,
            background: "#e8d5b0", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#0a0a0a", fontWeight: 700
          }}>✓</div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f0f0", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
        {item.brand && !selectable && <div style={{ fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: "0.04em" }}>{item.brand}</div>}
        {!selectable && (
          <>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
              {item.category && <Tag label={item.category} />}
              {item.price && <Tag label={item.price} />}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="small" onClick={() => onEdit(item)}>Edit</Btn>
              <Btn variant="danger" onClick={() => onDelete(item.id)}>Remove</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const itemsDb = useSupabaseTable("items");
  const wishlistDb = useSupabaseTable("wishlist");
  const outfitsDb = useSupabaseTable("outfits");

  const [tab, setTab] = useState("closet");
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [outfitName, setOutfitName] = useState("");
  const [outfitSelected, setOutfitSelected] = useState([]);
  const [outfitModal, setOutfitModal] = useState(false);

  const closeModal = () => { setModal(null); setEditItem(null); };

  const saveItem = async (form, db) => {
    if (editItem) await db.update({ ...form, id: editItem.id });
    else await db.add({ ...form, id: uid() });
    closeModal();
  };

  const moveToCloset = async (wish) => {
    await itemsDb.add({ ...wish });
    await wishlistDb.remove(wish.id);
  };

  const saveOutfit = async () => {
    if (!outfitName || outfitSelected.length === 0) return;
    await outfitsDb.add({ id: uid(), name: outfitName, itemIds: outfitSelected });
    setOutfitName(""); setOutfitSelected([]); setOutfitModal(false);
  };

  const filteredItems = itemsDb.rows.filter(i => {
    const matchText = !filter || i.name.toLowerCase().includes(filter.toLowerCase()) || (i.brand || "").toLowerCase().includes(filter.toLowerCase());
    return matchText && (!catFilter || i.category === catFilter);
  });

  const tabs = [
    { id: "closet", label: "Closet", count: itemsDb.rows.length },
    { id: "outfits", label: "Outfits", count: outfitsDb.rows.length },
    { id: "wishlist", label: "Wishlist", count: wishlistDb.rows.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <style>{globalStyles}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1a1a1a", padding: "0 28px",
        position: "sticky", top: 0, zIndex: 50, background: "#0a0a0acc",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#444", textTransform: "uppercase", marginBottom: 5 }}>personal wardrobe</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f0f0", fontWeight: 400, letterSpacing: "0.02em" }}>Atelier</h1>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "1px solid #2a2a2a",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#e8d5b0", fontSize: 13
            }}>✦</div>
          </div>
          <div style={{ display: "flex" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`tab-line ${tab === t.id ? "active" : ""}`}
                style={{
                  padding: "10px 18px 11px", background: "none", border: "none",
                  cursor: "pointer", color: tab === t.id ? "#f0f0f0" : "#444",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  fontWeight: tab === t.id ? 500 : 400, letterSpacing: "0.02em",
                  transition: "color 0.2s"
                }}>
                {t.label}
                <span style={{ marginLeft: 5, fontSize: 10, color: tab === t.id ? "#e8d5b0" : "#333" }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ padding: "36px 28px", maxWidth: 980, margin: "0 auto" }}>
        {itemsDb.loading ? (
          <div style={{ textAlign: "center", padding: "120px 0", color: "#333", fontSize: 11, letterSpacing: "0.2em" }}>LOADING</div>
        ) : (
          <>
            {/* CLOSET */}
            {tab === "closet" && (
              <div className="fade-up">
                <div style={{ display: "flex", gap: 10, marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
                  <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search…"
                    style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
                  <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    style={{ ...inputStyle, width: "auto", appearance: "none" }}>
                    <option value="">All categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Btn onClick={() => { setEditItem(null); setModal("item"); }}>+ Add piece</Btn>
                </div>
                {filteredItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "100px 0" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#333", textTransform: "uppercase" }}>Your closet is empty</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                    {filteredItems.map((item, i) => (
                      <div key={item.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                        <ItemCard item={item} onEdit={i => { setEditItem(i); setModal("item"); }} onDelete={itemsDb.remove} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OUTFITS */}
            {tab === "outfits" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
                  <Btn onClick={() => { setOutfitSelected([]); setOutfitName(""); setOutfitModal(true); }}>+ Build outfit</Btn>
                </div>
                {outfitsDb.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "100px 0" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#333", textTransform: "uppercase" }}>No outfits yet</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {outfitsDb.rows.map((outfit, i) => {
                      const outfitItems = outfit.itemIds.map(id => itemsDb.rows.find(x => x.id === id)).filter(Boolean);
                      return (
                        <div key={outfit.id} className="card-hover fade-up" style={{
                          background: "#141414", borderRadius: 14, border: "1px solid #2a2a2a",
                          overflow: "hidden", animationDelay: `${i * 0.06}s`, opacity: 0
                        }}>
                          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(outfitItems.length, 4)}, 1fr)`, height: 110 }}>
                            {outfitItems.slice(0, 4).map(item => (
                              <div key={item.id} style={{
                                background: item.image ? `url(${item.image}) center/cover` : "#0d0d0d",
                                display: "flex", alignItems: "center", justifyContent: "center"
                              }}>
                                {!item.image && <span style={{ opacity: 0.06, fontSize: 18, color: "#fff" }}>◈</span>}
                              </div>
                            ))}
                          </div>
                          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 500, color: "#f0f0f0", marginBottom: 3 }}>{outfit.name}</div>
                              <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>{outfitItems.length} piece{outfitItems.length !== 1 ? "s" : ""}</div>
                            </div>
                            <Btn variant="danger" onClick={() => outfitsDb.remove(outfit.id)}>Remove</Btn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST */}
            {tab === "wishlist" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
                  <Btn onClick={() => { setEditItem(null); setModal("wish"); }}>+ Add to wishlist</Btn>
                </div>
                {wishlistDb.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "100px 0" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#333", textTransform: "uppercase" }}>Your wishlist is empty</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                    {wishlistDb.rows.map((item, i) => (
                      <div key={item.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                        <div className="card-hover" style={{ background: "#141414", borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a2a" }}>
                          <div style={{
                            height: 190,
                            background: item.image ? `url(${item.image}) center/cover` : "#0d0d0d",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {!item.image && <span style={{ opacity: 0.06, fontSize: 28, color: "#fff" }}>◈</span>}
                          </div>
                          <div style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f0f0", marginBottom: 2 }}>{item.name}</div>
                            {item.brand && <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>{item.brand}</div>}
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                              {item.category && <Tag label={item.category} />}
                              {item.price && <Tag label={item.price} />}
                            </div>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              <Btn style={{ padding: "5px 12px", fontSize: 11 }} onClick={() => moveToCloset(item)}>→ Closet</Btn>
                              <Btn variant="small" onClick={() => { setEditItem(item); setModal("wish"); }}>Edit</Btn>
                              <Btn variant="danger" onClick={() => wishlistDb.remove(item.id)}>✕</Btn>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Modal open={modal === "item"} onClose={closeModal} title={editItem ? "Edit piece" : "Add to closet"}>
        <ItemForm initial={editItem || BLANK} onSave={f => saveItem(f, itemsDb)} onCancel={closeModal} />
      </Modal>
      <Modal open={modal === "wish"} onClose={closeModal} title={editItem ? "Edit wishlist item" : "Add to wishlist"}>
        <ItemForm initial={editItem || BLANK} onSave={f => saveItem(f, wishlistDb)} onCancel={closeModal} />
      </Modal>

      <Modal open={outfitModal} onClose={() => setOutfitModal(false)} title="Build an outfit">
        <Input label="Outfit name" value={outfitName} onChange={e => setOutfitName(e.target.value)} placeholder="e.g. Casual Sunday" />
        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: 14 }}>
          Select pieces — {outfitSelected.length} selected
        </div>
        {itemsDb.rows.length === 0 ? (
          <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Add pieces to your closet first</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginBottom: 20 }}>
            {itemsDb.rows.map(item => (
              <ItemCard key={item.id} item={item} selectable
                selected={outfitSelected.includes(item.id)}
                onSelect={id => setOutfitSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setOutfitModal(false)}>Cancel</Btn>
          <Btn onClick={saveOutfit}>Save outfit</Btn>
        </div>
      </Modal>
    </div>
  );
}
