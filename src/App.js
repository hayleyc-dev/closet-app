import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories", "Other"];
const COLORS = ["Black", "White", "Grey", "Beige", "Brown", "Navy", "Blue", "Green", "Red", "Pink", "Purple", "Yellow", "Orange", "Multicolor"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season"];

const uid = () => Math.random().toString(36).slice(2);

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8f7f4; color: #1a1a1a; font-family: 'Nunito', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #e0dbd0; border-radius: 4px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-up { animation: fadeUp 0.3s ease forwards; }
  .fade-in { animation: fadeIn 0.2s ease forwards; }
  .card { transition: transform 0.2s, box-shadow 0.2s; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08) !important; }
  .pill { transition: all 0.18s; cursor: pointer; }
  .pill:hover { background: #ede9e0 !important; }
  .btn-primary { transition: all 0.15s; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #c8b99a !important; }
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

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #e8e2d8", borderRadius: 12,
  background: "#fff", color: "#1a1a1a",
  fontFamily: "'Nunito', sans-serif", fontSize: 14,
  transition: "border-color 0.2s"
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</label>}
    <input style={inputStyle} {...props} />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</label>}
    <select style={{ ...inputStyle, appearance: "none" }} {...props}>
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fade-in" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      backdropFilter: "blur(4px)"
    }}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, padding: "28px 24px", width: "100%",
        maxWidth: 480, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", background: "#f5f3ef",
            border: "none", cursor: "pointer", fontSize: 16, color: "#999",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
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
          width: 90, height: 110, borderRadius: 16, flexShrink: 0,
          border: `2px dashed ${form.image ? "transparent" : "#e0dbd0"}`,
          background: form.image ? `url(${form.image}) center/cover` : "#faf9f6",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", fontSize: 26, color: "#ccc"
        }}>
          {!form.image && "+"}
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Linen blazer" />
          <Input label="Brand" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="optional" />
        </div>
      </div>
      <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <SelectField label="Category" options={CATEGORIES.filter(c => c !== "All")} value={form.category} onChange={e => set("category", e.target.value)} />
        <SelectField label="Color" options={COLORS} value={form.color} onChange={e => set("color", e.target.value)} />
        <SelectField label="Season" options={SEASONS} value={form.season} onChange={e => set("season", e.target.value)} />
        <Input label="Price" value={form.price} onChange={e => set("price", e.target.value)} placeholder="$" />
      </div>
      <Input label="Notes" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="fabric, fit, occasions…" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <button onClick={onCancel} style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 600 }}>Cancel</button>
        <button className="btn-primary" onClick={() => form.name && onSave(form)} style={{
          padding: "10px 22px", background: "#1a1a1a", color: "#fff", border: "none",
          borderRadius: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
          fontSize: 14, fontWeight: 700
        }}>Save</button>
      </div>
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete, selectable, selected, onSelect }) {
  return (
    <div className="card" onClick={selectable ? () => onSelect(item.id) : undefined} style={{
      background: "#fff", borderRadius: 18, overflow: "hidden",
      border: selected ? "2px solid #1a1a1a" : "1.5px solid #f0ece4",
      cursor: selectable ? "pointer" : "default",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      position: "relative"
    }}>
      <div style={{
        height: selectable ? 90 : 200,
        background: item.image ? `url(${item.image}) center/cover` : "#f5f3ef",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!item.image && <span style={{ fontSize: 32, opacity: 0.2 }}>👗</span>}
        {selected && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            width: 24, height: 24, borderRadius: "50%",
            background: "#1a1a1a", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700
          }}>✓</div>
        )}
      </div>
      {!selectable && (
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
          {item.brand && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>{item.brand}</div>}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
            {item.category && (
              <span style={{ background: "#f5f3ef", color: "#888", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{item.category}</span>
            )}
            {item.price && (
              <span style={{ background: "#f5f3ef", color: "#888", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{item.price}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onEdit(item)} style={{
              flex: 1, padding: "7px 0", background: "#f5f3ef", border: "none",
              borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: "#666", fontFamily: "'Nunito', sans-serif"
            }}>Edit</button>
            <button onClick={() => onDelete(item.id)} style={{
              flex: 1, padding: "7px 0", background: "#fef2f2", border: "none",
              borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: "#e05555", fontFamily: "'Nunito', sans-serif"
            }}>Remove</button>
          </div>
        </div>
      )}
      {selectable && (
        <div style={{ padding: "8px 10px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "closet", icon: "👗", label: "Closet" },
  { id: "outfits", icon: "✦", label: "Outfits" },
  { id: "wishlist", icon: "♡", label: "Wishlist" },
];

export default function App() {
  const itemsDb = useSupabaseTable("items");
  const wishlistDb = useSupabaseTable("wishlist");
  const outfitsDb = useSupabaseTable("outfits");

  const [tab, setTab] = useState("closet");
  const [modal, setModal] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
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

  const filteredItems = itemsDb.rows.filter(i =>
    catFilter === "All" || i.category === catFilter
  );

  const counts = { closet: itemsDb.rows.length, outfits: outfitsDb.rows.length, wishlist: wishlistDb.rows.length };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", paddingBottom: 90 }}>
      <style>{globalStyles}</style>

      {/* Header */}
      <div style={{
        background: "#fff", padding: "20px 24px 0",
        boxShadow: "0 1px 0 #f0ece4",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>My Wardrobe</h1>
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                {[
                  { label: "Items", val: itemsDb.rows.length },
                  { label: "Outfits", val: outfitsDb.rows.length },
                  { label: "Wishlist", val: wishlistDb.rows.length },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={() => { setEditItem(null); setModal(tab === "wishlist" ? "wish" : "item"); }} style={{
              width: 44, height: 44, borderRadius: "50%", background: "#1a1a1a",
              border: "none", cursor: "pointer", fontSize: 22, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
            }}>+</button>
          </div>

          {/* Category pills — only show on closet tab */}
          {tab === "closet" && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} className="pill" onClick={() => setCatFilter(cat)} style={{
                  padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: catFilter === cat ? "#1a1a1a" : "#f5f3ef",
                  color: catFilter === cat ? "#fff" : "#888",
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                  fontFamily: "'Nunito', sans-serif",
                  flexShrink: 0
                }}>{cat}</button>
              ))}
            </div>
          )}
          {tab !== "closet" && <div style={{ height: 14 }} />}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        {itemsDb.loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#ccc", fontSize: 13, fontWeight: 600 }}>Loading…</div>
        ) : (
          <>
            {/* CLOSET */}
            {tab === "closet" && (
              <div className="fade-up">
                {filteredItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👗</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#ccc" }}>Nothing here yet</div>
                    <div style={{ fontSize: 13, color: "#ddd", marginTop: 4 }}>Tap + to add your first piece</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
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
                <button className="btn-primary" onClick={() => { setOutfitSelected([]); setOutfitName(""); setOutfitModal(true); }} style={{
                  width: "100%", padding: "14px", background: "#1a1a1a", color: "#fff",
                  border: "none", borderRadius: 16, cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700,
                  marginBottom: 24
                }}>+ Build New Outfit</button>

                {outfitsDb.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#ccc" }}>No outfits yet</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {outfitsDb.rows.map((outfit, i) => {
                      const outfitItems = outfit.itemIds.map(id => itemsDb.rows.find(x => x.id === id)).filter(Boolean);
                      return (
                        <div key={outfit.id} className="card fade-up" style={{
                          background: "#fff", borderRadius: 20,
                          border: "1.5px solid #f0ece4", overflow: "hidden",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                          animationDelay: `${i * 0.06}s`, opacity: 0
                        }}>
                          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(outfitItems.length, 4)}, 1fr)`, height: 120 }}>
                            {outfitItems.slice(0, 4).map(item => (
                              <div key={item.id} style={{
                                background: item.image ? `url(${item.image}) center/cover` : "#f8f6f2",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {!item.image && <span style={{ opacity: 0.2, fontSize: 22 }}>👗</span>}
                              </div>
                            ))}
                          </div>
                          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{outfit.name}</div>
                              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{outfitItems.length} piece{outfitItems.length !== 1 ? "s" : ""}</div>
                            </div>
                            <button onClick={() => outfitsDb.remove(outfit.id)} style={{
                              padding: "7px 14px", background: "#fef2f2", border: "none",
                              borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
                              color: "#e05555", fontFamily: "'Nunito', sans-serif"
                            }}>Remove</button>
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
                {wishlistDb.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#ccc" }}>Your wishlist is empty</div>
                    <div style={{ fontSize: 13, color: "#ddd", marginTop: 4 }}>Tap + to add pieces you're dreaming of</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
                    {wishlistDb.rows.map((item, i) => (
                      <div key={item.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                        <div className="card" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1.5px solid #f0ece4", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                          <div style={{
                            height: 200, background: item.image ? `url(${item.image}) center/cover` : "#f5f3ef",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {!item.image && <span style={{ fontSize: 32, opacity: 0.2 }}>🛍️</span>}
                          </div>
                          <div style={{ padding: "12px 14px 14px" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{item.name}</div>
                            {item.brand && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>{item.brand}</div>}
                            {item.price && <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 10 }}>{item.price}</div>}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <button onClick={() => moveToCloset(item)} className="btn-primary" style={{
                                padding: "8px", background: "#1a1a1a", color: "#fff", border: "none",
                                borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
                                fontFamily: "'Nunito', sans-serif"
                              }}>→ Move to Closet</button>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => { setEditItem(item); setModal("wish"); }} style={{
                                  flex: 1, padding: "7px", background: "#f5f3ef", border: "none",
                                  borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
                                  color: "#666", fontFamily: "'Nunito', sans-serif"
                                }}>Edit</button>
                                <button onClick={() => wishlistDb.remove(item.id)} style={{
                                  flex: 1, padding: "7px", background: "#fef2f2", border: "none",
                                  borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
                                  color: "#e05555", fontFamily: "'Nunito', sans-serif"
                                }}>Remove</button>
                              </div>
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
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #f0ece4",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 20px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)"
      }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Nunito', sans-serif", padding: "4px 20px"
          }}>
            <span style={{ fontSize: 20, opacity: tab === n.id ? 1 : 0.35 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: tab === n.id ? "#1a1a1a" : "#bbb", letterSpacing: "0.02em" }}>{n.label}</span>
            {tab === n.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1a1a1a" }} />}
          </button>
        ))}
      </div>

      {/* Modals */}
      <Modal open={modal === "item"} onClose={closeModal} title={editItem ? "Edit piece" : "Add to closet"}>
        <ItemForm initial={editItem || BLANK} onSave={f => saveItem(f, itemsDb)} onCancel={closeModal} />
      </Modal>
      <Modal open={modal === "wish"} onClose={closeModal} title={editItem ? "Edit wishlist item" : "Add to wishlist"}>
        <ItemForm initial={editItem || BLANK} onSave={f => saveItem(f, wishlistDb)} onCancel={closeModal} />
      </Modal>

      <Modal open={outfitModal} onClose={() => setOutfitModal(false)} title="Build an outfit">
        <Input label="Outfit name" value={outfitName} onChange={e => setOutfitName(e.target.value)} placeholder="e.g. Casual Sunday" />
        <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Select pieces — {outfitSelected.length} selected
        </div>
        {itemsDb.rows.length === 0 ? (
          <div style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Add pieces to your closet first</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10, marginBottom: 20 }}>
            {itemsDb.rows.map(item => (
              <ItemCard key={item.id} item={item} selectable
                selected={outfitSelected.includes(item.id)}
                onSelect={id => setOutfitSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setOutfitModal(false)} style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button className="btn-primary" onClick={saveOutfit} style={{
            padding: "10px 22px", background: "#1a1a1a", color: "#fff", border: "none",
            borderRadius: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700
          }}>Save outfit</button>
        </div>
      </Modal>
    </div>
  );
}
