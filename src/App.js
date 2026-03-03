import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories", "Other"];
const COLORS = ["Black", "White", "Grey", "Beige", "Brown", "Navy", "Blue", "Green", "Red", "Pink", "Purple", "Yellow", "Orange", "Multicolor"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season"];

const uid = () => Math.random().toString(36).slice(2);

// Generic hook to load/save a table from Supabase
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

const TAG = ({ label, color = "#c8b49a" }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 99, padding: "2px 10px", fontSize: 11, fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "0.05em", fontWeight: 600
  }}>{label}</span>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(40,32,24,0.45)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#faf8f4", borderRadius: 16, padding: "32px 28px", width: "100%",
        maxWidth: 480, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(40,32,24,0.18)", border: "1px solid #e8e0d4"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#3a2e24", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9a8a7a" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", color: "#9a8a7a", fontFamily: "sans-serif", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
    <input style={{
      width: "100%", boxSizing: "border-box", padding: "9px 12px",
      border: "1.5px solid #e0d6c8", borderRadius: 8, background: "#fff",
      fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#3a2e24", outline: "none"
    }} {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", color: "#9a8a7a", fontFamily: "sans-serif", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
    <select style={{
      width: "100%", padding: "9px 12px", border: "1.5px solid #e0d6c8", borderRadius: 8,
      background: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#3a2e24", outline: "none"
    }} {...props}>
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", ...props }) => (
  <button style={{
    padding: variant === "small" ? "6px 14px" : "10px 22px",
    background: variant === "primary" ? "#3a2e24" : variant === "danger" ? "#c0392b" : "transparent",
    color: variant === "outline" ? "#3a2e24" : "#faf8f4",
    border: variant === "outline" ? "1.5px solid #c8b49a" : "none",
    borderRadius: 8, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif",
    fontSize: variant === "small" ? 13 : 15, fontWeight: 600, letterSpacing: "0.03em",
    transition: "opacity 0.15s"
  }} {...props}>{children}</button>
);

const BLANK_ITEM = { name: "", category: "", color: "", season: "", brand: "", notes: "", image: "", price: "" };

function ItemForm({ initial = BLANK_ITEM, onSave, onCancel }) {
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
      <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
        <div onClick={() => imgRef.current.click()} style={{
          width: 90, height: 110, borderRadius: 10, border: "1.5px dashed #c8b49a",
          background: form.image ? `url(${form.image}) center/cover` : "#f5f0e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: "#c8b49a", fontSize: 28
        }}>
          {!form.image && "+"}
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
      <Input label="Notes" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="fabric, fit, where to wear…" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={() => form.name && onSave(form)}>Save</Btn>
      </div>
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete, compact = false }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, overflow: "hidden",
      border: "1px solid #e8e0d4", boxShadow: "0 2px 8px rgba(40,32,24,0.06)"
    }}>
      <div style={{
        height: compact ? 100 : 160,
        background: item.image ? `url(${item.image}) center/cover` : "#f0ebe0",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#c8b49a", fontSize: 36
      }}>
        {!item.image && "👗"}
      </div>
      <div style={{ padding: compact ? "10px 12px" : "14px" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: compact ? 14 : 16, fontWeight: 700, color: "#3a2e24", marginBottom: 4 }}>{item.name}</div>
        {item.brand && <div style={{ fontSize: 11, color: "#9a8a7a", marginBottom: 6, letterSpacing: "0.05em" }}>{item.brand}</div>}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {item.category && <TAG label={item.category} color="#8a7a6a" />}
          {item.season && <TAG label={item.season} color="#6a8a7a" />}
          {item.price && <TAG label={item.price} color="#9a6a4a" />}
        </div>
        {!compact && (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="small outline" onClick={() => onEdit(item)}>Edit</Btn>
            <Btn variant="small danger" onClick={() => onDelete(item.id)}>Remove</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClosetApp() {
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
    if (editItem) {
      await db.update({ ...form, id: editItem.id });
    } else {
      await db.add({ ...form, id: uid() });
    }
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

  const toggleOutfitItem = (id) =>
    setOutfitSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const filteredItems = itemsDb.rows.filter(i => {
    const matchText = !filter || i.name.toLowerCase().includes(filter.toLowerCase()) || (i.brand || "").toLowerCase().includes(filter.toLowerCase());
    const matchCat = !catFilter || i.category === catFilter;
    return matchText && matchCat;
  });

  const tabs = [
    { id: "closet", label: "My Closet", count: itemsDb.rows.length },
    { id: "outfits", label: "Outfits", count: outfitsDb.rows.length },
    { id: "wishlist", label: "Wishlist", count: wishlistDb.rows.length },
  ];

  const isLoading = itemsDb.loading || wishlistDb.loading || outfitsDb.loading;

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f4", fontFamily: "sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#3a2e24", padding: "24px 24px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, letterSpacing: "0.3em", color: "#c8b49a", textTransform: "uppercase", marginBottom: 6 }}>my wardrobe</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#faf8f4", margin: "0 0 20px", fontWeight: 400 }}>✦ Atelier</h1>
        <div style={{ display: "flex", gap: 0, justifyContent: "center" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 20px", background: tab === t.id ? "#faf8f4" : "transparent",
              color: tab === t.id ? "#3a2e24" : "#c8b49a", border: "none", cursor: "pointer",
              fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 600,
              letterSpacing: "0.06em", borderRadius: "8px 8px 0 0", transition: "all 0.2s"
            }}>
              {t.label} <span style={{ opacity: 0.6, fontSize: 11 }}>({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#9a8a7a", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
            Loading your wardrobe…
          </div>
        ) : (
          <>
            {/* CLOSET TAB */}
            {tab === "closet" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search your closet…" style={{
                    flex: 1, minWidth: 160, padding: "9px 14px", border: "1.5px solid #e0d6c8", borderRadius: 8,
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#3a2e24", background: "#fff", outline: "none"
                  }} />
                  <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{
                    padding: "9px 12px", border: "1.5px solid #e0d6c8", borderRadius: 8,
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "#3a2e24", background: "#fff", outline: "none"
                  }}>
                    <option value="">All categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Btn onClick={() => { setEditItem(null); setModal("item"); }}>+ Add Piece</Btn>
                </div>
                {filteredItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a8a7a", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                    Your closet is empty — start adding pieces ✦
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                    {filteredItems.map(item => (
                      <ItemCard key={item.id} item={item}
                        onEdit={i => { setEditItem(i); setModal("item"); }}
                        onDelete={itemsDb.remove}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OUTFITS TAB */}
            {tab === "outfits" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                  <Btn onClick={() => { setOutfitSelected([]); setOutfitName(""); setOutfitModal(true); }}>+ Build Outfit</Btn>
                </div>
                {outfitsDb.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a8a7a", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                    No outfits yet — build your first look ✦
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                    {outfitsDb.rows.map(outfit => {
                      const outfitItems = outfit.itemIds.map(id => itemsDb.rows.find(i => i.id === id)).filter(Boolean);
                      return (
                        <div key={outfit.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e0d4", overflow: "hidden", boxShadow: "0 2px 8px rgba(40,32,24,0.06)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                            {outfitItems.slice(0, 4).map(item => (
                              <div key={item.id} style={{
                                height: 90, background: item.image ? `url(${item.image}) center/cover` : "#f0ebe0",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#c8b49a"
                              }}>{!item.image && "👗"}</div>
                            ))}
                          </div>
                          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: "#3a2e24" }}>{outfit.name}</div>
                              <div style={{ fontSize: 12, color: "#9a8a7a", marginTop: 2 }}>{outfitItems.length} piece{outfitItems.length !== 1 ? "s" : ""}</div>
                            </div>
                            <Btn variant="small danger" onClick={() => outfitsDb.remove(outfit.id)}>Remove</Btn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {tab === "wishlist" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                  <Btn onClick={() => { setEditItem(null); setModal("wish"); }}>+ Add to Wishlist</Btn>
                </div>
                {wishlistDb.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a8a7a", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                    Your wishlist is empty — add pieces you're dreaming of ✦
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                    {wishlistDb.rows.map(item => (
                      <div key={item.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e8e0d4", boxShadow: "0 2px 8px rgba(40,32,24,0.06)" }}>
                        <div style={{
                          height: 160, background: item.image ? `url(${item.image}) center/cover` : "#f0ebe0",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#c8b49a", fontSize: 36
                        }}>{!item.image && "🛍️"}</div>
                        <div style={{ padding: 14 }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: "#3a2e24", marginBottom: 4 }}>{item.name}</div>
                          {item.brand && <div style={{ fontSize: 11, color: "#9a8a7a", marginBottom: 6 }}>{item.brand}</div>}
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                            {item.category && <TAG label={item.category} color="#8a7a6a" />}
                            {item.price && <TAG label={item.price} color="#9a6a4a" />}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <Btn variant="small" onClick={() => moveToCloset(item)}>→ Closet</Btn>
                            <Btn variant="small outline" onClick={() => { setEditItem(item); setModal("wish"); }}>Edit</Btn>
                            <Btn variant="small danger" onClick={() => wishlistDb.remove(item.id)}>✕</Btn>
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
      </div>

      {/* ADD/EDIT ITEM MODAL */}
      <Modal open={modal === "item"} onClose={closeModal} title={editItem ? "Edit Piece" : "Add to Closet"}>
        <ItemForm initial={editItem || BLANK_ITEM} onSave={f => saveItem(f, itemsDb)} onCancel={closeModal} />
      </Modal>

      {/* ADD/EDIT WISHLIST MODAL */}
      <Modal open={modal === "wish"} onClose={closeModal} title={editItem ? "Edit Wishlist Item" : "Add to Wishlist"}>
        <ItemForm initial={editItem || BLANK_ITEM} onSave={f => saveItem(f, wishlistDb)} onCancel={closeModal} />
      </Modal>

      {/* BUILD OUTFIT MODAL */}
      <Modal open={outfitModal} onClose={() => setOutfitModal(false)} title="Build an Outfit">
        <Input label="Outfit Name" value={outfitName} onChange={e => setOutfitName(e.target.value)} placeholder="e.g. Casual Sunday" />
        <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "#9a8a7a", textTransform: "uppercase", marginBottom: 10, fontFamily: "sans-serif" }}>
          Select pieces ({outfitSelected.length} selected)
        </div>
        {itemsDb.rows.length === 0 ? (
          <div style={{ color: "#9a8a7a", fontFamily: "'Cormorant Garamond', serif", fontSize: 15, textAlign: "center", padding: "20px 0" }}>Add some pieces to your closet first!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10, marginBottom: 20 }}>
            {itemsDb.rows.map(item => (
              <div key={item.id} onClick={() => toggleOutfitItem(item.id)} style={{
                borderRadius: 10, overflow: "hidden", cursor: "pointer",
                border: outfitSelected.includes(item.id) ? "2.5px solid #3a2e24" : "1.5px solid #e0d6c8",
                transform: outfitSelected.includes(item.id) ? "scale(1.03)" : "scale(1)",
                transition: "all 0.15s"
              }}>
                <div style={{
                  height: 80, background: item.image ? `url(${item.image}) center/cover` : "#f0ebe0",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#c8b49a"
                }}>{!item.image && "👗"}</div>
                <div style={{ padding: "6px 8px", fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: "#3a2e24", fontWeight: 600 }}>{item.name}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="outline" onClick={() => setOutfitModal(false)}>Cancel</Btn>
          <Btn onClick={saveOutfit}>Save Outfit</Btn>
        </div>
      </Modal>
    </div>
  );
}
