import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

// ── Global SVG icon helper ───────────────────────────────────────────────────
const Ico = ({ size = 16, color = "currentColor", children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle", ...style }}>
    {children}
  </svg>
);
const SvgTrash    = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></Ico>;
const SvgTag      = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Ico>;
const SvgCamera   = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></Ico>;
const SvgLink     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></Ico>;
const SvgHanger   = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M20.38 18.01L12 12 3.62 18a1 1 0 00.38 1.81h16a1 1 0 00.38-1.8z"/><path d="M12 12V7"/><circle cx="12" cy="5" r="2"/></Ico>;
const SvgHeart    = ({size=14,color="currentColor",fill="none"}) => <Ico size={size} color={color}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={fill}/></Ico>;
const SvgSearch   = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Ico>;
const SvgDownload = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>;
const SvgEdit     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></Ico>;
const SvgCopy     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></Ico>;
const SvgArrowUp  = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Ico>;
const SvgArrowDn  = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Ico>;
const SvgArrowL   = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Ico>;
const SvgArrowR   = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ico>;
const SvgCheck    = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><polyline points="20 6 9 17 4 12"/></Ico>;
const SvgStar     = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ico>;
const SvgCastle = ({size=14,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",flexShrink:0,verticalAlign:"middle"}}>
    <line x1="1" y1="22" x2="23" y2="22"/>
    {/* Outer left turret */}
    <path d="M2 22V17H5V22"/><path d="M2 17L3.5 14L5 17"/>
    {/* Outer right turret */}
    <path d="M19 22V17H22V22"/><path d="M19 17L20.5 14L22 17"/>
    {/* Inner left tower */}
    <path d="M5 22V12H9V22"/><path d="M5 12L7 8L9 12"/>
    {/* Inner right tower */}
    <path d="M15 22V12H19V22"/><path d="M15 12L17 8L19 12"/>
    {/* Center tall spire */}
    <path d="M9 22V7H15V22"/><path d="M9 7L12 2L15 7"/>
    {/* Arch gate */}
    <path d="M10.5 22V18.5a1.5 1.5 0 013 0V22"/>
    {/* Battlements */}
    <line x1="5" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="19" y2="12"/>
  </svg>
);
const SvgGrid     = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Ico>;
const SvgBox      = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Ico>;
const SvgFolder   = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></Ico>;
const SvgShop     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></Ico>;
const SvgCalendar = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>;
const SvgLuggage  = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></Ico>;
const SvgLock     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Ico>;
const SvgGear     = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></Ico>;
const SvgUnlock   = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></Ico>;
const SvgPushPin  = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14"/><path d="M15 5h1a2 2 0 012 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h1"/><rect x="9" y="2" width="6" height="4" rx="1"/></Ico>;
const SvgPalette  = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><path d="M12 2a10 10 0 100 20 4 4 0 004-4c0-1.1-.9-2-2-2h-1a1 1 0 010-2h1a2 2 0 002-2 10 10 0 00-4-10z"/><circle cx="8.5" cy="9" r="1.5" fill={color} stroke="none"/><circle cx="12" cy="6" r="1.5" fill={color} stroke="none"/><circle cx="15.5" cy="9" r="1.5" fill={color} stroke="none"/></Ico>;
const SvgDress = ({size=16,color="currentColor",style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {/* neckline */}
    <path d="M9 3 C9 3 9 6 12 6 C15 6 15 3 15 3" />
    {/* straps going out to shoulders */}
    <path d="M9 3 L5 8" />
    <path d="M15 3 L19 8" />
    {/* bodice sides */}
    <path d="M5 8 L7 13" />
    <path d="M19 8 L17 13" />
    {/* waist band */}
    <path d="M7 13 Q12 11 17 13" />
    {/* skirt flare */}
    <path d="M7 13 L3 22" />
    <path d="M17 13 L21 22" />
    <path d="M9.5 14 L8 22" />
    <path d="M14.5 14 L16 22" />
    <path d="M12 13.5 L12 22" />
  </svg>
);
const SvgSparkle  = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></Ico>;
const SvgCart     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.42H6"/></Ico>;


const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ["All", "Accessories", "Activewear", "Bags", "Denim", "Dresses", "Intimates", "Jewelry", "Knits", "Loungewear", "Outerwear", "Shoes", "Shorts + Skirts", "Sleepwear", "Socks + Tights", "Sweaters", "Swim", "Tops", "Trousers"];
const COLORS = ["Black", "Blue", "Brown", "Clear", "Cream", "Gold", "Green", "Grey", "Orange", "Pink", "Purple", "Red", "Silver", "Tan", "White", "Yellow"];
const COLOR_HEX = { Black:"#1a1a1a", Blue:"#4a7fc1", Brown:"#8b6250", Clear:"#e8e8e8", Cream:"#f5f0e8", Gold:"#d4a843", Green:"#5a8f5a", Grey:"#9a9a9a", Orange:"#e8823a", Pink:"#f0a0b8", Purple:"#9b72cf", Red:"#d45050", Silver:"#c0c0c0", Tan:"#c8a882", White:"#f8f8f8", Yellow:"#e8d050" };

function getColorSwatch(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("black")) return "#6b6869";
  if (n.includes("white") || n.includes("ivory") || n.includes("cream")) return "#f0ede8";
  if (n.includes("grey") || n.includes("gray")) return "#c2bfbc";
  if (n.includes("navy")) return "#b3bedc";
  if (n.includes("blue") || n.includes("denim")) return "#b3cfee";
  if (n.includes("red") || n.includes("scarlet")) return "#f5b8b8";
  if (n.includes("pink") || n.includes("blush") || n.includes("rose")) return "#f5c6d8";
  if (n.includes("coral") || n.includes("salmon")) return "#f5c4b0";
  if (n.includes("orange") || n.includes("rust") || n.includes("terra")) return "#f5d0b0";
  if (n.includes("yellow") || n.includes("gold") || n.includes("mustard")) return "#f5e6a3";
  if (n.includes("green") || n.includes("olive") || n.includes("sage") || n.includes("mint")) return "#c0ddb5";
  if (n.includes("teal") || n.includes("aqua") || n.includes("turquoise")) return "#b0ddd8";
  if (n.includes("purple") || n.includes("violet") || n.includes("plum") || n.includes("lavender")) return "#d4bfee";
  if (n.includes("brown") || n.includes("camel") || n.includes("tan") || n.includes("beige") || n.includes("nude")) return "#ddc9a8";
  if (n.includes("silver") || n.includes("chrome")) return "#d8d8d8";
  if (n.includes("clear")) return "linear-gradient(135deg, #f0ede8 50%, #e0dbd5 50%)";
  return "#e0dbd5";
}
const SIZES = ["XS", "S", "M", "L", "XL", "00/24", "0/25", "2/26", "4/27", "6/28", "OS", "34B", "S Tall", "XS Long", "S/M", "7", "9"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season", "Holiday", "Disney"];
const OCCASIONS = ["WFH", "Disney", "Universal", "Date Night", "Travel", "Sport", "Weekend", "Event"];

const OCCASION_COLORS = {
  "WFH":        { bg: "#f0faf4", color: "#3aaa6e" },
  "Disney":     { bg: "#fff0f5", color: "#e05588" },
  "Universal":  { bg: "#fff8f0", color: "#e07e30" },
  "Date Night": { bg: "#fdf4ff", color: "#a855f7" },
  "Travel":     { bg: "#f0fbff", color: "#2bafd4" },
  "Sport":      { bg: "#f0f4ff", color: "#5b7fe6" },
  "Weekend":    { bg: "#fafaf0", color: "#9aaa30" },
  "Event":      { bg: "#f5f0ff", color: "#7c6fe0" },
};

const uid = () => Math.random().toString(36).slice(2);

// SVG hanger icon
const HangerIcon = ({ size = 20, color = "currentColor", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="7"
    strokeLinecap="round" strokeLinejoin="round" style={{ opacity, flexShrink: 0 }}>
    <path d="M50 28 C50 28 58 10 66 14 C74 18 72 30 62 30" />
    <path d="M50 30 L50 42" />
    <path d="M50 42 C44 46 16 58 7 72" />
    <path d="M50 42 C56 46 84 58 93 72" />
    <path d="M7 72 Q50 84 93 72" />
  </svg>
);

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f5f2; color: #1a1a1a; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #ddd8d0; border-radius: 4px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes shimmer { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
  .fade-in { animation: fadeIn 0.2s ease forwards; }
  .slide-enter-left { animation: slideLeft 0.25s ease forwards; }
  .slide-enter-right { animation: slideRight 0.25s ease forwards; }
  .card { transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.09) !important; }
  .pill { transition: all 0.18s; cursor: pointer; }
  .pill:hover { background: #e8e4dc !important; }
  .btn-primary { transition: all 0.15s; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #c0b8b0 !important; }

  /* Builder */
  .builder-overlay { position: fixed; inset: 0; z-index: 300; background: #f7f5f2; display: flex; flex-direction: column; }
  .builder-panels { display: flex; flex: 1; overflow: hidden; }
  .builder-left { width: 280px; flex-shrink: 0; background: #fff; border-right: 1px solid #ece8e0; padding: 28px 22px; display: flex; flex-direction: column; overflow-y: auto; }
  .builder-canvas { flex: 1; position: relative; overflow: hidden; background: #ece8e0; display: flex; align-items: center; justify-content: center; }
  .outfit-board { position: relative; background: #fff; box-shadow: 0 12px 60px rgba(0,0,0,0.12); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
  .builder-right { width: 320px; flex-shrink: 0; background: #fff; border-left: 1px solid #ece8e0; display: flex; flex-direction: column; overflow: hidden; }
  .canvas-item { position: absolute; cursor: grab; user-select: none; }
  .canvas-item:active { cursor: grabbing; }
  .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; overflow-y: auto; }
  .product-thumb { border-radius: 10px; overflow: hidden; cursor: pointer; border: 1.5px solid transparent; background: #f7f5f2; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s; position: relative; }
  .product-thumb.selected { border-color: #1a1a1a; }
  .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .product-thumb .check { position: absolute; bottom: 6px; right: 6px; width: 20px; height: 20px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; }
  .selected-strip { display: flex; gap: 8px; padding: 10px 12px; overflow-x: auto; scrollbar-width: none; align-items: center; }
  .selected-strip::-webkit-scrollbar { display: none; }
  .selected-thumb { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; flex-shrink: 0; border: 1.5px solid #1a1a1a; background: #f7f5f2; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .selected-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .builder-search { border: 1px solid #ece8e0; border-radius: 100px; padding: 7px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 100%; background: #f7f5f2; color: #1a1a1a; }
  .builder-search:focus { outline: none; border-color: #1a1a1a; }
  .builder-topbar { height: 52px; background: #fff; border-bottom: 1px solid #ece8e0; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; flex-shrink: 0; }
  .lookbook-overlay { position: fixed; inset: 0; z-index: 400; background: #f7f5f2; display: flex; flex-direction: column; }
  .lookbook-topbar { height: 56px; background: #fff; border-bottom: 1px solid #ece8e0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; }
  .outfit-popup-canvas { position: relative; width: 100%; background: #f7f5f2; border-radius: 16px; border: 1px solid #ece8e0; overflow: hidden; }
  .filter-row { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .filter-row::-webkit-scrollbar { display: none; }

  /* ── Vertical nav sidebar ── */
  .app-shell { display: flex; min-height: 100vh; }
  .app-nav-sidebar {
    width: 120px; flex-shrink: 0; background: #fff;
    border-right: 1px solid #ece8e0;
    display: flex; flex-direction: column; align-items: stretch;
    padding: 20px 0 16px; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
  }
  .app-nav-logo {
    width: 44px; height: 44px; background: transparent; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px; flex-shrink: 0;
  }
  .nav-icon-btn {
    width: 100%; min-height: 72px; border-radius: 0; border: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 12px 8px; gap: 6px;
    transition: background 0.12s; background: transparent;
    font-family: 'DM Sans', sans-serif; position: relative;
  }
  .nav-icon-btn:hover { background: #f7f5f2; }
  .nav-icon-btn.active { background: #1a1a1a; }
  .nav-icon-btn .nav-icon-wrap { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .nav-icon-btn .nav-label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; color: #c5bdb3; text-transform: uppercase; line-height: 1; text-align: center; }
  .nav-icon-btn.active .nav-label { color: rgba(255,255,255,0.5); }
  .nav-icon-btn.active .nav-icon-wrap svg { opacity: 1; }
  /* Density modes */
  .density-compact .item-card { padding: 8px !important; }
  .density-compact .app-main-area { padding: 20px 20px !important; }
  .density-spacious .app-main-area { padding: 52px 48px !important; }
  .density-compact .page-hero { margin-bottom: 16px !important; }
  .density-spacious .page-hero { margin-bottom: 40px !important; }
  .nav-icon-btn-bottom { margin-top: auto; }
  .pill-select { padding: 7px 44px 7px 14px !important; border-radius: 100px; border: 1px solid #e0dbd2; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; background: #fff; color: #444; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }

  .app-body { margin-left: 120px; flex: 1; display: flex; min-height: 100vh; }
  .app-main-area { flex: 1; min-width: 0; padding: 36px 32px; }
  .app-right-rail { width: 272px; flex-shrink: 0; padding: 32px 18px 32px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }

  /* Page hero — editorial serif */
  .page-hero { margin-bottom: 32px; }
  .page-hero-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #c0b8b0; margin-bottom: 6px; }
  .page-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 46px; font-weight: 300; font-style: italic;
    color: #1a1a1a; line-height: 1.05; letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .page-hero-sub { font-size: 13px; color: #b0a898; font-weight: 400; letter-spacing: 0.01em; }

  /* Filter pills */
  .filter-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 15px; border-radius: 100px;
    border: 1px solid #e0dbd2; background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    color: #666; cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .filter-pill:hover { border-color: #c0b8b0; color: #1a1a1a; }
  .filter-pill.active { background: #1a1a1a; border-color: #1a1a1a; color: #fff; font-weight: 600; }

  /* Item cards — refined */
  .item-card {
    background: #fff; border-radius: 16px; overflow: hidden;
    border: 1px solid #ece8e0;
    cursor: pointer;
    transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s, border-color 0.15s;
  }
  .item-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: #d8d2c8; }
  .item-card-label {
    padding: 10px 12px 12px;
    border-top: 1px solid #f5f2ee;
  }
  /* Closet cards: collapse label until hover */
  .item-card .item-card-label { max-height: 0; overflow: hidden; padding: 0; border-top: none; transition: max-height 0.2s ease, padding 0.2s ease; }
  .item-card:hover .item-card-label { max-height: 70px; padding: 8px 10px 10px; border-top: 1px solid #f5f2ee; }
  .item-card-name { font-size: 12px; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
  .item-card-brand { font-size: 11px; color: #b0a898; font-weight: 400; }
  .item-card-img { width: 100%; aspect-ratio: 3/4; object-fit: contain; display: block; background: #f7f5f2; padding: 8px; }

  /* Outfit cards: collapse label until hover */
  .outfit-card .outfit-card-label { max-height: 0; overflow: hidden; padding: 0; border-top: none; transition: max-height 0.2s ease, padding 0.2s ease; }
  .outfit-card:hover .outfit-card-label { max-height: 100px; padding: 8px 12px 12px; border-top: 1px solid #f5f2ee; }
  .outfit-card-btns { opacity: 0; transition: opacity 0.15s; }
  .outfit-card:hover .outfit-card-btns { opacity: 1; }

  /* Lookbook card hover actions */
  .lb-card-actions { max-height: 0; overflow: hidden; padding: 0; border-top: none; transition: max-height 0.2s ease, padding 0.2s ease; }
  .lb-card:hover .lb-card-actions { max-height: 60px; padding: 8px 14px 12px; border-top: 1px solid #f5f2ee; }
  .mb-card { background: #fff; border-radius: 18px; border: 1.5px solid #e8e4dc; overflow: hidden; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.15s, box-shadow 0.15s; }
  .mb-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10); }
  .mb-card-actions { max-height: 0; overflow: hidden; padding: 0; border-top: none; transition: max-height 0.2s ease, padding 0.2s ease; }
  .mb-card:hover .mb-card-actions { max-height: 90px; padding: 10px 12px 10px; border-top: 1px solid #f5f2ee; }

  /* Right rail cards */
  .right-card { background: #fff; border-radius: 16px; border: 1px solid #ece8e0; padding: 18px 16px; }
  .right-card-title { font-size: 10px; font-weight: 700; color: #c0b8b0; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }

  /* Sidebar btns */
  .sidebar-btn { display: block; width: 100%; text-align: left; padding: 7px 10px; border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; background: transparent; color: #777; transition: all 0.12s; }
  .sidebar-btn:hover { background: #f7f5f2; color: #1a1a1a; }
  .sidebar-btn.active { background: #1a1a1a; color: #fff; font-weight: 600; }

  /* Search */
  .closet-search { width: 100%; padding: 9px 14px 9px 36px; border: 1px solid #e0dbd2; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 13px; background: #fff; color: #1a1a1a; transition: border-color 0.15s; }
  .closet-search:focus { outline: none; border-color: #1a1a1a; }

  /* Item card edit btn reveal on hover */
  .item-card:hover .item-card-edit-btn { opacity: 1 !important; }
  /* Wishlist card: label always visible, action row collapses to 0 height at rest */
  .wl-card { overflow: visible !important; }
  .wl-card .item-card-label { max-height: none !important; overflow: visible !important; padding: 8px 10px 10px !important; border-top: 1px solid #f5f2ee !important; }
  .wl-card .wl-card-actions { max-height: 0; overflow: hidden; margin-top: 0; transition: max-height 0.2s ease, margin-top 0.15s ease; }
  .wl-card:hover .wl-card-actions { max-height: 46px; margin-top: 6px; }
  .palette-del-btn { opacity: 0 !important; transition: opacity 0.15s; }
  div:hover > .palette-del-btn { opacity: 1 !important; }

  /* Legacy compat */
  .closet-layout { display: flex; gap: 0; align-items: flex-start; }
  .closet-sidebar { background: transparent; padding: 0; }
  .closet-main { flex: 1; min-width: 0; }
  .sidebar-section { margin-bottom: 20px; }
  .sidebar-label { font-size: 10px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .app-layout { display: flex; gap: 0; align-items: flex-start; padding: 0; width: 100%; }
  .app-left-sidebar { width: 160px; flex-shrink: 0; margin-right: 22px; }
  .app-main { flex: 1; min-width: 0; }
  .app-right-panel { width: 260px; flex-shrink: 0; margin-left: 22px; display: flex; flex-direction: column; gap: 14px; position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto; }

  .item-detail-overlay { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); }
  .stats-bar { display: flex; gap: 0; border-radius: 16px; overflow: hidden; height: 10px; }
`

// ── Supabase hook ────────────────────────────────────────────────────────────
const isGuestMode = () => { try { return localStorage.getItem("wardrobe_guest_mode_v1") === "1"; } catch { return false; } };

function useSupabaseTable(table) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const parseRows = (data) => data.map(r => {
    if (r.data && typeof r.data === "object") return { ...r.data, id: r.id };
    const { id, created_at, ...rest } = r;
    return { ...rest, id };
  }).filter(r => r.id);
  const fetchRows = async (setter) => {
    if (isGuestMode()) return;
    let { data, error } = await supabase.from(table).select("*").order("created_at");
    if (error) ({ data, error } = await supabase.from(table).select("*"));
    if (!error && data) setter(parseRows(data));
    else if (error) console.error("[" + table + "] fetch:", error.message);
  };
  useEffect(() => {
    fetchRows(setRows).then(() => setLoading(false));
  }, [table]);
  const add = async (item) => {
    if (!isGuestMode()) {
      const { error } = await supabase.from(table).insert({ id: item.id, data: item });
      if (error) console.error("[" + table + "] add:", error.message);
    }
    setRows(r => [...r, item]);
  };
  const update = async (item) => {
    if (!isGuestMode()) {
      let { error } = await supabase.from(table).update({ data: item }).eq("id", item.id);
      if (error) {
        const { id, ...rest } = item;
        ({ error } = await supabase.from(table).update(rest).eq("id", id));
      }
      if (error) { console.error("[" + table + "] update:", error.message); return; }
    }
    setRows(r => r.map(i => i.id === item.id ? item : i));
  };
  const remove = async (id) => {
    if (!isGuestMode()) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) { console.error("[" + table + "] remove:", error.message); return; }
    }
    setRows(r => r.filter(i => i.id !== id));
  };
  const refresh = async () => {
    setLoading(true);
    await fetchRows(setRows);
    setLoading(false);
  };
  return { rows, loading, add, update, remove, refresh };
}

// ── Moodboards — Supabase + localStorage mirror ───────────────────────────────
function useMoodboardsDb() {
  const TABLE = "moodboards";
  const LS_KEY = "wardrobe_moodboards_v1";

  const [boards, setBoards] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  });
  const [loaded, setLoaded] = useState(false);

  // Mirror to localStorage whenever boards change
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(boards)); } catch {}
  }, [boards]);

  // Load from Supabase on mount; merge with any localStorage-only boards
  useEffect(() => {
    (async () => {
      let { data, error } = await supabase.from(TABLE).select("*").order("created_at");
      if (error) ({ data, error } = await supabase.from(TABLE).select("*"));
      if (!error && data && data.length > 0) {
        const remote = data.map(r =>
          r.data && typeof r.data === "object" ? { ...r.data, id: r.id } : r
        ).filter(r => r.id);
        // Merge: add any localStorage boards not yet in Supabase
        const remoteIds = new Set(remote.map(b => b.id));
        const lsBoards = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } })();
        const localOnly = lsBoards.filter(b => b.id && !remoteIds.has(b.id));
        // Upload local-only boards to Supabase
        for (const b of localOnly) {
          await supabase.from(TABLE).insert({ id: b.id, data: b }).then(({ error: e }) => {
            if (e) supabase.from(TABLE).insert(b);
          });
        }
        setBoards([...remote, ...localOnly]);
      } else if (!error && data && data.length === 0) {
        // Table exists but empty — upload any localStorage boards
        const lsBoards = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } })();
        for (const b of lsBoards) {
          if (b.id) await supabase.from(TABLE).insert({ id: b.id, data: b }).then(({ error: e }) => {
            if (e) supabase.from(TABLE).insert(b);
          });
        }
      }
      setLoaded(true);
    })();
  }, []);

  const persist = async (updated) => {
    setBoards(updated);
  };

  const saveBoard = async (board) => {
    // Upsert to Supabase
    const { error } = await supabase.from(TABLE).upsert({ id: board.id, data: board });
    if (error) await supabase.from(TABLE).upsert(board);
  };

  const deleteBoard = async (id) => {
    await supabase.from(TABLE).delete().eq("id", id);
  };

  const updateBoards = (updaterOrArray) => {
    setBoards(prev => {
      const next = typeof updaterOrArray === "function" ? updaterOrArray(prev) : updaterOrArray;
      // Async-persist changed/new boards
      next.forEach(b => {
        const old = prev.find(p => p.id === b.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(b)) saveBoard(b);
      });
      return next;
    });
  };

  // Safe single-board patch — always reads latest state, never stale
  const updateBoardById = (id, patch) => {
    setBoards(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...patch } : b);
      const changed = next.find(b => b.id === id);
      if (changed) saveBoard(changed);
      return next;
    });
  };

  const removeBoardById = (id) => {
    setBoards(prev => prev.filter(b => b.id !== id));
    deleteBoard(id);
  };

  return { boards, updateBoards, updateBoardById, removeBoardById, loaded };
}

// ── Shared UI ────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "11px 14px", border: "1.5px solid #e4dfd6", borderRadius: 14,
  background: "#fff", color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "border-color 0.2s"
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

const Modal = ({ open, onClose, title, children, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div className="fade-in" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)"
    }}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, padding: "28px 24px", width: "100%",
        maxWidth, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.15)"
      }}>
        {title ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{title}</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f5f2ed", cursor: "pointer", fontSize: 16, color: "#888", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};

const BLANK = { name: "", brand: "", category: "", color: "", colors: [], size: "", season: "", seasons: [], price: "", spent: "", notes: "", image: "", purchaseDate: "", wornCount: 0, lastWorn: "", link: "", needsStyling: false };
const BLANK_WISH = { name: "", brand: "", price: "", image: "", link: "" };

// ── Shared image helpers ─────────────────────────────────────────────────────

// Canvas-based background removal: floods from corners to find background colour,
// Removes background using corner-sampled flood fill.
// Uses a lower tolerance and checks that the bg colour is actually
// distinct enough from the item — prevents eating light-coloured clothing.
function removeBgCanvas(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width, h = canvas.height;

      // Sample bg from corners + edge midpoints for a more reliable bg estimate
      const samplePts = [
        [0,0],[w-1,0],[0,h-1],[w-1,h-1],
        [Math.floor(w/2),0],[Math.floor(w/2),h-1],
        [0,Math.floor(h/2)],[w-1,Math.floor(h/2)],
      ];
      let rSum=0, gSum=0, bSum=0;
      samplePts.forEach(([x,y]) => {
        const i = (y*w+x)*4;
        rSum+=data[i]; gSum+=data[i+1]; bSum+=data[i+2];
      });
      const n = samplePts.length;
      const bgR=rSum/n, bgG=gSum/n, bgB=bSum/n;

      const colorDist = (i, r, g, b) => {
        const dr=data[i]-r, dg=data[i+1]-g, db=data[i+2]-b;
        return Math.sqrt(dr*dr+dg*dg+db*db);
      };

      // Reduce tolerance so we don't eat light-coloured items.
      // Also: only remove pixels that are closer to bg than to the
      // "average item colour" sampled from the image centre.
      const tolerance = 28;

      // Sample item colour from centre of image as a guard
      const cx = Math.floor(w/2), cy = Math.floor(h/2);
      const ci = (cy*w+cx)*4;
      const itemR=data[ci], itemG=data[ci+1], itemB=data[ci+2];

      const visited = new Uint8Array(w * h);

      const shouldRemove = (i) => {
        const distToBg = colorDist(i, bgR, bgG, bgB);
        if (distToBg >= tolerance) return false;
        // Don't remove if the pixel is closer to the item centre colour than to bg
        // (protects light items on light backgrounds from being over-eaten)
        const distToItem = colorDist(i, itemR, itemG, itemB);
        return distToBg <= distToItem * 0.85;
      };

      const queue = [];
      samplePts.forEach(([x,y]) => {
        const idx = y*w+x;
        if (!visited[idx] && shouldRemove(idx*4)) { visited[idx]=1; queue.push(idx); }
      });

      while (queue.length) {
        const idx = queue.pop();
        data[idx*4+3] = 0;
        const x = idx % w, y = Math.floor(idx / w);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
          const nx=x+dx, ny=y+dy;
          if (nx<0||nx>=w||ny<0||ny>=h) return;
          const ni = ny*w+nx;
          if (!visited[ni] && shouldRemove(ni*4)) { visited[ni]=1; queue.push(ni); }
        });
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Fetch an external image and return base64 data URL.
// Tries direct fetch first (works for CORS-enabled hosts like Supabase Storage),
// then falls back to CORS proxies for retailer sites that block direct requests.
async function fetchImageAsDataUrl(url) {
  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // 1. Try direct fetch (Supabase Storage, CDNs with CORS headers)
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.type.startsWith("image/")) return await blobToDataUrl(blob);
    }
  } catch {}

  // 2. Fall back to CORS proxies
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) continue;
      return await blobToDataUrl(blob);
    } catch { continue; }
  }
  throw new Error("Could not fetch image — try downloading it and uploading directly.");
}


// Auto-crop: finds the bounding box of non-transparent / non-background pixels and crops to it
function autoCropCanvas(dataUrl, padding = 12) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);

      // Sample bg from corners (same as removeBg)
      const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]];
      let rS=0, gS=0, bS=0;
      corners.forEach(([x,y]) => { const i=(y*width+x)*4; rS+=data[i]; gS+=data[i+1]; bS+=data[i+2]; });
      const bgR=rS/4, bgG=gS/4, bgB=bS/4, tol=40;

      const isBg = (i) => {
        if (data[i+3] < 20) return true; // transparent
        const dr=data[i]-bgR, dg=data[i+1]-bgG, db=data[i+2]-bgB;
        return Math.sqrt(dr*dr+dg*dg+db*db) < tol;
      };

      let minX=width, maxX=0, minY=height, maxY=0;
      for (let y=0; y<height; y++) for (let x=0; x<width; x++) {
        if (!isBg((y*width+x)*4)) {
          if (x<minX) minX=x; if (x>maxX) maxX=x;
          if (y<minY) minY=y; if (y>maxY) maxY=y;
        }
      }
      if (maxX <= minX || maxY <= minY) { resolve(dataUrl); return; }

      minX = Math.max(0, minX-padding); minY = Math.max(0, minY-padding);
      maxX = Math.min(width-1, maxX+padding); maxY = Math.min(height-1, maxY+padding);

      const cw = maxX-minX, ch = maxY-minY;
      const out = document.createElement("canvas");
      out.width = cw; out.height = ch;
      out.getContext("2d").drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
      resolve(out.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ── Mask Editor: paint to erase or restore pixels after BG removal ───────────
// Keeps the original image separately; erase brush makes alpha=0, restore brush paints original back.
function MaskEditor({ current, original, onDone, onCancel }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("erase"); // "erase" | "restore" | "lasso" | "clone"
  const [brushSize, setBrushSize] = useState(24);
  const [painting, setPainting] = useState(false);
  const [lassoPoints, setLassoPoints] = useState([]);
  const [lassoClosed, setLassoClosed] = useState(false);
  const lassoPointsRef = useRef([]);
  const lastPos = useRef(null);
  const cloneSourceRef = useRef(null);
  const cloneStrokeStartRef = useRef(null);
  const cloneSnapshotRef = useRef(null);
  const currentDataRef = useRef(null);
  const originalDataRef = useRef(null);

  const redrawCanvas = () => {
    const cur = currentDataRef.current;
    const canvas = canvasRef.current;
    if (!cur || !canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tmp = document.createElement("canvas");
    tmp.width = cur.width;
    tmp.height = cur.height;
    tmp.getContext("2d").putImageData(cur, 0, 0);
    ctx.drawImage(tmp, 0, 0);

    if (lassoPoints.length) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = Math.max(1.5, cur.width / 320);
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      if (lassoClosed) ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if (tool === "clone" && cloneSourceRef.current) {
      const p = cloneSourceRef.current;
      ctx.save();
      ctx.strokeStyle = "#67b8ff";
      ctx.lineWidth = Math.max(1.5, cur.width / 420);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(5, brushSize * 0.25), 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - 8, p.y);
      ctx.lineTo(p.x + 8, p.y);
      ctx.moveTo(p.x, p.y - 8);
      ctx.lineTo(p.x, p.y + 8);
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    // Always convert external URLs to data URLs first to avoid canvas cross-origin taint
    const loadSafe = (src) => new Promise((res, rej) => {
      if (!src) { rej(new Error("no src")); return; }
      if (src.startsWith("data:")) {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      } else {
        fetch(src)
          .then(r => r.blob())
          .then(blob => new Promise((bres, brej) => {
            const fr = new FileReader();
            fr.onload = () => {
              const img = new Image();
              img.onload = () => bres(img);
              img.onerror = brej;
              img.src = fr.result;
            };
            fr.onerror = brej;
            fr.readAsDataURL(blob);
          }))
          .then(res)
          .catch(rej);
      }
    });

    Promise.all([loadSafe(current), loadSafe(original)]).then(([cur, orig]) => {
      const w = cur.width;
      const h = cur.height;
      const c1 = document.createElement("canvas");
      c1.width = w;
      c1.height = h;
      c1.getContext("2d").drawImage(cur, 0, 0);
      currentDataRef.current = c1.getContext("2d").getImageData(0, 0, w, h);

      const c2 = document.createElement("canvas");
      c2.width = w;
      c2.height = h;
      c2.getContext("2d").drawImage(orig, 0, 0);
      originalDataRef.current = c2.getContext("2d").getImageData(0, 0, w, h);

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
      redrawCanvas();
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    redrawCanvas();
  }, [lassoPoints, lassoClosed, tool, brushSize]);

  useEffect(() => {
    lassoPointsRef.current = lassoPoints;
  }, [lassoPoints]);

  const getCanvasPos = (e) => {
    const cur = currentDataRef.current;
    const canvas = canvasRef.current;
    if (!cur || !canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (cur.width / rect.width);
    const y = (clientY - rect.top) * (cur.height / rect.height);
    return { x: Math.max(0, Math.min(cur.width - 1, x)), y: Math.max(0, Math.min(cur.height - 1, y)) };
  };

  const paintAt = (x, y) => {
    const cur = currentDataRef.current;
    const orig = originalDataRef.current;
    if (!cur || !orig) return;
    const px = x;
    const py = y;
    const r = brushSize / 2;
    const data = cur.data;
    const odata = orig.data;
    const w = cur.width;

    const minX = Math.max(0, Math.floor(px - r));
    const maxX = Math.min(w - 1, Math.ceil(px + r));
    const minY = Math.max(0, Math.floor(py - r));
    const maxY = Math.min(cur.height - 1, Math.ceil(py + r));
    for (let iy = minY; iy <= maxY; iy++) for (let ix = minX; ix <= maxX; ix++) {
      const dist = Math.sqrt((ix - px) ** 2 + (iy - py) ** 2);
      if (dist > r) continue;
      const strength = Math.max(0, 1 - (dist / r) ** 2);
      const idx = (iy * w + ix) * 4;
      if (tool === "erase") {
        data[idx + 3] = Math.max(0, data[idx + 3] - Math.round(strength * 255));
      } else {
        const newA = Math.min(255, data[idx + 3] + Math.round(strength * odata[idx + 3]));
        data[idx] = Math.round(data[idx] * (1 - strength) + odata[idx] * strength);
        data[idx + 1] = Math.round(data[idx + 1] * (1 - strength) + odata[idx + 1] * strength);
        data[idx + 2] = Math.round(data[idx + 2] * (1 - strength) + odata[idx + 2] * strength);
        data[idx + 3] = newA;
      }
    }
    redrawCanvas();
  };

  const cloneAt = (x, y) => {
    const cur = currentDataRef.current;
    const source = cloneSourceRef.current;
    const start = cloneStrokeStartRef.current;
    const snapshot = cloneSnapshotRef.current;
    if (!cur || !source || !start || !snapshot) return;

    const data = cur.data;
    const sdata = snapshot;
    const w = cur.width;
    const h = cur.height;
    const r = brushSize / 2;
    const offX = x - start.x;
    const offY = y - start.y;
    const srcCx = source.x + offX;
    const srcCy = source.y + offY;

    const minX = Math.max(0, Math.floor(x - r));
    const maxX = Math.min(w - 1, Math.ceil(x + r));
    const minY = Math.max(0, Math.floor(y - r));
    const maxY = Math.min(h - 1, Math.ceil(y + r));

    for (let iy = minY; iy <= maxY; iy++) for (let ix = minX; ix <= maxX; ix++) {
      const dx = ix - x;
      const dy = iy - y;
      if ((dx * dx + dy * dy) > r * r) continue;
      const sx = Math.round(srcCx + dx);
      const sy = Math.round(srcCy + dy);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      const di = (iy * w + ix) * 4;
      const si = (sy * w + sx) * 4;
      data[di] = sdata[si];
      data[di + 1] = sdata[si + 1];
      data[di + 2] = sdata[si + 2];
      data[di + 3] = sdata[si + 3];
    }
    redrawCanvas();
  };

  const paintLine = (from, to) => {
    const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x * (1 - t) + to.x * t;
      const y = from.y * (1 - t) + to.y * t;
      if (tool === "clone") cloneAt(x, y);
      else paintAt(x, y);
    }
  };

  const closeLasso = () => {
    if (lassoPoints.length >= 3) setLassoClosed(true);
  };

  const deleteLassoSelection = () => {
    const cur = currentDataRef.current;
    if (!cur || lassoPoints.length < 3 || !lassoClosed) return;
    const data = cur.data;
    const w = cur.width;
    const h = cur.height;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    lassoPoints.forEach(({ x, y }) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
    minX = Math.max(0, Math.floor(minX));
    minY = Math.max(0, Math.floor(minY));
    maxX = Math.min(w - 1, Math.ceil(maxX));
    maxY = Math.min(h - 1, Math.ceil(maxY));

    const inside = (x, y) => {
      let hit = false;
      for (let i = 0, j = lassoPoints.length - 1; i < lassoPoints.length; j = i++) {
        const xi = lassoPoints[i].x;
        const yi = lassoPoints[i].y;
        const xj = lassoPoints[j].x;
        const yj = lassoPoints[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-7) + xi);
        if (intersect) hit = !hit;
      }
      return hit;
    };

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (inside(x + 0.5, y + 0.5)) data[(y * w + x) * 4 + 3] = 0;
      }
    }
    setLassoPoints([]);
    setLassoClosed(false);
    redrawCanvas();
  };

  const onDown = (e) => {
    e.preventDefault();
    const p = getCanvasPos(e);

    if (tool === "lasso") {
      if (lassoClosed) {
        setLassoPoints([p]);
        setLassoClosed(false);
      }
      setPainting(true);
      setLassoPoints([p]);
      return;
    }

    if (tool === "clone") {
      if (e.altKey || e.button === 2 || !cloneSourceRef.current) {
        cloneSourceRef.current = p;
        redrawCanvas();
        return;
      }
      cloneSnapshotRef.current = new Uint8ClampedArray(currentDataRef.current.data);
      cloneStrokeStartRef.current = p;
      setPainting(true);
      lastPos.current = p;
      cloneAt(p.x, p.y);
      return;
    }

    setPainting(true);
    lastPos.current = p;
    paintAt(p.x, p.y);
  };

  const onMove = (e) => {
    e.preventDefault();
    if (!painting) return;
    const p = getCanvasPos(e);
    if (tool === "lasso") {
      setLassoPoints(prev => {
        if (prev.length === 0) return [p];
        const last = prev[prev.length - 1];
        const dist = Math.sqrt((last.x - p.x) ** 2 + (last.y - p.y) ** 2);
        if (dist < 1.5) return prev;
        return [...prev, p];
      });
      return;
    }
    paintLine(lastPos.current, p);
    lastPos.current = p;
  };

  const onUp = (e) => {
    e.preventDefault();
    if (tool === "lasso" && painting) {
      if (lassoPointsRef.current.length >= 3) setLassoClosed(true);
      setPainting(false);
      return;
    }
    setPainting(false);
    cloneStrokeStartRef.current = null;
    cloneSnapshotRef.current = null;
    lastPos.current = null;
  };

  const applyEdit = () => {
    const cur = currentDataRef.current;
    if (!cur) return;
    const out = document.createElement("canvas");
    out.width = cur.width;
    out.height = cur.height;
    out.getContext("2d").putImageData(cur, 0, 0);
    onDone(out.toDataURL("image/png"));
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 640, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e4dc", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginRight: "auto" }}>Edit Mask</span>

          <div style={{ display: "flex", background: "#f5f3ef", borderRadius: 9, padding: 3, gap: 0 }}>
            {[["erase", "Erase"], ["restore", "Restore"], ["lasso", "Lasso"], ["clone", "Clone Stamp"]].map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => setTool(id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  background: tool === id ? "#1a1a1a" : "transparent",
                  color: tool === id ? "#fff" : "#aaa",
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  transition: "all 0.12s",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {tool !== "lasso" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase" }}>Brush</span>
              <input type="range" min={6} max={80} value={brushSize} onChange={e => setBrushSize(+e.target.value)} style={{ width: 80, accentColor: "#1a1a1a" }} />
              <span style={{ fontSize: 11, color: "#aaa", minWidth: 20 }}>{brushSize}</span>
            </div>
          )}

          {tool === "lasso" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={closeLasso} disabled={lassoPoints.length < 3 || lassoClosed} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: "#f0ece4", color: "#555", fontSize: 11, fontWeight: 700 }}>Close</button>
              <button onClick={deleteLassoSelection} disabled={!lassoClosed} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: lassoClosed ? "#1a1a1a" : "#f0ece4", color: lassoClosed ? "#fff" : "#aaa", fontSize: 11, fontWeight: 700 }}>Delete</button>
              <button onClick={() => { setLassoPoints([]); setLassoClosed(false); }} disabled={lassoPoints.length === 0} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: "#f0ece4", color: "#666", fontSize: 11, fontWeight: 700 }}>Clear</button>
            </div>
          )}
        </div>

        <div style={{ position: "relative", background: "repeating-conic-gradient(#e8e4dc 0% 25%,#fff 0% 50%) 0 0/20px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block", maxWidth: "100%", maxHeight: "58vh", cursor: tool === "erase" ? "cell" : "crosshair", touchAction: "none" }}
            onContextMenu={e => e.preventDefault()}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
            onDoubleClick={() => { if (tool === "lasso") closeLasso(); }}
          />
          <div style={{ position: "absolute", bottom: 10, left: 10, fontSize: 11, color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "3px 8px", fontFamily: "'Nunito',sans-serif", fontWeight: 600 }}>
            {tool === "erase"
              ? "Paint to erase"
              : tool === "restore"
                ? "Paint to restore"
                : tool === "lasso"
                  ? "Draw selection, release, then delete"
                  : "Alt/Right-click to set source, then paint"}
          </div>
        </div>

        <div style={{ padding: "14px 18px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #e8e4dc" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={applyEdit} style={{ padding: "9px 22px", background: "#1a1a1a", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>Apply</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Manual crop tool: drag a rectangle over the image
function CropTool({ src, onDone, onCancel }) {
  const containerRef = useRef(null);
  const [drag, setDrag] = useState(null);   // {x,y} start
  const [box, setBox] = useState(null);     // {x,y,w,h} in % of container
  const [applying, setApplying] = useState(false);

  const toPercent = (e) => {
    const r = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const p = toPercent(e);
    setDrag(p);
    setBox({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onMouseMove = (e) => {
    if (!drag) return;
    const p = toPercent(e);
    setBox({
      x: Math.min(drag.x, p.x), y: Math.min(drag.y, p.y),
      w: Math.abs(p.x - drag.x), h: Math.abs(p.y - drag.y),
    });
  };

  const onMouseUp = () => setDrag(null);

  const applyCrop = async () => {
    if (!box || box.w < 0.02 || box.h < 0.02) return;
    setApplying(true);
    const img = new Image();
    img.onload = () => {
      const iw = img.width, ih = img.height;
      const sx = Math.round(box.x * iw), sy = Math.round(box.y * ih);
      const sw = Math.round(box.w * iw), sh = Math.round(box.h * ih);
      const out = document.createElement("canvas");
      out.width = sw; out.height = sh;
      out.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      onDone(out.toDataURL("image/png"));
      setApplying(false);
    };
    img.src = src;
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 8999, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", maxWidth: 560, width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e4dc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Crop Image</span>
          <span style={{ fontSize: 12, color: "#aaa" }}>Click and drag to select crop area</span>
        </div>
        <div
          ref={containerRef}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
          style={{ position: "relative", cursor: "crosshair", userSelect: "none", background: "repeating-conic-gradient(#e0dbd0 0% 25%, #fff 0% 50%) 0 0 / 16px 16px" }}
        >
          <img src={src} alt="crop" style={{ display: "block", width: "100%", maxHeight: "60vh", objectFit: "contain", pointerEvents: "none" }} />
          {box && box.w > 0 && (
            <>
              {/* Dark overlay outside selection */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", pointerEvents: "none" }} />
              {/* Clear selection window */}
              <div style={{
                position: "absolute", pointerEvents: "none",
                left: `${box.x*100}%`, top: `${box.y*100}%`,
                width: `${box.w*100}%`, height: `${box.h*100}%`,
                boxSizing: "border-box",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                border: "2px solid #fff",
                background: "transparent",
              }} />
            </>
          )}
        </div>
        <div style={{ padding: "14px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={applyCrop} disabled={!box || box.w < 0.02 || applying} style={{
            padding: "9px 20px", background: (!box || box.w < 0.02) ? "#f5f3ef" : "#1a1a1a",
            border: "none", borderRadius: 12, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            color: (!box || box.w < 0.02) ? "#bbb" : "#fff"
          }}>{applying ? "Applying…" : "Apply Crop"}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ImageUploadField({ value, onChange, style: outerStyle }) {
  const [tab, setTab] = useState("upload"); // "upload" | "url"
  const [urlInput, setUrlInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [autoCropping, setAutoCropping] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showCropTool, setShowCropTool] = useState(false);
  const [showMaskEditor, setShowMaskEditor] = useState(false);
  // Keep original (pre-removal) image so restore brush has something to paint back
  const [originalSrc, setOriginalSrc] = useState(null);

  // Whenever a brand-new image is set (not a bg-removal result), save it as original
  const handleNewImage = (dataUrl) => {
    setOriginalSrc(dataUrl);
    onChange(dataUrl);
  };

  const handleFetchUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setFetching(true);
    setFetchError("");
    try {
      const dataUrl = await fetchImageAsDataUrl(url);
      handleNewImage(dataUrl);
      setUrlInput("");
    } catch (e) {
      setFetchError(e.message || "Failed to load image.");
    } finally {
      setFetching(false);
    }
  };

  const handleRemoveBg = async () => {
    if (!value) return;
    setRemoving(true);
    try {
      // If it's an external URL, fetch as data URL first to avoid canvas taint
      const src = value.startsWith("data:") ? value : await fetchImageAsDataUrl(value);
      const result = await removeBgCanvas(src);
      // Don't reset originalSrc — keep the pre-removal version for restore brush
      onChange(result);
    } catch {
      alert("Background removal failed — try a cleaner image.");
    } finally {
      setRemoving(false);
    }
  };

  const handleAutoCrop = async () => {
    if (!value) return;
    setAutoCropping(true);
    try {
      // If it's an external URL, fetch as data URL first to avoid canvas taint
      const src = value.startsWith("data:") ? value : await fetchImageAsDataUrl(value);
      const result = await autoCropCanvas(src);
      onChange(result);
    } catch {
      alert("Auto-crop failed.");
    } finally {
      setAutoCropping(false);
    }
  };

  return (
    <div style={{ marginBottom: 14, ...outerStyle }}>
      {showCropTool && (
        <CropTool src={value} onDone={dataUrl => { onChange(dataUrl); setShowCropTool(false); }} onCancel={() => setShowCropTool(false)} />
      )}
      {showMaskEditor && (
        <MaskEditor
          current={value}
          original={originalSrc || value}
          onDone={dataUrl => { onChange(dataUrl); setShowMaskEditor(false); }}
          onCancel={() => setShowMaskEditor(false)}
        />
      )}

      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Photo</label>

      {/* Tab switcher */}
      <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, marginBottom: 10 }}>
        {[["upload","Upload"],["url","From URL"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer",
            background: tab === id ? "#fff" : "transparent",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
            color: tab === id ? "#1a1a1a" : "#aaa",
            boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s"
          }}>{lbl}</button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px dashed #e0dbd0", borderRadius: 12, cursor: "pointer", background: "#faf9f6" }}>
          <SvgCamera size={16} color="#aaa" />
          <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{value ? "Change photo" : "Choose file…"}</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => handleNewImage(ev.target.result);
            reader.readAsDataURL(file);
          }} />
        </label>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1, fontSize: 12 }}
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setFetchError(""); }}
              placeholder="https://…/image.jpg"
              onKeyDown={e => e.key === "Enter" && handleFetchUrl()}
            />
            <button onClick={handleFetchUrl} disabled={fetching} style={{
              padding: "0 14px", background: fetching ? "#f5f3ef" : "#1a1a1a",
              border: "none", borderRadius: 10, cursor: fetching ? "default" : "pointer",
              fontSize: 12, fontWeight: 700, color: fetching ? "#aaa" : "#fff",
              fontFamily: "'DM Sans', sans-serif", flexShrink: 0, whiteSpace: "nowrap"
            }}>{fetching ? "Loading…" : "Fetch"}</button>
          </div>
          {fetchError && <div style={{ marginTop: 6, fontSize: 11, color: "#e05555", fontWeight: 600 }}>{fetchError}</div>}
          <div style={{ marginTop: 6, fontSize: 11, color: "#bbb" }}>Paste a direct image URL (ending in .jpg, .png, etc.)</div>
        </div>
      )}

      {/* Preview + actions */}
      {value && (
        <div style={{ marginTop: 10 }}>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 180, background: "repeating-conic-gradient(#e8e4dc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={value} alt="preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
            <button onClick={() => { onChange(""); setUrlInput(""); }} style={{
              position: "absolute", top: 7, right: 7, width: 26, height: 26, borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", cursor: "pointer",
              fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center"
            }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>

          {/* Action buttons — 2x2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            <button onClick={handleRemoveBg} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#1a1a1a", border: "none", borderRadius: 10,
              cursor: removing ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#fff", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span><span>{removing ? "Working…" : "Remove BG"}</span>
            </button>
            <button onClick={() => setShowMaskEditor(true)} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#f0ece4", border: "none", borderRadius: 10,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#444", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></span><span>Edit Mask</span>
            </button>
            <button onClick={() => setShowCropTool(true)} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#f5f2ed", border: "none", borderRadius: 10,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#444", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1" strokeDasharray="4 3"/></svg></span><span>Crop</span>
            </button>
            <button onClick={handleAutoCrop} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#f5f2ed", border: "none", borderRadius: 10,
              cursor: autoCropping ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#444", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/></svg></span><span>{autoCropping ? "Working…" : "Auto-Crop"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Multi-select pill helper ─────────────────────────────────────────────────
function MultiPills({ label, options, selected, onChange }) {
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o} onClick={() => toggle(o)} style={{
            padding: "5px 12px", borderRadius: 20, border: "1.5px solid",
            borderColor: selected.includes(o) ? "#1a1a1a" : "#e8e4dc",
            background: selected.includes(o) ? "#1a1a1a" : "#fafaf8",
            color: selected.includes(o) ? "#fff" : "#888",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s"
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

// ── Drafts stored in localStorage ────────────────────────────────────────────
const DRAFTS_KEY = "wardrobe_drafts_v1";
function loadDrafts() { try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]"); } catch { return []; } }
function saveDrafts(d) { try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(d)); } catch {} }

// ── Add Item Modal ────────────────────────────────────────────────────────────
// Unified form with Closet/Wishlist toggle at top + draft folder
function AddItemModal({ onSave, onSaveWish, onCancel, initial, editMode, initialDest, wishlistsDb = [], saveWishlistsMeta }) {
  const isWishInitial = !!(initial?.link) || initialDest === "wishlist";
  const [dest, setDest] = useState(isWishInitial ? "wishlist" : "closet"); // "closet" | "wishlist"
  const [selectedListId, setSelectedListId] = useState("none"); // "none" | existing id | "new"
  const [newListName, setNewListName] = useState("");
  const [form, setForm] = useState({
    ...BLANK,
    colors: [], seasons: [], spent: "",
    ...initial,
    colors: initial?.colors || (initial?.color ? [initial.color] : []),
    seasons: initial?.seasons || (initial?.season ? [initial.season] : []),
  });
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState(loadDrafts);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [urlSuccess, setUrlSuccess] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const extractFromUrl = async () => {
    const url = urlInput.trim();
    if (!url || !url.startsWith("http")) { setUrlError("Please enter a valid URL"); return; }
    setUrlLoading(true); setUrlError(""); setUrlSuccess(false);
    try {
      // Try multiple CORS proxies in sequence
      let html = "";
      const proxies = [
        "https://api.allorigins.win/get?url=" + encodeURIComponent(url),
        "https://corsproxy.io/?" + encodeURIComponent(url),
        "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url),
      ];
      for (const proxyUrl of proxies) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timer);
          if (!res.ok) continue;
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("json")) {
            const json = await res.json();
            html = json.contents || json.data || "";
          } else {
            html = await res.text();
          }
          if (html.length > 500) break;
        } catch(e) { continue; }
      }
      // Extract meta tags using simple string parsing (no RegExp constructor)
      const getTag = (prop) => {
        const lh = html.toLowerCase();
        const lp = prop.toLowerCase();
        // Find a meta tag containing this property/name
        let idx = 0;
        while (idx < lh.length) {
          const metaIdx = lh.indexOf("<meta", idx);
          if (metaIdx === -1) break;
          const closeIdx = lh.indexOf(">", metaIdx);
          if (closeIdx === -1) break;
          const tag = html.slice(metaIdx, closeIdx + 1);
          const tl = tag.toLowerCase();
          if ((tl.includes('property="' + lp + '"') || tl.includes("property='" + lp + "'") ||
               tl.includes('name="' + lp + '"') || tl.includes("name='" + lp + "'")) ) {
            const cm = tag.match(/content=["']([^"']+)["']/i);
            if (cm) return cm[1];
          }
          idx = closeIdx + 1;
        }
        return "";
      };
      const title = getTag("og:title") || getTag("twitter:title") || (html.match(/<title[^>]*>([^<]+)<\/title>/i)||[])[1] || "";
      const description = getTag("og:description") || getTag("description") || "";
      const imageUrl = getTag("og:image") || getTag("twitter:image") || "";
      const siteName = getTag("og:site_name") || "";
      const jsonLdMatches = html.match(/<script[^>]+type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>/gi) || [];
      let jsonLdText = "";
      for (const block of jsonLdMatches) {
        const inner = block.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
        if (inner.includes("Product") || inner.includes("price") || inner.includes("offers")) { jsonLdText = inner.slice(0, 3000); break; }
      }
      // Extract info from URL slug as fallback signal
      const urlSlug = url.replace(/https?:\/\/[^/]+/, "").replace(/[?#].*/, "").replace(/[-_/]+/g, " ").trim();
      const hostname = (url.match(/https?:\/\/([^/]+)/) || [])[1] || "";
      const promptText = [
        "Extract product info from this fashion retailer webpage and return ONLY a JSON object with these exact fields:",
        "name, brand, category (must be one of: Accessories, Activewear, Bags, Denim, Dresses, Intimates, Jewelry, Knits, Loungewear, Outerwear, Shoes, Shorts + Skirts, Sleepwear, Socks + Tights, Sweaters, Swim, Tops, Trousers), price (number only no $ sign, or null), color (main color as a single common word, or null), notes (one sentence description, or null).",
        "",
        "URL: " + url,
        "URL path (use to infer product name if nothing else available): " + urlSlug,
        "Retailer domain: " + hostname,
        "Page title: " + (title || "none"),
        "Site: " + (siteName || "none"),
        "Description: " + (description.slice(0, 400) || "none"),
        "Structured product data: " + (jsonLdText.slice(0, 2000) || "none"),
        "",
        "Use all available signals. The URL slug is especially useful — e.g. 'bra-free-rib-90s-cami' means the product is a cami top. Return ONLY valid JSON, no markdown."
      ].join("\n");
      // Slug-based fallback name: capitalize words from URL path
      const slugName = urlSlug.split(" ").filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ").slice(0, 80);

      let extracted = {};
      let apiErrorMsg = "";
      try {
        const apiKey = process.env.REACT_APP_ANTHROPIC_KEY || "";
        if (!apiKey) throw new Error("NO_KEY");
        const models = ["claude-opus-4-5", "claude-sonnet-4-5", "claude-3-5-sonnet-20241022"];
        let apiData = null; let lastErr = "";
        for (const model of models) {
          try {
            const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
              body: JSON.stringify({ model, max_tokens: 600, messages: [{ role: "user", content: promptText }] })
            });
            const d = await apiRes.json();
            if (!apiRes.ok) { lastErr = "HTTP " + apiRes.status + ": " + (d.error && d.error.message || "unknown"); continue; }
            apiData = d; break;
          } catch(e) { lastErr = e.message || "fetch error"; }
        }
        if (!apiData) throw new Error("All models failed: " + lastErr);
        const text = (apiData.content || []).map(b => b.text || "").join("");
        const clean = text.replace(/```json|```/g, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch(apiErr) {
        const msg = apiErr && apiErr.message || "";
        console.error("[URL Import] API error:", msg);
        if (msg === "NO_KEY") {
          setForm(f => ({ ...f, link: url, ...(slugName ? { name: slugName } : {}), ...(imageUrl && !f.image ? { image: imageUrl } : {}) }));
          setUrlError("API key not configured — add REACT_APP_ANTHROPIC_KEY to Vercel env vars. Name pre-filled from URL.");
          setUrlLoading(false);
          return;
        }
        apiErrorMsg = msg;
        extracted = {};
      }
      // Check if we got anything useful back
      const gotFields = extracted.name || extracted.brand || extracted.category;
      setForm(f => ({
        ...f,
        name: extracted.name || slugName || f.name || "",
        ...(extracted.brand ? { brand: extracted.brand } : {}),
        ...(extracted.category ? { category: extracted.category } : {}),
        ...(extracted.price ? { price: String(extracted.price) } : {}),
        ...(extracted.color ? { color: extracted.color, colors: [extracted.color] } : {}),
        ...(extracted.notes ? { notes: extracted.notes } : {}),
        link: url,
        ...(imageUrl && !f.image ? { image: imageUrl } : {}),
      }));
      if (dest === "wishlist") setForm(f => ({ ...f, store: extracted.brand || siteName || f.store || "" }));
      if (gotFields) {
        setUrlSuccess(true);
        setUrlInput("");
      } else {
        setUrlError(apiErrorMsg ? `API error: ${apiErrorMsg.slice(0, 80)} — name pre-filled from URL, fill rest manually.` : "Link saved — name pre-filled from URL. Fill in remaining details manually.");
      }
    } catch (e) {
      console.error("[URL Import] Outer error:", e);
      setForm(f => ({ ...f, link: url }));
      setUrlError("Link saved — couldn't auto-fill details. Try filling in manually.");
    } finally {
      setUrlLoading(false);
    }
  };

  const refreshDrafts = () => setDrafts(loadDrafts());

  const saveDraft = () => {
    const d = loadDrafts();
    const draft = { ...form, dest, _draftId: Date.now(), _draftLabel: form.name || `Draft ${d.length + 1}`, _savedAt: new Date().toLocaleString() };
    saveDrafts([draft, ...d.filter(x => x._draftId !== draft._draftId)]);
    refreshDrafts();
    onCancel();
  };

  const loadDraft = (draft) => {
    const { dest: dDest, _draftId, _draftLabel, _savedAt, ...rest } = draft;
    setForm({ ...BLANK, colors: [], seasons: [], spent: "", ...rest });
    setDest(dDest || "closet");
    setShowDrafts(false);
  };

  const deleteDraft = (id) => {
    const updated = loadDrafts().filter(d => d._draftId !== id);
    saveDrafts(updated);
    refreshDrafts();
  };

  const handleSave = () => {
    const out = { ...form, color: (form.colors||[])[0] || "", season: (form.seasons||[])[0] || "" };
    if (dest === "wishlist") {
      let listId = selectedListId === "none" ? undefined : selectedListId;
      if (selectedListId === "new" && newListName.trim()) {
        const newList = { id: Date.now().toString(36), name: newListName.trim(), notes: "" };
        if (saveWishlistsMeta) saveWishlistsMeta([...wishlistsDb, newList]);
        listId = newList.id;
      }
      onSaveWish(out, listId);
    } else {
      onSave(out);
    }
  };

  // ── Drafts panel ──
  if (showDrafts) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setShowDrafts(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#aaa", padding: 0, display: "flex" }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>Drafts</span>
        <span style={{ fontSize: 12, color: "#bbb", marginLeft: "auto" }}>{drafts.length} saved</span>
      </div>
      {drafts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc" }}>
          <div style={{ marginBottom: 8 }}><SvgBox size={32} color="#ddd" /></div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No drafts yet</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {drafts.map(d => (
            <div key={d._draftId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#faf9f6", borderRadius: 14, border: "1.5px solid #e8e4dc" }}>
              {d.image && <img src={d.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
              {!d.image && <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f0ece4", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><SvgCamera size={16} color="#bbb" /></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d._draftLabel}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{d._savedAt} · {d.dest === "wishlist" ? "Wishlist" : "Closet"}</div>
              </div>
              <button onClick={() => loadDraft(d)} style={{ padding: "5px 12px", background: "#1a1a1a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>Load</button>
              <button onClick={() => deleteDraft(d._draftId)} style={{ padding: "5px 10px", background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Main form ──
  return (
    <div>
      {/* ── Header row: toggle + draft + close ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 12, padding: 3, flex: 1 }}>
          {[["closet","My Closet"],["wishlist","Wishlist"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setDest(id)} style={{
              flex: 1, padding: "7px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: dest === id ? "#1a1a1a" : "transparent",
              color: dest === id ? "#fff" : "#aaa",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
              transition: "all 0.15s"
            }}>{lbl}</button>
          ))}
        </div>
        <button onClick={() => { refreshDrafts(); setShowDrafts(true); }} title="Drafts" style={{
          width: 36, height: 36, borderRadius: 10, background: "#f5f2ed", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, position: "relative"
        }}>
          <SvgFolder size={15} color="#888" />
          {drafts.length > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 13, height: 13, borderRadius: "50%", background: "#e05588", color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{drafts.length}</span>}
        </button>
        <button onClick={onCancel} title="Close" style={{
          width: 36, height: 36, borderRadius: 10, background: "#f5f2ed", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* ── URL import — spans full width ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setUrlError(""); setUrlSuccess(false); }}
            onKeyDown={e => e.key === "Enter" && extractFromUrl()}
            placeholder="Paste a product link to auto-fill all fields…"
            style={{ flex: 1, padding: "9px 14px", border: "1.5px solid #e0dbd2", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", background: "#fafaf8" }}
          />
          <button onClick={extractFromUrl} disabled={urlLoading || !urlInput.trim()} style={{
            padding: "9px 16px", borderRadius: 12, border: "none",
            background: urlLoading ? "#e8e4dc" : "#1a1a1a", color: urlLoading ? "#aaa" : "#fff",
            cursor: urlLoading || !urlInput.trim() ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            {urlLoading ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Fetching…</>
            ) : (
              <><SvgLink size={12} color="#fff" />Import</>
            )}
          </button>
        </div>
        {urlError && <div style={{ marginTop: 5, fontSize: 11, color: "#e05555", fontWeight: 600 }}>{urlError}</div>}
        {urlSuccess && <div style={{ marginTop: 5, fontSize: 11, color: "#2d6a3f", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><SvgCheck size={11} color="#2d6a3f" />Fields auto-filled — review below</div>}
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* LEFT: image + name + brand */}
        <div style={{ width: 252, flexShrink: 0 }}>
          <ImageUploadField value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} style={{ marginBottom: 12 }} />
          <Input label="Name" value={form.name} onChange={set("name")} placeholder="e.g. White linen shirt" />
          {dest === "wishlist" ? (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><Input label="Brand" value={form.brand} onChange={set("brand")} placeholder="e.g. Zara" /></div>
              <div style={{ flex: 1 }}><Input label="Store" value={form.store || ""} onChange={e => setForm(f => ({ ...f, store: e.target.value }))} placeholder="e.g. Zara, ASOS" /></div>
            </div>
          ) : (
            <Input label="Brand" value={form.brand} onChange={set("brand")} placeholder="e.g. Zara" />
          )}
        </div>

        {/* RIGHT: all fields — independently scrollable */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto", maxHeight: "calc(90vh - 230px)", paddingRight: 2 }}>

          {/* Wishlist-only: product link */}
          {dest === "wishlist" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Product Link</label>
              <input style={{ ...inputStyle, width: "100%" }} value={form.link || ""} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://zara.com/..." />
            </div>
          )}

          {/* Wishlist-only: reason */}
          {dest === "wishlist" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Reason</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Replace", "Gap", "Trend", "Trip", "Dream Item"].map(r => {
                  const val = r.toLowerCase();
                  const active = form.reason === val;
                  return (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, reason: f.reason === val ? "" : val }))} style={{
                      padding: "5px 12px", borderRadius: 100,
                      border: active ? "none" : "1px solid #e0dbd2",
                      background: active ? "#1a1a1a" : "#fff",
                      color: active ? "#fff" : "#555",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>{r}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category + Size */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><SelectField label="Category" options={CATEGORIES.slice(1)} value={form.category} onChange={set("category")} /></div>
            <div style={{ flex: 1 }}><SelectField label="Size" options={SIZES} value={form.size} onChange={set("size")} /></div>
          </div>

          {/* Color swatches */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Color</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 7 }}>
              {COLORS.map(color => {
                const active = (form.colors || []).includes(color);
                const swatch = getColorSwatch(color);
                return (
                  <button key={color} type="button" title={color}
                    onClick={() => setForm(f => {
                      const cur = f.colors || [];
                      return { ...f, colors: active ? cur.filter(c => c !== color) : [...cur, color] };
                    })}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: swatch, border: active ? "2.5px solid #1a1a1a" : "2px solid transparent", boxShadow: active ? "0 0 0 1px #1a1a1a" : "0 1px 3px rgba(0,0,0,0.12)", transition: "all 0.15s" }} />
                  </button>
                );
              })}
            </div>
            {(form.colors || []).length > 0 && (
              <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                {(form.colors || []).map(c => (
                  <span key={c} style={{ fontSize: 11, color: "#888", background: "#f5f2ed", borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>{c}</span>
                ))}
                <button type="button" onClick={() => setForm(f => ({ ...f, colors: [] }))} style={{ fontSize: 10, color: "#bbb", background: "none", border: "none", cursor: "pointer", fontWeight: 700, padding: "2px 4px" }}>Clear</button>
              </div>
            )}
          </div>

          {/* Season */}
          <MultiPills label="Season" options={SEASONS} selected={form.seasons || []} onChange={v => setForm(f => ({ ...f, seasons: v }))} />

          {/* Price + Spent */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Input label="Original Price ($)" value={form.price} onChange={set("price")} placeholder="e.g. 89" /></div>
            <div style={{ flex: 1 }}><Input label="Spent ($)" value={form.spent || ""} onChange={set("spent")} placeholder="e.g. 55" /></div>
          </div>

          {/* Purchase date — closet only */}
          {dest === "closet" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Purchase Date</label>
              <input type="date" value={form.purchaseDate || ""} onChange={set("purchaseDate")} style={{ ...inputStyle, width: "100%" }} />
            </div>
          )}

          {/* Wishlist-only: Reason + List picker */}
          {dest === "wishlist" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Reason</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Replace", "Gap", "Trend", "Trip", "Dream Item"].map(r => {
                  const val = r.toLowerCase();
                  const active = form.reason === val;
                  return (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, reason: f.reason === val ? "" : val }))} style={{
                      padding: "5px 12px", borderRadius: 100,
                      border: active ? "none" : "1px solid #e0dbd2",
                      background: active ? "#1a1a1a" : "#fff",
                      color: active ? "#fff" : "#555",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>{r}</button>
                  );
                })}
              </div>
            </div>
          )}

          {dest === "wishlist" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Add to List</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button type="button" onClick={() => setSelectedListId("none")} style={{
                  padding: "5px 12px", borderRadius: 100, border: selectedListId === "none" ? "none" : "1px solid #e0dbd2",
                  background: selectedListId === "none" ? "#1a1a1a" : "#fff", color: selectedListId === "none" ? "#fff" : "#555",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>No List</button>
                {wishlistsDb.map(wl => (
                  <button key={wl.id} type="button" onClick={() => setSelectedListId(wl.id)} style={{
                    padding: "5px 12px", borderRadius: 100, border: selectedListId === wl.id ? "none" : "1px solid #e0dbd2",
                    background: selectedListId === wl.id ? "#1a1a1a" : "#fff", color: selectedListId === wl.id ? "#fff" : "#555",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>{wl.name}</button>
                ))}
                <button type="button" onClick={() => setSelectedListId("new")} style={{
                  padding: "5px 12px", borderRadius: 100, border: selectedListId === "new" ? "none" : "1.5px dashed #c0b8b0",
                  background: selectedListId === "new" ? "#1a1a1a" : "transparent", color: selectedListId === "new" ? "#fff" : "#aaa",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>+ New List</button>
              </div>
              {selectedListId === "new" && (
                <input value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="New list name…" autoFocus
                  style={{ marginTop: 8, width: "100%", padding: "8px 12px", border: "1px solid #e0dbd2", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notes</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 52 }} value={form.notes || ""} onChange={set("notes")} placeholder="Care instructions, fit notes…" />
          </div>

        </div>{/* /right column */}
      </div>{/* /two-column body */}

      {/* ── Footer actions ── */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1.5px solid #f0ece5" }}>
        <button onClick={saveDraft} style={{
          padding: "10px 14px", background: "#f5f2ed", border: "none", borderRadius: 12,
          cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#888",
          fontFamily: "'DM Sans', sans-serif"
        }}>Save Draft</button>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={handleSave} style={{
          padding: "10px 24px", background: "#1a1a1a", color: "#fff",
          border: "none", borderRadius: 12, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700
        }}>{dest === "wishlist" ? "Save to Wishlist" : (editMode ? "Save Changes" : "Add to Closet")}</button>
      </div>
    </div>
  );
}

// Clean minimal card: photo dominant (3:4), name + brand + chips below
function ItemCard({ item, onClick, onCreateLook, onEdit, onDelete, onAddToCapsule }) {
  return (
    <div className="item-card" onClick={onClick}
      style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", background: "#fff", position: "relative" }}>
      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "1/1", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 6 }} />
          : <HangerIcon size={36} color="#ddd" />
        }
      </div>
      {/* Hover-reveal: brand + action buttons */}
      <div className="item-card-label">
        {(item.brand) && <div className="item-card-brand" style={{ marginBottom: 6 }}>{item.brand}</div>}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onEdit && onEdit(); }} title="Edit"
            style={{ width: 30, height: 30, borderRadius: 8, background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SvgEdit size={12} color="#555" />
          </button>
          <button onClick={e => { e.stopPropagation(); onCreateLook && onCreateLook(); }} title="Create outfit"
            style={{ width: 30, height: 30, borderRadius: 8, background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SvgHanger size={13} color="#555" />
          </button>
          <button onClick={e => { e.stopPropagation(); onAddToCapsule && onAddToCapsule(); }} title="Add to capsule"
            style={{ width: 30, height: 30, borderRadius: 8, background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SvgBox size={12} color="#555" />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={e => { e.stopPropagation(); onDelete && onDelete(); }} title="Delete"
            style={{ width: 30, height: 30, borderRadius: 8, background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SvgTrash size={12} color="#e05555" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopCard({ item, onClick }) {
  const wornCount = item.wornCount || 0;
  const price = parseFloat(item.price || item.spent || 0);
  const cpw = price > 0 ? price / Math.max(1, wornCount) : null;
  const daysSince = item.lastWorn
    ? Math.floor((Date.now() - new Date(item.lastWorn)) / 86400000)
    : null;

  // Badge: never worn (amber) or stale 60+ days (muted gray)
  let badge = null;
  if (wornCount === 0) {
    badge = { label: "Never worn", bg: "#fff4e0", color: "#b97a00" };
  } else if (daysSince !== null && daysSince > 60) {
    badge = { label: `${daysSince}d ago`, bg: "#f0ece5", color: "#999" };
  }

  // CPW color: green < $5, amber $5-$20, gray > $20
  let cpwBg = "#f0ece5", cpwColor = "#999";
  if (cpw !== null) {
    if (cpw < 5) { cpwBg = "#e8f5ee"; cpwColor = "#2d8a55"; }
    else if (cpw < 20) { cpwBg = "#fff4e0"; cpwColor = "#b97a00"; }
  }

  return (
    <div onClick={onClick} className="fade-up" style={{ cursor: "pointer", background: "#fff", border: "1px solid #ece8e0", borderRadius: 16, overflow: "hidden", transition: "transform 0.18s, box-shadow 0.18s", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.015)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Badge */}
      {badge && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, padding: "3px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, letterSpacing: "0.02em" }}>
          {badge.label}
        </div>
      )}
      {/* Image */}
      <div style={{ aspectRatio: "3/4", background: "#f9f7f5", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 8 }} />
          : <HangerIcon size={40} color="#ddd" />
        }
      </div>
      {/* Bottom strip */}
      <div style={{ padding: "9px 11px 11px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <div style={{ fontSize: 11, color: "#b0a898", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
            {item.brand || item.category || ""}
          </div>
          <div style={{ fontSize: 10, color: "#ccc", flexShrink: 0 }}>
            {wornCount > 0 ? `×${wornCount}` : ""}
          </div>
        </div>
        {cpw !== null ? (
          <div style={{ display: "inline-block", padding: "3px 8px", borderRadius: 100, background: cpwBg, color: cpwColor, fontSize: 11, fontWeight: 700 }}>
            ${cpw.toFixed(2)}/wear
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "#ddd" }}>No price set</div>
        )}
      </div>
    </div>
  );
}

// ── Item Detail Popup ────────────────────────────────────────────────────────
function ItemDetailPopup({ item, onClose, onEdit, onDelete, onWorn, onDuplicate, onToggleNeedsStyling, onCreateOutfit, onListForSale, onMoveToCloset, onAddToCapsule, onOpenItem, onOpenOutfit, onOpenLookbook, outfits, lookbooks, isWishlist, capsules, allItems }) {
  const priceNum = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
  const spentNum = parseFloat((item.spent || "").replace(/[^0-9.]/g, "")) || 0;
  const worn = item.wornCount || 0;
  const cpw = worn > 0 && (spentNum || priceNum) > 0 ? ((spentNum || priceNum) / worn).toFixed(2) : null;
  const [featuredView, setFeaturedView] = useState("outfits"); // "outfits" | "lookbooks" | "wornWith"
  const [showPurchasedModal, setShowPurchasedModal] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [lbZoom, setLbZoom] = useState(1);
  const [lbPan, setLbPan] = useState({ x: 0, y: 0 });
  const [lbDrag, setLbDrag] = useState(null); // {startX, startY, panX, panY}
  const closeLightbox = () => { setLightbox(false); setLbZoom(1); setLbPan({ x: 0, y: 0 }); };
  const [purchasedDate, setPurchasedDate] = useState(new Date().toISOString().slice(0, 10));
  const [purchasedFinalPrice, setPurchasedFinalPrice] = useState("");
  const [purchasedKeepLink, setPurchasedKeepLink] = useState(true);
  const featuredOutfits = (outfits || []).filter(o => (o.layers || o.itemIds || []).includes(item.id));
  const featuredOutfitIds = new Set(featuredOutfits.map(o => o.id));
  const featuredLookbooks = (lookbooks || []).filter(lb => (lb.outfitIds || []).some(oid => featuredOutfitIds.has(oid)));
  const featuredLookbookCount = featuredLookbooks.length;
  const wornWithCounts = featuredOutfits.reduce((acc, outfit) => {
    (outfit.layers || outfit.itemIds || []).forEach(id => {
      if (id !== item.id) acc[id] = (acc[id] || 0) + 1;
    });
    return acc;
  }, {});
  const wornWithItems = Object.entries(wornWithCounts)
    .map(([id, count]) => ({ item: (allItems || []).find(i => i.id === id), count }))
    .filter(entry => entry.item)
    .sort((a, b) => b.count - a.count);

  // Days since added (for wishlist)
  const daysSinceAdded = isWishlist && item.addedAt
    ? Math.floor((Date.now() - new Date(item.addedAt).getTime()) / 86400000)
    : null;

  const chip = (label, bg = "#f5f3ef", color = "#666") => (
    <span style={{ background: bg, color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{label}</span>
  );

  return (
    <>
    {/* Lightbox */}
    {lightbox && item.image && (
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", cursor: lbZoom > 1 ? (lbDrag ? "grabbing" : "grab") : "zoom-out" }}
        onClick={closeLightbox}
        onWheel={e => { e.preventDefault(); setLbZoom(z => Math.max(1, Math.min(4, z - e.deltaY * 0.003))); if (lbZoom <= 1) setLbPan({ x: 0, y: 0 }); }}
        onMouseDown={e => { if (lbZoom > 1) { e.stopPropagation(); setLbDrag({ startX: e.clientX - lbPan.x, startY: e.clientY - lbPan.y }); } }}
        onMouseMove={e => { if (lbDrag) setLbPan({ x: e.clientX - lbDrag.startX, y: e.clientY - lbDrag.startY }); }}
        onMouseUp={() => setLbDrag(null)}
        onKeyDown={e => e.key === "Escape" && closeLightbox()}
        tabIndex={0}
      >
        <img src={item.image} alt={item.name} draggable={false}
          style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", transform: `scale(${lbZoom}) translate(${lbPan.x / lbZoom}px, ${lbPan.y / lbZoom}px)`, transformOrigin: "center", transition: lbDrag ? "none" : "transform 0.15s", userSelect: "none", pointerEvents: "none" }}
          onClick={e => e.stopPropagation()}
        />
        <button onClick={closeLightbox} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); setLbZoom(z => Math.max(1, z - 0.5)); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: "#fff", padding: "5px 12px", cursor: "pointer", fontSize: 16 }}>−</button>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, minWidth: 44, textAlign: "center" }}>{Math.round(lbZoom * 100)}%</span>
          <button onClick={e => { e.stopPropagation(); setLbZoom(z => Math.min(4, z + 0.5)); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: "#fff", padding: "5px 12px", cursor: "pointer", fontSize: 16 }}>+</button>
          {lbZoom > 1 && <button onClick={e => { e.stopPropagation(); setLbZoom(1); setLbPan({ x: 0, y: 0 }); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: "#fff", padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>Reset</button>}
        </div>
      </div>
    )}
    <div className="item-detail-overlay fade-in" onClick={onClose}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "min(1200px, 96vw)",  maxWidth: 1200,
        maxHeight: "90vh", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "row"
      }}>

        {/* ── LEFT: image + info ── */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Image */}
          <div style={{ width: "100%", aspectRatio: "3/4", background: "#f5f2ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: item.image ? "zoom-in" : "default" }}
            onClick={() => item.image && setLightbox(true)}>
            {item.image
              ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 8 }} />
              : <HangerIcon size={56} color="#ddd" />
            }
            {item.image && <div style={{ position: "absolute", bottom: 7, right: 7, background: "rgba(0,0,0,0.25)", borderRadius: 5, padding: "3px 5px", pointerEvents: "none" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>}
          </div>

          {/* Info */}
          <div style={{ padding: "18px 20px 22px", flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.01em", marginBottom: 2 }}>{item.name}</h2>
            {item.brand && <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>{item.brand}</div>}

            {/* Tags */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {item.category && chip(item.category)}
              {item.size && chip(item.size)}
              {(item.colors?.length ? item.colors : item.color ? [item.color] : []).map(c => chip(c))}
              {(item.seasons?.length ? item.seasons : item.season ? [item.season] : []).map(s => chip(s, "#f0fbff", "#2bafd4"))}
              {item.needsStyling && chip("Needs styling", "#fff0f6", "#b64b78")}
              {isWishlist && item.reason && (() => { const rMap = { replace: ["Replace", "#fff0f0", "#e05555"], gap: ["Gap", "#f0f4ff", "#3b5bdb"], trend: ["Trend", "#fdf0ff", "#9c27b0"], trip: ["Trip", "#f0fbff", "#2bafd4"], "dream item": ["Dream Item", "#fffbe6", "#a07000"] }; const rm = rMap[item.reason]; return rm ? chip(rm[0], rm[1], rm[2]) : null; })()}
            </div>
            {/* Color swatches */}
            {(item.colors?.length ? item.colors : item.color ? [item.color] : []).length > 0 && (() => {
              const colorMap = { black: "#1a1a1a", white: "#fff", cream: "#f5f0e8", beige: "#e8dcc8", brown: "#8b5e3c", tan: "#d2a679", camel: "#c19a6b", grey: "#9e9e9e", gray: "#9e9e9e", navy: "#1a2a4a", blue: "#2979c4", "light blue": "#7eb8e8", red: "#e03535", pink: "#f48fb1", blush: "#f4c2c2", purple: "#9c27b0", lavender: "#ce93d8", green: "#388e3c", sage: "#87a878", olive: "#6d7c43", yellow: "#f9d71c", orange: "#f57c00", gold: "#c9a96e", silver: "#aaa", multicolor: "linear-gradient(135deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)" };
              const cols = item.colors?.length ? item.colors : [item.color];
              return (
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {cols.map((c, i) => {
                    const key = (c||"").toLowerCase();
                    const bg = colorMap[key] || c;
                    const isGradient = bg.startsWith("linear");
                    return (
                      <div key={i} title={c} style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: bg,
                        border: "2px solid rgba(0,0,0,0.1)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                        flexShrink: 0,
                      }} />
                    );
                  })}
                </div>
              );
            })()}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Price", value: priceNum > 0 ? `$${priceNum.toFixed(0)}` : "—" },
                { label: "Spent", value: spentNum > 0 ? `$${spentNum.toFixed(0)}` : "—" },
                ...(!isWishlist ? [
                  { label: "Worn", value: worn > 0 ? `${worn}×` : "—" },
                  { label: "Cost/wear", value: cpw ? `$${cpw}` : "—" },
                ] : []),
                { label: "Outfits", value: featuredOutfits.length },
                { label: "Lookbooks", value: featuredLookbookCount },
              ].map(s => (
                <div key={s.label} style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {item.purchaseDate && (
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10, textAlign: "center" }}>
                Purchased {new Date(item.purchaseDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            )}

            {isWishlist && daysSinceAdded !== null && (
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10, textAlign: "center", fontStyle: "italic" }}>
                Added {daysSinceAdded === 0 ? "today" : `${daysSinceAdded} day${daysSinceAdded !== 1 ? "s" : ""} ago`}
              </div>
            )}

            {item.notes && (
              <div style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#555", lineHeight: 1.6 }}>{item.notes}</div>
            )}
          </div>
        </div>

        {/* ── RIGHT: featured in ── */}
        <div style={{ flex: 1, borderLeft: "1px solid #e8e4dc", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header: single row of action buttons + × at end */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e4dc", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap", overflowX: "auto" }}>
              {!isWishlist && (
                <button onClick={onEdit} title="Edit" style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              )}
              {!isWishlist && (
                <button onClick={onWorn} title="Add a wear" style={{
                  padding: "6px 11px", background: "#f0faf4", border: "1.5px solid #b6e8c8",
                  borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#2d6a3f", whiteSpace: "nowrap",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif", flexShrink: 0
                }}><SvgCheck size={12} color="#2d6a3f" />{worn}×</button>
              )}
              {!isWishlist && onAddToCapsule && (
                <button onClick={onAddToCapsule} style={{ padding: "6px 11px", background: "#f5f2ed", border: "1px solid #e0dbd2", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap" }}>
                  <SvgBox size={14} color="#888" />
                </button>
              )}
              {!isWishlist && onCreateOutfit && <button onClick={onCreateOutfit} style={{ padding: "6px 11px", background: "#1a1a1a", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap" }}>Create Outfit</button>}
              {!isWishlist && onListForSale && <button onClick={onListForSale} style={{ padding: "6px 11px", background: "#fff8ee", border: "1.5px solid #f5c842", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#a07000", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap" }}><SvgTag size={14} color="currentColor" /></button>}
              {!isWishlist && onDuplicate && <button onClick={onDuplicate} style={{ padding: "6px 11px", background: "#f5f2ed", border: "1px solid #e0dbd2", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap" }}><SvgCopy size={14} color="currentColor" /></button>}
              {!isWishlist && onToggleNeedsStyling && <button onClick={onToggleNeedsStyling} style={{ padding: "6px 11px", background: item.needsStyling ? "#fff0f6" : "#f5f2ed", border: item.needsStyling ? "1.5px solid #f3b4ce" : "1px solid #e0dbd2", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: item.needsStyling ? "#b64b78" : "#666", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap" }}><SvgHanger size={14} color="currentColor" /></button>}
              {isWishlist ? (<>
                {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{ padding: "6px 11px", background: "transparent", border: "1px solid #e8e4dc", borderRadius: 10, display: "flex", alignItems: "center", gap: 5, textDecoration: "none", flexShrink: 0, color: "#555", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}><SvgCart size={13} color="#555" />Buy</a>}
                <button onClick={() => { setPurchasedFinalPrice(item.price ? item.price.replace(/[^0-9.]/g,"") : ""); setPurchasedKeepLink(true); setShowPurchasedModal(true); }} style={{ padding: "6px 11px", background: "transparent", border: "1px solid #e8e4dc", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}><SvgShop size={13} color="#555" />Purchased</button>
                {onCreateOutfit && <button onClick={onCreateOutfit} style={{ padding: "6px 11px", background: "#f5f2ed", border: "1px solid #e0dbd2", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}><SvgHanger size={13} color="#555" />Create Look</button>}
                <button onClick={onDelete} style={{ padding: "6px 11px", background: "#fef2f2", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#e05555", whiteSpace: "nowrap" }}><SvgTrash size={13} color="#e05555" />Delete</button>
              </>) : (<>
                <button onClick={onDelete} title="Delete" style={{ width: 32, height: 32, borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e05555", flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
              </>)}
              {/* Spacer */}
              <div style={{ flex: 1 }} />
              {/* Toggle: Outfits / Lookbooks */}
              <div style={{ display: "flex", gap: 0, background: "#f5f2ed", borderRadius: 10, padding: 3, flexShrink: 0 }}>
                {[["outfits", "Outfits", featuredOutfits.length], ["lookbooks", "Lookbooks", featuredLookbookCount], ["wornWith", "Worn With", wornWithItems.length]].map(([id, lbl, cnt]) => (
                  <button key={id} onClick={() => setFeaturedView(id)} style={{
                    padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: featuredView === id ? "#fff" : "transparent",
                    color: featuredView === id ? "#1a1a1a" : "#aaa",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                    boxShadow: featuredView === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}>{lbl} <span style={{ fontSize: 10, opacity: 0.6 }}>({cnt})</span></button>
                ))}
              </div>
              {/* Close */}
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Content grid */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {featuredView === "outfits" ? (
              featuredOutfits.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", gap: 10, paddingTop: 40 }}>
                  <SvgSparkle size={40} color="#ddd" />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Not in any outfits yet</div>
                  {!isWishlist && <div style={{ fontSize: 12 }}>Click Create Outfit to style it</div>}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                  {featuredOutfits.map(outfit => (
                    <div key={outfit.id} onClick={() => onOpenOutfit && onOpenOutfit(outfit)} style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: "1px solid #cfcfcf", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", cursor: onOpenOutfit ? "pointer" : "default" }}>
                      {outfit.previewImage ? <img src={outfit.previewImage} alt={outfit.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <HangerIcon size={28} color="#ddd" />}
                    </div>
                  ))}
                </div>
              )
            ) : featuredView === "lookbooks" ? (
              featuredLookbooks.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", gap: 10, paddingTop: 40 }}>
                  <SvgGrid size={40} color="#ddd" />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Not in any lookbooks yet</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                  {featuredLookbooks.map(lb => (
                    <div key={lb.id} onClick={() => onOpenLookbook && onOpenLookbook(lb)} style={{ borderRadius: 14, overflow: "hidden", background: "#f5f2ed", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: onOpenLookbook ? "pointer" : "default" }}>
                      {lb.coverImage ? <img src={lb.coverImage} alt={lb.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <SvgGrid size={28} color="#ddd" />}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "18px 8px 8px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lb.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              wornWithItems.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", gap: 10, paddingTop: 40 }}>
                  <SvgHanger size={40} color="#ddd" />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No worn-with relationships yet</div>
                  <div style={{ fontSize: 12 }}>Wear this piece in more outfits to build links</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                  {wornWithItems.map(({ item: relatedItem, count }) => (
                    <div key={relatedItem.id} onClick={() => onOpenItem && onOpenItem(relatedItem)} style={{ borderRadius: 14, overflow: "hidden", background: "#f5f2ed", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}>
                      {relatedItem.image ? <img src={relatedItem.image} alt={relatedItem.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <HangerIcon size={28} color="#ddd" />}
                      <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.65)", color: "#fff", borderRadius: 999, padding: "4px 8px", fontSize: 10, fontWeight: 700 }}>{count}×</div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "18px 8px 8px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{relatedItem.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </div>

      {/* Purchase modal */}
      {showPurchasedModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
          onClick={() => setShowPurchasedModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: "28px 28px 24px", width: 340, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Mark as Purchased</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}><strong style={{ color: "#1a1a1a" }}>{item.name}</strong> will move to your closet.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Purchase Date</label>
                <input type="date" value={purchasedDate} onChange={e => setPurchasedDate(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Final Price Paid</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#888", fontWeight: 600 }}>$</span>
                  <input type="number" min="0" step="0.01" value={purchasedFinalPrice} onChange={e => setPurchasedFinalPrice(e.target.value)}
                    placeholder={item.price ? item.price.replace(/[^0-9.]/g,"") : "0.00"}
                    style={{ width: "100%", padding: "9px 12px 9px 24px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {item.link && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: "#faf9f6", borderRadius: 10 }}>
                  <input type="checkbox" checked={purchasedKeepLink} onChange={e => setPurchasedKeepLink(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1a1a1a" }} />
                  <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Keep product link in closet</span>
                </label>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => { onMoveToCloset(purchasedDate, purchasedFinalPrice, purchasedKeepLink); setShowPurchasedModal(false); }}
                style={{ flex: 1, padding: "11px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                Move to Closet
              </button>
              <button onClick={() => setShowPurchasedModal(false)}
                style={{ padding: "11px 16px", background: "#f5f3ef", color: "#888", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Closet Stats Panel ───────────────────────────────────────────────────────
const CAT_COLORS = {
  Accessories: "#e07e30", Activewear: "#3aaa6e", Bags: "#a855f7", Denim: "#6366f1",
  Dresses: "#e05588", Intimates: "#f59e42", Jewelry: "#f0c040", Knits: "#c084fc",
  Loungewear: "#94a3b8", Outerwear: "#2bafd4", Shoes: "#10b981", "Shorts + Skirts": "#fb7185",
  Sleepwear: "#818cf8", "Socks + Tights": "#a78bfa", Sweaters: "#f97316",
  Swim: "#06b6d4", Tops: "#f59e42", Trousers: "#64748b",
};

function ClosetStats({ items }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const totalValue = items.reduce((s, i) => s + (parseFloat((i.price || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const neverWorn = items.filter(i => !(i.wornCount || 0)).length;
  const byCategory = CATEGORIES.slice(1).map(cat => ({ cat, count: items.filter(i => i.category === cat).length })).filter(c => c.count > 0);
  const maxCat = Math.max(...byCategory.map(c => c.count), 1);
  const mostWorn = [...items].filter(i => (i.wornCount || 0) > 0).sort((a, b) => (b.wornCount || 0) - (a.wornCount || 0)).slice(0, 3);
  const withCPW = items
    .filter(i => (i.wornCount || 0) > 0 && parseFloat((i.price || "").replace(/[^0-9.]/g, "")) > 0)
    .map(i => ({ ...i, cpw: parseFloat((i.price || "").replace(/[^0-9.]/g, "")) / i.wornCount }))
    .sort((a, b) => a.cpw - b.cpw).slice(0, 3);
  return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 18px", background: "#fff", border: "1.5px solid #e8e4dc",
        borderRadius: open ? "16px 16px 0 0" : 16, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            { val: `$${totalValue.toFixed(0)}`, lbl: "Wardrobe Value" },
            { val: items.length, lbl: "Items" },
            { val: neverWorn, lbl: "Unworn", color: neverWorn > 0 ? "#e07e30" : "#3aaa6e" },
          ].map(s => (
            <div key={s.lbl}>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.color || "#1a1a1a" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 20, color: "#bbb", display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(270deg)", transition: "transform 0.2s" }}>‹</span>
      </button>
      {open && (
        <div className="fade-up" style={{ background: "#fff", border: "1.5px solid #e8e4dc", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>By Category</div>
            {byCategory.map(({ cat, count }) => (
              <div key={cat} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{cat}</span>
                  <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ height: 7, background: "#f0ece4", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / maxCat) * 100}%`, background: CAT_COLORS[cat] || "#ccc", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          {mostWorn.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Most Worn</div>
              {mostWorn.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", background: item.image ? "transparent" : "#f5f3ef", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image ? <img src={item.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <HangerIcon size={16} color="#ccc" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{item.brand || item.category || ""}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#3aaa6e", flexShrink: 0 }}>{item.wornCount}x</div>
                </div>
              ))}
            </div>
          )}
          {withCPW.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Best Value (Cost / Wear)</div>
              {withCPW.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", background: item.image ? "transparent" : "#f5f3ef", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image ? <img src={item.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <HangerIcon size={16} color="#ccc" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>${parseFloat((item.price||"").replace(/[^0-9.]/g,"")).toFixed(0)} · {item.wornCount}x worn</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#6366f1", flexShrink: 0 }}>${item.cpw.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          {neverWorn > 0 && (
            <div style={{ background: "#fff8f0", borderRadius: 12, padding: "12px 14px" }}>
              <span style={{ fontSize: 13, color: "#e07e30", fontWeight: 700 }}>{neverWorn} item{neverWorn > 1 ? "s" : ""} never worn</span>
              <span style={{ fontSize: 12, color: "#aaa", marginLeft: 6 }}>— try styling them in an outfit!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function OccasionPill({ tag, selected, onClick, small }) {
  const style = OCCASION_COLORS[tag] || { bg: "#f5f3ef", color: "#888" };
  return (
    <button onClick={onClick} style={{
      padding: small ? "3px 10px" : "6px 14px", borderRadius: 20,
      border: selected ? `1.5px solid ${style.color}` : "1.5px solid transparent",
      background: selected ? style.bg : "#f5f3ef", color: selected ? style.color : "#aaa",
      fontSize: small ? 11 : 12, fontWeight: 700, cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
    }}>{tag}</button>
  );
}

// ── Outfit Detail Popup ──────────────────────────────────────────────────────
function OutfitDetailPopup({ outfit, allItems, wishlistIds = new Set(), allOutfits, lookbooks, onClose, onEdit, onDelete, onArchive, onMarkWorn, onDuplicate, onAddToLookbook, onGoToLookbook, onItemClick }) {
  const [addingToLb, setAddingToLb] = useState(false);
  const [selectedLb, setSelectedLb] = useState("");
  const [exported, setExported] = useState(false);
  const [rightTab, setRightTab] = useState("pieces");
  const [wornFlash, setWornFlash] = useState(false);

  const handleMarkWorn = () => {
    onMarkWorn();
    setWornFlash(true);
    setTimeout(() => setWornFlash(false), 1800);
  };

  const exportPreview = () => {
    if (!outfit.previewImage) return;
    const a = document.createElement("a");
    a.href = outfit.previewImage;
    a.download = (outfit.name || "outfit").replace(/\s+/g, "_") + ".jpg";
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const outfitItems = (outfit.layers || outfit.itemIds || []).map(id => allItems.find(i => i.id === id)).filter(Boolean);
  const memberLookbooks = lookbooks.filter(lb => (lb.outfitIds || []).includes(outfit.id));
  const myIds = new Set(outfit.layers || outfit.itemIds || []);
  const similarOutfits = (allOutfits || []).filter(o => {
    if (o.id === outfit.id) return false;
    const shared = (o.layers || o.itemIds || []).filter(id => myIds.has(id)).length;
    return shared >= 2;
  }).sort((a, b) => {
    const sa = (b.layers || b.itemIds || []).filter(id => myIds.has(id)).length;
    const sb = (a.layers || a.itemIds || []).filter(id => myIds.has(id)).length;
    return sa - sb;
  }).slice(0, 6);
  const nonMemberLookbooks = lookbooks.filter(lb => !(lb.outfitIds || []).includes(outfit.id));
  const totalValue = outfitItems.reduce((sum, item) => sum + (parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const totalSpent = outfitItems.reduce((sum, item) => sum + (parseFloat((item.spent || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const wornCount = (outfit.wornDates || []).length;

  return (
    <div className="item-detail-overlay fade-in" onClick={onClose}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "min(1200px, 96vw)",  maxWidth: 1200,
        maxHeight: "90vh", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "row"
      }}>

        {/* ── LEFT: preview + info ── */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Preview image */}
          <div style={{ width: "100%", aspectRatio: "4/5", background: "#f5f2ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {outfit.previewImage
              ? <img src={outfit.previewImage} alt={outfit.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <HangerIcon size={56} color="#ddd" />
            }
          </div>

          {/* Info */}
          <div style={{ padding: "18px 20px 22px", flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.01em", marginBottom: 2 }}>{outfit.name}</h2>

            {/* Season + occasion tags */}
            {((outfit.seasons || []).length > 0 || (outfit.tags || []).length > 0) && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, marginTop: 8 }}>
                {(outfit.seasons || []).map(s => <span key={s} style={{ background: "#f0fbff", color: "#2bafd4", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s}</span>)}
                {(outfit.tags || []).map(tag => <OccasionPill key={tag} tag={tag} selected small />)}
              </div>
            )}

            {/* Stats 2×2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Pieces", value: outfitItems.length },
                { label: "Lookbooks", value: memberLookbooks.length },
                { label: "Total Value", value: totalValue > 0 ? `$${totalValue.toFixed(0)}` : "—" },
                { label: "Total Spent", value: totalSpent > 0 ? `$${totalSpent.toFixed(0)}` : "—" },
              ].map(s => (
                <div key={s.label} style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {outfit.notes && (
              <div style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>{outfit.notes}</div>
            )}

            {/* In lookbooks */}
            {memberLookbooks.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>In Lookbooks</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {memberLookbooks.map(lb => (
                    <button key={lb.id} onClick={() => onGoToLookbook(lb)} style={{
                      padding: "4px 12px", borderRadius: 20, background: "#f5f0ff", border: "1.5px solid #c4b0f0",
                      color: "#7c6fe0", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
                    }}><SvgGrid size={12} color="currentColor" style={{marginRight:6}} />{lb.name}</button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT: tabbed pieces / lookbooks ── */}
        <div style={{ flex: 1, borderLeft: "1px solid #e8e4dc", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e4dc", flexShrink: 0, gap: 8, flexWrap: "wrap" }}>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={onEdit} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", fontSize: 14, color: "#444", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button onClick={handleMarkWorn} style={{ padding: "6px 12px", borderRadius: 10, background: wornFlash ? "#2d6a3f" : "#f0faf4", border: "1.5px solid #b6e8c8", cursor: "pointer", fontSize: 12, fontWeight: 700, color: wornFlash ? "#fff" : "#2d6a3f", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}><SvgCheck size={12} color="currentColor" />{wornFlash ? "Marked!" : `${wornCount}×`}</button>
              {nonMemberLookbooks.length > 0 && (
                <button onClick={() => { setRightTab("lookbooks"); setAddingToLb(true); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }} title="Add to lookbook"><SvgGrid size={13} color="#666" /></button>
              )}
              <button onClick={onDuplicate} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }} title="Duplicate"><SvgCopy size={12} color="currentColor" /></button>
              <button onClick={onArchive} title="Archive" style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgDownload size={13} color="#666" /></button>
              <button onClick={onDelete} style={{ width: 32, height: 32, borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", color: "#e05555", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgTrash size={14} color="#e05555" /></button>
            </div>
            {/* Tab toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2 }}>
                {[["pieces", `Pieces (${outfitItems.length})`], ["lookbooks", `Lookbooks (${memberLookbooks.length})`], ["history", "History"], ["similar", "Similar"]].map(([v, lbl]) => (
                  <button key={v} onClick={() => setRightTab(v)} style={{
                    padding: "6px 14px", border: "none", borderRadius: 8, cursor: "pointer",
                    background: rightTab === v ? "#fff" : "transparent",
                    color: rightTab === v ? "#1a1a1a" : "#aaa",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                    boxShadow: rightTab === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s"
                  }}>{lbl}</button>
                ))}
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", fontSize: 14, color: "#888", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {rightTab === "pieces" && (
              outfitItems.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", gap: 10, paddingTop: 40 }}>
                  <HangerIcon size={36} color="#ddd" />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No items found</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                  {outfitItems.map(item => (
                    <div key={item.id} onClick={() => onItemClick && onItemClick(item)} style={{ borderRadius: 14, overflow: "hidden", background: "#fff", cursor: "pointer", border: "1.5px solid #ece8e0", transition: "border-color 0.15s", position: "relative" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#c0b8b0"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#ece8e0"}
                    >
                      {wishlistIds.has(item.id) && (
                        <div style={{ position: "absolute", top: 6, right: 6, zIndex: 2, fontSize: 11, color: "#f5a623" }}>★</div>
                      )}
                      <div style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} /> : <HangerIcon size={24} color="#ddd" />}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {rightTab === "lookbooks" && (
              memberLookbooks.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", gap: 10, paddingTop: 40 }}>
                  <div><SvgGrid size={32} color="#ddd" /></div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Not in any lookbooks</div>
                  {nonMemberLookbooks.length > 0 && (
                    addingToLb ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <select value={selectedLb} onChange={e => setSelectedLb(e.target.value)} style={{ padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                          <option value="">Choose lookbook…</option>
                          {nonMemberLookbooks.map(lb => <option key={lb.id} value={lb.id}>{lb.name}</option>)}
                        </select>
                        <button onClick={() => { if (selectedLb) { onAddToLookbook(outfit.id, selectedLb); setAddingToLb(false); setSelectedLb(""); } }} style={{ padding: "8px 12px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700 }}>Add</button>
                        <button onClick={() => setAddingToLb(false)} style={{ padding: "8px 10px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", color: "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingToLb(true)} style={{ padding: "8px 18px", background: "#f5f2ed", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>+ Add to Lookbook</button>
                    )
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {memberLookbooks.map(lb => (
                    <button key={lb.id} onClick={() => onGoToLookbook(lb)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      background: "#f5f0ff", border: "1.5px solid #c4b0f0", borderRadius: 14,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", width: "100%"
                    }}>
                      <div><SvgGrid size={20} color="#888" /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{lb.name}</div>
                        <div style={{ fontSize: 11, color: "#7c6fe0" }}>{(lb.outfitIds || []).length} outfit{(lb.outfitIds || []).length !== 1 ? "s" : ""} · tap to open →</div>
                      </div>
                    </button>
                  ))}
                  {nonMemberLookbooks.length > 0 && (
                    addingToLb ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <select value={selectedLb} onChange={e => setSelectedLb(e.target.value)} style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                          <option value="">Choose lookbook…</option>
                          {nonMemberLookbooks.map(lb => <option key={lb.id} value={lb.id}>{lb.name}</option>)}
                        </select>
                        <button onClick={() => { if (selectedLb) { onAddToLookbook(outfit.id, selectedLb); setAddingToLb(false); setSelectedLb(""); } }} style={{ padding: "8px 12px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700 }}>Add</button>
                        <button onClick={() => setAddingToLb(false)} style={{ padding: "8px 10px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", color: "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingToLb(true)} style={{ padding: "8px 14px", background: "#f5f2ed", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>+ Add to Lookbook</button>
                    )
                  )}
                </div>
              )
            )}
            {rightTab === "history" && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Worn {(outfit.wornDates || []).length} time{(outfit.wornDates || []).length !== 1 ? "s" : ""}
                </div>
                {(outfit.wornDates || []).length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 40, color: "#ccc", gap: 10 }}>
                    <SvgCalendar size={32} color="#ddd" />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>No wear history yet</div>
                    <div style={{ fontSize: 12 }}>Click Worn to log a date</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[...(outfit.wornDates || [])].reverse().map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#faf9f6", borderRadius: 10 }}>
                        <SvgCalendar size={13} color="#bbb" />
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>
                          {new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {rightTab === "similar" && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Outfits sharing 2+ pieces
                </div>
                {similarOutfits.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 40, color: "#ccc", gap: 10 }}>
                    <SvgSparkle size={32} color="#ddd" />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>No similar outfits found</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                    {similarOutfits.map(o => {
                      const sharedCount = (o.layers || o.itemIds || []).filter(id => myIds.has(id)).length;
                      return (
                        <div key={o.id} onClick={() => onItemClick && onItemClick(o)} style={{ borderRadius: 14, overflow: "hidden", background: "#f5f2ed", cursor: "pointer", position: "relative" }}>
                          <div style={{ aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {o.previewImage ? <img src={o.previewImage} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <HangerIcon size={24} color="#ddd" />}
                          </div>
                          <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 20, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>{sharedCount} shared</div>
                          <div style={{ padding: "6px 8px 8px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Lookbook Viewer ──────────────────────────────────────────────────────────
function LookbookViewer({ lookbook, outfits, allItems, closetItems, onClose, onUpdate, onArchive, onOpenOutfit, markOutfitWorn, moodboardsProp, moodboardsUpdateBoards, initialView }) {
  const LB_TAGS = ["Travel","Work Week","Event","Disney","Sport","Weekend","Vacation"];
  const [view, setView] = useState(initialView || "editorial"); // "editorial" | "grid"
  const [idx, setIdx] = useState(0);
  const [slideDir, setSlideDir] = useState("left");
  const [notes, setNotes] = useState(lookbook.notes || "");
  const [lbName, setLbName] = useState(lookbook.name);
  const [editingName, setEditingName] = useState(false);
  const [lookIds, setLookIds] = useState(lookbook.outfitIds || []);
  const [lookMeta, setLookMeta] = useState(lookbook.lookMeta || {});
  const [reordering, setReordering] = useState(false);
  const [addingOutfit, setAddingOutfit] = useState(false);
  const [showAddLooks, setShowAddLooks] = useState(false);
  const [outfitSearch, setOutfitSearch] = useState("");
  const [outfitTagFilter, setOutfitTagFilter] = useState("");
  const [lbDateStart, setLbDateStart] = useState(lookbook.dateStart || "");
  const [lbDateEnd, setLbDateEnd] = useState(lookbook.dateEnd || "");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [shareToast, setShareToast] = useState("");
  const [showPackList, setShowPackList] = useState(false);
  const [checkedPack, setCheckedPack] = useState(() => {
    try { const all = JSON.parse(localStorage.getItem("wardrobe_pack_checked_v1") || "{}"); return all[lookbook.id] || {}; } catch { return {}; }
  });
  useEffect(() => {
    try { const all = JSON.parse(localStorage.getItem("wardrobe_pack_checked_v1") || "{}"); localStorage.setItem("wardrobe_pack_checked_v1", JSON.stringify({ ...all, [lookbook.id]: checkedPack })); } catch {}
  }, [checkedPack, lookbook.id]);
  const [packingListView, setPackingListView] = useState(() => {
    // Check if opened from right panel packing list shortcut
    try {
      const sig = localStorage.getItem("wardrobe_open_packing_v1");
      if (sig === lookbook.id) {
        localStorage.removeItem("wardrobe_open_packing_v1");
        return true;
      }
    } catch {}
    return false;
  }); // full-screen packing grid
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver2, setDragOver2] = useState(null);
  const [lbTags, setLbTags] = useState(lookbook.tags || []);
  const [lbCity, setLbCity] = useState(lookbook.city || "");
  const [lbWeather, setLbWeather] = useState(null);
  const [wxLoading, setWxLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(lookbook.coverImage || "");
  const [wornToast, setWornToast] = useState("");
  // Moodboard — use prop from App (Supabase-backed), fall back to localStorage poll
  const MOODBOARD_KEY = "wardrobe_moodboards_v1";
  const [moodboardsLocal, setMoodboardsLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wardrobe_moodboards_v1") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    if (moodboardsProp) return; // don't poll if prop provided
    const iv = setInterval(() => {
      try { setMoodboardsLocal(JSON.parse(localStorage.getItem("wardrobe_moodboards_v1") || "[]")); } catch {}
    }, 600);
    return () => clearInterval(iv);
  }, [moodboardsProp]);
  const moodboards = (moodboardsProp && moodboardsProp.length > 0) ? moodboardsProp : moodboardsLocal;
  const [linkedMoodboardId, setLinkedMoodboardIdState] = useState(lookbook.moodboardId || null);
  const linkedMoodboardIdx = linkedMoodboardId
    ? moodboards.findIndex(b => b.id === linkedMoodboardId)
    : -1;
  const [showLinkModal, setShowLinkModal] = useState(false);
  const setLinkedMoodboardId = (id) => {
    setLinkedMoodboardIdState(id);
    try {
      onUpdate({ ...lookbook, moodboardId: id });
    } catch(e) { console.error("setLinkedMoodboardId error:", e); }
  };
  const setLinkedMoodboardIdx = (idx) => {
    const board = moodboards[idx];
    if (board) setLinkedMoodboardId(board.id);
  };
  const [moodboardView, setMoodboardView] = useState(false);
  // Trip details
  const [tripDetails, setTripDetails] = useState(lookbook.tripDetails || {
    hotel: "", activities: [], notes: ""
  });
  const [newActivity, setNewActivity] = useState("");
  const [plannedSlots, setPlannedSlots] = useState(() => lookbook.plannedSlots || []);
  const [openAccordions, setOpenAccordions] = useState({ overview: true, trip: false, notes: false, looks: true });
  const toggleAccordion = (key) => setOpenAccordions(a => ({ ...a, [key]: !a[key] }));
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotDragIdx, setSlotDragIdx] = useState(null);
  const [slotDragOver, setSlotDragOver] = useState(null);

  const looks = lookIds.map(id => outfits.find(o => o.id === id)).filter(Boolean);
  const availableToAdd = outfits.filter(o => !lookIds.includes(o.id));

  const fmtDate = (d) => {
    if (!d) return null;
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const dateStr = (lookbook.dateStart || lookbook.dateEnd)
    ? [fmtDate(lookbook.dateStart), fmtDate(lookbook.dateEnd)].filter(Boolean).join(" \u2013 ")
    : null;

  // Days / nights
  const tripDays = (lbDateStart && lbDateEnd)
    ? Math.max(1, Math.round((new Date(lbDateEnd) - new Date(lbDateStart)) / 86400000) + 1)
    : (lookbook.dateStart && lookbook.dateEnd)
    ? Math.max(1, Math.round((new Date(lookbook.dateEnd) - new Date(lookbook.dateStart)) / 86400000) + 1)
    : null;
  const tripNights = tripDays ? Math.max(0, tripDays - 1) : null;

  const totalVal = looks.flatMap(o => (o.layers || o.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean))
    .reduce((s, it) => s + (parseFloat((it.price || "").replace(/[^0-9.]/g, "")) || 0), 0);

  const go = (dir) => {
    setSlideDir(dir === 1 ? "left" : "right");
    setIdx(i => Math.max(0, Math.min(looks.length - 1, i + dir)));
  };

  const save = (overrides = {}) => {
    try {
      onUpdate({
        ...lookbook, name: lbName, notes, outfitIds: lookIds, lookMeta,
        tags: lbTags, city: lbCity, coverImage, moodboardId: linkedMoodboardId,
        tripDetails, dateStart: lbDateStart, dateEnd: lbDateEnd, plannedSlots, ...overrides
      });
    } catch(e) { console.error("save error:", e); }
  };

  const saveTripDetails = (patch) => {
    const next = { ...tripDetails, ...patch };
    setTripDetails(next);
    onUpdate({ ...lookbook, name: lbName, notes, outfitIds: lookIds, lookMeta, tags: lbTags, city: lbCity, coverImage, moodboardId: linkedMoodboardId, tripDetails: next });
  };

  const removeLook = (outfitId) => {
    const next = lookIds.filter(id => id !== outfitId);
    setLookIds(next);
    setIdx(i => Math.min(i, Math.max(0, next.length - 1)));
    onUpdate({ ...lookbook, name: lbName, notes, outfitIds: next, lookMeta, tags: lbTags, city: lbCity, coverImage });
  };

  const addLook = (outfitId) => {
    const next = [...lookIds, outfitId];
    setLookIds(next);
    setAddingOutfit(false);
    onUpdate({ ...lookbook, name: lbName, notes, outfitIds: next, lookMeta, tags: lbTags, city: lbCity, coverImage });
  };

  const updateMeta = (outfitId, field, value) => {
    const next = { ...lookMeta, [outfitId]: { ...(lookMeta[outfitId] || {}), [field]: value } };
    setLookMeta(next);
  };

  const handleWorn = async (look) => {
    const today = new Date().toISOString().slice(0, 10);
    if (markOutfitWorn) await markOutfitWorn(look, today);
    setWornToast(look.name);
    setTimeout(() => setWornToast(""), 2500);
  };

  const handleShare = () => {
    const data = {
      name: lbName, dateStr, outfits: looks.map(l => ({ name: l.name, preview: l.previewImage }))
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const url = window.location.origin + window.location.pathname + "?lb=" + encoded;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast("Share link copied!");
      setTimeout(() => setShareToast(""), 2500);
    });
  };

  const fetchWeather = async () => {
    const city = lbCity.trim();
    if (!city) return;
    setWxLoading(true);
    // Strip ", State" suffix for better API compatibility (e.g. "Orlando, FL" → "Orlando")
    const cityQuery = city.split(",")[0].trim();
    try {
      const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(cityQuery) + "&count=1&language=en&format=json");
      const geo = await geoRes.json();
      const loc = geo.results?.[0];
      if (!loc) { setLbWeather({ error: "City not found — try just the city name" }); setWxLoading(false); return; }
      const wRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + loc.latitude + "&longitude=" + loc.longitude + "&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=16");
      const w = await wRes.json();
      const days = (w.daily?.time || []).map((d, i) => ({
        date: d, high: Math.round(w.daily.temperature_2m_max[i]),
        low: Math.round(w.daily.temperature_2m_min[i]), code: w.daily.weathercode[i],
      }));
      setLbWeather({ city: loc.name, days });
    } catch(e) { setLbWeather({ error: "Weather unavailable" }); }
    setWxLoading(false);
  };

  const wxIcon = (code) => {
    if (code === 0) return "\u2600";
    if (code <= 2) return "\u26C5";
    if (code <= 45) return "\u2601";
    if (code <= 67) return "\uD83C\uDF27";
    if (code <= 77) return "\u2744";
    if (code <= 82) return "\uD83C\uDF26";
    return "\u26C8";
  };

  const getWxForDate = (dateStr2) => lbWeather?.days?.find(d => d.date === dateStr2) || null;

  // Drag-to-reorder looks list
  const handleDragStart = (i) => setDragIdx(i);
  const handleDragEnter = (i) => setDragOver2(i);
  const handleDrop = () => {
    if (dragIdx === null || dragOver2 === null || dragIdx === dragOver2) { setDragIdx(null); setDragOver2(null); return; }
    const next = [...lookIds];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(dragOver2, 0, moved);
    setLookIds(next);
    setDragIdx(null); setDragOver2(null);
    onUpdate({ ...lookbook, name: lbName, notes, outfitIds: next, lookMeta, tags: lbTags, city: lbCity, coverImage });
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    const s = document.createElement("script"); s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const handleExport = async () => {
    setExportingPdf(true);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const pdf = new window.jspdf.jsPDF({ orientation: "portrait", unit: "px", format: [420, 560] });
      // Cover page
      pdf.setFillColor(26, 26, 26);
      pdf.rect(0, 0, 420, 560, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28); pdf.setFont("helvetica", "bold");
      pdf.text(lbName, 30, 80, { maxWidth: 360 });
      if (dateStr) { pdf.setFontSize(13); pdf.setFont("helvetica", "normal"); pdf.text(dateStr, 30, 110); }
      if (looks.length > 0) { pdf.setFontSize(11); pdf.text(looks.length + " looks", 30, 130); }
      // Look pages
      for (let i = 0; i < looks.length; i++) {
        const look = looks[i];
        pdf.addPage();
        pdf.setFillColor(250, 249, 246);
        pdf.rect(0, 0, 420, 560, "F");
        pdf.setTextColor(26, 26, 26);
        pdf.setFontSize(18); pdf.setFont("helvetica", "bold");
        pdf.text(look.name || ("Look " + (i + 1)), 20, 36);
        const meta = lookMeta[look.id] || {};
        if (meta.occasion || meta.day) {
          pdf.setFontSize(11); pdf.setFont("helvetica", "normal"); pdf.setTextColor(136, 136, 136);
          pdf.text([meta.day, meta.occasion, meta.lookNotes].filter(Boolean).join("  \u00B7  "), 20, 52);
        }
        if (look.previewImage) {
          pdf.addImage(look.previewImage, "JPEG", 20, 64, 380, 420);
        }
        // Pieces list at bottom
        const pieces = (look.layers || look.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean);
        pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 100, 100);
        const piecesStr = pieces.map(p => p.name).join("  \u00B7  ");
        pdf.text(piecesStr, 20, 500, { maxWidth: 380 });
      }
      pdf.save((lbName || "lookbook") + ".pdf");
    } catch(e) {
      const imgs = looks.filter(l => l.previewImage).map(l => '<img src="' + l.previewImage + '" style="max-width:100%;margin:10px 0;display:block"/>').join("");
      const w = window.open("", "_blank");
      if (w) w.document.write('<html><body style="background:#111;padding:20px">' + imgs + '</body></html>');
    }
    setExportingPdf(false);
  };

  const currentLook = looks[idx];
  const canvasItems = currentLook
    ? (currentLook.layers || currentLook.itemIds || []).map(id => {
        const item = allItems.find(i => i.id === id);
        const pos = currentLook.positions?.[id];
        return item && pos ? { item, pos } : null;
      }).filter(Boolean)
    : [];

  const btnBase = { border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 10, transition: "all 0.15s" };
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  // Pack list items (deduplicated)
  const packItems = (() => {
    const seen = {};
    looks.forEach(look => {
      (look.layers || look.itemIds || []).forEach(id => {
        const item = allItems.find(i => i.id === id);
        if (item) seen[id] = item;
      });
    });
    return Object.values(seen);
  })();

  // Items used in 2+ looks (repeats)
  const itemUsageCount = {};
  looks.forEach(look => {
    (look.layers || look.itemIds || []).forEach(id => {
      itemUsageCount[id] = (itemUsageCount[id] || 0) + 1;
    });
  });
  const repeatCount = Object.values(itemUsageCount).filter(c => c > 1).length;
  const statTileStyle = { background: "#faf9f6", borderRadius: 10, padding: "10px 8px", textAlign: "center" };
  const acHdrStyle = { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", borderBottom: "1.5px solid #f0ece4", cursor: "pointer", padding: "10px 16px", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="lookbook-overlay">
      <style>{globalStyles}</style>

      {/* Toasts */}
      {(shareToast || wornToast) && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", padding: "10px 22px", borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
          {wornToast ? "\u2713 Marked \"" + wornToast + "\" as worn" : shareToast}
        </div>
      )}

      {/* ── PACKING LIST FULL VIEW ── */}
      {packingListView && (
        <div style={{ position: "fixed", inset: 0, background: "#f7f5f2", zIndex: 9998, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
          {/* Header */}
          <div style={{ height: 56, background: "#fff", borderBottom: "1.5px solid #e8e4dc", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, flexShrink: 0 }}>
            <button onClick={() => setPackingListView(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#aaa" }}>
              <SvgArrowL size={18} color="#aaa" />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>Packing List — {lbName}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{packItems.filter(i => checkedPack[i.id]).length} of {packItems.length} packed</div>
            </div>
            {/* Progress bar inline */}
            <div style={{ width: 140, height: 6, borderRadius: 6, background: "#e8e4dc", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: "#2d6a3f", width: (packItems.length > 0 ? (packItems.filter(i => checkedPack[i.id]).length / packItems.length * 100) : 0) + "%", transition: "width 0.3s" }} />
            </div>
            <button onClick={() => setCheckedPack({})} style={{ fontSize: 11, fontWeight: 700, color: "#aaa", background: "#f5f3ef", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Reset</button>
          </div>
          {/* Grid of items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {packItems.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 80, color: "#bbb", fontSize: 14 }}>No items in this lookbook yet</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {packItems.map(item => {
                  const packed = !!checkedPack[item.id];
                  return (
                    <div key={item.id} onClick={() => setCheckedPack(c => ({ ...c, [item.id]: !c[item.id] }))}
                      style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `2px solid ${packed ? "#2d6a3f" : "#e8e4dc"}`, background: packed ? "#f0faf4" : "#fff", transition: "all 0.15s", position: "relative" }}>
                      {/* Check badge */}
                      <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: packed ? "#2d6a3f" : "rgba(255,255,255,0.9)", border: packed ? "none" : "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, transition: "all 0.15s" }}>
                        {packed && <SvgCheck size={12} color="#fff" />}
                      </div>
                      {/* Image */}
                      <div style={{ width: "100%", aspectRatio: "1/1", background: "#f7f5f2", display: "flex", alignItems: "center", justifyContent: "center", opacity: packed ? 0.45 : 1, transition: "opacity 0.15s" }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
                          : <HangerIcon size={32} color="#ddd" />
                        }
                      </div>
                      {/* Label */}
                      <div style={{ padding: "8px 10px", opacity: packed ? 0.5 : 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: packed ? "line-through" : "none" }}>{item.name}</div>
                        {item.category && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{item.category}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="lookbook-topbar">
        <button onClick={() => {
          const finalLb = { ...lookbook, name: lbName, notes, outfitIds: lookIds, lookMeta, tags: lbTags, city: lbCity, coverImage, moodboardId: linkedMoodboardId, tripDetails, dateStart: lbDateStart, dateEnd: lbDateEnd };
          onClose(finalLb);
        }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#aaa" }}>
          <SvgArrowL size={18} color="#aaa" />
        </button>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 10 }}>
          {editingName ? (
            <input autoFocus value={lbName} onChange={e => setLbName(e.target.value)}
              onBlur={() => { setEditingName(false); save(); }}
              onKeyDown={e => { if (e.key === "Enter") { setEditingName(false); save(); } }}
              style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", border: "none", borderBottom: "2px solid #1a1a1a", outline: "none", background: "transparent", fontFamily: "'DM Sans', sans-serif", padding: "2px 0", width: "100%", maxWidth: 320 }} />
          ) : (
            <div onClick={() => setEditingName(true)} style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", cursor: "text", display: "flex", alignItems: "center", gap: 6 }}>
              {lbName} <SvgEdit size={12} color="#ccc" />
            </div>
          )}
          {dateStr && <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginTop: 1 }}>{dateStr}{tripDays ? " \u00B7 " + tripDays + " day" + (tripDays !== 1 ? "s" : "") : ""}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", background: "#f0ece4", borderRadius: 10, padding: 3, gap: 2 }}>
            {[{ id: "editorial", label: "Looks" }, { id: "grid", label: "Grid" }, { id: "moodboard", label: "Moodboard" }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                ...btnBase, padding: "6px 12px", fontSize: 12, borderRadius: 8,
                background: view === v.id ? "#fff" : "transparent",
                color: view === v.id ? "#1a1a1a" : "#aaa",
                boxShadow: view === v.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
              }}>{v.label}</button>
            ))}
          </div>
          {/* Link Moodboard button */}
          <button onClick={() => setShowLinkModal(true)} style={{ ...btnBase, padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6,
            background: linkedMoodboardId ? "#f0faf4" : "#f5f3ef",
            color: linkedMoodboardId ? "#2d6a3f" : "#555",
            border: linkedMoodboardId ? "1.5px solid #b6e8c8" : "1.5px solid transparent"
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            {linkedMoodboardId && linkedMoodboardIdx >= 0 && moodboards[linkedMoodboardIdx]
              ? moodboards[linkedMoodboardIdx].name || "Linked Board"
              : "Link Moodboard"}
          </button>
          <button onClick={handleShare} style={{ ...btnBase, padding: "7px 14px", background: "#f5f3ef", color: "#555", fontSize: 12 }}>Share</button>
          <button onClick={() => setPackingListView(true)} style={{ ...btnBase, padding: "7px 14px", background: "#f0faf4", color: "#2d6a3f", fontSize: 12, border: "1.5px solid #b6e8c8" }}>
            <SvgLuggage size={12} color="#2d6a3f" style={{ marginRight: 5 }} />Pack List
          </button>
          <button onClick={handleExport} disabled={exportingPdf} style={{ ...btnBase, padding: "7px 14px", background: "#f5f3ef", color: "#555", fontSize: 12 }}>
            {exportingPdf ? "Exporting\u2026" : "Export PDF"}
          </button>
          {onArchive && (
            <button onClick={() => {
              if (window.confirm(`Archive "${lbName}"? You can restore it from Settings → Data.`)) {
                const finalLb = { ...lookbook, name: lbName, notes, outfitIds: lookIds, lookMeta, tags: lbTags, city: lbCity, coverImage, moodboardId: linkedMoodboardId, tripDetails, dateStart: lbDateStart, dateEnd: lbDateEnd };
                onArchive(finalLb);
              }
            }} style={{ ...btnBase, padding: "7px 14px", background: "#fff8f8", color: "#e05555", fontSize: 12, border: "1.5px solid #ffd0d0" }}>
              Archive
            </button>
          )}
          <button onClick={() => {
            const finalLb = { ...lookbook, name: lbName, notes, outfitIds: lookIds, lookMeta, tags: lbTags, city: lbCity, coverImage, moodboardId: linkedMoodboardId, tripDetails, dateStart: lbDateStart, dateEnd: lbDateEnd };
            onClose(finalLb);
          }} style={{ ...btnBase, padding: "7px 18px", background: "#1a1a1a", color: "#fff", fontSize: 13 }}>Save &amp; Close</button>
        </div>
      </div>

      {/* ── HERO HEADER ── */}
      {(lbCity || dateStr || lbTags.length > 0 || lbWeather?.days) && (
        <div style={{ background: "#fff", borderBottom: "1.5px solid #f0ece4", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          {lbCity && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", background: "#f5f3ef", borderRadius: 20 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{lbCity}</span>
            </div>
          )}
          {(lbDateStart || lbDateEnd) && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", background: "#f5f3ef", borderRadius: 20 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>
                {[fmtDate(lbDateStart), fmtDate(lbDateEnd)].filter(Boolean).join(" \u2013 ")}
                {tripDays ? ` \u00B7 ${tripDays}d ${tripNights}n` : ""}
              </span>
            </div>
          )}
          {lbTags.map(t => (
            <div key={t} style={{ padding: "4px 10px", background: "#1a1a1a", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#fff" }}>{t}</div>
          ))}
          {lbWeather?.days && (() => {
            const wxDays = lbWeather.days.filter(d => {
              if (!lbDateStart && !lbDateEnd) return true;
              return d.date >= (lbDateStart || "0") && d.date <= (lbDateEnd || "9999");
            }).slice(0, 6);
            return wxDays.length > 0 ? (
              <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                {wxDays.map(d => (
                  <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3px 8px", background: "#faf9f6", borderRadius: 10, gap: 1, minWidth: 38 }}>
                    <span style={{ fontSize: 14 }}>{wxIcon(d.code)}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#666" }}>{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span style={{ fontSize: 9, color: "#888" }}>{d.high}\u00B0/{d.low}\u00B0</span>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {view === "moodboard" ? (
            /* ── MOODBOARD VIEW — always show, regardless of looks count ── */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#faf9f6" }}>
              {linkedMoodboardIdx >= 0 && moodboards[linkedMoodboardIdx] ? (
                <div style={{ flex: 1, overflow: "auto" }}>
                  <Moodboard
                    closetItems={closetItems || []}
                    activeIdx={linkedMoodboardIdx}
                    setActiveIdx={setLinkedMoodboardIdx}
                    boards={moodboardsProp}
                    updateBoards={moodboardsUpdateBoards}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>No moodboard linked</div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>Use the Link Moodboard button above to connect one.</div>
                  <button onClick={() => setShowLinkModal(true)} style={{ ...btnBase, padding: "10px 22px", background: "#1a1a1a", color: "#fff", fontSize: 13 }}>+ Link Moodboard</button>
                </div>
              )}
            </div>

          ) : looks.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ccc", gap: 12 }}>
              <SvgGrid size={36} color="#ddd" />
              <div style={{ fontSize: 14, fontWeight: 600 }}>No looks yet</div>
              <button onClick={() => setShowAddLooks(true)} style={{ ...btnBase, padding: "10px 22px", background: "#1a1a1a", color: "#fff", fontSize: 13 }}>+ Add Outfits</button>
            </div>

          ) : view === "editorial" ? (
            /* ── EDITORIAL / MAGAZINE VIEW ── */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Large hero image */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0e0e0e" }}>
                <div className={"slide-enter-" + slideDir} key={idx} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {currentLook?.previewImage ? (
                    <img src={currentLook.previewImage} alt={currentLook.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : canvasItems.length > 0 ? (
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      {canvasItems.map(({ item, pos }, ii) => (
                        <div key={item.id} style={{ position: "absolute", left: pos.x, top: pos.y, width: pos.w, zIndex: ii + 1, pointerEvents: "none" }}>
                          {item.image
                            ? <img src={item.image} alt={item.name} style={{ width: pos.w, height: pos.h, objectFit: "contain" }} />
                            : <div style={{ width: pos.w, height: pos.h, background: "#222", borderRadius: 8 }} />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#444", fontSize: 13, fontWeight: 600 }}>No preview</div>
                  )}
                </div>

                {/* Editorial overlay — look name + tags + weather */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 100%)", padding: "40px 24px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                    Look {idx + 1} of {looks.length}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6 }}>
                    {currentLook?.name}
                  </div>
                  {/* Occasion tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {(currentLook?.tags || []).map(t => (
                      <div key={t} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700 }}>{t}</div>
                    ))}
                    {lookMeta[currentLook?.id]?.occasion && (
                      <div style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                        {lookMeta[currentLook.id].occasion}
                      </div>
                    )}
                  </div>
                  {/* Weather for this look's date */}
                  {(() => {
                    const metaDate = lookMeta[currentLook?.id]?.date;
                    const wx = metaDate ? getWxForDate(metaDate) : null;
                    return wx ? (
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{wxIcon(wx.code)}</span>
                        <span>{wx.high}\u00B0 / {wx.low}\u00B0</span>
                        <span style={{ opacity: 0.6 }}>{lbCity}</span>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Prev/Next arrows over image */}
                <button onClick={() => go(-1)} disabled={idx === 0} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SvgArrowL size={18} color="#fff" />
                </button>
                <button onClick={() => go(1)} disabled={idx === looks.length - 1} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "none", cursor: idx === looks.length - 1 ? "default" : "pointer", opacity: idx === looks.length - 1 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SvgArrowR size={18} color="#fff" />
                </button>
              </div>

              {/* Bottom strip — meta inputs + pieces + actions */}
              {currentLook && (
                <div style={{ background: "#fff", borderTop: "1px solid #f0ece4", padding: "12px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <select value={lookMeta[currentLook.id]?.day || ""} onChange={e => updateMeta(currentLook.id, "day", e.target.value)} onBlur={() => save()}
                    style={{ padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#1a1a1a", background: "#fff", minWidth: 120 }}>
                    <option value="">Day of week\u2026</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input value={lookMeta[currentLook.id]?.occasion || ""} onChange={e => updateMeta(currentLook.id, "occasion", e.target.value)} onBlur={() => save()}
                    placeholder="Occasion" style={{ padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, flex: "1 1 140px", outline: "none" }} />
                  <input type="date" value={lookMeta[currentLook.id]?.date || ""} onChange={e => updateMeta(currentLook.id, "date", e.target.value)} onBlur={() => save()}
                    style={{ padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
                  <input value={lookMeta[currentLook.id]?.lookNotes || ""} onChange={e => updateMeta(currentLook.id, "lookNotes", e.target.value)} onBlur={() => save()}
                    placeholder="Notes for this look\u2026" style={{ padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, flex: "2 1 200px", outline: "none" }} />
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => handleWorn(currentLook)} style={{ ...btnBase, padding: "6px 14px", background: "#f0faf4", color: "#2d6a3f", fontSize: 12, border: "none" }}>
                      \u2713 Mark Worn
                    </button>
                    <button onClick={() => onOpenOutfit && onOpenOutfit(currentLook)} style={{ ...btnBase, padding: "6px 12px", background: "#f5f2ed", color: "#666", fontSize: 12, border: "none" }}>Details</button>
                    <button onClick={() => removeLook(currentLook.id)} style={{ ...btnBase, padding: "6px 12px", background: "#fef2f2", color: "#e05555", fontSize: 12, border: "none" }}>Remove</button>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── GRID VIEW ── */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, padding: 20, overflowY: "auto", flex: 1, alignContent: "start" }}>
              {looks.map((look, i) => {
                const pieces = (look.layers || look.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean);
                const meta = lookMeta[look.id] || {};
                const metaWx = meta.date ? getWxForDate(meta.date) : null;
                return (
                  <div key={look.id} style={{ cursor: "pointer", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e8e4dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", position: "relative" }}>
                    <div onClick={() => { setIdx(i); setView("editorial"); }}>
                      {look.previewImage ? (
                        <div style={{ height: 180, background: "url(" + look.previewImage + ") center/contain no-repeat #f5f3ef", position: "relative" }}>
                          {metaWx && <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", borderRadius: 10, padding: "3px 8px", color: "#fff", fontSize: 11, fontWeight: 700 }}>{wxIcon(metaWx.code)} {metaWx.high}\u00B0</div>}
                          {meta.day && <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", borderRadius: 10, padding: "3px 8px", color: "#fff", fontSize: 10, fontWeight: 700 }}>{meta.day}</div>}
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: pieces.length >= 2 ? "1fr 1fr" : "1fr", height: 140, position: "relative" }}>
                          {pieces.slice(0, 4).map(item => (
                            <div key={item.id} style={{ background: item.image ? "url(" + item.image + ") center/contain no-repeat #f5f3ef" : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {!item.image && <HangerIcon size={20} color="#ccc" />}
                            </div>
                          ))}
                          {metaWx && <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", borderRadius: 10, padding: "3px 8px", color: "#fff", fontSize: 11, fontWeight: 700 }}>{wxIcon(metaWx.code)} {metaWx.high}\u00B0</div>}
                          {meta.day && <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", borderRadius: 10, padding: "3px 8px", color: "#fff", fontSize: 10, fontWeight: 700 }}>{meta.day}</div>}
                        </div>
                      )}
                      <div style={{ padding: "8px 10px 4px" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{look.name || ("Look " + (i+1))}</div>
                        {(meta.day || meta.occasion) && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{[meta.day, meta.occasion].filter(Boolean).join(" \u00B7 ")}</div>}
                        {meta.lookNotes && <div style={{ fontSize: 10, color: "#bbb", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.lookNotes}</div>}
                        <div style={{ fontSize: 10, color: "#ccc", marginTop: 2 }}>{pieces.length} piece{pieces.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, padding: "0 10px 10px" }}>
                      <button onClick={() => handleWorn(look)} style={{ ...btnBase, flex: 1, fontSize: 10, padding: "4px 6px", background: "#f0faf4", color: "#2d6a3f", border: "none" }}>\u2713 Worn</button>
                      <button onClick={() => onOpenOutfit && onOpenOutfit(look)} style={{ ...btnBase, flex: 1, fontSize: 10, padding: "4px 6px", background: "#f5f2ed", color: "#666", border: "none" }}>Details</button>
                      <button onClick={() => removeLook(look.id)} style={{ ...btnBase, flex: 1, fontSize: 10, padding: "4px 6px", background: "#fef2f2", color: "#e05555", border: "none" }}>Remove</button>
                    </div>
                  </div>
                );
              })}

              {/* ── PLANNED SLOT CARDS (dotted placeholders) ── */}
              {plannedSlots.map((slot, si) => {
                const slotWx = slot.date ? getWxForDate(slot.date) : null;
                const slotDate = slot.date ? new Date(slot.date + "T00:00:00") : null;
                const slotDateLabel = slotDate ? slotDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
                const slotDayLabel = slotDate ? slotDate.toLocaleDateString("en-US", { weekday: "short" }) : null;
                return (
                  <div key={slot.id}
                    draggable
                    onDragStart={() => setSlotDragIdx(si)}
                    onDragEnter={() => setSlotDragOver(si)}
                    onDragEnd={() => {
                      if (slotDragIdx !== null && slotDragOver !== null && slotDragIdx !== slotDragOver) {
                        const next = [...plannedSlots];
                        const [moved] = next.splice(slotDragIdx, 1);
                        next.splice(slotDragOver, 0, moved);
                        setPlannedSlots(next);
                        save({ plannedSlots: next });
                      }
                      setSlotDragIdx(null); setSlotDragOver(null);
                    }}
                    onDragOver={e => e.preventDefault()}
                    style={{ borderRadius: 16, border: `2px dashed ${slotDragOver === si ? "#888" : "#d0cbc3"}`, background: slotDragOver === si ? "#f5f3ef" : "#faf9f6", overflow: "hidden", position: "relative", cursor: "grab", transition: "border-color 0.15s" }}>
                    {/* Weather / date badges */}
                    <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, position: "relative" }}>
                      {slotDateLabel && (
                        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
                          <div style={{ background: "rgba(0,0,0,0.65)", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>{slotDayLabel} {slotDateLabel}</div>
                          {slotWx && <div style={{ background: "rgba(0,0,0,0.65)", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>{wxIcon(slotWx.code)} {slotWx.high}\u00B0</div>}
                        </div>
                      )}
                      {!slotDateLabel && slotWx && (
                        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.65)", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>{wxIcon(slotWx.code)} {slotWx.high}\u00B0</div>
                      )}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d0cbc3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                      <button onClick={e => { e.stopPropagation(); setShowAddLooks(true); }}
                        style={{ padding: "5px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                        + Add Outfit
                      </button>
                    </div>
                    <div style={{ padding: "0 10px 10px", borderTop: "1.5px dashed #e0dbd2" }}>
                      {editingSlotId === slot.id ? (
                        <input autoFocus value={slot.name}
                          onChange={e => { const next = plannedSlots.map((s, j) => j === si ? { ...s, name: e.target.value } : s); setPlannedSlots(next); }}
                          onBlur={() => { setEditingSlotId(null); save({ plannedSlots }); }}
                          onKeyDown={e => { if (e.key === "Enter") { setEditingSlotId(null); save({ plannedSlots }); } }}
                          style={{ width: "100%", border: "none", borderBottom: "1.5px solid #1a1a1a", outline: "none", fontSize: 12, fontWeight: 700, color: "#1a1a1a", background: "transparent", fontFamily: "'DM Sans', sans-serif", padding: "5px 0", boxSizing: "border-box" }} />
                      ) : (
                        <div onClick={() => setEditingSlotId(slot.id)} style={{ fontSize: 12, fontWeight: 700, color: slot.name ? "#1a1a1a" : "#bbb", cursor: "text", padding: "5px 0" }}>
                          {slot.name || "Name this look\u2026"}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 4, marginTop: 3, alignItems: "center" }}>
                        <input type="date" value={slot.date || ""}
                          onChange={e => { const next = plannedSlots.map((s, j) => j === si ? { ...s, date: e.target.value } : s); setPlannedSlots(next); save({ plannedSlots: next }); }}
                          style={{ flex: 1, padding: "3px 6px", border: "1px solid #e8e4dc", borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 10, outline: "none", background: "#fff" }} />
                        <button onClick={() => { const next = plannedSlots.filter((_, j) => j !== si); setPlannedSlots(next); save({ plannedSlots: next }); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", padding: "2px 4px", lineHeight: 1 }}
                          onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
                          onMouseLeave={e => e.currentTarget.style.color = "#ddd"}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Slot tile */}
              <div onClick={() => { const next = [...plannedSlots, { id: Date.now() + "_" + Math.random().toString(36).slice(2), name: "", date: "" }]; setPlannedSlots(next); save({ plannedSlots: next }); }}
                style={{ borderRadius: 16, border: "2px dashed #e0dbd2", background: "#fafaf8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", minHeight: 200, transition: "border-color 0.15s, background 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#aaa"; e.currentTarget.style.background = "#f5f3ef"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0dbd2"; e.currentTarget.style.background = "#fafaf8"; }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 17, color: "#999", lineHeight: 1 }}>+</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb" }}>Plan a Look</div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR (accordion) ── */}
        <div style={{ width: 272, background: "#fff", borderLeft: "1.5px solid #e8e4dc", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>

          {/* ── OVERVIEW ── */}
          <button onClick={() => toggleAccordion("overview")} style={{ ...acHdrStyle }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Overview</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" style={{ transform: openAccordions.overview ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {openAccordions.overview && (
            <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                <div style={statTileStyle}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>
                    {looks.length}<span style={{ fontSize: 11, fontWeight: 600, color: "#bbb" }}> / {looks.length + plannedSlots.length}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Planned Looks</div>
                </div>
                <div style={statTileStyle}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>{packItems.length}</div>
                  <div style={{ fontSize: 9, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Packed Pieces</div>
                </div>
                {repeatCount > 0 && (
                  <div style={statTileStyle}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>{repeatCount}</div>
                    <div style={{ fontSize: 9, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Repeats</div>
                  </div>
                )}
                {tripDays && (
                  <div style={statTileStyle}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>
                      {tripDays}<span style={{ fontSize: 10, color: "#bbb", fontWeight: 600 }}>d</span> {tripNights}<span style={{ fontSize: 10, color: "#bbb", fontWeight: 600 }}>n</span>
                    </div>
                    <div style={{ fontSize: 9, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Duration</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TRIP ── */}
          <button onClick={() => toggleAccordion("trip")} style={{ ...acHdrStyle }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Trip</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" style={{ transform: openAccordions.trip ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {openAccordions.trip && (
            <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Name */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Name</div>
                <input value={lbName} onChange={e => setLbName(e.target.value)} onBlur={() => save()}
                  style={{ width: "100%", padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Start</div>
                  <input type="date" value={lbDateStart} onChange={e => setLbDateStart(e.target.value)} onBlur={() => save()}
                    style={{ width: "100%", padding: "6px 6px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 10, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>End</div>
                  <input type="date" value={lbDateEnd} onChange={e => setLbDateEnd(e.target.value)} onBlur={() => save()}
                    style={{ width: "100%", padding: "6px 6px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 10, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {/* Destination + Weather */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Destination</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={lbCity} onChange={e => setLbCity(e.target.value)} placeholder="City (e.g. Orlando, FL)"
                    onKeyDown={e => { if (e.key === "Enter") fetchWeather(); }}
                    style={{ flex: 1, padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
                  <button onClick={fetchWeather} disabled={wxLoading || !lbCity.trim()} style={{ ...btnBase, padding: "6px 10px", background: "#f5f3ef", color: "#555", fontSize: 12, border: "none", flexShrink: 0 }}>
                    {wxLoading ? "\u2026" : "\u26C5"}
                  </button>
                </div>
                {lbWeather?.error && <div style={{ fontSize: 11, color: "#e05555", marginTop: 4 }}>{lbWeather.error}</div>}
                {lbWeather?.days && lbWeather.days.length > 0 && (
                  <div style={{ marginTop: 6, maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                    {lbWeather.days.filter(d => {
                      if (!lookbook.dateStart && !lookbook.dateEnd) return true;
                      return d.date >= (lookbook.dateStart || "0") && d.date <= (lookbook.dateEnd || "9999");
                    }).slice(0, 14).map(d => (
                      <div key={d.date} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 6px", borderRadius: 7, background: "#faf9f6" }}>
                        <span style={{ fontSize: 13 }}>{wxIcon(d.code)}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#555", flex: 1 }}>{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span style={{ fontSize: 11, color: "#1a1a1a", fontWeight: 700 }}>{d.high}\u00B0</span>
                        <span style={{ fontSize: 10, color: "#bbb" }}>{d.low}\u00B0</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Hotel */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Hotel</div>
                <input value={tripDetails.hotel || ""} onChange={e => setTripDetails(d => ({ ...d, hotel: e.target.value }))} onBlur={() => saveTripDetails({})}
                  placeholder="Hotel name\u2026"
                  style={{ width: "100%", padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              </div>
              {/* Activities */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Activities</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 5 }}>
                  {(tripDetails.activities || []).map((act, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "#faf9f6", borderRadius: 7, border: "1px solid #e8e4dc" }}>
                      <span style={{ flex: 1, fontSize: 12, color: "#444", fontWeight: 600 }}>{act}</span>
                      <button onClick={() => { const next = (tripDetails.activities || []).filter((_, j) => j !== i); saveTripDetails({ activities: next }); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
                        onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <input value={newActivity} onChange={e => setNewActivity(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newActivity.trim()) { saveTripDetails({ activities: [...(tripDetails.activities || []), newActivity.trim()] }); setNewActivity(""); } }}
                    placeholder="Add activity\u2026"
                    style={{ flex: 1, padding: "5px 8px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
                  <button onClick={() => { if (newActivity.trim()) { saveTripDetails({ activities: [...(tripDetails.activities || []), newActivity.trim()] }); setNewActivity(""); } }}
                    style={{ padding: "5px 10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>+</button>
                </div>
              </div>
              {/* Other notes */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Other Notes</div>
                <textarea value={tripDetails.notes || ""} onChange={e => setTripDetails(d => ({ ...d, notes: e.target.value }))} onBlur={() => saveTripDetails({})}
                  placeholder="Reservations, dress codes, reminders\u2026"
                  style={{ width: "100%", padding: "6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", resize: "vertical", minHeight: 56, boxSizing: "border-box" }} />
              </div>
            </div>
          )}

          {/* ── NOTES ── */}
          <button onClick={() => toggleAccordion("notes")} style={{ ...acHdrStyle }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Notes</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" style={{ transform: openAccordions.notes ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {openAccordions.notes && (
            <div style={{ padding: "12px 16px 14px" }}>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => save()}
                placeholder="Add notes\u2026"
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" }} />
            </div>
          )}

          {/* ── LOOKS ── */}
          <button onClick={() => toggleAccordion("looks")} style={{ ...acHdrStyle }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Looks</span>
              {(looks.length + plannedSlots.length) > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#1a1a1a", borderRadius: 20, padding: "1px 7px" }}>{looks.length}/{looks.length + plannedSlots.length}</span>
              )}
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" style={{ transform: openAccordions.looks ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {openAccordions.looks && (
            <div style={{ padding: "8px 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Packing list toggle */}
              {looks.length > 0 && (
                <>
                  <button onClick={() => setShowPackList(p => !p)} style={{ width: "100%", padding: "6px 10px", background: showPackList ? "#f0faf4" : "#f5f3ef", border: showPackList ? "1.5px solid #b6e8c8" : "none", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 700, color: showPackList ? "#2d6a3f" : "#666", fontFamily: "'DM Sans', sans-serif", textAlign: "left", marginBottom: 2 }}>
                    <SvgLuggage size={12} color="currentColor" style={{ marginRight: 5 }} />Packing List ({packItems.length})
                  </button>
                  {showPackList && (
                    <div style={{ marginBottom: 6, background: "#faf9f6", borderRadius: 9, padding: "8px 10px", maxHeight: 200, overflowY: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa" }}>{packItems.filter(i => checkedPack[i.id]).length} / {packItems.length} packed</div>
                        <button onClick={() => setCheckedPack({})} style={{ fontSize: 10, fontWeight: 700, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Reset</button>
                      </div>
                      <div style={{ height: 3, borderRadius: 3, background: "#e8e4dc", marginBottom: 7, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "#2d6a3f", width: (packItems.length > 0 ? (packItems.filter(i => checkedPack[i.id]).length / packItems.length * 100) : 0) + "%", transition: "width 0.3s" }} />
                      </div>
                      {packItems.map(item => (
                        <div key={item.id} onClick={() => setCheckedPack(c => ({ ...c, [item.id]: !c[item.id] }))} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: checkedPack[item.id] ? 0.45 : 1, padding: "3px 0" }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, border: "2px solid", borderColor: checkedPack[item.id] ? "#2d6a3f" : "#ccc", background: checkedPack[item.id] ? "#2d6a3f" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {checkedPack[item.id] && <SvgCheck size={8} color="#fff" />}
                          </div>
                          <div style={{ fontSize: 11, color: "#444", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textDecoration: checkedPack[item.id] ? "line-through" : "none" }}>{item.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Real looks (draggable) */}
              {looks.map((look, i) => {
                const meta = lookMeta[look.id] || {};
                const isDraggingOver = dragOver2 === i;
                return (
                  <div key={look.id}
                    draggable onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)} onDragEnd={handleDrop} onDragOver={e => e.preventDefault()}
                    onClick={() => { setIdx(i); setView("editorial"); }}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", background: idx === i ? "#f0faf4" : isDraggingOver ? "#f5f3ef" : "#fafaf8", borderRadius: 9, border: idx === i ? "1.5px solid #3aaa6e" : isDraggingOver ? "1.5px dashed #888" : "1.5px solid #e8e4dc", cursor: "grab", transition: "all 0.12s" }}>
                    <span style={{ color: "#ccc", fontSize: 11, flexShrink: 0 }}>\u2630</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{look.name || ("Look " + (i + 1))}</div>
                      {(meta.day || meta.occasion) && <div style={{ fontSize: 9, color: "#aaa", marginTop: 1 }}>{[meta.day, meta.occasion].filter(Boolean).join(" \u00B7 ")}</div>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeLook(look.id); }}
                      style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", padding: "0 2px", flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
                      onMouseLeave={e => e.currentTarget.style.color = "#ddd"}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                );
              })}

              {/* Planned slot rows */}
              {plannedSlots.map((slot, si) => {
                const slotDateLabel = slot.date ? new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
                const slotWxRow = slot.date ? getWxForDate(slot.date) : null;
                return (
                  <div key={slot.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", background: "#faf9f6", borderRadius: 9, border: "1.5px dashed #d0cbc3" }}>
                    <span style={{ color: "#d0cbc3", fontSize: 10, flexShrink: 0 }}>&#9633;</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: slot.name ? "#888" : "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.name || "Empty slot"}</div>
                      <div style={{ fontSize: 9, color: "#bbb", marginTop: 1, display: "flex", gap: 6 }}>
                        {slotDateLabel && <span>{slotDateLabel}</span>}
                        {slotWxRow && <span>{wxIcon(slotWxRow.code)} {slotWxRow.high}\u00B0</span>}
                      </div>
                    </div>
                    <button onClick={() => { const next = plannedSlots.filter((_, j) => j !== si); setPlannedSlots(next); save({ plannedSlots: next }); }}
                      style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", padding: "0 2px", flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#e05555"}
                      onMouseLeave={e => e.currentTarget.style.color = "#ddd"}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                );
              })}

              {/* Action buttons */}
              <button onClick={() => setShowAddLooks(true)} style={{ width: "100%", padding: "7px", background: "#f5f3ef", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>+ Add Outfit</button>
              <button onClick={() => { const next = [...plannedSlots, { id: Date.now() + "_" + Math.random().toString(36).slice(2), name: "", date: "" }]; setPlannedSlots(next); save({ plannedSlots: next }); }}
                style={{ width: "100%", padding: "7px", background: "transparent", border: "1.5px dashed #d0cbc3", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>+ Plan a Slot</button>
            </div>
          )}

        </div>
      </div>

      {/* ── ADD LOOKS MODAL ── */}
      {showAddLooks && (() => {
        const allTags = [...new Set(outfits.flatMap(o => o.tags || []))].sort();
        const filtered = outfits.filter(o => {
          if (lookIds.includes(o.id)) return false;
          if (outfitSearch && !o.name?.toLowerCase().includes(outfitSearch.toLowerCase())) return false;
          if (outfitTagFilter && !(o.tags || []).includes(outfitTagFilter)) return false;
          return true;
        });
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowAddLooks(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "min(680px, 92vw)", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1.5px solid #f0ece4", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 10 }}>Add Looks</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={outfitSearch} onChange={e => setOutfitSearch(e.target.value)}
                      placeholder="Search outfits…" autoFocus
                      style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none" }} />
                    <select value={outfitTagFilter} onChange={e => setOutfitTagFilter(e.target.value)}
                      style={{ padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: "#fff", outline: "none", minWidth: 120 }}>
                      <option value="">All tags</option>
                      {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => setShowAddLooks(false)} style={{ background: "#f5f2ed", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ overflowY: "auto", padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {filtered.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#bbb", fontSize: 13, fontWeight: 600 }}>
                    {outfits.length === lookIds.length ? "All outfits already added" : "No outfits match"}
                  </div>
                ) : filtered.map(o => (
                  <div key={o.id} onClick={() => addLook(o.id)} style={{ borderRadius: 14, border: "1.5px solid #e8e4dc", overflow: "hidden", cursor: "pointer", background: "#fff" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e4dc"}>
                    <div style={{ aspectRatio: "3/4", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {o.previewImage ? <img src={o.previewImage} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <HangerIcon size={28} color="#ddd" />}
                    </div>
                    <div style={{ padding: "8px 10px 10px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                      {(o.tags || []).length > 0 && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.tags.slice(0, 3).join(", ")}</div>}
                      <div style={{ marginTop: 6, padding: "4px 0", textAlign: "center", background: "#1a1a1a", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#fff" }}>+ Add</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── LINK MOODBOARD MODAL ── */}
      {showLinkModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowLinkModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "min(520px, 92vw)", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1.5px solid #f0ece4", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", flex: 1 }}>Link Moodboard</div>
              {linkedMoodboardId && (
                <button onClick={() => { setLinkedMoodboardId(null); setShowLinkModal(false); }} style={{ padding: "5px 12px", background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans',sans-serif" }}>
                  Unlink
                </button>
              )}
              <button onClick={() => setShowLinkModal(false)} style={{ background: "#f5f2ed", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {moodboards.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#bbb", fontSize: 13 }}>
                  No moodboards yet — create one in the Moodboard tab first.
                </div>
              ) : moodboards.map((mb, i) => {
                const isLinked = linkedMoodboardId === mb.id;
                return (
                  <div key={mb.id} onClick={() => { setLinkedMoodboardId(mb.id); setView("moodboard"); setShowLinkModal(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: "1.5px solid", cursor: "pointer",
                      borderColor: isLinked ? "#3aaa6e" : "#e0dbd2", background: isLinked ? "#f0faf4" : "#faf9f6" }}
                    onMouseEnter={e => { if (!isLinked) e.currentTarget.style.borderColor = "#1a1a1a"; }}
                    onMouseLeave={e => { if (!isLinked) e.currentTarget.style.borderColor = "#e0dbd2"; }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: mb.bg || "#f5f2ed", border: "1px solid #e8e4dc", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {(mb.items || []).filter(it => it.src).slice(0, 1).map(it => (
                        <img key={it.id} src={it.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ))}
                      {!(mb.items || []).some(it => it.src) && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{mb.name || "Board " + (i + 1)}</div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{(mb.items || []).length} items</div>
                    </div>
                    {isLinked
                      ? <div style={{ fontSize: 11, fontWeight: 700, color: "#2d6a3f", background: "#d4f5e2", padding: "3px 10px", borderRadius: 20 }}>Linked ✓</div>
                      : <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa" }}>Select →</div>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// BoardSizer — measures available space and renders a 4:5 white board
function BoardSizer({ boardRef: _ignored, children }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const availW = el.offsetWidth - 48;
      const availH = el.offsetHeight - 48;
      // 4:5 ratio
      let w = Math.min(availW, availH * 0.8);
      let h = w * 1.25;
      if (h > availH) { h = availH; w = h * 0.8; }
      setDims({ w: Math.floor(w), h: Math.floor(h) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {dims.w > 0 && children(dims.w, dims.h)}
    </div>
  );
}

// ── Outfit Builder ───────────────────────────────────────────────────────────
function OutfitBuilder({ itemsDb, wishlistDb, onSave, onClose, initial, seedItem, capsules, lookbooks, onSaveToLookbook }) {
  const [name, setName] = useState(initial?.name || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [tags, setTags] = useState(initial?.tags || []);
  const [seasons, setSeasons] = useState(initial?.seasons || []);
  const [layers, setLayers] = useState(() => {
    const base = initial?.layers || initial?.itemIds || [];
    if (seedItem?.id && !base.includes(seedItem.id)) return [...base, seedItem.id];
    return base;
  });
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [panelTab, setPanelTab] = useState("home");
  const [filterCat, setFilterCat] = useState("All");
  const [filterColor, setFilterColor] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [positions, setPositions] = useState(() => {
    const pos = {};
    (initial?.layers || initial?.itemIds || []).forEach((id, i) => {
      pos[id] = initial?.positions?.[id] || { x: 80 + (i % 3) * 160, y: 60 + Math.floor(i / 3) * 180, w: 140, h: 160 };
    });
    if (seedItem?.id && !pos[seedItem.id]) {
      pos[seedItem.id] = { x: 80, y: 60, w: 160, h: 200 };
    }
    return pos;
  });
  const [itemPopup, setItemPopup] = useState(null);
  const [capsulePickerOpen, setCapsulePickerOpen] = useState(false);
  const OUTFIT_DRAFTS_KEY = "wardrobe_outfit_drafts_v1";
  const loadOutfitDrafts = () => { try { return JSON.parse(localStorage.getItem("wardrobe_outfit_drafts_v1") || "[]"); } catch { return []; } };
  const [outfitDrafts, setOutfitDrafts] = useState(loadOutfitDrafts);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lockedIds, setLockedIds] = useState(new Set());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [flipped, setFlipped] = useState({});
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveLbModal, setSaveLbModal] = useState(false);
  const [savedOutfitData, setSavedOutfitData] = useState(null);
  const [ghostDrag, setGhostDrag] = useState(null);
  const history = useRef([]);
  const historyIdx = useRef(-1);
  const dragging = useRef(null);
  const resizing = useRef(null);
  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const panelDragRef = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { activeId, layers, positions, lockedIds, selectedIds };

  const pushHistory = (newLayers, newPositions) => {
    const snap = { layers: newLayers, positions: newPositions };
    const next = history.current.slice(0, historyIdx.current + 1);
    next.push(snap);
    history.current = next;
    historyIdx.current = next.length - 1;
    setCanUndo(historyIdx.current > 0);
    setCanRedo(false);
  };
  const undo = () => {
    if (historyIdx.current <= 0) return;
    historyIdx.current--;
    const snap = history.current[historyIdx.current];
    setLayers(snap.layers); setPositions(snap.positions);
    setCanUndo(historyIdx.current > 0); setCanRedo(true);
  };
  const redo = () => {
    if (historyIdx.current >= history.current.length - 1) return;
    historyIdx.current++;
    const snap = history.current[historyIdx.current];
    setLayers(snap.layers); setPositions(snap.positions);
    setCanUndo(true); setCanRedo(historyIdx.current < history.current.length - 1);
  };

  // Auto-save draft
  useEffect(() => {
    if (!name && layers.length === 0) return;
    try { localStorage.setItem("wardrobe_builder_draft", JSON.stringify({ name, notes, tags, seasons, layers, positions, savedAt: Date.now() })); } catch(e) {}
  }, [name, notes, tags, seasons, layers, positions]);

  // Restore draft on mount if no initial
  useEffect(() => {
    if (initial) return;
    try {
      const raw = localStorage.getItem("wardrobe_builder_draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.name && (Date.now() - d.savedAt) < 7 * 24 * 60 * 60 * 1000) {
        setName(d.name); setNotes(d.notes || ""); setTags(d.tags || []);
        setSeasons(d.seasons || []); setLayers(d.layers || []); setPositions(d.positions || {});
      }
    } catch(e) {}
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { if (showShortcuts) { setShowShortcuts(false); return; } onClose(); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && !e.target.matches("input,textarea,select")) {
        const { activeId: aid, layers: ls, positions: pos, lockedIds: locked } = stateRef.current;
        if (!aid || locked.has(aid)) return;
        const newLayers = ls.filter(x => x !== aid);
        const newPos = { ...pos }; delete newPos[aid];
        setLayers(newLayers); setPositions(newPos); pushHistory(newLayers, newPos); setActiveId(null); setSelectedIds(new Set());
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, showShortcuts]);

  const activeDb = panelTab === "wishlist" ? wishlistDb : itemsDb;
  const allItems = [...itemsDb.rows, ...wishlistDb.rows];
  const activeFilterCount = (filterCat !== "All" ? 1 : 0) + (filterColor ? 1 : 0) + (filterSeason ? 1 : 0);

  const [activeCapsuleId, setActiveCapsuleId] = useState(null);
  const activeCapsule = (capsules || []).find(c => c.id === activeCapsuleId) || null;

  const panelItems = (() => {
    if (panelTab === "capsule") {
      if (!activeCapsule) return [];
      const ids = new Set(activeCapsule.itemIds || []);
      return itemsDb.rows.filter(i => ids.has(i.id)).filter(i => {
        const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.brand || "").toLowerCase().includes(search.toLowerCase());
        return matchSearch;
      });
    }
    return activeDb.rows.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.brand || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "All" || i.category === filterCat;
      const matchColor = !filterColor || i.color === filterColor;
      const matchSeason = !filterSeason || i.season === filterSeason;
      return matchSearch && matchCat && matchColor && matchSeason;
    });
  })();

  const toggleItem = (id) => {
    if (layers.includes(id)) {
      if (lockedIds.has(id)) return; // can't remove locked items
      const newLayers = layers.filter(x => x !== id);
      const newPos = { ...positions }; delete newPos[id];
      setLayers(newLayers); setPositions(newPos);
      pushHistory(newLayers, newPos);
      if (activeId === id) setActiveId(null);
    } else {
      const board = boardRef.current;
      const cw = board?.offsetWidth || 400;
      const ch = board?.offsetHeight || 500;
      const newPos = { ...positions, [id]: { x: 40 + Math.random() * (cw - 200), y: 30 + Math.random() * (ch - 200), w: 140, h: 160 } };
      const newLayers = [...layers, id];
      setLayers(newLayers); setPositions(newPos);
      pushHistory(newLayers, newPos);
      setActiveId(id);
    }
  };

  const toggleLock = (id) => setLockedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const flipItem = (id) => setFlipped(f => ({ ...f, [id]: !f[id] }));

  const autoArrange = () => {
    const board = boardRef.current;
    if (!board || layers.length === 0) return;
    const bw = board.offsetWidth, bh = board.offsetHeight;
    // Sort by clothing category order: tops first, then bottoms, then shoes, then accessories
    const CAT_ORDER = ["Tops","Knits","Sweaters","Dresses","Outerwear","Trousers","Denim","Shorts + Skirts","Shoes","Bags","Accessories","Jewelry","Activewear","Swim","Intimates","Loungewear","Sleepwear","Socks + Tights"];
    const sorted = [...layers].sort((a, b) => {
      const ia = allItems.find(i => i.id === a); const ib = allItems.find(i => i.id === b);
      const oa = CAT_ORDER.indexOf(ia?.category || ""); const ob = CAT_ORDER.indexOf(ib?.category || "");
      return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob);
    });
    const count = sorted.length;
    const cols = count <= 2 ? count : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    const itemW = Math.min(160, Math.floor((bw - 40) / cols));
    const itemH = Math.round(itemW * 1.2);
    const padX = Math.floor((bw - cols * itemW) / (cols + 1));
    const padY = Math.floor((bh - rows * itemH) / (rows + 1));
    const newPos = {};
    sorted.forEach((id, idx) => {
      const col = idx % cols, row = Math.floor(idx / cols);
      newPos[id] = { x: padX + col * (itemW + padX), y: padY + row * (itemH + padY), w: itemW, h: itemH };
    });
    setPositions(p => ({ ...p, ...newPos }));
    setLayers(sorted);
    pushHistory(sorted, { ...positions, ...newPos });
  };

  const moveLayerUp = (id) => setLayers(ls => { const i = ls.indexOf(id); if (i === ls.length - 1) return ls; const n = [...ls]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; pushHistory(n, positions); return n; });
  const moveLayerDown = (id) => setLayers(ls => { const i = ls.indexOf(id); if (i === 0) return ls; const n = [...ls]; [n[i], n[i - 1]] = [n[i - 1], n[i]]; pushHistory(n, positions); return n; });
  const bringToFront = (id) => setLayers(ls => [...ls.filter(x => x !== id), id]);

  const onMouseDown = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (e.shiftKey) {
      setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
      setActiveId(id); return;
    }
    const isInSelection = stateRef.current.selectedIds ? stateRef.current.selectedIds.has(id) : false;
    if (!isInSelection) setSelectedIds(new Set());
    setActiveId(id);
    if (lockedIds.has(id)) return;
    bringToFront(id);
    const board = boardRef.current;
    const rect = board.getBoundingClientRect();
    const curPos = stateRef.current.positions;
    const startMouseX = e.clientX - rect.left;
    const startMouseY = e.clientY - rect.top;
    // Capture start positions for all items in selection (or just this one)
    const { selectedIds: sel } = stateRef.current;
    const idsToMove = (sel && sel.size > 1 && sel.has(id)) ? Array.from(sel) : [id];
    const startPositions = {};
    idsToMove.forEach(mid => { if (curPos[mid]) startPositions[mid] = { ...curPos[mid] }; });
    dragging.current = { id, startMouseX, startMouseY, idsToMove, startPositions };
    const onMove = (ev) => {
      if (!dragging.current) return;
      const r = board.getBoundingClientRect();
      const dx = ev.clientX - r.left - dragging.current.startMouseX;
      const dy = ev.clientY - r.top - dragging.current.startMouseY;
      setPositions(p => {
        const np = { ...p };
        dragging.current.idsToMove.forEach(mid => {
          if (dragging.current.startPositions[mid]) np[mid] = { ...np[mid], x: dragging.current.startPositions[mid].x + dx, y: dragging.current.startPositions[mid].y + dy };
        });
        return np;
      });
    };
    const onUp = () => {
      if (dragging.current) pushHistory(stateRef.current.layers, stateRef.current.positions);
      dragging.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onResizeMouseDown = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    const { startX, startY, startW, startH } = { startX: e.clientX, startY: e.clientY, startW: positions[id].w, startH: positions[id].h };
    resizing.current = { id, startX, startY, startW, startH };
    const onMove = (ev) => {
      if (!resizing.current) return;
      const r = resizing.current;
      setPositions(p => ({ ...p, [r.id]: { ...p[r.id], w: Math.max(60, r.startW + ev.clientX - r.startX), h: Math.max(60, r.startH + ev.clientY - r.startY) } }));
    };
    const onUp = () => { resizing.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handlePopupSave = async (form) => {
    if (itemPopup?.mode === "add") await activeDb.add({ ...form, id: uid() });
    else if (itemPopup?.mode === "edit") await activeDb.update({ ...form, id: itemPopup.item.id });
    setItemPopup(null);
  };

  const saveOutfitDraft = () => {
    const draft = {
      _draftId: initial?._draftId || ("od_" + Date.now()),
      _savedAt: Date.now(),
      name: name || "Untitled Look",
      notes, tags, seasons, layers, positions
    };
    const existing = loadOutfitDrafts().filter(d => d._draftId !== draft._draftId);
    const updated = [draft, ...existing].slice(0, 20);
    localStorage.setItem("wardrobe_outfit_drafts_v1", JSON.stringify(updated));
    setOutfitDrafts(updated);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const loadOutfitDraft = (draft) => {
    setName(draft.name || "");
    setNotes(draft.notes || "");
    setTags(draft.tags || []);
    setSeasons(draft.seasons || []);
    setLayers(draft.layers || []);
    setPositions(draft.positions || {});
    setShowDraftPanel(false);
  };

  const deleteOutfitDraft = (draftId) => {
    const updated = loadOutfitDrafts().filter(d => d._draftId !== draftId);
    localStorage.setItem("wardrobe_outfit_drafts_v1", JSON.stringify(updated));
    setOutfitDrafts(updated);
  };

  const loadCapsule = (capsule) => {
    const ids = capsule.itemIds || [];
    const board = boardRef.current;
    const cw = board?.offsetWidth || 400;
    const ch = board?.offsetHeight || 500;
    const newPos = { ...positions };
    const newLayers = [...layers];
    ids.forEach((id, i) => {
      if (!newLayers.includes(id)) {
        newLayers.push(id);
        newPos[id] = { x: 30 + (i % 4) * 140, y: 30 + Math.floor(i / 4) * 160, w: 120, h: 140 };
      }
    });
    setLayers(newLayers);
    setPositions(newPos);
    pushHistory(newLayers, newPos);
    setCapsulePickerOpen(false);
  };


  const capturePreview = () => {
    return new Promise((resolve) => {
      const board = boardRef.current;
      if (!board) return resolve(null);
      const { offsetWidth: W, offsetHeight: H } = board;
      const canvas = document.createElement("canvas");
      canvas.width = W * 2; canvas.height = H * 2; // 2x for retina
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);

      const itemsToDraw = layers.map(id => {
        const item = allItems.find(i => i.id === id);
        const pos = positions[id];
        return item && pos ? { item, pos } : null;
      }).filter(Boolean);

      if (itemsToDraw.length === 0) return resolve(canvas.toDataURL("image/jpeg", 0.85));

      let loaded = 0;
      const imgs = [];
      itemsToDraw.forEach(({ item, pos }, idx) => {
        if (!item.image) { loaded++; if (loaded === itemsToDraw.length) finish(); return; }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { imgs[idx] = { img, pos, id: item.id }; loaded++; if (loaded === itemsToDraw.length) finish(); };
        img.onerror = () => { loaded++; if (loaded === itemsToDraw.length) finish(); };
        img.src = item.image;
      });

      function finish() {
        imgs.forEach((entry, idx) => {
          if (!entry) return;
          const { img, pos, id } = entry;
          if (flipped[id]) {
            ctx.save(); ctx.translate(pos.x + pos.w, pos.y); ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, pos.w, pos.h); ctx.restore();
          } else {
            ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
          }
        });
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      }
    });
  };

  const handleSave = async (saveLookbook = false) => {
    if (!name || layers.length === 0) return;
    const previewImage = await capturePreview();
    try { localStorage.removeItem("wardrobe_builder_draft"); } catch(e) {}
    const data = { name, notes, tags, seasons, itemIds: layers, layers, positions, previewImage };
    if (saveLookbook && lookbooks && lookbooks.length > 0) {
      setSavedOutfitData(data); setSaveLbModal(true);
    } else {
      onSave(data);
    }
  };
  const handleSaveAndAddToLookbook = async (lookbookId) => {
    if (!savedOutfitData) return;
    await onSave(savedOutfitData);
    if (onSaveToLookbook && lookbookId) onSaveToLookbook(savedOutfitData, lookbookId);
    setSaveLbModal(false); setSavedOutfitData(null);
  };

  const onPanelItemMouseDown = (e, item) => {
    if (e.button !== 0) return;
    e.preventDefault();
    panelDragRef.current = { id: item.id, item, startX: e.clientX, startY: e.clientY, moved: false };
    const onMove = (ev) => {
      if (!panelDragRef.current) return;
      if (!panelDragRef.current.moved && (Math.abs(ev.clientX - panelDragRef.current.startX) > 5 || Math.abs(ev.clientY - panelDragRef.current.startY) > 5)) {
        panelDragRef.current.moved = true;
      }
      if (panelDragRef.current.moved) setGhostDrag({ id: item.id, item, x: ev.clientX, y: ev.clientY });
    };
    const onUp = (ev) => {
      window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
      if (panelDragRef.current?.moved) {
        const board = boardRef.current;
        if (board) {
          const rect = board.getBoundingClientRect();
          if (ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
            const id = panelDragRef.current.id;
            const { layers: ls, positions: pos } = stateRef.current;
            if (!ls.includes(id)) {
              const newPos = { ...pos, [id]: { x: Math.max(0, ev.clientX - rect.left - 70), y: Math.max(0, ev.clientY - rect.top - 80), w: 140, h: 160 } };
              const newLayers = [...ls, id];
              setLayers(newLayers); setPositions(newPos); pushHistory(newLayers, newPos); setActiveId(id);
            }
          }
        }
      } else if (panelDragRef.current) {
        toggleItem(panelDragRef.current.id);
      }
      panelDragRef.current = null; setGhostDrag(null);
    };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const btnBase = { border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 10, transition: "all 0.15s" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 };
  const fieldStyle = { width: "100%", padding: "8px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a1a", background: "#fff" };

  return (
    <div className="builder-overlay">
      <style>{globalStyles}</style>
      <div className="builder-topbar">
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#888", lineHeight: 1, padding: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{name || "Build a Look"}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setShowDraftPanel(p => !p)} title="Drafts" style={{ ...btnBase, padding: "7px 10px", fontSize: 12, background: showDraftPanel ? "#f0f0f0" : "#f5f3ef", color: "#555", position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
            <SvgFolder size={14} color="#888" />
            {outfitDrafts.length > 0 && <span style={{ background: "#1a1a1a", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{outfitDrafts.length}</span>}
          </button>
          <button onClick={saveOutfitDraft} style={{ ...btnBase, padding: "7px 14px", fontSize: 12, background: draftSaved ? "#f0faf4" : "#f5f3ef", color: draftSaved ? "#2d6a3f" : "#555" }}>
            {draftSaved ? "✓ Saved" : "Save Draft"}
          </button>
          {lookbooks && lookbooks.length > 0 && (
            <button onClick={() => handleSave(true)} disabled={!name || layers.length === 0} style={{
              ...btnBase, padding: "8px 16px", fontSize: 13,
              background: (!name || layers.length === 0) ? "#ccc" : "#f5f2ed",
              color: (!name || layers.length === 0) ? "#fff" : "#555", cursor: (!name || layers.length === 0) ? "not-allowed" : "pointer"
            }}>+ Lookbook</button>
          )}
          <button onClick={() => handleSave(false)} disabled={!name || layers.length === 0} style={{
            ...btnBase, padding: "8px 20px", fontSize: 13,
            background: (!name || layers.length === 0) ? "#ccc" : "#2d6a3f",
            color: "#fff", cursor: (!name || layers.length === 0) ? "not-allowed" : "pointer"
          }}>Save Look</button>
        </div>
      </div>

      <div className="builder-panels">
        {/* LEFT */}
        <div className="builder-left">
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Look Details
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Look Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Casual Sunday" style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Styling Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Type your notes here" style={{ ...fieldStyle, minHeight: 100, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Season</label>
            <div style={{ display: "flex", flexWrap: "nowrap", gap: 6 }}>
              {[{value:"Spring",label:"SP"},{value:"Summer",label:"SU"},{value:"Fall",label:"FA"},{value:"Winter",label:"WI"}].map(({value, label}) => (
                <button key={value} onClick={() => setSeasons(ss => ss.includes(value) ? ss.filter(x => x !== value) : [...ss, value])} style={{
                  ...btnBase, padding: "5px 10px", borderRadius: 16, fontSize: 12,
                  border: seasons.includes(value) ? "1.5px solid #2bafd4" : "1.5px solid #e8e4dc",
                  background: seasons.includes(value) ? "#f0fbff" : "#fafaf8",
                  color: seasons.includes(value) ? "#2bafd4" : "#aaa"
                }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Occasion</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {OCCASIONS.map(tag => {
                const oc = OCCASION_COLORS[tag] || { bg: "#f5f3ef", color: "#888" };
                const sel = tags.includes(tag);
                return (
                  <button key={tag} onClick={() => setTags(ts => ts.includes(tag) ? ts.filter(x => x !== tag) : [...ts, tag])} style={{
                    ...btnBase, padding: "5px 12px", borderRadius: 16, fontSize: 12,
                    border: sel ? `1.5px solid ${oc.color}` : "1.5px solid #e8e4dc",
                    background: sel ? oc.bg : "#fafaf8", color: sel ? oc.color : "#aaa"
                  }}>{tag}</button>
                );
              })}
            </div>
          </div>

          {/* Selected pieces preview */}
          {layers.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Pieces ({layers.length})</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {layers.map(id => {
                  const item = allItems.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} onClick={() => { setActiveId(id); }} title={item.name} style={{
                      width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: activeId === id ? "2px solid #2d6a3f" : "1.5px solid #e8e4dc",
                      background: "#fafaf8", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", transform: flipped[id] ? "scaleX(-1)" : "none" }} />
                        : <HangerIcon size={16} color="#ccc" />
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CANVAS — centered white 4:5 board */}
        <div className="builder-canvas" ref={canvasRef} onClick={() => setActiveId(null)}>
          <BoardSizer boardRef={boardRef}>
            {(boardW, boardH) => (
              <div
                ref={boardRef}
                className="outfit-board"
                style={{ width: boardW, height: boardH }}
                onClick={() => setActiveId(null)}
              >
                {layers.length === 0 && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ccc", pointerEvents: "none" }}>
                    <div style={{ marginBottom: 8 }}><SvgSparkle size={32} color="#ddd" /></div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Select items to build your look</div>
                  </div>
                )}
                {layers.map((id, zIndex) => {
                  const item = allItems.find(i => i.id === id);
                  if (!item || !positions[id]) return null;
                  const { x, y, w, h } = positions[id];
                  const isActive = activeId === id;
                  const isSelected = selectedIds.has(id);
                  const isTop = zIndex === layers.length - 1;
                  const isBottom = zIndex === 0;
                  const outlineColor = lockedIds.has(id) ? "#f0c040" : isSelected ? "#2bafd4" : "#2d6a3f";
                  const showOutline = isActive || isSelected;
                  return (
                    <div key={id} className="canvas-item" style={{ left: x, top: y, width: w, zIndex: zIndex + 1 }}
                      onMouseDown={e => onMouseDown(e, id)} onClick={e => e.stopPropagation()}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: w, height: h, objectFit: "contain", borderRadius: 4, display: "block", pointerEvents: "none", outline: showOutline ? `2px solid ${outlineColor}` : "none", outlineOffset: 2, transform: flipped[id] ? "scaleX(-1)" : "none" }} />
                          : <div style={{ width: w, height: h, background: "#f0ece4", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", outline: showOutline ? `2px solid ${outlineColor}` : "none" }}><HangerIcon size={32} color="#ccc" /></div>
                        }
                        {lockedIds.has(id) && <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: "2px 4px", pointerEvents: "none", display: "flex" }}><SvgLock size={12} color="#fff" /></div>}
                        {isActive && (
                          <div onMouseDown={e => onResizeMouseDown(e, id)} style={{
                            position: "absolute", bottom: -6, right: -6, width: 16, height: 16, borderRadius: "50%",
                            background: "#2d6a3f", border: "2px solid #fff", cursor: "nwse-resize", zIndex: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                          }} />
                        )}
                      </div>
                      {isActive && (
                        <div onClick={e => e.stopPropagation()} style={{
                          position: "absolute", top: -46, left: "50%", transform: "translateX(-50%)",
                          display: "flex", alignItems: "center", gap: 2,
                          background: "rgba(20,20,20,0.95)", borderRadius: 22, padding: "5px 8px",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap", zIndex: 9999,
                          backdropFilter: "blur(6px)"
                        }}>
                          {!lockedIds.has(id) && (<>
                            <button onClick={() => moveLayerUp(id)} disabled={isTop} title="Bring Forward" style={{ background: isTop ? "none" : "rgba(255,255,255,0.08)", border: "none", color: isTop ? "#555" : "#fff", cursor: isTop ? "default" : "pointer", padding: "4px 9px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 14, display: "flex", alignItems: "center", gap: 4 }}>
                              <SvgArrowUp size={10} color="currentColor" /> Fwd
                            </button>
                            <button onClick={() => moveLayerDown(id)} disabled={isBottom} title="Send Backward" style={{ background: isBottom ? "none" : "rgba(255,255,255,0.08)", border: "none", color: isBottom ? "#555" : "#fff", cursor: isBottom ? "default" : "pointer", padding: "4px 9px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 14, display: "flex", alignItems: "center", gap: 4 }}>
                              <SvgArrowDn size={10} color="currentColor" /> Back
                            </button>
                            <div style={{ width: 1, background: "#444", margin: "3px 2px", height: 16 }} />
                          </>)}
                          <button onClick={() => flipItem(id)} title="Flip horizontal" style={{ background: flipped[id] ? "rgba(43,175,212,0.15)" : "rgba(255,255,255,0.08)", border: "none", color: flipped[id] ? "#2bafd4" : "#ccc", cursor: "pointer", padding: "4px 9px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 14, display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><line x1="12" y1="20" x2="12" y2="4"/></svg>
                            Flip
                          </button>
                          <button onClick={() => toggleLock(id)} title={lockedIds.has(id) ? "Unlock" : "Lock"} style={{ background: lockedIds.has(id) ? "rgba(240,192,64,0.15)" : "rgba(255,255,255,0.08)", border: "none", color: lockedIds.has(id) ? "#f0c040" : "#aaa", cursor: "pointer", padding: "4px 9px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 14, display: "flex", alignItems: "center", gap: 4 }}>
                            {lockedIds.has(id) ? <SvgLock size={11} color="#f0c040" /> : <SvgUnlock size={11} color="#aaa" />}
                            {lockedIds.has(id) ? "Locked" : "Lock"}
                          </button>
                          {!lockedIds.has(id) && (<>
                            <div style={{ width: 1, background: "#444", margin: "3px 2px", height: 16 }} />
                            <button onClick={() => toggleItem(id)} title="Remove" style={{ background: "rgba(255,107,107,0.15)", border: "none", color: "#ff6b6b", cursor: "pointer", padding: "4px 9px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 14, display: "flex", alignItems: "center", gap: 4 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Remove
                            </button>
                          </>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </BoardSizer>
          {/* Canvas bottom toolbar */}
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, background: "rgba(26,26,26,0.88)", borderRadius: 20, padding: "5px 8px", boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 200, backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}>
            <button onClick={undo} disabled={!canUndo} title="Undo (⌘Z)" style={{ background: "none", border: "none", color: canUndo ? "#fff" : "#555", cursor: canUndo ? "pointer" : "default", padding: "4px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 12, display: "flex", alignItems: "center", gap: 5 }}>↩ Undo</button>
            <button onClick={redo} disabled={!canRedo} title="Redo (⌘Y)" style={{ background: "none", border: "none", color: canRedo ? "#fff" : "#555", cursor: canRedo ? "pointer" : "default", padding: "4px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 12, display: "flex", alignItems: "center", gap: 5 }}>↪ Redo</button>
            <div style={{ width: 1, background: "#444", margin: "4px 2px" }} />
            <button onClick={autoArrange} disabled={layers.length === 0} title="Auto-arrange" style={{ background: "none", border: "none", color: layers.length > 0 ? "#fff" : "#555", cursor: layers.length > 0 ? "pointer" : "default", padding: "4px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 12, display: "flex", alignItems: "center", gap: 5 }}>⊹ Arrange</button>
            <div style={{ width: 1, background: "#444", margin: "4px 2px" }} />
            <button onClick={() => setShowShortcuts(s => !s)} title="Keyboard shortcuts" style={{ background: showShortcuts ? "rgba(255,255,255,0.15)" : "none", border: "none", color: "#aaa", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 12 }}>?</button>
          </div>
          {showShortcuts && (
            <div style={{ position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.96)", borderRadius: 14, padding: "14px 18px", zIndex: 300, backdropFilter: "blur(8px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Keyboard Shortcuts</div>
              {[["Delete / Backspace","Remove selected item"],["⌘Z / Ctrl+Z","Undo"],["⌘Y / Ctrl+Y","Redo"],["Shift+Click","Multi-select items"],["Escape","Close builder"]].map(([key, desc]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 6, alignItems: "center" }}>
                  <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap" }}>{key}</span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="builder-right">
          <div style={{ padding: "10px 12px 8px", borderBottom: "1.5px solid #e8e4dc", flexShrink: 0 }}>
            {/* Tab toggle */}
            <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2, marginBottom: 8 }}>
              {[{ id: "closet", label: "Closet" }, { id: "wishlist", label: "Wishlist" }, { id: "capsule", label: "Capsule" }].map(t => (
                <button key={t.id} onClick={() => setPanelTab(t.id)} style={{
                  flex: 1, padding: "6px 0", border: "none", borderRadius: 8,
                  background: panelTab === t.id ? "#fff" : "transparent",
                  color: panelTab === t.id ? "#1a1a1a" : "#aaa",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  boxShadow: panelTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s"
                }}>{t.label}</button>
              ))}
            </div>

            {/* Capsule picker */}
            {panelTab === "capsule" && (
              <div style={{ marginBottom: 8 }}>
                {capsules && capsules.length > 0 ? (
                  <select value={activeCapsuleId || ""} onChange={e => setActiveCapsuleId(e.target.value || null)} style={{ ...fieldStyle, marginBottom: 0 }}>
                    <option value="">Choose a capsule…</option>
                    {capsules.map(c => <option key={c.id} value={c.id}>{c.name} ({(c.itemIds || []).length} items)</option>)}
                  </select>
                ) : (
                  <div style={{ fontSize: 12, color: "#bbb", padding: "8px 0", textAlign: "center" }}>No capsules yet</div>
                )}
              </div>
            )}

            {/* Search */}
            <input className="builder-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ marginBottom: 8 }} />

            {/* Filter toggle button — only for closet/wishlist */}
            {panelTab !== "capsule" && (<>
              <button onClick={() => setShowFilters(f => !f)} style={{
                ...btnBase, width: "100%", padding: "6px", marginBottom: showFilters ? 8 : 0,
                background: activeFilterCount > 0 ? "#f0faf4" : "#f5f3ef",
                color: activeFilterCount > 0 ? "#2d6a3f" : "#888", fontSize: 12
              }}>
                {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active` : "Filters"}
              </button>

              {showFilters && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...fieldStyle }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                  </select>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Color</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                      {COLORS.map(c => {
                        const active = filterColor === c;
                        const swatch = getColorSwatch(c);
                        return (
                          <button key={c} onClick={() => setFilterColor(active ? "" : c)} title={c} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: swatch, border: active ? "2.5px solid #1a1a1a" : "2px solid transparent", boxShadow: active ? "0 0 0 1px #1a1a1a" : "0 1px 3px rgba(0,0,0,0.12)", transition: "all 0.15s" }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)} style={{ ...fieldStyle }}>
                    <option value="">All Seasons</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {activeFilterCount > 0 && (
                    <button onClick={() => { setFilterCat("All"); setFilterColor(""); setFilterSeason(""); }} style={{ ...btnBase, padding: "5px", background: "#fef2f2", color: "#e05555", fontSize: 11 }}>Clear filters</button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => setItemPopup({ mode: "add" })} style={{ ...btnBase, flex: 1, padding: "7px 0", background: "#2d6a3f", color: "#fff", fontSize: 12 }}>+ Add</button>
                <button onClick={() => activeDb.refresh()} style={{ ...btnBase, flex: 1, padding: "7px 0", background: "#f5f2ed", color: "#555", fontSize: 12 }}>↻ Fetch</button>
              </div>
            </>)}
          </div>

          {/* Grid */}
          <div className="product-grid" style={{ flex: 1, alignContent: "start" }}>
            {activeDb.loading && <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 0", color: "#ccc", fontSize: 13 }}>Loading…</div>}
            {!activeDb.loading && panelItems.length === 0 && (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 0", color: "#ccc", fontSize: 13 }}>
                {search || activeFilterCount > 0 ? "No items match" : `Your ${panelTab} is empty`}
              </div>
            )}
            {panelItems.map(item => {
              const sel = layers.includes(item.id);
              return (
                <div key={item.id} style={{ position: "relative" }}>
                  <div className={`product-thumb${sel ? " selected" : ""}`} onMouseDown={e => onPanelItemMouseDown(e, item)} style={{ cursor: "grab" }}>
                    {item.image && <img src={item.image} alt={item.name} draggable={false} />}
                    {!item.image && <HangerIcon size={28} color="#ccc" />}
                    {sel && <div className="check"><SvgCheck size={10} color="#fff" /></div>}
                  </div>
                  <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setItemPopup({ mode: "edit", item }); }} title="Edit" style={{
                    position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer",
                    fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)", color: "#555", fontWeight: 700, zIndex: 2
                  }}>⋯</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Draft panel — slides in from left */}
      {showDraftPanel && (
        <div style={{ position: "absolute", top: 52, left: 0, bottom: 0, width: 300, background: "#fff", borderRight: "1.5px solid #e8e4dc", zIndex: 400, display: "flex", flexDirection: "column", boxShadow: "4px 0 20px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "1.5px solid #e8e4dc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a" }}>Saved Drafts</div>
            <button onClick={() => setShowDraftPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
            {outfitDrafts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No drafts yet</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Click Save Draft to save your progress</div>
              </div>
            ) : outfitDrafts.map(d => (
              <div key={d._draftId} style={{ padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e8e4dc", marginBottom: 8, background: "#faf9f6" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
                  {(d.layers || []).length} piece{(d.layers || []).length !== 1 ? "s" : ""} · {new Date(d._savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => loadOutfitDraft(d)} style={{ flex: 1, padding: "6px 0", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Load</button>
                  <button onClick={() => deleteOutfitDraft(d._draftId)} style={{ width: 32, height: 32, background: "#fef2f2", color: "#e05555", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item popup */}
      {itemPopup && (
        <div onClick={() => setItemPopup(null)} style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(3px)"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "24px 22px",
            width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <AddItemModal
              initial={itemPopup.mode === "edit" ? itemPopup.item : BLANK}
              editMode={itemPopup.mode === "edit" ? "manual" : null}
              onSave={handlePopupSave}
              onSaveWish={handlePopupSave}
              onCancel={() => setItemPopup(null)}
            />
          </div>
        </div>
      )}

      {/* Save to Lookbook modal */}
      {saveLbModal && (
        <div onClick={() => { setSaveLbModal(false); if (savedOutfitData) { onSave(savedOutfitData); setSavedOutfitData(null); } }} style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)"
        }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>Add to Lookbook</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>Choose a lookbook to add this look to:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {(lookbooks || []).map(lb => (
                <button key={lb.id} onClick={() => handleSaveAndAddToLookbook(lb.id)} style={{
                  padding: "12px 16px", background: "#fafaf8", border: "1.5px solid #e8e4dc", borderRadius: 12,
                  cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a"
                }}>{lb.name}</button>
              ))}
            </div>
            <button onClick={() => { setSaveLbModal(false); if (savedOutfitData) { onSave(savedOutfitData); setSavedOutfitData(null); } }} style={{
              marginTop: 14, width: "100%", padding: "10px", background: "#f5f2ed", border: "none", borderRadius: 10,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#555"
            }}>Save Without Lookbook</button>
          </div>
        </div>
      )}

      {/* Ghost drag overlay */}
      {ghostDrag && (
        <div style={{ position: "fixed", left: ghostDrag.x - 50, top: ghostDrag.y - 60, width: 100, height: 110, borderRadius: 12, background: "#fff", border: "2px solid #2d6a3f", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", overflow: "hidden", pointerEvents: "none", zIndex: 9999, opacity: 0.9 }}>
          {ghostDrag.item.image
            ? <img src={ghostDrag.item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <div style={{ width: "100%", height: "100%", background: "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center" }}><HangerIcon size={24} color="#ccc" /></div>
          }
        </div>
      )}
    </div>
  );
}




// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({ itemsDb, outfitsDb, lookbooksDb, wishlistDb, outfitCalendar, onViewItem, monthlyBudget, annualBudget }) {
  const items = itemsDb.rows.filter(i => !i.forSale);
  const outfits = outfitsDb.rows || [];
  const wishItems = (wishlistDb && wishlistDb.rows) || [];
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [statsView, setStatsView] = useState("profile");

  // ── helpers ──
  const parsePrice = (p) => parseFloat((p||"").replace(/[^0-9.]/g,"")) || 0;

  // ── shared data ──
  const totalValue = items.reduce((s,i) => s + parsePrice(i.price), 0);
  const totalWears = items.reduce((s,i) => s + (i.wornCount||0), 0);
  const unworn = items.filter(i => !(i.wornCount > 0));
  const mostWorn = [...items].sort((a,b)=>(b.wornCount||0)-(a.wornCount||0)).slice(0,6);
  const now2 = new Date();

  const COLOR_HEX = { Black:"#1a1a1a", White:"#f5f5f5", Grey:"#9a9a9a", Blue:"#4a7fd4", Navy:"#1e3a6e", Brown:"#7a5c3e", Tan:"#c4a882", Cream:"#f5eed8", Red:"#e05555", Pink:"#f0a0b0", Orange:"#e07e30", Yellow:"#f0c840", Green:"#4aaa6e", Purple:"#9a6fe0", Gold:"#d4a820", Silver:"#c0c0c0", Clear:"#e8f4ff" };
  const SEASON_COLORS = { Spring:"#e8f5ee", Summer:"#fff8ee", Fall:"#fff2e8", Winter:"#eef0ff", "All Season":"#f5f3ef", Holiday:"#fff0f5", Disney:"#fff0fb" };
  const SEASON_TEXT = { Spring:"#3aaa6e", Summer:"#a07000", Fall:"#c06020", Winter:"#4a5fe0", "All Season":"#888", Holiday:"#e05588", Disney:"#d040b0" };
  const OCCASION_COLORS_LOCAL = { WFH:{bg:"#f0f4ff",color:"#3a5fe0"}, Disney:{bg:"#fff0fb",color:"#d040b0"}, Universal:{bg:"#fff4ee",color:"#e07030"}, "Date Night":{bg:"#fff0f5",color:"#e05588"}, Travel:{bg:"#f0faff",color:"#2090c0"}, Sport:{bg:"#f0fff4",color:"#2aaa5e"}, Weekend:{bg:"#faf5ee",color:"#a07030"}, Occasion:{bg:"#f8f0ff",color:"#8040d0"} };

  const topColors = (() => { const c={}; items.forEach(i=>{const col=i.color||(i.colors&&i.colors[0]); if(col)c[col]=(c[col]||0)+1;}); return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8); })();
  const topCategories = (() => { const c={}; items.forEach(i=>{if(i.category&&i.category!=="All")c[i.category]=(c[i.category]||0)+1;}); return Object.entries(c).sort((a,b)=>b[1]-a[1]); })();
  const topBrands = (() => { const c={}; items.forEach(i=>{if(i.brand)c[i.brand]=(c[i.brand]||0)+1;}); return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8); })();
  const topSeasons = (() => { const c={}; items.forEach(i=>(i.seasons||[i.season]).filter(Boolean).forEach(s=>{c[s]=(c[s]||0)+1;})); return Object.entries(c).sort((a,b)=>b[1]-a[1]); })();
  const topOccasions = (() => { const c={}; items.forEach(i=>(i.occasions||[i.occasion]).filter(Boolean).forEach(o=>{c[o]=(c[o]||0)+1;})); return Object.entries(c).sort((a,b)=>b[1]-a[1]); })();

  // ── Style archetype ──
  const ARCHETYPES = {
    "WFH": { label: "The Professional", desc: "Your wardrobe leans work-ready — polished, functional, and put-together.", palette: ["#1a1a1a","#4a7fd4","#f5f5f5","#c4a882"] },
    "Date Night": { label: "The Romantic", desc: "You dress with intention. Your closet is built for moments that matter.", palette: ["#f0a0b0","#e05588","#1a1a1a","#f5eed8"] },
    "Weekend": { label: "The Casual Cool", desc: "Effortlessly stylish — your wardrobe is made for living life at ease.", palette: ["#c4a882","#7a5c3e","#f5f5f5","#4aaa6e"] },
    "Sport": { label: "The Athlete", desc: "Performance meets style. You keep it active and functional.", palette: ["#4aaa6e","#1a1a1a","#4a7fd4","#f5f5f5"] },
    "Disney": { label: "The Dreamer", desc: "Bold, fun, and full of personality — you dress for the magic.", palette: ["#d040b0","#f0c840","#4a7fd4","#e05555"] },
    "Travel": { label: "The Adventurer", desc: "Versatile and ready for anything. Your wardrobe goes where you go.", palette: ["#2090c0","#c4a882","#4aaa6e","#1a1a1a"] },
    "Event": { label: "The Elegante", desc: "You always dress for the occasion — polished and event-ready.", palette: ["#9a6fe0","#d4a820","#1a1a1a","#f5f5f5"] },
    "Universal": { label: "The Trendsetter", desc: "Pop culture meets personal style. You always stand out.", palette: ["#e07e30","#4a7fd4","#e05555","#1a1a1a"] },
  };
  const archetype = topOccasions[0] ? (ARCHETYPES[topOccasions[0][0]] || { label: "The Individualist", desc: "Your style defies categories — uniquely and completely you.", palette: ["#1a1a1a","#9a9a9a","#c4a882","#f5f5f5"] }) : null;

  // ── Archetype confidence + supporting evidence ──
  const archetypeEvidence = (() => {
    if (!archetype || !topOccasions[0]) return [];
    const topOcc = topOccasions[0][0];
    const topOccCount = topOccasions[0][1];
    const pct = Math.round((topOccCount / items.length) * 100);
    const evidence = [];
    evidence.push(`${pct}% of your closet is tagged for ${topOcc}`);
    if (topColors[0]) evidence.push(`Your dominant color is ${topColors[0][0]}`);
    if (topBrands[0]) evidence.push(`You lean toward ${topBrands[0][0]}`);
    if (mostWorn[0]?.wornCount > 0) evidence.push(`Your most-worn item: ${mostWorn[0].name} (${mostWorn[0].wornCount}× worn)`);
    return evidence.slice(0, 3);
  })();

  // ── Archetype quiz state ──
  const [archetypeQuiz, setArchetypeQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const QUIZ_QUESTIONS = [
    { id: "occasion", q: "Where do you wear most of your outfits?", opts: ["Work / WFH", "Weekends & casual", "Date nights & events", "Working out", "Travel & adventures", "Theme parks & fun outings"] },
    { id: "color", q: "What's your go-to color?", opts: ["Neutrals (black, white, grey)", "Earth tones (tan, brown, cream)", "Bold & bright", "Pastels & soft tones", "Navy & classic blues", "Whatever matches"] },
    { id: "vibe", q: "How would your friends describe your style?", opts: ["Put-together & polished", "Laid-back & effortless", "Romantic & feminine", "Sporty & functional", "Eclectic & fun", "Minimalist & clean"] },
  ];
  const QUIZ_MAP = {
    "Work / WFH": "WFH", "Weekends & casual": "Weekend", "Date nights & events": "Date Night",
    "Working out": "Sport", "Travel & adventures": "Travel", "Theme parks & fun outings": "Disney",
    "Put-together & polished": "WFH", "Laid-back & effortless": "Weekend", "Romantic & feminine": "Date Night",
    "Sporty & functional": "Sport", "Eclectic & fun": "Universal", "Minimalist & clean": "Weekend",
  };
  const computeQuizArchetype = (answers) => {
    const scores = {};
    Object.values(answers).forEach(v => { const key = QUIZ_MAP[v]; if (key) scores[key] = (scores[key]||0) + 1; });
    const top = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
    return top ? (ARCHETYPES[top[0]] || ARCHETYPES["Weekend"]) : ARCHETYPES["Weekend"];
  };
  const displayArchetype = quizResult || archetype;
  const cpwItems = items
    .filter(i => parsePrice(i.price) > 0 && (i.wornCount||0) > 0)
    .map(i => ({ ...i, cpw: parsePrice(i.price) / (i.wornCount||1) }))
    .sort((a,b) => a.cpw - b.cpw);
  const worstCpw = items
    .filter(i => parsePrice(i.price) > 0)
    .map(i => ({ ...i, cpw: parsePrice(i.price) / Math.max(i.wornCount||0, 1) }))
    .sort((a,b) => b.cpw - a.cpw)
    .slice(0, 5);

  // ── Outfit formula ──
  const outfitFormula = (() => {
    const pairCounts = {};
    outfits.forEach(o => {
      const pieces = o.items || o.pieces || [];
      const cats = [...new Set(pieces.map(p => {
        const item = items.find(i => i.id === (p.itemId||p.id||p));
        return item?.category;
      }).filter(Boolean))];
      for (let a = 0; a < cats.length; a++) {
        for (let b = a+1; b < cats.length; b++) {
          const key = [cats[a],cats[b]].sort().join(" + ");
          pairCounts[key] = (pairCounts[key]||0) + 1;
        }
      }
    });
    return Object.entries(pairCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  // ── Wardrobe gaps ──
  const ALL_CATS = ["Tops","Bottoms","Dresses","Outerwear","Shoes","Bags","Accessories","Activewear","Swimwear"];
  const catCounts = {};
  items.forEach(i => { if(i.category) catCounts[i.category] = (catCounts[i.category]||0)+1; });
  const gaps = ALL_CATS.filter(c => !catCounts[c] || catCounts[c] < 2).map(c => ({ cat: c, count: catCounts[c]||0 }));

  // ── Smart gap insights ──
  const gapInsights = (() => {
    const insights = [];
    const tops = catCounts["Tops"]||0, bottoms = catCounts["Bottoms"]||0, dresses = catCounts["Dresses"]||0;
    const shoes = catCounts["Shoes"]||0, outerwear = catCounts["Outerwear"]||0;
    const bags = catCounts["Bags"]||0, accessories = catCounts["Accessories"]||0;
    if (tops > 0 && bottoms > 0 && tops > bottoms * 2) insights.push({ type:"ratio", emoji:"👗", msg:`You have ${tops} tops but only ${bottoms} bottom${bottoms!==1?"s":""}. More bottoms = more outfit combinations.`, priority:"high" });
    if (bottoms > 0 && tops > 0 && bottoms > tops * 2) insights.push({ type:"ratio", emoji:"👖", msg:`You have ${bottoms} bottoms but only ${tops} top${tops!==1?"s":""}. More tops would unlock a lot more looks.`, priority:"high" });
    if ((tops > 3 || bottoms > 3) && shoes < 2) insights.push({ type:"gap", emoji:"👟", msg:`Only ${shoes} pair${shoes!==1?"s":""} of shoes for ${tops+bottoms} tops and bottoms. Shoes can completely change an outfit.`, priority:"medium" });
    if (tops + bottoms + dresses > 10 && outerwear < 2) insights.push({ type:"gap", emoji:"🧥", msg:`With ${tops+bottoms+dresses} clothes, adding more outerwear would extend your options into cooler weather.`, priority:"medium" });
    if (items.length > 15 && bags < 2) insights.push({ type:"gap", emoji:"👜", msg:`A versatile bag or two can tie together a lot of different looks.`, priority:"low" });
    if (items.length > 20 && accessories < 3) insights.push({ type:"gap", emoji:"✨", msg:`Accessories are the easiest way to remix what you already own — you have very few.`, priority:"low" });
    const unwornHighValue = items.filter(i => !(i.wornCount > 0) && parsePrice(i.price) > 50);
    if (unwornHighValue.length >= 3) insights.push({ type:"habit", emoji:"💸", msg:`${unwornHighValue.length} items worth $${unwornHighValue.reduce((s,i)=>s+parsePrice(i.price),0).toFixed(0)} total have never been worn. Worth revisiting before buying more.`, priority:"high" });
    return insights;
  })();

  // ── Wear frequency (calendar heatmap — last 12 weeks) ──
  const calData = (() => {
    const cal = outfitCalendar || {};
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const count = (cal[key]||[]).length;
      days.push({ key, date: d, count, month: d.getMonth(), day: d.getDay() });
    }
    return days;
  })();
  const maxCalCount = Math.max(...calData.map(d=>d.count), 1);

  // ── Weekly wear strip (last 7 days) ──
  const weekStrip = (() => {
    const cal = outfitCalendar || {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const outfitIds = cal[key] || [];
      days.push({ key, date: d, outfitIds, isToday: i === 0 });
    }
    return days;
  })();

  // ── Monthly spend ──
  const monthlyData = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const spent = items.filter(i => (i.purchaseDate||"").startsWith(key)).reduce((s,i) => s+parsePrice(i.price), 0);
    const added = items.filter(i => (i.purchaseDate||"").startsWith(key)).length;
    monthlyData.push({ key, label, spent, added });
  }
  const maxSpent = Math.max(...monthlyData.map(m => m.spent), 1);

  // ── Wishlist vs closet overlap ──
  const wishlistOverlap = wishItems.filter(wi => {
    const wCat = wi.category || "";
    const wName = (wi.name||"").toLowerCase().split(" ")[0];
    return items.some(ci => ci.category === wCat && (ci.name||"").toLowerCase().includes(wName));
  });
  const wishlistTotalValue = wishItems.reduce((s,i) => s+parsePrice(i.price), 0);

  // ── Closet health score ──
  const healthScore = (() => {
    if (items.length === 0) return 0;
    const wearScore = Math.min((totalWears / items.length) * 20, 40); // max 40
    const gapScore = Math.max(0, 30 - gaps.filter(g=>g.count===0).length * 5); // max 30
    const cpwScore = cpwItems.length > 0 ? Math.min(cpwItems.length / items.length * 60, 30) : 0; // max 30
    return Math.round(wearScore + gapScore + cpwScore);
  })();

  const healthLabel = healthScore >= 80 ? ["Thriving","#3aaa6e"] : healthScore >= 60 ? ["Healthy","#2090c0"] : healthScore >= 40 ? ["Growing","#a07000"] : ["Needs Love","#e05555"];
  const weekLogged = weekStrip.filter(d=>d.outfitIds.length>0).length;
  const topGapInsights = gapInsights.slice(0, 3);
  const neglectedValue = [...unworn]
    .filter(i => parsePrice(i.price) > 0)
    .sort((a,b)=>parsePrice(b.price)-parsePrice(a.price))
    .slice(0, 4);
  const inferredStyleWords = (() => {
    const words = [];
    const label = displayArchetype?.label || "";
    if (label.includes("Professional")) words.push("Polished", "Structured");
    if (label.includes("Romantic")) words.push("Intentional", "Feminine");
    if (label.includes("Casual")) words.push("Relaxed", "Effortless");
    if (label.includes("Athlete")) words.push("Functional", "Sporty");
    if (label.includes("Dreamer")) words.push("Playful", "Expressive");
    if (label.includes("Adventurer")) words.push("Versatile", "Practical");
    if (label.includes("Elegante")) words.push("Refined", "Elevated");
    if (label.includes("Trendsetter")) words.push("Bold", "Trend-led");
    if (topColors[0]) {
      if (["Black","White","Cream","Grey","Brown","Navy","Beige","Tan"].includes(topColors[0][0])) words.push("Neutral-led");
      else words.push("Color-aware");
    }
    if (topOccasions[0]) {
      if (["WFH","Event","Date Night"].includes(topOccasions[0][0])) words.push("Put-together");
      if (["Weekend","Travel"].includes(topOccasions[0][0])) words.push("Easygoing");
    }
    return [...new Set(words)].slice(0, 5);
  })();
  const styleThesis = (() => {
    const colorLead = topColors[0]?.[0]?.toLowerCase();
    const occasionLead = topOccasions[0]?.[0];
    const formulaLead = outfitFormula[0]?.[0];
    const opener = displayArchetype?.desc || "Your closet has a clear point of view.";
    const colorText = colorLead ? ` It leans ${colorLead} first` : "";
    const occasionText = occasionLead ? ` and is most built around ${occasionLead.toLowerCase()} dressing.` : ".";
    const formulaText = formulaLead ? ` Your signature formula is ${formulaLead.toLowerCase()}.` : "";
    return `${opener}${colorText}${occasionText}${formulaText}`;
  })();
  const styleSpectrum = (() => {
    const neutralCount = topColors.reduce((sum, [color, count]) => (
      ["Black","White","Cream","Grey","Brown","Navy","Beige","Tan"].includes(color) ? sum + count : sum
    ), 0);
    const neutralPct = items.length ? Math.round((neutralCount / items.length) * 100) : 0;
    const structuredOccasions = topOccasions
      .filter(([name]) => ["WFH","Event","Date Night"].includes(name))
      .reduce((sum, [, count]) => sum + count, 0);
    const relaxedOccasions = topOccasions
      .filter(([name]) => ["Weekend","Travel","Sport"].includes(name))
      .reduce((sum, [, count]) => sum + count, 0);
    return [
      { left: "Minimal", right: "Maximal", value: Math.max(20, Math.min(80, 100 - Math.min((topColors.length || 1) * 15, 80))) },
      { left: "Classic", right: "Trend-led", value: displayArchetype?.label === "The Trendsetter" ? 75 : displayArchetype?.label === "The Professional" ? 30 : 45 },
      { left: "Structured", right: "Relaxed", value: structuredOccasions + relaxedOccasions > 0 ? Math.round((relaxedOccasions / (structuredOccasions + relaxedOccasions)) * 100) : 50 },
      { left: "Neutral", right: "Colorful", value: 100 - neutralPct },
    ];
  })();
  const duplicateSignals = (() => {
    const signals = [];
    if (topColors[0]) {
      const [color, count] = topColors[0];
      const pct = Math.round((count / items.length) * 100);
      if (pct >= 40) signals.push({ label: `${color} dominates`, detail: `${pct}% of your closet sits in ${color.toLowerCase()}.` });
    }
    if (topCategories[0]) {
      const [cat, count] = topCategories[0];
      const pct = Math.round((count / items.length) * 100);
      if (pct >= 30) signals.push({ label: `${cat} are overrepresented`, detail: `${count} pieces, or ${pct}% of your closet.` });
    }
    if ((catCounts["Shoes"]||0) >= 5 && (catCounts["Bags"]||0) <= 1) {
      signals.push({ label: "Accessorizing is lopsided", detail: `You have ${catCounts["Shoes"]||0} pairs of shoes but only ${catCounts["Bags"]||0} bag${(catCounts["Bags"]||0) !== 1 ? "s" : ""}.` });
    }
    if (wishlistOverlap.length >= 3) {
      signals.push({ label: "Wishlist repeats what you own", detail: `${wishlistOverlap.length} wishlist pieces overlap with your current closet.` });
    }
    return signals.slice(0, 4);
  })();
  const nextAdditions = (() => {
    const recs = [];
    const primaryGap = gaps.find(g => g.count === 0) || gaps[0];
    if (primaryGap) recs.push({ label: "Practical gap", value: primaryGap.cat, note: primaryGap.count === 0 ? "You don't have this category yet." : `You only have ${primaryGap.count}.` });
    if ((catCounts["Accessories"]||0) < 3) recs.push({ label: "Styling piece", value: "Accessories", note: "Small add-ons will remix your closet fastest." });
    else if ((catCounts["Bags"]||0) < 2) recs.push({ label: "Styling piece", value: "Versatile bag", note: "A flexible bag will connect more looks." });
    else recs.push({ label: "Styling piece", value: "Layering piece", note: "A blazer, cardigan, or jacket will stretch outfit formulas." });
    if (displayArchetype?.label === "The Romantic") recs.push({ label: "Personality piece", value: "Statement evening piece", note: "Lean into the dressed-up side of your closet." });
    else if (displayArchetype?.label === "The Trendsetter") recs.push({ label: "Personality piece", value: "Conversation-starting accent", note: "One bold piece will keep the closet from feeling too basic." });
    else if (displayArchetype?.label === "The Athlete") recs.push({ label: "Personality piece", value: "Elevated off-duty piece", note: "Bridge activewear and everyday dressing." });
    else recs.push({ label: "Personality piece", value: "Joy piece", note: "Choose one item that feels more expressive than purely practical." });
    return recs;
  })();
  const spendingStats = [
    { label:"Closet Value", value:`$${totalValue.toFixed(0)}`, color:"#1a1a1a", bg:"#fafaf8" },
    { label:"Avg Item Price", value: items.filter(i=>parsePrice(i.price)>0).length>0?`$${(totalValue/items.filter(i=>parsePrice(i.price)>0).length).toFixed(0)}`:"—", color:"#2090c0", bg:"#f0f8ff" },
    { label:"Added This Month", value:items.filter(i=>(i.purchaseDate||"").startsWith(thisMonth)).length, color:"#3aaa6e", bg:"#f0faf4" },
  ];
  const descriptorWords = inferredStyleWords.slice(0, 3);
  const dominantSeason = topSeasons[0]?.[0] || null;
  const dominantOccasion = topOccasions[0]?.[0] || null;
  const signatureFormula = outfitFormula[0] || null;
  const recentAdds = [...items]
    .filter(i => i.purchaseDate)
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    .slice(0, 4);
  const styleDistinctions = [
    duplicateSignals[0] ? `${duplicateSignals[0].label}. ${duplicateSignals[0].detail}` : null,
    signatureFormula ? `Your most repeated outfit formula is ${signatureFormula[0].toLowerCase()}, which gives the closet a reliable backbone.` : null,
    topBrands[0] ? `${topBrands[0][0]} shows up more than any other brand, adding consistency to the wardrobe's point of view.` : null,
    topGapInsights[0]?.msg || null,
  ].filter(Boolean).slice(0, 3);
  const closetPov = (() => {
    const leadWords = descriptorWords.length > 0 ? descriptorWords.join(", ").toLowerCase() : "distinctive and personal";
    const seasonText = dominantSeason ? ` It feels most at home in ${dominantSeason.toLowerCase()} dressing.` : "";
    const occasionText = dominantOccasion ? ` The wardrobe is primarily shaped around ${dominantOccasion.toLowerCase()} moments.` : "";
    return `Your closet reads ${leadWords}, with repeatable foundations that make getting dressed feel intentional rather than accidental.${seasonText}${occasionText}`;
  })();
  const styleJourneyCards = [
    {
      title: "What's Becoming More You",
      eyebrow: recentAdds.length > 0 ? "Recent Direction" : "Current Direction",
      body: recentAdds.length > 0
        ? `Your newest additions suggest you are leaning further into ${descriptorWords[0]?.toLowerCase() || "a stronger point of view"}, especially through ${recentAdds.slice(0, 2).map(i => i.category || i.name).filter(Boolean).join(" and ").toLowerCase()}.`
        : `Your wardrobe already has a defined center of gravity around ${descriptorWords[0]?.toLowerCase() || "personal style"} and repeatable silhouettes.`
    },
    {
      title: "Pieces Waiting For Their Moment",
      eyebrow: "Needs Styling",
      body: neglectedValue.length > 0
        ? `${neglectedValue.length} higher-value piece${neglectedValue.length !== 1 ? "s have" : " has"} not been worn yet. ${neglectedValue[0].name} is a good candidate to build your next few looks around.`
        : unworn.length > 0
          ? `${unworn.length} item${unworn.length !== 1 ? "s are" : " is"} still waiting to be folded into your regular rotation.`
          : "Most of your closet is already being used, which is a strong sign of alignment between taste and real life."
    },
    {
      title: "Your Style Is Moving Toward",
      eyebrow: "Next Chapter",
      body: nextAdditions[0]
        ? `The next evolution is not a reinvention. It is about deepening the wardrobe with ${nextAdditions[0].value.toLowerCase()} and a little more contrast in the finishing pieces.`
        : "The next chapter looks like a sharper, more self-aware version of what is already working well."
    },
  ];

  // ── UI helpers ──
  const SI = ({ d }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight:6, verticalAlign:"middle", display:"inline-block", flexShrink:0 }}>{d}</svg>;

  const Card = ({ children, style={} }) => (
    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"20px 22px", ...style }}>{children}</div>
  );
  const CardTitle = ({ icon, children }) => (
    <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>{icon}{children}</div>
  );
  const ItemRow = ({ item, sub, onClick }) => (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"6px 0", borderBottom:"1px solid #f5f3ef" }}
      onMouseEnter={e=>e.currentTarget.style.background="#faf9f6"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{ width:38, height:38, borderRadius:10, overflow:"hidden", background:"#f5f3ef", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {item.image ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <HangerIcon size={14} color="#ddd" />}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
        <div style={{ fontSize:11, color:"#aaa" }}>{sub}</div>
      </div>
    </div>
  );

  const tabs = [["profile","✦ Profile"],["intelligence","◈ Intelligence"],["habits","◷ Habits"],["budget","$ Budget"]];

  return (
    <div className="fade-up">
      {/* Tab nav */}
      <div style={{ display:"flex", gap:4, marginBottom:28, background:"#f5f3ef", borderRadius:14, padding:4, width:"fit-content" }}>
        {tabs.map(([v,l]) => (
          <button key={v} onClick={()=>setStatsView(v)} style={{
            padding:"8px 18px", border:"none", borderRadius:11, cursor:"pointer",
            fontFamily:"'DM Sans', sans-serif", fontSize:12, fontWeight:700,
            background: statsView===v ? "#fff" : "transparent",
            color: statsView===v ? "#1a1a1a" : "#aaa",
            boxShadow: statsView===v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition:"all 0.15s"
          }}>{l}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 0", color:"#ccc" }}>
          <SvgSparkle size={40} color="#e8e4dc" />
          <div style={{ fontSize:15, fontWeight:700, marginTop:16, color:"#bbb" }}>Add items to your closet to see your Style Profile</div>
        </div>
      ) : (<>

      {/* ══════════════════ PROFILE ══════════════════ */}
      {statsView === "profile" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Editorial hero */}
          {displayArchetype ? (
            <div style={{ background:"linear-gradient(135deg,#181716 0%,#2e2925 55%,#413931 100%)", borderRadius:28, padding:"34px 30px", color:"#fff", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-24, right:-6, fontFamily:"'Cormorant Garamond',serif", fontSize:180, fontStyle:"italic", opacity:0.04, lineHeight:1, pointerEvents:"none", userSelect:"none" }}>✦</div>
              <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.65fr) minmax(260px,1fr)", gap:24, alignItems:"start" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.42)", textTransform:"uppercase", letterSpacing:"0.16em", marginBottom:10 }}>Your Style Portrait</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:42, fontWeight:300, fontStyle:"italic", letterSpacing:"-0.01em", lineHeight:1.06, marginBottom:10 }}>{displayArchetype.label}</div>
                  <div style={{ fontSize:16, color:"rgba(255,255,255,0.88)", lineHeight:1.65, maxWidth:560, marginBottom:12 }}>{styleThesis}</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.62)", lineHeight:1.7, maxWidth:520, marginBottom:18 }}>{displayArchetype.desc}</div>
                  {descriptorWords.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
                      {descriptorWords.map(word => (
                        <div key={word} style={{ padding:"6px 12px", borderRadius:999, background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.10)", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"rgba(255,255,255,0.76)" }}>{word}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"center" }}>
                    {[{label:"Pieces",value:items.length},{label:"Closet Value",value:`$${totalValue.toFixed(0)}`},{label:"Total Wears",value:totalWears},{label:"Avg CPW",value:cpwItems.length>0?`$${(cpwItems.reduce((s,i)=>s+i.cpw,0)/cpwItems.length).toFixed(1)}`:"—"}].map(s=>(
                      <div key={s.label}>
                        <div style={{ fontSize:22, fontWeight:800 }}>{s.value}</div>
                        <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
                      </div>
                    ))}
                    {quizResult && <button onClick={()=>{setQuizResult(null);setQuizAnswers({});}} style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.5)", background:"transparent", border:"1px solid rgba(255,255,255,0.16)", borderRadius:20, padding:"4px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>Retake quiz</button>}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:18, padding:"16px 18px", backdropFilter:"blur(8px)" }}>
                    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:10, marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.44)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Closet Health</div>
                        <div style={{ fontSize:34, fontWeight:900, color:healthLabel[1], lineHeight:1 }}>{healthScore}</div>
                      </div>
                      <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.52)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{healthLabel[0]}</div>
                    </div>
                    <div style={{ height:6, borderRadius:999, background:"rgba(255,255,255,0.10)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${healthScore}%`, background:healthLabel[1], borderRadius:999 }} />
                    </div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:18, padding:"16px 18px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.44)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Palette Notes</div>
                    <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                      {(displayArchetype.palette||[]).map((hex,i) => (
                        <div key={i} style={{ width:30, height:30, borderRadius:"50%", background:hex, border:"2px solid rgba(255,255,255,0.16)", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }} />
                      ))}
                    </div>
                    <div style={{ fontSize:12, lineHeight:1.7, color:"rgba(255,255,255,0.66)" }}>
                      {topColors[0] ? `${topColors[0][0]} leads the closet, while ${topColors.slice(1, 3).map(([c]) => c.toLowerCase()).join(" and ")} keep it dimensional.` : "As you keep adding pieces, your palette story will begin to sharpen."}
                    </div>
                  </div>
                </div>
              </div>
              {archetypeEvidence.length > 0 && !quizResult && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:18 }}>
                  {archetypeEvidence.map((e,i) => (
                    <div key={i} style={{ fontSize:11, color:"rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.08)", borderRadius:20, padding:"4px 10px", backdropFilter:"blur(4px)" }}>{e}</div>
                  ))}
                </div>
              )}
            </div>
          ) : archetypeQuiz ? (
            <div style={{ background:"#f9f8f5", borderRadius:24, padding:"28px 28px", border:"1.5px solid #e8e4dc" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#b0a898", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Style Archetype Quiz</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, fontStyle:"italic", color:"#1a1a1a", marginBottom:20 }}>Let's figure out your style</div>
              {QUIZ_QUESTIONS.map((q,qi) => (
                <div key={q.id} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#444", marginBottom:10 }}>{qi+1}. {q.q}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {q.opts.map(opt => (
                      <button key={opt} onClick={()=>setQuizAnswers(a=>({...a,[q.id]:opt}))}
                        style={{ padding:"7px 14px", borderRadius:20, border:`1.5px solid ${quizAnswers[q.id]===opt?"#1a1a1a":"#e8e4dc"}`, background:quizAnswers[q.id]===opt?"#1a1a1a":"#fff", color:quizAnswers[q.id]===opt?"#fff":"#555", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.12s" }}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button onClick={()=>setArchetypeQuiz(false)} style={{ padding:"10px 20px", borderRadius:100, border:"1.5px solid #e8e4dc", background:"transparent", color:"#888", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                <button onClick={()=>{ setQuizResult(computeQuizArchetype(quizAnswers)); setArchetypeQuiz(false); }} disabled={Object.keys(quizAnswers).length<3} style={{ padding:"10px 24px", borderRadius:100, border:"none", background:Object.keys(quizAnswers).length<3?"#e8e4dc":"#1a1a1a", color:Object.keys(quizAnswers).length<3?"#aaa":"#fff", fontSize:13, fontWeight:700, cursor:Object.keys(quizAnswers).length<3?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  {Object.keys(quizAnswers).length<3?`Answer ${3-Object.keys(quizAnswers).length} more…`:"See my archetype →"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background:"#f5f3ef", borderRadius:24, padding:"28px 28px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, fontStyle:"italic", color:"#b0a898", marginBottom:8 }}>What's your style archetype?</div>
                  <div style={{ fontSize:13, color:"#bbb", lineHeight:1.7, maxWidth:340, marginBottom:14 }}>Answer 3 quick questions to discover your style personality — or tag items with occasions and we'll figure it out automatically.</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {Object.entries(ARCHETYPES).slice(0,4).map(([occ,a]) => (
                      <div key={occ} style={{ padding:"4px 12px", borderRadius:20, background:"#fff", border:"1px solid #e8e4dc", fontSize:11, fontWeight:700, color:"#888" }}>{a.label}</div>
                    ))}
                    <div style={{ padding:"4px 12px", borderRadius:20, background:"#fff", border:"1px solid #e8e4dc", fontSize:11, fontWeight:700, color:"#bbb" }}>+ more</div>
                  </div>
                </div>
                <button onClick={()=>setArchetypeQuiz(true)} style={{ padding:"13px 24px", background:"#1a1a1a", color:"#fff", border:"none", borderRadius:100, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", flexShrink:0 }}>Take the quiz →</button>
              </div>
            </div>
          )}

          {/* Style DNA */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:14 }}>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/></svg>}>Color DNA</CardTitle>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}>
                {topColors.slice(0,5).map(([color,count],i) => {
                  const hex = COLOR_HEX[color]||"#ccc";
                  const size = i===0?54:i===1?48:i===2?42:36;
                  const pct = Math.round((count/items.length)*100);
                  return (
                    <div key={color} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                      <div style={{ width:size, height:size, borderRadius:"50%", background:hex, border:(color==="White"||color==="Cream")?"1.5px solid #e0dbd0":"none", boxShadow:"0 4px 14px rgba(0,0,0,0.12)" }} />
                      <div style={{ fontSize:10, fontWeight:700, color:"#555" }}>{color}</div>
                      <div style={{ fontSize:10, color:"#bbb" }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize:12, color:"#888", lineHeight:1.7 }}>
                {topColors[0] ? `${topColors[0][0]} anchors the closet, while ${topColors.slice(1,3).map(([c]) => c.toLowerCase()).join(" and ")} add range without breaking cohesion.` : "Start tagging colors to reveal your palette story."}
              </div>
            </Card>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18h16"/><path d="M4 12h10"/><path d="M4 6h7"/></svg>}>Silhouette DNA</CardTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {styleSpectrum.slice(0, 3).map((row) => (
                  <div key={row.left + row.right}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:11, fontWeight:700, color:"#666" }}>
                      <span>{row.left}</span>
                      <span>{row.right}</span>
                    </div>
                    <div style={{ height:6, background:"#f0ece4", borderRadius:999, overflow:"hidden", position:"relative" }}>
                      <div style={{ width:`${row.value}%`, height:"100%", background:"linear-gradient(90deg,#d7d2ca,#1a1a1a)", borderRadius:999 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:12, color:"#888", lineHeight:1.7, marginTop:12 }}>
                {`You lean ${styleSpectrum[2]?.value > 50 ? "more relaxed" : "more structured"} overall, with ${styleSpectrum[1]?.value > 55 ? "a stronger trend pull" : "a steadier classic foundation"} underneath.`}
              </div>
            </Card>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}>Occasion DNA</CardTitle>
              {topOccasions.length === 0 ? <div style={{ fontSize:12, color:"#ccc" }}>None tagged yet</div> : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {topOccasions.slice(0,4).map(([o,count]) => {
                    const oc = OCCASION_COLORS_LOCAL[o]||{bg:"#f5f3ef",color:"#888"};
                    const pct = Math.round((count/items.length)*100);
                    return (
                      <div key={o}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:11, fontWeight:700, color:oc.color, background:oc.bg, padding:"2px 8px", borderRadius:20 }}>{o}</span>
                          <span style={{ fontSize:11, color:"#aaa", fontWeight:600 }}>{pct}%</span>
                        </div>
                        <div style={{ height:4, background:"#f0ece4", borderRadius:99 }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:oc.color, borderRadius:99, opacity:0.7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ fontSize:12, color:"#888", lineHeight:1.7, marginTop:12 }}>
                {dominantOccasion ? `${dominantOccasion} dressing leads, which gives the wardrobe a clear real-life purpose instead of a purely aspirational one.` : "Occasion tags will help reveal how this wardrobe actually lives."}
              </div>
            </Card>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>}>Season & Mood</CardTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {topSeasons.slice(0,4).map(([s,count]) => {
                  const pct = Math.round((count/items.length)*100);
                  return (
                    <div key={s}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:SEASON_TEXT[s]||"#888", background:SEASON_COLORS[s]||"#f5f3ef", padding:"2px 8px", borderRadius:20 }}>{s}</span>
                        <span style={{ fontSize:11, color:"#aaa", fontWeight:600 }}>{pct}%</span>
                      </div>
                      <div style={{ height:4, background:"#f0ece4", borderRadius:99 }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:SEASON_TEXT[s]||"#888", borderRadius:99, opacity:0.6 }} />
                      </div>
                    </div>
                    );
                  })}
                </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>
                {inferredStyleWords.slice(0,4).map(word => (
                  <div key={word} style={{ padding:"5px 10px", borderRadius:999, background:"#faf6f1", border:"1px solid #ede6db", fontSize:11, fontWeight:700, color:"#74685d" }}>{word}</div>
                ))}
              </div>
            </Card>
          </div>

          {/* Signature style */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>}>Signature Moves</CardTitle>
              {signatureFormula ? (
                <>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontStyle:"italic", color:"#1a1a1a", lineHeight:1.05, marginBottom:10 }}>{signatureFormula[0]}</div>
                  <div style={{ fontSize:13, color:"#888", lineHeight:1.7, marginBottom:16 }}>
                    This is the formula you return to most. It is the clearest expression of how you like to feel when the outfit is working.
                  </div>
                </>
              ) : (
                <div style={{ fontSize:12, color:"#ccc", marginBottom:16 }}>Build more outfits to reveal your signature formula.</div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {topCategories.slice(0,3).map(([cat,count]) => (
                  <div key={cat} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:14, background:"#faf8f4", border:"1px solid #eee7dc" }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#b0a898", textTransform:"uppercase", letterSpacing:"0.07em" }}>Closet pillar</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>{cat}</div>
                    </div>
                    <div style={{ fontSize:12, color:"#888", fontWeight:700 }}>{count} pieces</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}>Hero Pieces</CardTitle>
              <div style={{ fontSize:12, color:"#888", lineHeight:1.7, marginBottom:12 }}>
                These are the pieces doing the most to define your style language, not just fill space in the closet.
              </div>
              {mostWorn.filter(i=>i.wornCount>0).length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:10 }}>
                  {mostWorn.filter(i=>i.wornCount>0).slice(0,4).map((item,idx) => (
                    <div key={item.id} onClick={()=>onViewItem(item)} style={{ cursor:"pointer", borderRadius:16, overflow:"hidden", background:"#faf9f6", border:"1.5px solid #e8e4dc" }}>
                      <div style={{ aspectRatio:"1/1", display:"flex", alignItems:"center", justifyContent:"center", padding:8, position:"relative" }}>
                        {item.image ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <HangerIcon size={18} color="#ddd" />}
                        {idx === 0 && <div style={{ position:"absolute", top:8, right:8, width:20, height:20, borderRadius:"50%", background:"#f0c840", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>★</div>}
                      </div>
                      <div style={{ padding:"0 10px 10px" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                        <div style={{ fontSize:10, color:"#aaa" }}>{item.wornCount}× worn</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:12, color:"#ccc" }}>Wear history will surface your hero pieces here.</div>
              )}
            </Card>
          </div>

          {/* Closet POV */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}>What Your Closet Says</CardTitle>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontStyle:"italic", color:"#1a1a1a", lineHeight:1.1, marginBottom:12 }}>A wardrobe with a point of view.</div>
              <div style={{ fontSize:13, color:"#666", lineHeight:1.8 }}>{closetPov}</div>
            </Card>
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>}>What Makes It Distinct</CardTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {styleDistinctions.map((entry, idx) => (
                  <div key={idx} style={{ padding:"12px 14px", borderRadius:14, background:"#faf8f4", border:"1px solid #eee6da", fontSize:12, lineHeight:1.7, color:"#666" }}>{entry}</div>
                ))}
              </div>
            </Card>
          </div>

          {/* Style journey */}
          <Card style={{ padding:"24px 24px 22px" }}>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#b0a898", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Style Journey</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontStyle:"italic", color:"#1a1a1a", lineHeight:1.05 }}>The shift happening now</div>
              </div>
              <div style={{ fontSize:12, color:"#888", lineHeight:1.7, maxWidth:320 }}>
                {weekLogged > 0 ? `${weekLogged} of the last 7 days were logged, so the profile is starting to capture how your style actually lives.` : "As you log more outfits and purchases, this section will get more specific and more personal."}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
              {styleJourneyCards.map(card => (
                <div key={card.title} style={{ borderRadius:18, padding:"16px 16px 18px", background:"#faf8f4", border:"1px solid #ece3d7" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#b0a898", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:8 }}>{card.eyebrow}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#1a1a1a", marginBottom:8 }}>{card.title}</div>
                  <div style={{ fontSize:12, color:"#666", lineHeight:1.75 }}>{card.body}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Next chapter */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:14 }}>
            {nextAdditions.slice(0,3).map((rec, idx) => (
              <Card key={rec.label + rec.value} style={{ background: idx === 0 ? "#fbf7f1" : "#fff" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#b0a898", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
                  {idx === 0 ? "To Complete The Picture" : idx === 1 ? "To Add Contrast" : "Next Chapter"}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontStyle:"italic", color:"#1a1a1a", lineHeight:1.05, marginBottom:8 }}>{rec.value}</div>
                <div style={{ fontSize:12, fontWeight:700, color:"#444", marginBottom:6 }}>{rec.label}</div>
                <div style={{ fontSize:12, color:"#888", lineHeight:1.7 }}>{rec.note}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ INTELLIGENCE ══════════════════ */}
      {statsView === "intelligence" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Cost per wear — best */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}>Best Cost Per Wear</CardTitle>
            <div style={{ fontSize:12, color:"#bbb", marginBottom:12 }}>Your best investments — price ÷ wears</div>
            {cpwItems.length===0 ? <div style={{ fontSize:12, color:"#ccc" }}>Add prices and start marking outfits worn to see this</div> : (
              cpwItems.slice(0,5).map(item => (
                <ItemRow key={item.id} item={item} sub={`$${item.cpw.toFixed(2)}/wear · ${item.wornCount}× worn · $${parsePrice(item.price).toFixed(0)}`} onClick={()=>onViewItem(item)} />
              ))
            )}
          </Card>

          {/* Cost per wear — worst */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}>Worst Cost Per Wear</CardTitle>
            <div style={{ fontSize:12, color:"#bbb", marginBottom:12 }}>Items that need more love to justify their price</div>
            {worstCpw.length===0 ? <div style={{ fontSize:12, color:"#ccc" }}>Add prices to items to see this</div> : (
              worstCpw.map(item => (
                <ItemRow key={item.id} item={item} sub={`$${item.cpw.toFixed(2)}/wear · ${item.wornCount||0}× worn · $${parsePrice(item.price).toFixed(0)}`} onClick={()=>onViewItem(item)} />
              ))
            )}
          </Card>

          {/* Outfit formula */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>}>Your Outfit Formula</CardTitle>
            <div style={{ fontSize:12, color:"#bbb", marginBottom:12 }}>Category combinations that appear together most in your outfits</div>
            {outfitFormula.length===0 ? <div style={{ fontSize:12, color:"#ccc" }}>Build more outfits to discover your formula</div> : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {outfitFormula.map(([pair,count],i) => (
                  <div key={pair} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:"#f5f3ef", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#aaa", flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1, fontSize:12, fontWeight:700, color:"#1a1a1a" }}>{pair}</div>
                    <div style={{ fontSize:11, color:"#aaa", fontWeight:600 }}>{count}×</div>
                    <div style={{ width:60, height:4, background:"#f0ece4", borderRadius:99 }}>
                      <div style={{ height:"100%", width:`${(count/(outfitFormula[0]?.[1]||1))*100}%`, background:"#1a1a1a", borderRadius:99 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Wardrobe gaps + smart insights */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}>Wardrobe Gaps & Insights</CardTitle>
            {gapInsights.length === 0 && gaps.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0", color:"#3aaa6e", fontSize:13, fontWeight:700 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Your wardrobe looks well-rounded — no major gaps!
              </div>
            ) : (<>
              {gapInsights.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                  {gapInsights.map((ins,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", borderRadius:16, background:ins.priority==="high"?"#fff8f0":ins.priority==="medium"?"#f8f8ff":"#f9fdf9", border:`1.5px solid ${ins.priority==="high"?"#f5c89a":ins.priority==="medium"?"#d8d2f8":"#c8ecd8"}` }}>
                      <span style={{ fontSize:22, lineHeight:1, flexShrink:0, marginTop:1 }}>{ins.emoji}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, color:"#444", lineHeight:1.6, fontWeight:500 }}>{ins.msg}</div>
                        {ins.priority==="high" && <div style={{ fontSize:10, fontWeight:700, color:"#e07000", marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>High priority</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {gaps.length > 0 && (<>
                <div style={{ fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Missing or thin categories</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {gaps.map(({cat,count}) => (
                    <div key={cat} style={{ padding:"8px 14px", borderRadius:20, background:count===0?"#fff0f0":"#fff8ee", border:`1px solid ${count===0?"#ffc5c5":"#f5c842"}`, fontSize:12, fontWeight:700, color:count===0?"#e05555":"#a07000", display:"flex", alignItems:"center", gap:8 }}>
                      <span>{count===0?"✕":"!"}</span>
                      <span>{cat}</span>
                      <span style={{ fontWeight:500, opacity:0.7 }}>{count===0?"none":`only ${count}`}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:12, fontSize:12, color:"#aaa", lineHeight:1.6 }}>
                  💡 Add these to your <strong style={{ color:"#888" }}>Wishlist</strong> to track what you're looking for next
                </div>
              </>)}
            </>)}
          </Card>

          {/* Never worn */}
          {unworn.length > 0 && (
            <Card>
              <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}>Never Worn <span style={{ fontSize:11, fontWeight:600, color:"#e05555", marginLeft:6 }}>{unworn.length} items</span></CardTitle>
              <div style={{ fontSize:12, color:"#bbb", marginBottom:12 }}>Wear them or list them for sale</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:10 }}>
                {unworn.slice(0,12).map(item => (
                  <div key={item.id} onClick={()=>onViewItem(item)} style={{ cursor:"pointer", borderRadius:12, overflow:"hidden", background:"#faf9f6", border:"1.5px solid #e8e4dc" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#e05555"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#e8e4dc"}>
                    <div style={{ aspectRatio:"1/1", display:"flex", alignItems:"center", justifyContent:"center", padding:4 }}>
                      {item.image ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <HangerIcon size={16} color="#ddd" />}
                    </div>
                    <div style={{ padding:"3px 6px 5px", fontSize:9, fontWeight:700, color:"#888", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════ HABITS ══════════════════ */}
      {statsView === "habits" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* This week strip */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>This Week</CardTitle>
            <div style={{ display:"flex", gap:6 }}>
              {weekStrip.map(day => {
                const dayLabel = day.date.toLocaleDateString("en-US", { weekday:"short" });
                const dateLabel = day.date.toLocaleDateString("en-US", { month:"numeric", day:"numeric" });
                const wore = day.outfitIds.length > 0;
                const outfitPreviews = day.outfitIds.map(id => outfits.find(o => o.id === id)).filter(Boolean);
                return (
                  <div key={day.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ fontSize:9, fontWeight:700, color: day.isToday ? "#1a1a1a" : "#bbb", textTransform:"uppercase", letterSpacing:"0.06em" }}>{dayLabel}</div>
                    <div style={{
                      width:"100%", aspectRatio:"1/1", borderRadius:12,
                      background: wore ? "#1a1a1a" : day.isToday ? "#f5f3ef" : "#f5f3ef",
                      border: day.isToday ? "2px solid #1a1a1a" : "1.5px solid #e8e4dc",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      overflow:"hidden", position:"relative",
                    }}>
                      {outfitPreviews[0]?.previewImage ? (
                        <img src={outfitPreviews[0].previewImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      ) : wore ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div style={{ width:6, height:6, borderRadius:"50%", background: day.isToday ? "#1a1a1a" : "#ddd" }} />
                      )}
                      {day.outfitIds.length > 1 && (
                        <div style={{ position:"absolute", bottom:3, right:3, background:"rgba(255,255,255,0.9)", borderRadius:6, padding:"1px 4px", fontSize:8, fontWeight:800, color:"#1a1a1a" }}>+{day.outfitIds.length}</div>
                      )}
                    </div>
                    <div style={{ fontSize:9, color:"#bbb", fontWeight:500 }}>{dateLabel}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:11, color:"#888" }}>
                <span style={{ fontWeight:700, color:"#1a1a1a" }}>{weekStrip.filter(d=>d.outfitIds.length>0).length}</span> of 7 days tracked this week
              </div>
              {weekStrip.filter(d=>d.outfitIds.length>0).length === 7 && (
                <div style={{ fontSize:11, fontWeight:700, color:"#3aaa6e", display:"flex", alignItems:"center", gap:4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Perfect week!
                </div>
              )}
            </div>
          </Card>

          {/* Wear frequency heatmap */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>Outfit Frequency <span style={{ fontSize:11, fontWeight:500, color:"#bbb", marginLeft:6 }}>last 12 weeks</span></CardTitle>
            <div style={{ overflowX:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:3, minWidth:320 }}>
                {Array.from({length:12},(_,week) => (
                  <div key={week} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {Array.from({length:7},(_,day) => {
                      const dIdx = week*7+day;
                      const d = calData[dIdx];
                      if (!d) return <div key={day} style={{ width:"100%", aspectRatio:"1/1" }} />;
                      const intensity = d.count===0?0:Math.max(0.15, d.count/maxCalCount);
                      return (
                        <div key={day} title={`${d.key}: ${d.count} outfit${d.count!==1?"s":""}`}
                          style={{ width:"100%", aspectRatio:"1/1", borderRadius:3, background: d.count===0?"#f0ece4":`rgba(26,26,26,${intensity})`, cursor: d.count>0?"pointer":"default", transition:"transform 0.1s" }}
                          onMouseEnter={e=>{if(d.count>0)e.currentTarget.style.transform="scale(1.3)";}}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, fontSize:10, color:"#bbb" }}>
              <span>Less</span>
              {[0,0.15,0.4,0.7,1].map(v=>(
                <div key={v} style={{ width:12, height:12, borderRadius:3, background:v===0?"#f0ece4":`rgba(26,26,26,${v})` }} />
              ))}
              <span>More</span>
            </div>
          </Card>

          {/* Monthly stats */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}>Monthly Activity</CardTitle>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {monthlyData.map(m => (
                <div key={m.key} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:30, fontSize:11, fontWeight:700, color:"#888", flexShrink:0 }}>{m.label}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:8, background:"#f0ece4", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(m.spent/maxSpent)*100}%`, background:"linear-gradient(90deg,#1a1a1a,#555)", borderRadius:99, transition:"width 0.5s" }} />
                    </div>
                  </div>
                  <div style={{ width:52, textAlign:"right", fontSize:11, fontWeight:700, color:m.spent>0?"#1a1a1a":"#ddd" }}>{m.spent>0?`$${m.spent.toFixed(0)}`:"—"}</div>
                  <div style={{ width:42, textAlign:"right", fontSize:11, color:"#aaa" }}>{m.added} item{m.added!==1?"s":""}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Most active season */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>}>Season Breakdown</CardTitle>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {topSeasons.map(([s,count]) => {
                const pct = Math.round((count/items.length)*100);
                return (
                  <div key={s} style={{ background:SEASON_COLORS[s]||"#f5f3ef", borderRadius:14, padding:"12px 16px", textAlign:"center", minWidth:80 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:SEASON_TEXT[s]||"#888" }}>{pct}%</div>
                    <div style={{ fontSize:10, fontWeight:700, color:SEASON_TEXT[s]||"#888", opacity:0.8, marginTop:2 }}>{s}</div>
                    <div style={{ fontSize:10, color:SEASON_TEXT[s]||"#888", opacity:0.5 }}>{count} items</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Getting dressed score */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}>Wardrobe Health Score</CardTitle>
            <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
              <div style={{ position:"relative", width:80, height:80, flexShrink:0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#f0ece4" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke={healthLabel[1]} strokeWidth="8"
                    strokeDasharray={`${2*Math.PI*32*healthScore/100} ${2*Math.PI*32*(1-healthScore/100)}`}
                    strokeDashoffset={2*Math.PI*32*0.25}
                    strokeLinecap="round" />
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontSize:18, fontWeight:900, color:healthLabel[1], lineHeight:1 }}>{healthScore}</div>
                  <div style={{ fontSize:8, fontWeight:700, color:"#bbb", textTransform:"uppercase" }}>/100</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:healthLabel[1], marginBottom:4 }}>{healthLabel[0]}</div>
                <div style={{ fontSize:12, color:"#888", lineHeight:1.6 }}>Based on wear frequency,<br/>category balance, and cost per wear</div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Wear Frequency", score:Math.min(Math.round((totalWears/Math.max(items.length,1))*20),40), max:40, color:"#3aaa6e" },
                { label:"Category Balance", score:Math.max(0,30-gaps.filter(g=>g.count===0).length*5), max:30, color:"#2090c0" },
                { label:"Cost Per Wear", score:cpwItems.length>0?Math.min(Math.round(cpwItems.length/items.length*60),30):0, max:30, color:"#9a6fe0" },
              ].map(s=>(
                <div key={s.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>{s.label}</span>
                    <span style={{ fontSize:11, color:s.color, fontWeight:700 }}>{s.score}/{s.max}</span>
                  </div>
                  <div style={{ height:5, background:"#f0ece4", borderRadius:99 }}>
                    <div style={{ height:"100%", width:`${(s.score/s.max)*100}%`, background:s.color, borderRadius:99 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════ BUDGET ══════════════════ */}
      {statsView === "budget" && (() => {
        const spentThisMonth = items.filter(i=>(i.purchaseDate||"").startsWith(thisMonth)).reduce((s,i)=>s+parsePrice(i.price),0);
        const spentThisYear  = items.filter(i=>(i.purchaseDate||"").startsWith(String(now.getFullYear()))).reduce((s,i)=>s+parsePrice(i.price),0);
        const moPct   = monthlyBudget > 0 ? Math.min((spentThisMonth / monthlyBudget) * 100, 100) : 0;
        const yrPct   = annualBudget  > 0 ? Math.min((spentThisYear  / annualBudget)  * 100, 100) : 0;
        const moOver  = monthlyBudget > 0 && spentThisMonth > monthlyBudget;
        const yrOver  = annualBudget  > 0 && spentThisYear  > annualBudget;
        const moColor = moPct > 90 ? "#e05555" : moPct > 70 ? "#d97706" : "#3aaa6e";
        const yrColor = yrPct > 90 ? "#e05555" : yrPct > 70 ? "#d97706" : "#3aaa6e";
        // target line height within the 72px chart area
        const chartH = 72;
        const targetLineH = monthlyBudget > 0 ? Math.min((monthlyBudget / Math.max(maxSpent, monthlyBudget)) * chartH, chartH) : null;
        return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Budget progress bars — only shown when targets are set */}
          {(monthlyBudget > 0 || annualBudget > 0) && (
            <div style={{ display:"grid", gridTemplateColumns: monthlyBudget>0 && annualBudget>0 ? "1fr 1fr" : "1fr", gap:12 }}>
              {monthlyBudget > 0 && (
                <div style={{ background: moOver?"#fff8f8":"#fafaf8", borderRadius:16, padding:"16px 18px", border:`1.5px solid ${moOver?"#ffd0d0":"#e8e4dc"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.07em" }}>This Month</div>
                    <div style={{ fontSize:10, fontWeight:700, color: moOver?"#e05555":moColor }}>{moOver ? "Over budget" : `$${Math.max(monthlyBudget-spentThisMonth,0).toFixed(0)} left`}</div>
                  </div>
                  <div style={{ fontSize:22, fontWeight:900, color: moOver?"#e05555":"#1a1a1a", lineHeight:1, marginBottom:2 }}>${spentThisMonth.toFixed(0)}</div>
                  <div style={{ fontSize:11, color:"#bbb", marginBottom:10 }}>of ${monthlyBudget.toFixed(0)} budget</div>
                  <div style={{ height:6, borderRadius:99, background:"#ece8e0", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${moPct}%`, background: moColor, borderRadius:99, transition:"width 0.5s" }} />
                  </div>
                </div>
              )}
              {annualBudget > 0 && (
                <div style={{ background: yrOver?"#fff8f8":"#fafaf8", borderRadius:16, padding:"16px 18px", border:`1.5px solid ${yrOver?"#ffd0d0":"#e8e4dc"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.07em" }}>{now.getFullYear()} Annual</div>
                    <div style={{ fontSize:10, fontWeight:700, color: yrOver?"#e05555":yrColor }}>{yrOver ? "Over budget" : `$${Math.max(annualBudget-spentThisYear,0).toFixed(0)} left`}</div>
                  </div>
                  <div style={{ fontSize:22, fontWeight:900, color: yrOver?"#e05555":"#1a1a1a", lineHeight:1, marginBottom:2 }}>${spentThisYear.toFixed(0)}</div>
                  <div style={{ fontSize:11, color:"#bbb", marginBottom:10 }}>of ${annualBudget.toFixed(0)} budget</div>
                  <div style={{ height:6, borderRadius:99, background:"#ece8e0", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${yrPct}%`, background: yrColor, borderRadius:99, transition:"width 0.5s" }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12 }}>
            {[
              { label:"Closet Value", value:`$${totalValue.toFixed(0)}`, color:"#1a1a1a", bg:"#fafaf8" },
              { label:"Avg Item Price", value: items.filter(i=>parsePrice(i.price)>0).length>0?`$${(totalValue/items.filter(i=>parsePrice(i.price)>0).length).toFixed(0)}`:"—", color:"#2090c0", bg:"#f0f8ff" },
              { label:"Wishlist Value", value:wishlistTotalValue>0?`$${wishlistTotalValue.toFixed(0)}`:"—", color:"#9a6fe0", bg:"#f8f0ff" },
              { label:"Added This Month", value:items.filter(i=>(i.purchaseDate||"").startsWith(thisMonth)).length, color:"#3aaa6e", bg:"#f0faf4" },
            ].map(s=>(
              <div key={s.label} style={{ background:s.bg, borderRadius:16, padding:"16px 18px", textAlign:"center", border:"1.5px solid #e8e4dc" }}>
                <div style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:10, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.07em", marginTop:6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Spend bar chart */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Spending — Last 6 Months</CardTitle>
            <div style={{ position:"relative", display:"flex", alignItems:"flex-end", gap:8, height:100, marginBottom:8 }}>
              {/* Monthly budget target line */}
              {targetLineH !== null && (
                <div style={{ position:"absolute", left:0, right:0, bottom: targetLineH + 28, height:1, borderTop:"1.5px dashed #e05555", zIndex:2, pointerEvents:"none" }}>
                  <span style={{ position:"absolute", right:0, top:-9, fontSize:9, fontWeight:700, color:"#e05555", background:"#fff", paddingLeft:4 }}>${monthlyBudget.toFixed(0)}</span>
                </div>
              )}
              {monthlyData.map(m => {
                const barH = Math.max((m.spent / Math.max(maxSpent, monthlyBudget||0, 1)) * 72, m.spent>0?4:0);
                const isOver = monthlyBudget > 0 && m.spent > monthlyBudget;
                const barColor = m.key===thisMonth ? (isOver?"#e05555":"#1a1a1a") : (isOver?"#f5a0a0":"#e0dbd2");
                return (
                  <div key={m.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ fontSize:9, fontWeight:700, color: isOver?"#e05555":"#888" }}>{m.spent>0?`$${m.spent.toFixed(0)}`:" "}</div>
                    <div style={{ width:"100%", background: barColor, borderRadius:"4px 4px 0 0", height:`${barH}px`, minHeight:m.spent>0?4:0, transition:"height 0.4s" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {monthlyData.map(m=>(
                <div key={m.key} style={{ flex:1, textAlign:"center", fontSize:10, fontWeight:600, color: m.key===thisMonth?"#1a1a1a":"#bbb" }}>{m.label}</div>
              ))}
            </div>
            {monthlyBudget > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, paddingTop:10, borderTop:"1px solid #f5f3ef" }}>
                <div style={{ width:16, height:1, borderTop:"1.5px dashed #e05555" }} />
                <span style={{ fontSize:10, color:"#aaa", fontWeight:600 }}>Monthly budget target (${monthlyBudget.toFixed(0)})</span>
              </div>
            )}
          </Card>

          {/* Most valuable items */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>}>Most Valuable Items</CardTitle>
            {[...items].sort((a,b)=>parsePrice(b.price)-parsePrice(a.price)).filter(i=>parsePrice(i.price)>0).slice(0,6).map(item=>(
              <ItemRow key={item.id} item={item} sub={`$${parsePrice(item.price).toFixed(0)} · $${(parsePrice(item.price)/Math.max(item.wornCount||0,1)).toFixed(2)}/wear`} onClick={()=>onViewItem(item)} />
            ))}
          </Card>

          {/* Wishlist intelligence */}
          <Card>
            <CardTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}>Wishlist Intelligence</CardTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:"Wishlist Items", value:wishItems.length, color:"#9a6fe0" },
                { label:"Total Value", value:wishlistTotalValue>0?`$${wishlistTotalValue.toFixed(0)}`:"—", color:"#9a6fe0" },
                { label:"Closet Overlap", value:wishlistOverlap.length, color:wishlistOverlap.length>0?"#e05555":"#3aaa6e" },
              ].map(s=>(
                <div key={s.label} style={{ background:"#faf9f6", borderRadius:12, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:9, fontWeight:700, color:"#bbb", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {wishlistOverlap.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#e05555", marginBottom:8 }}>⚠ You may already own versions of these:</div>
                {wishlistOverlap.slice(0,4).map(wi=>(
                  <div key={wi.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px solid #f5f3ef" }}>
                    <div style={{ width:32, height:32, borderRadius:8, overflow:"hidden", background:"#f5f3ef", flexShrink:0 }}>
                      {wi.image?<img src={wi.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>:<HangerIcon size={12} color="#ddd"/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{wi.name}</div>
                      <div style={{ fontSize:11, color:"#e05555" }}>{wi.category} · already in closet</div>
                    </div>
                    {wi.price && <div style={{ fontSize:12, fontWeight:700, color:"#9a6fe0" }}>{wi.price}</div>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        );
      })()}

      </>)}
    </div>
  );
}

// ── Wishlist Tab ──────────────────────────────────────────────────────────────
function WishlistTab({ wishlistDb, wishlistsDb, saveWishlistsMeta, activeWishlistId, setActiveWishlistId, wlSort, setWlSort, wlSortCat, setWlSortCat, wlZoom, setWlZoom, moveToCloset, onEdit, onItemClick, moodboardsDb, lookbooksDb, wlSelectMode, setWlSelectMode, onCreateLook }) {
  const [showNewWl, setShowNewWl] = useState(false);
  const [newWlName, setNewWlName] = useState("");
  const [newWlNotes, setNewWlNotes] = useState("");
  const [editingWlId, setEditingWlId] = useState(null);
  const [dragItemId, setDragItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const [dropTargetListId, setDropTargetListId] = useState(null); // list being hovered during item drag
  const [customOrder, setCustomOrder] = useState({});
  const [wlStoreFilter, setWlStoreFilter] = useState("All");
  const [wlSearch, setWlSearch] = useState("");
  const [wlSelected, setWlSelected] = useState(new Set());
  const [listDragId, setListDragId] = useState(null);
  const [listDragOverId, setListDragOverId] = useState(null);
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0,10));
  const [purchaseFinalPrice, setPurchaseFinalPrice] = useState("");
  const [purchaseKeepLink, setPurchaseKeepLink] = useState(true);
  const [showBulkMoveDropdown, setShowBulkMoveDropdown] = useState(false);

  // Clear selection when select mode is turned off externally (e.g. Cancel button in toolbar)
  useEffect(() => { if (!wlSelectMode) setWlSelected(new Set()); }, [wlSelectMode]);

  const priorityMeta = { high: { label: "High", bg: "#fff0f0", color: "#e05555", border: "#ffc5c5" }, medium: { label: "Medium", bg: "#fff8ee", color: "#a07000", border: "#f5c842" }, low: { label: "Low", bg: "#f5f3ef", color: "#aaa", border: "#e0dbd0" } };
  const reasonMeta = { replace: { label: "Replace", bg: "#fff0f0", color: "#e05555", border: "#ffc5c5" }, gap: { label: "Gap", bg: "#f0f4ff", color: "#3b5bdb", border: "#b0c4ff" }, trend: { label: "Trend", bg: "#fdf0ff", color: "#9c27b0", border: "#e2b0ff" }, trip: { label: "Trip", bg: "#f0fbff", color: "#2bafd4", border: "#9adff5" }, "dream item": { label: "Dream Item", bg: "#fffbe6", color: "#a07000", border: "#f5c842" } };

  const visibleItems = wishlistDb.rows.filter(i =>
    !activeWishlistId || i.wishlistId === activeWishlistId
  );

  const applySort = (items) => {
    const po = { high: 0, medium: 1, low: 2 };
    let sorted = [...items].sort((a, b) => {
      if (wlSort === "priority") return (po[a.priority] ?? 1) - (po[b.priority] ?? 1);
      if (wlSort === "store") return (a.store || "").localeCompare(b.store || "");
      if (wlSort === "category") return (a.category || "").localeCompare(b.category || "");
      if (wlSort === "price") return (parseFloat((b.price||"").replace(/[^0-9.]/g,""))||0) - (parseFloat((a.price||"").replace(/[^0-9.]/g,""))||0);
      if (wlSort === "added") return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
      return 0;
    }).filter(i => wlSortCat === "All" || i.category === wlSortCat)
      .filter(i => wlStoreFilter === "All" || (i.store || "") === wlStoreFilter)
      .filter(i => !wlSearch || (i.name||"").toLowerCase().includes(wlSearch.toLowerCase()) || (i.brand||"").toLowerCase().includes(wlSearch.toLowerCase()) || (i.store||"").toLowerCase().includes(wlSearch.toLowerCase()));
    const orderKey = activeWishlistId || "all";
    const order = customOrder[orderKey];
    if (order && order.length) {
      sorted = [...sorted].sort((a, b) => {
        const ai = order.indexOf(a.id), bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }
    return sorted;
  };

  const sortedItems = applySort(visibleItems);

  // Item drag-to-reorder
  const handleDragStart = (id) => setDragItemId(id);
  const handleDragEnter = (id) => setDragOverItemId(id);
  const handleDrop = () => {
    if (!dragItemId || !dragOverItemId || dragItemId === dragOverItemId) { setDragItemId(null); setDragOverItemId(null); return; }
    const orderKey = activeWishlistId || "all";
    const ids = sortedItems.map(i => i.id);
    const fromIdx = ids.indexOf(dragItemId), toIdx = ids.indexOf(dragOverItemId);
    if (fromIdx === -1 || toIdx === -1) { setDragItemId(null); setDragOverItemId(null); return; }
    const next = [...ids]; next.splice(fromIdx, 1); next.splice(toIdx, 0, dragItemId);
    setCustomOrder(o => ({ ...o, [orderKey]: next }));
    setDragItemId(null); setDragOverItemId(null);
  };

  // Drop item onto a list in the sidebar
  const handleDropOnList = (targetListId) => {
    if (!dragItemId) return;
    const item = wishlistDb.rows.find(i => i.id === dragItemId);
    if (!item) return;
    wishlistDb.update({ ...item, wishlistId: targetListId || undefined });
    setDragItemId(null); setDragOverItemId(null); setDropTargetListId(null);
  };

  // List sidebar drag-to-reorder
  const handleListDrop = () => {
    if (!listDragId || !listDragOverId || listDragId === listDragOverId) { setListDragId(null); setListDragOverId(null); return; }
    const fromIdx = wishlistsDb.findIndex(w => w.id === listDragId);
    const toIdx = wishlistsDb.findIndex(w => w.id === listDragOverId);
    if (fromIdx === -1 || toIdx === -1) { setListDragId(null); setListDragOverId(null); return; }
    const next = [...wishlistsDb]; const [moved] = next.splice(fromIdx, 1); next.splice(toIdx, 0, moved);
    saveWishlistsMeta(next);
    setListDragId(null); setListDragOverId(null);
  };

  const wlCategories = [...new Set(wishlistDb.rows.map(i => i.category).filter(Boolean))];
  const wlStores = [...new Set(wishlistDb.rows.map(i => i.store).filter(Boolean))];
  const activeWl = wishlistsDb.find(w => w.id === activeWishlistId) || null;
  const filteredWishlistsDb = wishlistsDb;

  const openPurchaseModal = (item) => {
    setPurchaseItem(item);
    setPurchaseDate(new Date().toISOString().slice(0,10));
    setPurchaseFinalPrice(item.price ? item.price.replace(/[^0-9.]/g, "") : "");
    setPurchaseKeepLink(true);
  };

  const confirmPurchase = () => {
    if (!purchaseItem) return;
    const itemToMove = purchaseKeepLink ? purchaseItem : { ...purchaseItem, link: undefined };
    moveToCloset(itemToMove, purchaseDate, purchaseFinalPrice);
    setPurchaseItem(null);
  };

  const toggleSelect = (id) => setWlSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${wlSelected.size} item${wlSelected.size !== 1 ? "s" : ""}?`)) return;
    for (const id of wlSelected) await wishlistDb.remove(id);
    setWlSelected(new Set()); setWlSelectMode(false);
  };

  const bulkMoveToList = async (listId) => {
    for (const id of wlSelected) {
      const item = wishlistDb.rows.find(i => i.id === id);
      if (item) await wishlistDb.update({ ...item, wishlistId: listId || undefined });
    }
    setWlSelected(new Set()); setWlSelectMode(false);
    if (listId) setActiveWishlistId(listId);
  };

  const bulkMarkPurchased = async () => {
    const today = new Date().toISOString().slice(0,10);
    for (const id of wlSelected) { const item = wishlistDb.rows.find(i => i.id === id); if (item) await moveToCloset(item, today); }
    setWlSelected(new Set()); setWlSelectMode(false);
  };

  return (
    <div className="fade-up" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

      {/* ── Left sidebar ── */}
      <div style={{ width: 190, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 6 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <input className="closet-search" value={wlSearch} onChange={e => setWlSearch(e.target.value)} placeholder="Search items…" />
        </div>

        {/* Lists card */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #ece8e0", padding: "6px", display: "flex", flexDirection: "column", gap: 2 }}>
          {/* All Items */}
          <button onClick={() => setActiveWishlistId(null)}
            onDragOver={e => { if (dragItemId) { e.preventDefault(); setDropTargetListId("all"); } }}
            onDragLeave={() => setDropTargetListId(null)}
            onDrop={() => handleDropOnList(null)}
            style={{
              width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 12, border: dropTargetListId === "all" ? "2px dashed #1a1a1a" : "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: activeWishlistId === null ? 700 : 500,
              background: dropTargetListId === "all" ? "#f0f0f0" : activeWishlistId === null ? "#1a1a1a" : "transparent",
              color: activeWishlistId === null && dropTargetListId !== "all" ? "#fff" : "#555",
              display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s",
            }}>
            <span>All Items</span>
            <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 600 }}>{wishlistDb.rows.length}</span>
          </button>

          {/* Named lists (draggable) */}
          {filteredWishlistsDb.map(wl => (
            <button key={wl.id} onClick={() => setActiveWishlistId(wl.id)}
              draggable
              onDragStart={() => setListDragId(wl.id)}
              onDragEnter={() => { setListDragOverId(wl.id); if (dragItemId) setDropTargetListId(wl.id); }}
              onDragLeave={() => setDropTargetListId(null)}
              onDragEnd={handleListDrop}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragItemId) handleDropOnList(wl.id); }}
              style={{
                width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 12,
                cursor: dragItemId ? "copy" : "grab",
                border: dropTargetListId === wl.id ? "2px dashed #1a1a1a" : listDragOverId === wl.id ? "2px dashed #888" : "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: activeWishlistId === wl.id ? 700 : 500,
                background: dropTargetListId === wl.id ? "#f0f0f0" : activeWishlistId === wl.id ? "#1a1a1a" : "transparent",
                color: activeWishlistId === wl.id && dropTargetListId !== wl.id ? "#fff" : "#555",
                display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s",
              }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{wl.name}</span>
              <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>{wishlistDb.rows.filter(i => i.wishlistId === wl.id).length}</span>
            </button>
          ))}

          {/* New list */}
          {!showNewWl && (
            <button onClick={() => setShowNewWl(true)} style={{
              width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 12,
              border: "1.5px dashed #d8d2c8", background: "transparent", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#aaa",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New List
            </button>
          )}
          {showNewWl && (
            <div style={{ padding: "8px 4px 4px" }}>
              <input value={newWlName} onChange={e => setNewWlName(e.target.value)} placeholder="List name…" autoFocus
                onKeyDown={e => { if (e.key === "Enter" && newWlName.trim()) { const wl = { id: Date.now().toString(36), name: newWlName.trim(), notes: newWlNotes }; saveWishlistsMeta([...wishlistsDb, wl]); setNewWlName(""); setNewWlNotes(""); setShowNewWl(false); setActiveWishlistId(wl.id); }}}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, outline: "none", marginBottom: 6, boxSizing: "border-box" }} />
              <textarea value={newWlNotes} onChange={e => setNewWlNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 11, resize: "none", outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { if (!newWlName.trim()) return; const wl = { id: Date.now().toString(36), name: newWlName.trim(), notes: newWlNotes }; saveWishlistsMeta([...wishlistsDb, wl]); setNewWlName(""); setNewWlNotes(""); setShowNewWl(false); setActiveWishlistId(wl.id); }}
                  style={{ flex: 1, padding: "7px 0", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Create</button>
                <button onClick={() => { setShowNewWl(false); setNewWlName(""); setNewWlNotes(""); }}
                  style={{ padding: "7px 10px", background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>✕</button>
              </div>
            </div>
          )}
        </div>

        {/* Edit active list + moodboard/lookbook links */}
        {activeWl && (
          <div style={{ marginTop: 8, background: "#fff", borderRadius: 18, border: "1px solid #ece8e0", padding: "12px" }}>
            {editingWlId === activeWl.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <input value={activeWl.name} onChange={e => saveWishlistsMeta(wishlistsDb.map(w => w.id === activeWl.id ? { ...w, name: e.target.value } : w))}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
                <textarea value={activeWl.notes || ""} onChange={e => saveWishlistsMeta(wishlistsDb.map(w => w.id === activeWl.id ? { ...w, notes: e.target.value } : w))} rows={2}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 11, resize: "none", outline: "none", boxSizing: "border-box" }} />
                {moodboardsDb && moodboardsDb.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Moodboard</div>
                    <select value={activeWl.linkedMoodboardId || ""} onChange={e => saveWishlistsMeta(wishlistsDb.map(w => w.id === activeWl.id ? { ...w, linkedMoodboardId: e.target.value || undefined } : w))}
                      style={{ width: "100%", padding: "6px 8px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 11, outline: "none", boxSizing: "border-box" }}>
                      <option value="">None</option>
                      {moodboardsDb.map((mb, idx) => <option key={mb.id} value={mb.id}>{mb.name || `Board ${idx + 1}`}</option>)}
                    </select>
                  </div>
                )}
                {lookbooksDb && lookbooksDb.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Lookbook</div>
                    <select value={activeWl.linkedLookbookId || ""} onChange={e => saveWishlistsMeta(wishlistsDb.map(w => w.id === activeWl.id ? { ...w, linkedLookbookId: e.target.value || undefined } : w))}
                      style={{ width: "100%", padding: "6px 8px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 11, outline: "none", boxSizing: "border-box" }}>
                      <option value="">None</option>
                      {lookbooksDb.map(lb => <option key={lb.id} value={lb.id}>{lb.name}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={() => setEditingWlId(null)} style={{ padding: "6px 0", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Done</button>
              </div>
            ) : (
              <>
                {(activeWl.linkedMoodboardId || activeWl.linkedLookbookId) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {activeWl.linkedMoodboardId && moodboardsDb && (() => { const mb = moodboardsDb.find(m => m.id === activeWl.linkedMoodboardId); return mb ? <span style={{ fontSize: 9, fontWeight: 700, color: "#7c6fe0", background: "#f0f4ff", border: "1px solid #c4b0f0", borderRadius: 100, padding: "2px 8px" }}>{mb.name || "Board"}</span> : null; })()}
                    {activeWl.linkedLookbookId && lookbooksDb && (() => { const lb = lookbooksDb.find(l => l.id === activeWl.linkedLookbookId); return lb ? <span style={{ fontSize: 9, fontWeight: 700, color: "#2bafd4", background: "#f0fbff", border: "1px solid #a8d8e8", borderRadius: 100, padding: "2px 8px" }}>{lb.name}</span> : null; })()}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditingWlId(activeWl.id)} style={{ flex: 1, padding: "6px 0", background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, color: "#666", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Edit</button>
                  <button onClick={() => { if (window.confirm("Delete this list? Items stay in All Items.")) { saveWishlistsMeta(wishlistsDb.filter(w => w.id !== activeWishlistId)); setActiveWishlistId(null); }}} style={{ flex: 1, padding: "6px 0", background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, color: "#e05555", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Delete</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right: items area ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select value={wlSort} onChange={e => setWlSort(e.target.value)} className="pill-select">
            <option value="priority">Priority</option>
            <option value="added">Date Added</option>
            <option value="store">Store</option>
            <option value="category">Category</option>
            <option value="price">Price ↓</option>
          </select>
          {wlCategories.length > 1 && (
            <select value={wlSortCat} onChange={e => setWlSortCat(e.target.value)} className="pill-select">
              <option value="All">All Categories</option>
              {wlCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {wlStoreFilter !== "All" && (() => {
            const STORE_URLS = {
              "abercrombie": "https://www.abercrombie.com/shop/us",
              "banana republic factory": "https://bananarepublicfactory.gapfactory.com/",
              "amazon": "https://www.amazon.com/",
              "zara": "https://www.zara.com/us/",
            };
            const storeUrl = STORE_URLS[wlStoreFilter.toLowerCase()] || `https://www.google.com/search?q=${encodeURIComponent(wlStoreFilter)}+official+site`;
            return (
              <a href={storeUrl} target="_blank" rel="noreferrer"
                style={{ padding: "7px 13px", background: "#1a1a1a", borderRadius: 100, display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {wlStoreFilter}
              </a>
            );
          })()}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <SvgBox size={11} color="#bbb" />
            <input type="range" min={160} max={300} step={10} value={wlZoom || 210} onChange={e => setWlZoom && setWlZoom(Number(e.target.value))}
              style={{ width: 72, accentColor: "#1a1a1a", cursor: "pointer" }} />
            <SvgBox size={16} color="#bbb" />
          </div>
        </div>

        {/* Bulk action bar */}
        {wlSelectMode && wlSelected.size > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, padding: "10px 14px", background: "#fff", borderRadius: 14, border: "1.5px solid #e8e4dc", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{wlSelected.size} selected</span>
            <button onClick={bulkMarkPurchased} style={{ padding: "6px 14px", background: "#f0faf4", border: "1.5px solid #b6e8c8", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#2d6a3f", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
              <SvgShop size={12} color="#2d6a3f" />Purchased
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowBulkMoveDropdown(v => !v)} style={{ padding: "6px 14px", background: "#f0f4ff", border: "1.5px solid #c4b0f0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#7c6fe0", fontFamily: "'DM Sans', sans-serif" }}>
                Move to List ▾
              </button>
              {showBulkMoveDropdown && (
                <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 100, background: "#fff", borderRadius: 12, border: "1px solid #e8e4dc", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 170, overflow: "hidden" }}
                  onMouseLeave={() => setShowBulkMoveDropdown(false)}>
                  <button onClick={() => { bulkMoveToList(null); setShowBulkMoveDropdown(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: "transparent", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer" }}>All Items (unassigned)</button>
                  {wishlistsDb.map(wl => (
                    <button key={wl.id} onClick={() => { bulkMoveToList(wl.id); setShowBulkMoveDropdown(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: "transparent", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer" }}>{wl.name}</button>
                  ))}
                  <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #f0ece6" }} />
                  <button onClick={() => { const name = window.prompt("New list name:"); if (!name?.trim()) { setShowBulkMoveDropdown(false); return; } const wl = { id: Date.now().toString(36), name: name.trim() }; saveWishlistsMeta([...wishlistsDb, wl]); bulkMoveToList(wl.id); setShowBulkMoveDropdown(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: "transparent", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#1a1a1a", cursor: "pointer" }}>+ New List</button>
                </div>
              )}
            </div>
            <button onClick={bulkDelete} style={{ padding: "6px 14px", background: "#fef2f2", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
              <SvgTrash size={12} color="#e05555" />Delete
            </button>
            <button onClick={() => setWlSelected(new Set(sortedItems.map(i => i.id)))} style={{ padding: "6px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Select All</button>
            <button onClick={() => setWlSelected(new Set())} style={{ padding: "6px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Deselect All</button>
          </div>
        )}

        {sortedItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            {wishlistDb.rows.length === 0 ? (<>
              <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
                <rect width="88" height="88" rx="26" fill="#fff0f5"/>
                <path d="M44 58l-2.4-2.18C32 47.2 26 42.5 26 36.5 26 31.26 30.18 27 35.3 27c2.9 0 5.68 1.35 7.7 3.48C45.02 28.35 47.8 27 50.7 27 55.82 27 60 31.26 60 36.5c0 6-6 10.7-15.6 19.32L44 58z" fill="none" stroke="#e05588" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="62" cy="27" r="7" fill="#e05588" opacity="0.9"/>
                <path d="M59.5 27l1.7 1.7 3.3-3.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 10 }}>Your wishlist is empty</div>
              <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.8, maxWidth: 300, margin: "0 auto 24px" }}>Save things you're coveting before you buy — track prices, set priorities, and move them to your closet when they're yours.</div>
              <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
                {[["🏷️","Track prices"],["⭐","Set priorities"],["✓","Move to closet when bought"]].map(([icon, label]) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 22 }}>{icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb" }}>{label}</div>
                  </div>
                ))}
              </div>
            </>) : (
              <div style={{ fontSize: 14, color: "#bbb", fontWeight: 600 }}>No items in this list yet</div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${wlZoom || 210}px, 1fr))`, gap: 16 }}>
            {sortedItems.map((item, i) => {
              const pm = priorityMeta[item.priority] || null;
              const isDraggingOver = dragOverItemId === item.id;
              const isSelected = wlSelected.has(item.id);
              return (
                <div key={item.id}
                  draggable={!wlSelectMode}
                  onDragStart={() => !wlSelectMode && handleDragStart(item.id)}
                  onDragEnter={() => !wlSelectMode && handleDragEnter(item.id)}
                  onDragEnd={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  className="item-card wl-card fade-up"
                  onClick={() => { if (wlSelectMode) { toggleSelect(item.id); return; } onItemClick && onItemClick(item); }}
                  style={{
                    animationDelay: `${i * 0.04}s`, opacity: 0, background: "#fff",
                    border: isSelected ? "2px solid #2d6a3f" : isDraggingOver ? "2px dashed #888" : `1px solid ${pm ? pm.border : "#ece8e0"}`,
                    position: "relative", cursor: wlSelectMode ? "pointer" : "grab",
                    transform: isDraggingOver ? "scale(1.02)" : "scale(1)", transition: "transform 0.1s",
                  }}>
                  {/* Multi-select checkbox */}
                  {wlSelectMode && (
                    <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, width: 22, height: 22, borderRadius: "50%", background: isSelected ? "#2d6a3f" : "rgba(255,255,255,0.9)", border: `2px solid ${isSelected ? "#2d6a3f" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                      {isSelected && <SvgCheck size={12} color="#fff" />}
                    </div>
                  )}
                  {/* Image */}
                  <div className="wl-card-img" style={{ width: "100%", aspectRatio: "1/1", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 6 }} />
                      : <SvgHeart size={26} color="#ccc" style={{ opacity: 0.3 }} />
                    }
                    {pm && <div style={{ position: "absolute", top: 7, left: 7, fontSize: 9, fontWeight: 700, color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`, borderRadius: 100, padding: "2px 7px" }}>{item.priority}</div>}
                    {item.reason && reasonMeta[item.reason] && <div style={{ position: "absolute", top: 7, right: 7, fontSize: 9, fontWeight: 700, color: reasonMeta[item.reason].color, background: reasonMeta[item.reason].bg, border: `1px solid ${reasonMeta[item.reason].border}`, borderRadius: 100, padding: "2px 7px" }}>{reasonMeta[item.reason].label}</div>}
                    <button onClick={e => { e.stopPropagation(); onEdit(item); }} className="item-card-edit-btn"
                      style={{ position: "absolute", bottom: 7, right: 7, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", opacity: 0 }}>
                      <SvgEdit size={12} color="#555" />
                    </button>
                  </div>
                  {/* Label + hover action row */}
                  <div className="item-card-label">
                    <div className="item-card-name">{item.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                      {item.price
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{/^\$/.test(item.price) ? item.price : `$${item.price}`}</span>
                        : <span style={{ fontSize: 11, color: "#c0b8b0" }}>{item.brand || item.category || ""}</span>
                      }
                      {item.store && <span style={{ fontSize: 10, color: "#1a1a1a", fontWeight: 600 }}>{item.store}</span>}
                    </div>
                    {/* Action row — collapses to 0 at rest, expands on hover */}
                    <div className="wl-card-actions" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="Buy"
                          style={{ width: 30, height: 30, borderRadius: 8, background: "#f5f2ed", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                          <SvgCart size={13} color="#555" />
                        </a>
                      )}
                      <button onClick={e => { e.stopPropagation(); openPurchaseModal(item); }} title="Mark as purchased"
                        style={{ width: 30, height: 30, borderRadius: 8, background: "#f0faf4", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <SvgShop size={13} color="#3aaa6e" />
                      </button>
                      {onCreateLook && (
                        <button onClick={e => { e.stopPropagation(); onCreateLook(item); }} title="Create look"
                          style={{ width: 30, height: 30, borderRadius: 8, background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <SvgHanger size={13} color="#555" />
                        </button>
                      )}
                      <div style={{ flex: 1 }} />
                      <button onClick={e => { e.stopPropagation(); wishlistDb.remove(item.id); }} title="Delete"
                        style={{ width: 30, height: 30, borderRadius: 8, background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <SvgTrash size={13} color="#e05555" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right panel: Stores filter ── */}
      {wlStores.length > 0 && (
        <div style={{ width: 272, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #ece8e0", padding: "6px" }}>
            <div style={{ padding: "8px 14px 6px", fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em" }}>Stores</div>
            {wlStores.map(store => (
              <button key={store} onClick={() => setWlStoreFilter(s => s === store ? "All" : store)}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: wlStoreFilter === store ? 700 : 500,
                  background: wlStoreFilter === store ? "#1a1a1a" : "transparent",
                  color: wlStoreFilter === store ? "#fff" : "#555",
                  display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s",
                }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{store}</span>
                <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>{wishlistDb.rows.filter(i => (i.store || "") === store).length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Purchase modal ── */}
      {purchaseItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
          onClick={() => setPurchaseItem(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: "28px 28px 24px", width: 340, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Mark as Purchased</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}><strong style={{ color: "#1a1a1a" }}>{purchaseItem.name}</strong> will move to your closet.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Purchase Date</label>
                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Final Price Paid</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#888", fontWeight: 600 }}>$</span>
                  <input type="number" min="0" step="0.01" value={purchaseFinalPrice} onChange={e => setPurchaseFinalPrice(e.target.value)}
                    placeholder={purchaseItem.price ? purchaseItem.price.replace(/[^0-9.]/g,"") : "0.00"}
                    style={{ width: "100%", padding: "9px 12px 9px 24px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {purchaseItem.link && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: "#faf9f6", borderRadius: 10 }}>
                  <input type="checkbox" checked={purchaseKeepLink} onChange={e => setPurchaseKeepLink(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1a1a1a" }} />
                  <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Keep product link in closet</span>
                </label>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={confirmPurchase}
                style={{ flex: 1, padding: "11px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                Move to Closet
              </button>
              <button onClick={() => setPurchaseItem(null)}
                style={{ padding: "11px 16px", background: "#f5f3ef", color: "#888", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seller Dashboard ──────────────────────────────────────────────────────────
const SALE_STATUSES = ["draft", "listed", "pending", "sold", "archived"];
const SALE_STATUS_META = {
  draft:    { label: "Draft",    bg: "#f5f3ef", color: "#888",    border: "#e0dbd0" },
  listed:   { label: "Listed",   bg: "#f0faf4", color: "#2d6a3f", border: "#b6e8c8" },
  pending:  { label: "Pending",  bg: "#fff8ee", color: "#a07000", border: "#f5c842" },
  sold:     { label: "Sold",     bg: "#f5f0ff", color: "#7c6fe0", border: "#c4b0f0" },
  archived: { label: "Archived", bg: "#f5f3ef", color: "#aaa",    border: "#e0dbd0" },
};

const PLATFORM_FEE_CALC = {
  "Poshmark":  (p) => p >= 15 ? p * 0.20 : 2.95,
  "Depop":     (p) => p * 0.10,
  "Mercari":   (p) => p * 0.10,
  "eBay":      (p) => p * 0.1295,
  "ThredUp":   () => 0,
  "Facebook":  (p) => p * 0.05,
  "Vinted":    () => 0,
  "Instagram": (p) => p * 0.05,
  "Other":     () => 0,
};
const PLATFORM_FEE_LABELS = {
  "Poshmark": "20% (or $2.95 flat under $15)",
  "Depop": "10%", "Mercari": "10%", "eBay": "12.95%",
  "ThredUp": "Variable (they set price)", "Facebook": "5% (shipping orders)",
  "Vinted": "Buyer pays fee", "Instagram": "5%", "Other": "—",
};

const CONDITION_BADGE = {
  "New with tags": { bg: "#f0faf4", color: "#2d6a3f", border: "#b6e8c8" },
  "Like new":      { bg: "#f5f0ff", color: "#7c6fe0", border: "#c4b0f0" },
  "Good":          { bg: "#fff8ee", color: "#a07000", border: "#f5c842" },
  "Fair":          { bg: "#fef2f2", color: "#e05555", border: "#fca5a5" },
  "Poor":          { bg: "#f5f3ef", color: "#aaa",    border: "#e0dbd0" },
};

const getDaysListed = (item) => {
  if (!item.listedDate) return null;
  return Math.floor((Date.now() - new Date(item.listedDate + "T00:00:00")) / 86400000);
};
const getDaysBadgeStyle = (days) => {
  if (days < 14) return { color: "#2d6a3f", bg: "#f0faf4" };
  if (days < 30) return { color: "#a07000", bg: "#fff8ee" };
  return { color: "#e05555", bg: "#fef2f2" };
};

function SellerDashboard({ itemsDb, allClosetItems, onViewItem }) {
  const forSaleItems = itemsDb.rows.filter(i => i.forSale);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [viewMode, setViewMode] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [genLoading, setGenLoading] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkSelected, setBulkSelectedLocal] = useState(new Set());
  const [bulkPlatform, setBulkPlatform] = useState("");
  const [bulkCondition, setBulkCondition] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceSelected, setBulkPriceSelected] = useState(new Set());
  const [bulkDiscountPct, setBulkDiscountPct] = useState(10);
  const [soldConfirmItem, setSoldConfirmItem] = useState(null);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldPlatform, setSoldPlatform] = useState("");
  const [soldShipping, setSoldShipping] = useState("");
  const [soldDate, setSoldDate] = useState(new Date().toISOString().slice(0, 10));
  const [soldRemoveFromCloset, setSoldRemoveFromCloset] = useState(true);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [gridEditItem, setGridEditItem] = useState(null);

  // Stats (moved here from right-rail)
  const listed = forSaleItems.filter(i => i.saleStatus === "listed" || !i.saleStatus).length;
  const pending = forSaleItems.filter(i => i.saleStatus === "pending").length;
  const drafts = forSaleItems.filter(i => i.saleStatus === "draft").length;
  const sold = forSaleItems.filter(i => i.saleStatus === "sold").length;
  const totalEarned = forSaleItems.filter(i => i.saleStatus === "sold")
    .reduce((s, i) => s + (parseFloat((i.netRevenue || i.salePrice || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const potentialEarnings = forSaleItems.filter(i => i.saleStatus !== "sold")
    .reduce((s, i) => s + (parseFloat((i.salePrice || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const totalSpent = itemsDb.rows.reduce((s, i) => s + (parseFloat((i.price||"").replace(/[^0-9.]/g,""))||0), 0);
  const earnedPct = totalSpent > 0 ? Math.min(100, (totalEarned / totalSpent) * 100) : 0;
  const soldWithDates = forSaleItems.filter(i => i.saleStatus === "sold" && i.soldDate && i.listedDate);
  const avgDaysToSell = soldWithDates.length > 0
    ? Math.round(soldWithDates.reduce((s, i) => s + Math.max(0, (new Date(i.soldDate) - new Date(i.listedDate)) / 86400000), 0) / soldWithDates.length)
    : null;
  const sellThrough = forSaleItems.length > 0 ? Math.round((sold / forSaleItems.length) * 100) : 0;

  const updateItem = (item, patch) => itemsDb.update({ ...item, ...patch });
  const moveBackToCloset = (item) => {
    itemsDb.update({ ...item, forSale: false, saleStatus: undefined, salePrice: undefined, salePlatform: undefined, saleNotes: undefined, saleUrl: undefined, saleDescription: undefined });
  };
  const openSoldConfirm = (item) => {
    setSoldConfirmItem(item); setSoldPrice(item.salePrice || ""); setSoldPlatform(item.salePlatform || "");
    setSoldShipping(""); setSoldDate(new Date().toISOString().slice(0, 10)); setSoldRemoveFromCloset(true);
  };
  const confirmSold = () => {
    if (!soldConfirmItem) return;
    const spNum = parseFloat(soldPrice || 0) || 0;
    const shipNum = parseFloat(soldShipping || 0) || 0;
    const feeCalc = PLATFORM_FEE_CALC[soldPlatform];
    const platformFee = feeCalc ? feeCalc(spNum) : 0;
    updateItem(soldConfirmItem, { saleStatus: "sold", soldDate, salePrice: soldPrice, salePlatform: soldPlatform, shippingCost: soldShipping, netRevenue: String(spNum - shipNum - platformFee), ...(soldRemoveFromCloset ? { forSale: false } : {}) });
    setSoldConfirmItem(null);
  };
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditVals({ salePrice: item.salePrice || "", salePlatform: item.salePlatform || "", saleCondition: item.saleCondition || "", saleNotes: item.saleNotes || "", saleStatus: item.saleStatus || "listed", saleUrl: item.saleUrl || "", saleDescription: item.saleDescription || "" });
  };
  const saveEdit = (item) => { updateItem(item, editVals); setEditingId(null); };
  const generateDescription = async (item) => {
    const apiKey = process.env.REACT_APP_ANTHROPIC_KEY || "";
    if (!apiKey) { alert("No API key configured (REACT_APP_ANTHROPIC_KEY)"); return; }
    setGenLoading(item.id);
    try {
      const prompt = `Write a short, engaging resale listing description for this clothing item. Be specific, appealing, and honest. Keep it under 80 words.\n- Name: ${item.name}\n- Brand: ${item.brand || "N/A"}\n- Category: ${item.category || ""}\n- Color: ${item.color || ""}\n- Size: ${item.size || ""}\n- Condition: ${item.saleCondition || "Good"}\n- Original price: ${item.price || ""}\n- Notes: ${item.notes || ""}\nOutput only the description text, no labels or headers.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 200, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const desc = data?.content?.[0]?.text?.trim() || "";
      if (desc) setEditVals(v => ({ ...v, saleDescription: desc }));
    } catch (e) { console.error("Generate description error:", e); }
    setGenLoading(null);
  };

  const sortedFiltered = (() => {
    const base = forSaleItems.filter(i => {
      const matchStatus = statusFilter === "all" || (i.saleStatus || "listed") === statusFilter;
      const q = search.trim().toLowerCase();
      return matchStatus && (!q || i.name.toLowerCase().includes(q) || (i.brand || "").toLowerCase().includes(q));
    });
    return [...base].sort((a, b) => {
      if (sortBy === "price") return (parseFloat((b.salePrice||"").replace(/[^0-9.]/g,""))||0) - (parseFloat((a.salePrice||"").replace(/[^0-9.]/g,""))||0);
      if (sortBy === "days") return (getDaysListed(b) ?? -1) - (getDaysListed(a) ?? -1);
      if (sortBy === "status") return SALE_STATUSES.indexOf(a.saleStatus||"listed") - SALE_STATUSES.indexOf(b.saleStatus||"listed");
      return (b.listedDate || b.id || "").localeCompare(a.listedDate || a.id || "");
    });
  })();

  const PLATFORMS = ["Depop", "Poshmark", "eBay", "Mercari", "ThredUp", "Facebook", "Instagram", "Vinted", "Other"];
  const closetOnlyItems = (allClosetItems || itemsDb.rows).filter(i => !i.forSale);
  const bulkFiltered = closetOnlyItems.filter(i => !bulkSearch || i.name.toLowerCase().includes(bulkSearch.toLowerCase()));
  const applyBulkList = () => {
    if (bulkSelected.size === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    bulkSelected.forEach(id => { const item = closetOnlyItems.find(i => i.id === id); if (item) itemsDb.update({ ...item, forSale: true, saleStatus: "listed", listedDate: today, salePlatform: bulkPlatform || undefined, saleCondition: bulkCondition || undefined, salePrice: bulkPrice || undefined }); });
    setShowBulkModal(false); setBulkSelectedLocal(new Set()); setBulkSearch(""); setBulkPlatform(""); setBulkCondition(""); setBulkPrice("");
  };
  const applyBulkPrice = () => {
    if (bulkPriceSelected.size === 0) return;
    const factor = 1 - (bulkDiscountPct / 100);
    bulkPriceSelected.forEach(id => { const item = forSaleItems.find(i => i.id === id); if (!item) return; const current = parseFloat((item.salePrice || "").replace(/[^0-9.]/g, "")) || 0; if (current > 0) itemsDb.update({ ...item, salePrice: String(Math.round(current * factor)) }); });
    setShowBulkPriceModal(false); setBulkPriceSelected(new Set()); setBulkDiscountPct(10);
  };
  const activePriceItems = forSaleItems.filter(i => (i.saleStatus === "listed" || i.saleStatus === "pending") && parseFloat((i.salePrice || "").replace(/[^0-9.]/g, "")) > 0);

  // Shared edit form fields (used in both list inline + grid modal)
  const editFormFields = (genItem) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={editVals.salePrice} onChange={e => setEditVals(v => ({ ...v, salePrice: e.target.value }))} placeholder="Sale price"
          style={{ flex: 1, padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
        <select value={editVals.salePlatform} onChange={e => setEditVals(v => ({ ...v, salePlatform: e.target.value }))}
          style={{ flex: 1, padding: "7px 32px 7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundColor: "#fff" }}>
          <option value="">Platform…</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <select value={editVals.saleCondition} onChange={e => setEditVals(v => ({ ...v, saleCondition: e.target.value }))}
        style={{ padding: "7px 32px 7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundColor: "#fff" }}>
        <option value="">Condition…</option>
        {["New with tags", "Like new", "Good", "Fair", "Poor"].map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input value={editVals.saleUrl} onChange={e => setEditVals(v => ({ ...v, saleUrl: e.target.value }))} placeholder="Listing URL (e.g. depop.com/…)"
        style={{ padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
      <div style={{ position: "relative" }}>
        <textarea value={editVals.saleDescription} onChange={e => setEditVals(v => ({ ...v, saleDescription: e.target.value }))} placeholder="Listing description…" rows={3}
          style={{ width: "100%", padding: "7px 10px 28px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        <button onClick={() => generateDescription(genItem)} disabled={genLoading === genItem.id}
          style={{ position: "absolute", bottom: 7, right: 7, padding: "3px 10px", background: genLoading === genItem.id ? "#f0ece4" : "#1a1a1a", color: genLoading === genItem.id ? "#aaa" : "#fff", border: "none", borderRadius: 7, cursor: genLoading === genItem.id ? "not-allowed" : "pointer", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
          {genLoading === genItem.id ? "Generating…" : "✦ Generate"}
        </button>
      </div>
      <input value={editVals.saleNotes} onChange={e => setEditVals(v => ({ ...v, saleNotes: e.target.value }))} placeholder="Notes"
        style={{ padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
    </div>
  );

  // ── Left panel ──
  const leftPanel = (
    <div style={{ width: 210, flexShrink: 0, position: "sticky", top: 24, maxHeight: "calc(100vh - 48px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input className="closet-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" />
      </div>
      {/* Stats cards */}
      {forSaleItems.length > 0 && (<>
        <div className="right-card">
          <div className="right-card-title">Listings</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
            {[{ label: "Drafts", value: drafts, bg: "#f5f3ef", color: "#888" }, { label: "Listed", value: listed, bg: "#f0faf4", color: "#2d6a3f" }, { label: "Pending", value: pending, bg: "#fff8ee", color: "#a07000" }, { label: "Sold", value: sold, bg: "#f5f0ff", color: "#7c6fe0" }].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ background: "#fafaf8", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#2d6a3f" }}>{totalEarned > 0 ? `$${totalEarned.toFixed(0)}` : "—"}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em" }}>Earned</div>
            </div>
            <div style={{ background: "#fafaf8", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#888" }}>{potentialEarnings > 0 ? `$${potentialEarnings.toFixed(0)}` : "—"}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em" }}>Potential</div>
            </div>
          </div>
        </div>
        <div className="right-card">
          <div className="right-card-title">Performance</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#888" }}>Sell-through</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#7c6fe0" }}>{sellThrough}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 6, background: "#e8e4dc", overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", borderRadius: 6, background: "#7c6fe0", width: sellThrough + "%", transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#aaa" }}>{sold} of {forSaleItems.length} sold</div>
          {avgDaysToSell !== null && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0ece4", fontSize: 11, color: "#888" }}>
              Avg time to sell: <strong style={{ color: "#1a1a1a" }}>{avgDaysToSell}d</strong>
            </div>
          )}
        </div>
        {totalSpent > 0 && (
          <div className="right-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div className="right-card-title" style={{ marginBottom: 0 }}>Wardrobe Payback</div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#7c6fe0" }}>{earnedPct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 8, background: "#e8e4dc", overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", borderRadius: 8, background: "linear-gradient(90deg, #7c6fe0, #3aaa6e)", width: earnedPct + "%", transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#aaa" }}>Sold: <strong style={{ color: "#2d6a3f" }}>${totalEarned.toFixed(0)}</strong></span>
              <span style={{ fontSize: 10, color: "#aaa" }}>Spent: <strong style={{ color: "#1a1a1a" }}>${totalSpent.toFixed(0)}</strong></span>
            </div>
          </div>
        )}
      </>)}
    </div>
  );

  // ── Top toolbar ──
  const topBar = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
        {[["all", "All"], ...SALE_STATUSES.map(s => [s, SALE_STATUS_META[s].label])].map(([val, lbl]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            style={{ padding: "5px 13px", border: "1.5px solid", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s",
              background: statusFilter === val ? "#1a1a1a" : "#f5f3ef",
              borderColor: statusFilter === val ? "#1a1a1a" : "#e8e4dc",
              color: statusFilter === val ? "#fff" : "#777" }}>
            {lbl}
          </button>
        ))}
      </div>
      {/* Sort */}
      <select value={sortBy} onChange={e => setSortBy(e.target.value)}
        style={{ padding: "6px 32px 6px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", cursor: "pointer", color: "#555", appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundColor: "#faf9f6" }}>
        <option value="dateAdded">Date Added</option>
        <option value="days">Days Listed</option>
        <option value="price">Price ↓</option>
        <option value="status">Status</option>
      </select>
      {/* View toggle */}
      <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2 }}>
        {[
          ["list", <svg key="l" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>],
          ["grid", <svg key="g" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>],
        ].map(([mode, icon]) => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: "5px 8px", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === mode ? "#fff" : "transparent", color: viewMode === mode ? "#1a1a1a" : "#bbb", boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{icon}</button>
        ))}
      </div>
      {/* Bulk Actions */}
      <div style={{ position: "relative" }}>
        {showBulkMenu && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowBulkMenu(false)} />}
        <button onClick={() => setShowBulkMenu(v => !v)}
          style={{ padding: "6px 13px", background: "#f5f3ef", border: "1.5px solid #e8e4dc", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
          <span>Bulk Actions</span>
          <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
        </button>
        {showBulkMenu && (
          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#fff", border: "1.5px solid #e8e4dc", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 100, minWidth: 150 }}>
            <button onClick={() => { setShowBulkModal(true); setShowBulkMenu(false); }}
              style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#1a1a1a", textAlign: "left" }}>
              List from Closet
            </button>
            {activePriceItems.length > 0 && (
              <button onClick={() => { setShowBulkPriceModal(true); setShowBulkMenu(false); }}
                style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", borderTop: "1px solid #f0ece4", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#1a1a1a", textAlign: "left" }}>
                Adjust Prices
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {leftPanel}
      <div style={{ flex: 1, minWidth: 0 }}>
        {topBar}
        {/* Item list / grid */}
        {forSaleItems.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0 40px", gap: 14 }}>
            <HangerIcon size={40} color="#ddd" />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>No items listed for sale</div>
            <div style={{ fontSize: 13, color: "#aaa", textAlign: "center", maxWidth: 260 }}>Open any item in your closet and tap "List for Sale" to move it here, or use Bulk Actions to list multiple items.</div>
          </div>
        ) : sortedFiltered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc", fontSize: 13, fontWeight: 600 }}>No items match this filter</div>
        ) : viewMode === "grid" ? (
          /* ── GRID VIEW ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
            {sortedFiltered.map(item => {
              const status = item.saleStatus || "listed";
              const meta = SALE_STATUS_META[status] || SALE_STATUS_META.listed;
              const days = getDaysListed(item);
              const showDays = days !== null && (status === "listed" || status === "pending");
              const dayStyle = showDays ? getDaysBadgeStyle(days) : null;
              const salePrice = parseFloat((item.salePrice || "").replace(/[^0-9.]/g, "")) || 0;
              return (
                <div key={item.id} style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1.5px solid #e8e4dc", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 12, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: meta.color }}>{meta.label}</div>
                  {showDays && <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2, background: dayStyle.bg, borderRadius: 12, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: dayStyle.color }}>{days}d</div>}
                  <div onClick={() => onViewItem(item)} style={{ aspectRatio: "1/1", background: "#f8f6f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} /> : <HangerIcon size={28} color="#ddd" />}
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    {item.brand && <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>{item.brand}</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      {salePrice > 0 ? <span style={{ fontSize: 13, fontWeight: 800, color: "#2d6a3f" }}>${salePrice.toFixed(0)}</span> : <span style={{ fontSize: 11, color: "#ccc" }}>No price</span>}
                      {item.salePlatform && <span style={{ fontSize: 9, background: "#f5f2ed", borderRadius: 6, padding: "1px 6px", color: "#777", fontWeight: 600 }}>{item.salePlatform}</span>}
                    </div>
                    {item.saleCondition && CONDITION_BADGE[item.saleCondition] && (() => { const cb = CONDITION_BADGE[item.saleCondition]; return <div style={{ marginTop: 5, display: "inline-block", background: cb.bg, border: `1px solid ${cb.border}`, borderRadius: 8, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: cb.color }}>{item.saleCondition}</div>; })()}
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <button onClick={() => { startEdit(item); setGridEditItem(item); }} style={{ flex: 1, padding: "5px 0", background: "#f5f2ed", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <SvgEdit size={10} color="#555" /> Edit
                      </button>
                      {status !== "sold" && (
                        <button onClick={() => openSoldConfirm(item)} style={{ flex: 1, padding: "5px 0", background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#2563eb", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <SvgTag size={10} color="#2563eb" /> Sold
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedFiltered.map(item => {
              const status = item.saleStatus || "listed";
              const meta = SALE_STATUS_META[status] || SALE_STATUS_META.listed;
              const origPrice = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
              const salePrice = parseFloat((item.salePrice || "").replace(/[^0-9.]/g, "")) || 0;
              const isEditing = editingId === item.id;
              const days = getDaysListed(item);
              const showDays = days !== null && (status === "listed" || status === "pending");
              const dayStyle = showDays ? getDaysBadgeStyle(days) : null;
              return (
                <div key={item.id} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e8e4dc", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", display: "flex" }}>
                  <div onClick={() => onViewItem(item)} style={{ width: 100, flexShrink: 0, background: item.image ? `url(${item.image}) center/contain no-repeat #f8f6f2` : "#f8f6f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {!item.image && <HangerIcon size={28} color="#ddd" />}
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                        {item.brand && <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{item.brand}</div>}
                      </div>
                      <select value={status} onChange={e => { if (e.target.value === "sold") { openSoldConfirm(item); } else updateItem(item, { saleStatus: e.target.value, ...(e.target.value === "listed" ? { listedDate: item.listedDate || new Date().toISOString().slice(0,10) } : {}) }); }}
                        style={{ padding: "4px 32px 4px 10px", border: `1.5px solid ${meta.border}`, borderRadius: 20, color: meta.color, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", flexShrink: 0, appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center", backgroundColor: meta.bg }}>
                        {SALE_STATUSES.map(s => <option key={s} value={s}>{SALE_STATUS_META[s].label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {origPrice > 0 && <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>${origPrice.toFixed(0)}</span>}
                      {salePrice > 0 && <span style={{ fontSize: 14, fontWeight: 800, color: "#2d6a3f" }}>${salePrice.toFixed(0)}</span>}
                      {item.salePlatform && <span style={{ fontSize: 11, background: "#f5f2ed", borderRadius: 8, padding: "2px 8px", color: "#666", fontWeight: 600 }}>{item.salePlatform}</span>}
                      {origPrice > 0 && salePrice > 0 && origPrice > salePrice && <span style={{ fontSize: 11, color: "#e05555", fontWeight: 700 }}>-{Math.round((1 - salePrice/origPrice)*100)}%</span>}
                      {item.shippingCost && <span style={{ fontSize: 11, color: "#aaa" }}>ship: ${item.shippingCost}</span>}
                      {showDays && <span style={{ fontSize: 11, fontWeight: 700, color: dayStyle.color, background: dayStyle.bg, borderRadius: 8, padding: "2px 8px" }}>{days}d listed</span>}
                      {item.saleCondition && CONDITION_BADGE[item.saleCondition] && (() => { const cb = CONDITION_BADGE[item.saleCondition]; return <span style={{ fontSize: 11, fontWeight: 700, color: cb.color, background: cb.bg, border: `1px solid ${cb.border}`, borderRadius: 8, padding: "2px 8px" }}>{item.saleCondition}</span>; })()}
                    </div>
                    {isEditing ? (
                      <>
                        {editFormFields(item)}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => saveEdit(item)} style={{ flex: 1, padding: "7px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Save</button>
                          <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "7px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        {item.saleDescription && <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.saleDescription}</div>}
                        {item.saleUrl && <a href={item.saleUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#7c6fe0", textDecoration: "none", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>↗ View Listing</a>}
                        {item.saleNotes && <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>{item.saleNotes}</div>}
                        {item.soldDate && <div style={{ fontSize: 11, color: "#7c6fe0", fontWeight: 600 }}>Sold {new Date(item.soldDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{item.netRevenue ? ` · Net $${parseFloat(item.netRevenue).toFixed(0)}` : ""}</div>}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                          <button onClick={() => startEdit(item)} style={{ padding: "5px 11px", background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                            <SvgEdit size={11} color="#555" /> Edit
                          </button>
                          {status !== "sold" && (
                            <button onClick={() => openSoldConfirm(item)} style={{ padding: "5px 11px", background: "#eff6ff", border: "1.5px solid #93c5fd", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#2563eb", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                              <SvgTag size={11} color="#2563eb" /> Mark Sold
                            </button>
                          )}
                          {status === "draft" && (
                            <button onClick={() => updateItem(item, { saleStatus: "listed", listedDate: new Date().toISOString().slice(0,10) })} style={{ padding: "5px 11px", background: "#f0faf4", border: "1.5px solid #b6e8c8", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#2d6a3f", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                              → List Now
                            </button>
                          )}
                          <button onClick={() => moveBackToCloset(item)} style={{ padding: "5px 11px", background: "#f5f3ef", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#777", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                            <HangerIcon size={12} color="#999" /> Back to Closet
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk List Modal */}
      {showBulkModal && <BulkListModal items={bulkFiltered} search={bulkSearch} setSearch={setBulkSearch} selected={bulkSelected} setSelected={setBulkSelectedLocal} platform={bulkPlatform} setPlatform={setBulkPlatform} condition={bulkCondition} setCondition={setBulkCondition} price={bulkPrice} setPrice={setBulkPrice} platforms={PLATFORMS} onApply={applyBulkList} onClose={() => setShowBulkModal(false)} />}
      {/* Bulk Price Modal */}
      {showBulkPriceModal && <BulkPriceModal items={activePriceItems} selected={bulkPriceSelected} setSelected={setBulkPriceSelected} discountPct={bulkDiscountPct} setDiscountPct={setBulkDiscountPct} onApply={applyBulkPrice} onClose={() => { setShowBulkPriceModal(false); setBulkPriceSelected(new Set()); setBulkDiscountPct(10); }} />}

      {/* Grid Edit Modal */}
      {gridEditItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setGridEditItem(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: "24px", width: 420, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              {gridEditItem.image && <img src={gridEditItem.image} alt={gridEditItem.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", background: "#f8f6f2", border: "1px solid #e8e4dc" }} />}
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{gridEditItem.name}</div>
                {gridEditItem.brand && <div style={{ fontSize: 12, color: "#aaa" }}>{gridEditItem.brand}</div>}
              </div>
            </div>
            {editFormFields(gridEditItem)}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => { saveEdit(gridEditItem); setGridEditItem(null); }} style={{ flex: 1, padding: "10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Save</button>
              <button onClick={() => setGridEditItem(null)} style={{ padding: "10px 18px", background: "#f5f3ef", color: "#888", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sold Confirmation Modal */}
      {soldConfirmItem && (() => {
        const spNum = parseFloat(soldPrice || 0) || 0;
        const shipNum = parseFloat(soldShipping || 0) || 0;
        const feeCalc = PLATFORM_FEE_CALC[soldPlatform];
        const platformFee = feeCalc ? feeCalc(spNum) : 0;
        const netAfterAll = spNum - shipNum - platformFee;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setSoldConfirmItem(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: "28px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>🎉 Mark as Sold</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>{soldConfirmItem.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Final Sale Price</label>
                  <input value={soldPrice} onChange={e => setSoldPrice(e.target.value)} placeholder="e.g. 35" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Platform</label>
                  <select value={soldPlatform} onChange={e => setSoldPlatform(e.target.value)} style={{ width: "100%", padding: "9px 28px 9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none" }}>
                    <option value="">Select platform…</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {soldPlatform && PLATFORM_FEE_LABELS[soldPlatform] && <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>Fee: {PLATFORM_FEE_LABELS[soldPlatform]}</div>}
                </div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Shipping Cost</label>
                  <input value={soldShipping} onChange={e => setSoldShipping(e.target.value)} placeholder="e.g. 4.50" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Date Sold</label>
                  <input type="date" value={soldDate} onChange={e => setSoldDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
                {spNum > 0 && (
                  <div style={{ background: "#f0faf4", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: 6, fontWeight: 700 }}>Earnings Breakdown</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555" }}><span>Sale price</span><span style={{ fontWeight: 700 }}>${spNum.toFixed(2)}</span></div>
                      {shipNum > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}><span>Shipping</span><span>-${shipNum.toFixed(2)}</span></div>}
                      {platformFee > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}><span>{soldPlatform} fee</span><span>-${platformFee.toFixed(2)}</span></div>}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2d6a3f", fontWeight: 800, borderTop: "1px solid #d8f0e4", paddingTop: 6, marginTop: 2 }}><span>Net earnings</span><span>${netAfterAll.toFixed(2)}</span></div>
                    </div>
                  </div>
                )}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={soldRemoveFromCloset} onChange={e => setSoldRemoveFromCloset(e.target.checked)} style={{ width: 15, height: 15, accentColor: "#7c6fe0", cursor: "pointer" }} />
                <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>Remove from my active closet</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={confirmSold} style={{ flex: 1, padding: "11px", background: "#7c6fe0", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Confirm Sale</button>
                <button onClick={() => setSoldConfirmItem(null)} style={{ padding: "11px 18px", background: "#f5f3ef", color: "#888", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function BulkListModal({ items, search, setSearch, selected, setSelected, platform, setPlatform, condition, setCondition, price, setPrice, platforms, onApply, onClose }) {
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, width: "min(720px, 95vw)", maxHeight: "86vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #e8e4dc" }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Bulk List from Closet</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>Select items to list, then apply shared settings.</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search closet…"
            style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        {/* Item grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#bbb" }}>No closet items found</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {items.map(item => {
                const isSelected = selected.has(item.id);
                return (
                  <div key={item.id} onClick={() => toggle(item.id)} style={{ border: `2px solid ${isSelected ? "#7c6fe0" : "#e8e4dc"}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", background: isSelected ? "#f5f0ff" : "#fff", transition: "all 0.1s", position: "relative" }}>
                    {isSelected && <div style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: "50%", background: "#7c6fe0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}><SvgCheck size={10} color="#fff" /></div>}
                    <div style={{ width: "100%", aspectRatio: "1/1", background: "#f7f5f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : <HangerIcon size={22} color="#ddd" />}
                    </div>
                    <div style={{ padding: "6px 8px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      {item.price && <div style={{ fontSize: 10, color: "#aaa" }}>{item.price}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Shared settings + apply */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e8e4dc" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Shared Settings (optional)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ flex: 1, minWidth: 120, padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
              <option value="">Platform…</option>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={condition} onChange={e => setCondition(e.target.value)} style={{ flex: 1, minWidth: 120, padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
              <option value="">Condition…</option>
              {["New with tags", "Like new", "Good", "Fair", "Poor"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Default price…"
              style={{ flex: 1, minWidth: 100, padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#888", flex: 1 }}>{selected.size} item{selected.size !== 1 ? "s" : ""} selected</span>
            <button onClick={onClose} style={{ padding: "9px 18px", background: "#f5f3ef", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#888" }}>Cancel</button>
            <button onClick={onApply} disabled={selected.size === 0} style={{ padding: "9px 22px", background: selected.size > 0 ? "#1a1a1a" : "#e0dbd2", color: "#fff", border: "none", borderRadius: 10, cursor: selected.size > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700 }}>
              List {selected.size > 0 ? selected.size : ""} Item{selected.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkPriceModal({ items, selected, setSelected, discountPct, setDiscountPct, onApply, onClose }) {
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i => i.id)));
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, width: "min(560px, 95vw)", maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #e8e4dc" }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Bulk Price Editor</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>Drop prices on selected listings by a percentage.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>Discount %</label>
            <input type="number" min={1} max={90} value={discountPct} onChange={e => setDiscountPct(Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: 70, padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 13, color: "#888" }}>off current price</span>
            <button onClick={toggleAll} style={{ marginLeft: "auto", padding: "5px 12px", background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
              {selected.size === items.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>
        {/* Items list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(item => {
            const isSelected = selected.has(item.id);
            const currentPrice = parseFloat((item.salePrice || "").replace(/[^0-9.]/g, "")) || 0;
            const newPrice = Math.round(currentPrice * (1 - discountPct / 100));
            return (
              <div key={item.id} onClick={() => toggle(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: `1.5px solid ${isSelected ? "#7c6fe0" : "#e8e4dc"}`, borderRadius: 12, cursor: "pointer", background: isSelected ? "#f5f0ff" : "#fff", transition: "all 0.1s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: item.image ? `url(${item.image}) center/contain no-repeat #f8f6f2` : "#f8f6f2", flexShrink: 0, border: "1px solid #e8e4dc" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  {item.salePlatform && <div style={{ fontSize: 10, color: "#aaa" }}>{item.salePlatform}</div>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, color: "#bbb", textDecoration: "line-through", fontWeight: 600 }}>${currentPrice.toFixed(0)}</div>
                  {isSelected && <div style={{ fontSize: 14, fontWeight: 800, color: "#2d6a3f" }}>${newPrice.toFixed(0)}</div>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? "#7c6fe0" : "#ddd"}`, background: isSelected ? "#7c6fe0" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isSelected && <SvgCheck size={10} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e8e4dc", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#888", flex: 1 }}>{selected.size} item{selected.size !== 1 ? "s" : ""} selected</span>
          <button onClick={onClose} style={{ padding: "9px 18px", background: "#f5f3ef", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#888" }}>Cancel</button>
          <button onClick={onApply} disabled={selected.size === 0} style={{ padding: "9px 22px", background: selected.size > 0 ? "#7c6fe0" : "#e0dbd2", color: "#fff", border: "none", borderRadius: 10, cursor: selected.size > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700 }}>
            Apply -{discountPct}%
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Moodboard ─────────────────────────────────────────────────────────────────
// ── MoodboardInfoPanel — reads active board from Moodboard via localStorage ──
function MoodboardInfoPanel({ activeIdx, setActiveIdx, boards: boardsProp, updateBoards, updateBoardById, removeBoardById, lookbooksDb, createLookbook, addMoodboardToLookbook, onGoToLookbook, closetItems }) {
  const ARCHIVE_KEY = "wardrobe_moodboards_archived_v1";

  const data = boardsProp || [];
  const save = (updated) => { if (updateBoards) updateBoards(updated); };

  const [hexInput, setHexInput] = useState("");
  const [editingColorIdx, setEditingColorIdx] = useState(null);
  const [newLbNameInput, setNewLbNameInput] = useState("");
  const [lbAction, setLbAction] = useState(null); // "add" | "create"
  const [selectedLbId, setSelectedLbId] = useState("");
  const [lbFeedback, setLbFeedback] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  // Reset UI state when switching boards
  useEffect(() => { setLbAction(null); setSelectedLbId(""); }, [activeIdx]);

  const board = data[activeIdx] || null;
  const palette = board?.palette || [];

  // linkedLb derived from board — persisted via updateBoardById to avoid stale closures
  const linkedLb = board?.linkedLb || null;
  const setLinkedLb = (lb) => {
    if (board?.id && updateBoardById) updateBoardById(board.id, { linkedLb: lb });
  };

  const updatePalette = (p) => save(data.map((b,i) => i===activeIdx ? {...b, palette:p} : b));
  const addColor = () => { if (palette.length >= 10) return; updatePalette([...palette, "#e8e4dc"]); };
  const removeColor = (idx) => { updatePalette(palette.filter((_,i)=>i!==idx)); if(editingColorIdx===idx) setEditingColorIdx(null); };
  const updateColor = (idx, val) => updatePalette(palette.map((c,i)=>i===idx?val:c));
  const normalizeHex = (val) => {
    const clean = val.replace(/[^0-9a-fA-F]/g,"");
    if(clean.length===3) return "#"+clean.split("").map(c=>c+c).join("");
    if(clean.length===6) return "#"+clean;
    return null;
  };

  const generatePalette = () => {
    if (!board) return;
    const imageItems = (board.items||[]).filter(i=>i.type!=="text"&&i.src);
    if (imageItems.length===0) return;
    const buckets = {};
    let pending = imageItems.length;
    const finish = () => {
      if (--pending > 0) return;
      const sorted = Object.entries(buckets).sort((a,b)=>b[1]-a[1]);
      const colors = sorted.slice(0,6).map(([hex])=>hex);
      if (colors.length > 0) save(data.map((b,i)=>i===activeIdx?{...b,palette:colors}:b));
    };
    imageItems.forEach(item => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const c = document.createElement("canvas"); c.width=40; c.height=40;
            const ctx = c.getContext("2d"); ctx.drawImage(img,0,0,40,40);
            const data2 = ctx.getImageData(0,0,40,40).data;
            for (let p=0;p<data2.length;p+=16) {
              const r=Math.round(data2[p]/32)*32, g=Math.round(data2[p+1]/32)*32, b=Math.round(data2[p+2]/32)*32, a=data2[p+3];
              if (a<128) continue;
              if (r>220&&g>220&&b>220) continue;
              if (r<20&&g<20&&b<20) continue;
              const hex=`#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
              buckets[hex]=(buckets[hex]||0)+1;
            }
          } catch {}
          finish();
        };
        img.onerror = finish;
        img.src = item.src;
      } catch { finish(); }
    });
  };

  const closetSuggestions = (() => {
    if (!board?.palette?.length || !(closetItems||[]).length) return [];
    const paletteHexes = board.palette.map(h=>h.toLowerCase());
    const colorNameToHues = {
      "black":["#000","#1a1a1a","#202020"],"white":["#fff","#ffffff","#f0f0f0"],
      "red":["#c00","#e00","#c80"],"pink":["#f080a0","#e06080","#e0a0b0"],
      "orange":["#e06000","#e08000","#f0a000"],"yellow":["#e0e000","#f0c000","#e0c000"],
      "green":["#008000","#406040","#608060","#204020"],"blue":["#0060c0","#2060c0","#4080e0"],
      "navy":["#002060","#002040","#203060"],"purple":["#800080","#6040a0","#8060c0"],
      "brown":["#604020","#805040","#a06040"],"beige":["#e0d0a0","#d0c080","#c0b060"],
      "gray":["#808080","#a0a0a0","#606060"],"grey":["#808080","#a0a0a0","#606060"],
      "cream":["#f0e8c0","#e8dca0","#e0d080"],"tan":["#c0a060","#d0b060","#c0a040"],
    };
    return (closetItems||[]).filter(item=>{
      if (!item.image||!item.color) return false;
      const colorKey = item.color.toLowerCase();
      const hues = colorNameToHues[colorKey]||[];
      return paletteHexes.some(ph=>hues.some(h=>{
        const r1=parseInt(ph.slice(1,3)||"00",16),g1=parseInt(ph.slice(3,5)||"00",16),b1=parseInt(ph.slice(5,7)||"00",16);
        const r2=parseInt(h.slice(1,3)||"00",16),g2=parseInt(h.slice(3,5)||"00",16),b2=parseInt(h.slice(5,7)||"00",16);
        return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2)<120;
      }));
    }).slice(0,8);
  })();

  const archiveBoard = () => {
    if (!board) return;
    try {
      const archived = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
      archived.push({ ...board, archivedAt: new Date().toISOString() });
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archived));
    } catch {}
    if (removeBoardById) removeBoardById(board.id);
    else save(data.filter((_,i) => i !== activeIdx));
    setActiveIdx(Math.max(0, activeIdx - 1));
    setConfirmArchive(false);
  };

  const handleLbAction = async () => {
    if (!board) return;
    if (lbAction === "create") {
      if (!newLbNameInput.trim()) return;
      const newId = uid();
      await createLookbook({ id: newId, name: newLbNameInput.trim(), moodboardId: board.id });
      setLinkedLb({ id: newId, name: newLbNameInput.trim(), moodboardId: board.id });
    } else if (lbAction === "add" && selectedLbId) {
      const lb = (lookbooksDb||[]).find(l => l.id === selectedLbId);
      await addMoodboardToLookbook(selectedLbId, board);
      setLinkedLb({ ...(lb || { id: selectedLbId, name: "Lookbook" }), moodboardId: board.id });
    }
    setLbAction(null); setSelectedLbId(""); setNewLbNameInput("");
  };

  if (data.length === 0) return (
    <div className="right-card">
      <div className="right-card-title">Boards</div>
      <div style={{fontSize:12,color:"#bbb",textAlign:"center",padding:"12px 0"}}>No boards yet</div>
      <button onClick={() => {
        const updated = [{ id: uid(), name: "Board 1", items: [], bg: "#ffffff" }];
        save(updated); setActiveIdx(0);
      }} style={{width:"100%",padding:"9px 0",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700}}>+ Create Board</button>
    </div>
  );

  return (
    <>
    {board && (<>

    {/* ── Board Info ── */}
    <div className="right-card" style={{marginTop:12}}>
      <div className="right-card-title">Board Info</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>Name</label>
          <input value={board.name||""} onChange={e => save(data.map((b,i)=>i===activeIdx?{...b,name:e.target.value}:b))}
            placeholder="Board name…"
            style={{width:"100%",padding:"7px 10px",border:"1px solid #e0dbd2",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,outline:"none",background:"#fafaf8",boxSizing:"border-box"}} />
        </div>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>Notes</label>
          <textarea value={board.notes||""} onChange={e => save(data.map((b,i)=>i===activeIdx?{...b,notes:e.target.value}:b))}
            placeholder="Mood, theme, inspiration…" rows={3}
            style={{width:"100%",padding:"7px 10px",border:"1px solid #e0dbd2",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",background:"#fafal8",resize:"none",lineHeight:1.5,boxSizing:"border-box"}} />
        </div>
      </div>
    </div>

    {/* ── Color Palette ── */}
    <div className="right-card" style={{marginTop:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div className="right-card-title" style={{marginBottom:0}}>Color Palette</div>
        <button onClick={generatePalette} title="Generate palette from board images"
          style={{padding:"3px 8px",background:"#f5f3ef",border:"1px solid #e0dbd2",borderRadius:8,cursor:"pointer",fontSize:10,fontWeight:700,color:"#666",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}>
          Generate
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,52px)",rowGap:6,columnGap:6,marginBottom:12}}>
        {palette.map((color,idx) => (
          <div key={idx} style={{position:"relative",width:52,height:52,lineHeight:0,flexShrink:0}}>
            <div onClick={() => setEditingColorIdx(editingColorIdx===idx?null:idx)} style={{
              width:52,height:52,borderRadius:12,background:color,
              border:editingColorIdx===idx?"2px solid #1a1a1a":"2px solid transparent",
              boxShadow:"0 1px 4px rgba(0,0,0,0.12)",cursor:"pointer",
              outline:"1.5px solid rgba(0,0,0,0.08)",outlineOffset:1,
            }} />
            <button onClick={() => removeColor(idx)} className="palette-del-btn" style={{
              position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",
              background:"rgba(0,0,0,0.55)",border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
        {palette.length < 10 && (
          <button onClick={addColor} style={{
            width:52,height:52,borderRadius:12,background:"#f5f3ef",border:"1.5px dashed #d0cac0",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            color:"#bbb",fontSize:20,fontWeight:300,lineHeight:1,
          }}>+</button>
        )}
      </div>
      {editingColorIdx!==null && palette[editingColorIdx]!==undefined && (
        <div style={{display:"flex",gap:8,alignItems:"center",padding:"10px 12px",background:"#f9f8f6",borderRadius:12,border:"1px solid #e8e4dc"}}>
          <input type="color" value={palette[editingColorIdx]} onChange={e => updateColor(editingColorIdx,e.target.value)}
            style={{width:32,height:32,border:"none",borderRadius:8,cursor:"pointer",padding:0,background:"none",flexShrink:0}} />
          <input value={hexInput!==""?hexInput:palette[editingColorIdx]}
            onChange={e => { setHexInput(e.target.value); const n=normalizeHex(e.target.value); if(n) updateColor(editingColorIdx,n); }}
            onFocus={() => setHexInput(palette[editingColorIdx])}
            onBlur={() => setHexInput("")}
            placeholder="#000000" maxLength={7}
            style={{flex:1,padding:"6px 10px",border:"1px solid #e0dbd2",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,outline:"none",background:"#fff",color:"#1a1a1a",letterSpacing:"0.05em",textTransform:"uppercase",boxSizing:"border-box"}}
          />
        </div>
      )}
      {palette.length===0 && <div style={{fontSize:11,color:"#ccc",textAlign:"center",padding:"8px 0"}}>Tap + to build your palette · or Generate from images</div>}
    </div>

    {/* ── Closet Suggestions ── */}
    <div className="right-card" style={{marginTop:12}}>
      <div className="right-card-title">From Your Closet</div>
      {closetSuggestions.length === 0 ? (
        <div style={{fontSize:11,color:"#ccc",textAlign:"center",padding:"8px 0",lineHeight:1.6}}>
          {palette.length===0 ? "Build a color palette to see matching pieces" : "No closet items match this palette yet"}
        </div>
      ) : (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {closetSuggestions.map(item=>(
            <div key={item.id} title={item.name} style={{width:48,height:60,borderRadius:10,overflow:"hidden",background:"#fff",border:"1.5px solid #e8e4dc",flexShrink:0}}>
              <img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"contain"}} />
            </div>
          ))}
        </div>
      )}
    </div>

    {/* ── Lookbooks ── */}
    <div className="right-card" style={{marginTop:12}}>
      <div className="right-card-title">Lookbooks</div>

      {linkedLb ? (
        /* Linked — show the lookbook as a clickable card */
        <div>
          <button onClick={() => onGoToLookbook && onGoToLookbook(linkedLb)} style={{
            width:"100%",padding:"11px 14px",background:"#f0faf4",border:"1.5px solid #b6e8c8",
            borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left",
            display:"flex",alignItems:"center",gap:10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d6a3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:800,color:"#2d6a3f",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{linkedLb.name}</div>
              <div style={{fontSize:10,color:"#5aaa7e",marginTop:1}}>Open lookbook →</div>
            </div>
          </button>
          <button onClick={() => setLinkedLb(null)} style={{
            width:"100%",marginTop:6,padding:"7px 0",background:"none",border:"none",
            cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"#bbb",
          }}
            onMouseEnter={e=>e.currentTarget.style.color="#888"}
            onMouseLeave={e=>e.currentTarget.style.color="#bbb"}
          >Link a different lookbook</button>
        </div>
      ) : (
        /* No link yet — show action buttons */
        <>
          {lbAction === "add" ? (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <select value={selectedLbId} onChange={e => setSelectedLbId(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e0dbd2",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,background:"#fafaf8",outline:"none"}}>
                <option value="">Choose lookbook…</option>
                {(lookbooksDb||[]).map(lb => <option key={lb.id} value={lb.id}>{lb.name}</option>)}
              </select>
              <div style={{display:"flex",gap:6}}>
                <button onClick={handleLbAction} disabled={!selectedLbId}
                  style={{flex:1,padding:"8px 0",background:selectedLbId?"#1a1a1a":"#e0dbd2",color:"#fff",border:"none",borderRadius:10,cursor:selectedLbId?"pointer":"default",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700}}>Add</button>
                <button onClick={() => { setLbAction(null); setSelectedLbId(""); }}
                  style={{padding:"8px 12px",background:"#f5f3ef",border:"none",borderRadius:10,cursor:"pointer",fontSize:11,color:"#888",fontFamily:"'DM Sans',sans-serif"}}>✕</button>
              </div>
            </div>
          ) : lbAction === "create" ? (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <input value={newLbNameInput} onChange={e => setNewLbNameInput(e.target.value)}
                placeholder="New lookbook name…" autoFocus
                onKeyDown={e => e.key==="Enter" && handleLbAction()}
                style={{padding:"8px 12px",border:"1.5px solid #1a1a1a",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,outline:"none"}} />
              <div style={{display:"flex",gap:6}}>
                <button onClick={handleLbAction}
                  style={{flex:1,padding:"8px 0",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700}}>Create</button>
                <button onClick={() => { setLbAction(null); setNewLbNameInput(""); }}
                  style={{padding:"8px 12px",background:"#f5f3ef",border:"none",borderRadius:10,cursor:"pointer",fontSize:11,color:"#888",fontFamily:"'DM Sans',sans-serif"}}>✕</button>
              </div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(lookbooksDb||[]).length > 0 && (
                <button onClick={() => setLbAction("add")} style={{
                  width:"100%",padding:"9px 12px",background:"#fafaf8",border:"1.5px solid #e0dbd2",
                  borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#444",
                  display:"flex",alignItems:"center",gap:8,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add to Lookbook
                </button>
              )}
              <button onClick={() => setLbAction("create")} style={{
                width:"100%",padding:"9px 12px",background:"#fafaf8",border:"1.5px solid #e0dbd2",
                borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#444",
                display:"flex",alignItems:"center",gap:8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
                New Lookbook from Board
              </button>
            </div>
          )}
        </>
      )}
    </div>

    </>)}

    {/* Archive confirm modal */}
    </>
  );
}


function MoodboardGridCard({ board, onPreview, onEdit, onArchive, onDelete }) {
  const imgItems = (board?.items||[]).filter(it=>it.src);
  return (
    <div className="mb-card">
      {/* Clickable preview area */}
      <div onClick={onPreview} style={{position:"relative",aspectRatio:"4/3",background:board?.bg||"#f5f3ef",overflow:"hidden"}}>
        {imgItems.slice(0,4).map((it,idx)=>(
          <img key={it.id} src={it.src} alt="" style={{position:"absolute",objectFit:"cover",borderRadius:6,
            ...(idx===0?{top:"8%",left:"6%",width:"56%",height:"82%"}:
               idx===1?{top:"8%",right:"6%",width:"36%",height:"39%"}:
               idx===2?{bottom:"8%",right:"6%",width:"36%",height:"39%"}:
               {bottom:"8%",left:"6%",width:"36%",height:"39%"})}} />
        ))}
        {imgItems.length===0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><SvgSparkle size={28} color="rgba(0,0,0,0.12)" /></div>}
      </div>
      {/* Hover-reveal: name + action buttons */}
      <div className="mb-card-actions">
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
          <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{board?.name||"Untitled"}</div>
          {board?.pinned&&<span style={{color:"#f0c840",fontSize:11,flexShrink:0}}>★</span>}
          {board?.linkedLb&&<span style={{fontSize:9,fontWeight:700,color:"#2d6a3f",background:"#f0faf4",border:"1px solid #b6e8c8",borderRadius:20,padding:"2px 6px",flexShrink:0}}>Lookbook</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={e=>{e.stopPropagation();onEdit&&onEdit();}} title="Edit board"
            style={{width:30,height:30,borderRadius:8,background:"#f5f3ef",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <SvgEdit size={12} color="#555" />
          </button>
          <div style={{flex:1}} />
          <button onClick={e=>{e.stopPropagation();onArchive&&onArchive();}} title="Archive board"
            style={{width:30,height:30,borderRadius:8,background:"#f5f3ef",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <SvgDownload size={12} color="#555" />
          </button>
          <button onClick={e=>{e.stopPropagation();onDelete&&onDelete();}} title="Delete board"
            style={{width:30,height:30,borderRadius:8,background:"#fef2f2",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <SvgTrash size={12} color="#e05555" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MoodboardPreviewPopup({ board, onClose, onEdit, onGoToLookbook }) {
  const items = board?.items || [];
  // Compute bounding box of all items to scale them to fit
  const allX = items.map(it=>it.x||0);
  const allY = items.map(it=>it.y||0);
  const allR = items.map(it=>(it.x||0)+(it.w||160));
  const allB = items.map(it=>(it.y||0)+(it.h||200));
  const minX = items.length ? Math.min(...allX) : 0;
  const minY = items.length ? Math.min(...allY) : 0;
  const maxR = items.length ? Math.max(...allR) : 800;
  const maxB = items.length ? Math.max(...allB) : 600;
  const contentW = Math.max(maxR - minX, 400);
  const contentH = Math.max(maxB - minY, 300);
  const PREVIEW_W = Math.min(window.innerWidth * 0.8, 900);
  const PREVIEW_H = Math.min(window.innerHeight * 0.75, 650);
  const scale = Math.min(PREVIEW_W / contentW, PREVIEW_H / contentH, 1);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:board?.bg||"#f5f3ef",borderRadius:20,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.28)",display:"flex",flexDirection:"column",maxWidth:"90vw",maxHeight:"90vh"}}>
        {/* Header */}
        <div style={{padding:"14px 18px 12px",background:"rgba(255,255,255,0.88)",borderBottom:"1px solid rgba(0,0,0,0.08)",backdropFilter:"blur(8px)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:(board?.palette?.length||board?.linkedLb)?10:0}}>
            <div style={{fontSize:15,fontWeight:700,color:"#1a1a1a"}}>{board?.name||"Untitled Board"}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={onEdit} style={{padding:"6px 14px",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                <SvgEdit size={11} color="#fff" />Edit Board
              </button>
              <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"rgba(0,0,0,0.08)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          {/* Palette + lookbook row */}
          {(board?.palette?.length > 0 || board?.linkedLb) && (
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              {board?.palette?.length > 0 && (
                <div style={{display:"flex",alignItems:"center",gap:0}}>
                  {board.palette.map((color, i) => (
                    <div key={i} style={{
                      width:18, height:18, borderRadius:"50%", background:color,
                      border:"2px solid #fff", outline:"1px solid rgba(0,0,0,0.08)",
                      marginLeft: i===0 ? 0 : -5, zIndex: board.palette.length - i,
                      position:"relative",
                    }} />
                  ))}
                </div>
              )}
              {board?.linkedLb && (
                <button onClick={()=>onGoToLookbook&&onGoToLookbook(board.linkedLb)} style={{
                  display:"flex",alignItems:"center",gap:5,padding:"3px 10px 3px 7px",
                  background:"#f0faf4",border:"1px solid #b6e8c8",borderRadius:20,
                  cursor:onGoToLookbook?"pointer":"default",fontFamily:"'DM Sans',sans-serif",
                  fontSize:11,fontWeight:700,color:"#2d6a3f",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  {board.linkedLb.name||"Lookbook"}
                </button>
              )}
            </div>
          )}
        </div>
        {/* Canvas preview */}
        <div style={{overflow:"auto",flex:1}}>
          <div style={{position:"relative",width:contentW*scale,height:contentH*scale,flexShrink:0}}>
            {items.map(item=>(
              <div key={item.id} style={{
                position:"absolute",
                left:(item.x||0-minX)*scale, top:(item.y||0-minY)*scale,
                width:(item.w||160)*scale, height:(item.h||200)*scale,
                transform:`rotate(${item.rotation||0}deg)`,
                transformOrigin:"center center",
                opacity:item.opacity??1,
                pointerEvents:"none",
              }}>
                {item.type==="text" ? (
                  <div style={{
                    width:"100%",height:"100%",
                    fontFamily:item.fontFamily||"'DM Sans',sans-serif",
                    fontSize:(item.fontSize||14)*scale,
                    fontWeight:item.bold?"700":"400",
                    color:item.color||"#1a1a1a",
                    background:item.transparentBg?"transparent":(item.bg||"#fff9e6"),
                    display:"flex",alignItems:"center",justifyContent:"center",
                    padding:8*scale,boxSizing:"border-box",
                    borderRadius:8*scale,overflow:"hidden",
                    whiteSpace:"pre-wrap",textAlign:"center",lineHeight:1.4,
                  }}>{item.text||""}</div>
                ) : (
                  <img src={item.src} alt="" style={{
                    width:"100%",height:"100%",
                    objectFit:"contain",display:"block",
                    background:item.transparent?"transparent":"transparent",
                    transform:item.flipH?"scaleX(-1)":"none",
                  }} />
                )}
              </div>
            ))}
            {items.length===0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><SvgSparkle size={48} color="rgba(0,0,0,0.1)" /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Moodboard({ closetItems = [], activeIdx, setActiveIdx, boards: boardsProp, updateBoards, removeBoardById, mbView = "grid", setMbView, mbSearch = "", mbTagFilter = "All", onGoToLookbook }) {
  const closetItemsForMoodboard = closetItems;
  // Use prop-based boards (Supabase-backed) if provided, else fall back to localStorage
  const STORAGE_KEY = "wardrobe_moodboards_v1";
  const [boardsLocal, setBoardsLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const boards = boardsProp !== undefined ? boardsProp : boardsLocal;
  const setBoards = boardsProp !== undefined
    ? updateBoards
    : (updater) => {
        setBoardsLocal(prev => {
          const next = typeof updater === "function" ? updater(prev) : updater;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      };
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);
  const dragging = useRef(null);
  const resizing = useRef(null);
  const rotating = useRef(null);
  const fileRef = useRef(null);
  const editingTextRef = useRef(null);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [showClosetPicker, setShowClosetPicker] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingTextVal, setEditingTextVal] = useState("");
  const [mbPreviewBoard, setMbPreviewBoard] = useState(null);
  const [mbSort, setMbSort] = useState("pinned");
  const [mbGridZoom, setMbGridZoom] = useState(220);

  // ── Undo/redo history ──
  const history = useRef([]);   // array of board item snapshots
  const historyIdx = useRef(-1);
  const skipHistory = useRef(false);

  const board = boards[activeIdx] || null;
  const items = board?.items || [];

  const pushHistory = (snapshot) => {
    if (skipHistory.current) return;
    history.current = history.current.slice(0, historyIdx.current + 1);
    history.current.push(JSON.parse(JSON.stringify(snapshot)));
    if (history.current.length > 30) history.current.shift();
    historyIdx.current = history.current.length - 1;
  };

  const undo = () => {
    if (historyIdx.current <= 0) return;
    historyIdx.current--;
    const snap = history.current[historyIdx.current];
    skipHistory.current = true;
    setBoards(bs => bs.map((b,i) => i===activeIdx ? {...b, items: snap} : b));
    skipHistory.current = false;
  };

  const redo = () => {
    if (historyIdx.current >= history.current.length - 1) return;
    historyIdx.current++;
    const snap = history.current[historyIdx.current];
    skipHistory.current = true;
    setBoards(bs => bs.map((b,i) => i===activeIdx ? {...b, items: snap} : b));
    skipHistory.current = false;
  };

  const updateBoard = (updater) => {
    setBoards(bs => bs.map((b,i) => {
      if (i !== activeIdx) return b;
      const newItems = typeof updater === "function" ? updater(b.items || []) : updater;
      pushHistory(newItems);
      return {...b, items: newItems};
    }));
  };

  const updateBoardMeta = (patch) => {
    setBoards(bs => bs.map((b,i) => i===activeIdx ? {...b, ...patch} : b));
  };

  const addBoard = () => {
    const name = `Board ${boards.length + 1}`;
    setBoards(bs => [...bs, {id:uid(), name, items:[], bg:"#ffffff"}]);
    setActiveIdx(boards.length);
    setSelectedId(null);
  };

  const importImages = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxW=260; const maxH=220;
          let w=img.naturalWidth; let h=img.naturalHeight;
          if(w>maxW){h=h*maxW/w;w=maxW;} if(h>maxH){w=w*maxH/h;h=maxH;}
          const canvas=canvasRef.current;
          const cx=canvas?canvas.offsetWidth/2-w/2+(Math.random()-0.5)*80:100;
          const cy=canvas?canvas.offsetHeight/2-h/2+(Math.random()-0.5)*80:100;
          const newItem={id:uid(),src:e.target.result,x:Math.max(0,cx),y:Math.max(0,cy),w:Math.round(w),h:Math.round(h),rotation:(Math.random()-0.5)*6,zIndex:Math.floor(Date.now()/1000000),opacity:1,label:"",showLabel:false,flipH:false};
          updateBoard(items => [...items, newItem]);
          setSelectedId(newItem.id);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const addTextNote = () => {
    const canvas = canvasRef.current;
    const newItem = {
      id:uid(), type:"text", text:"Double-click to edit",
      x:canvas?canvas.offsetWidth/2-80:120, y:canvas?canvas.offsetHeight/2-30:120,
      w:180, h:60, rotation:0, zIndex:Math.floor(Date.now()/1000000),
      fontSize:14, color:"#1a1a1a", bg:"#fff9e6", bold:false,
    };
    updateBoard(items => [...items, newItem]);
    setSelectedId(newItem.id);
  };

  const removeItem = (id) => { updateBoard(items => items.filter(i => i.id!==id)); setSelectedId(null); };
  const bringForward = (id) => { const maxZ=Math.max(...items.map(i=>i.zIndex||0)); updateBoard(items=>items.map(i=>i.id===id?{...i,zIndex:maxZ+1}:i)); };
  const sendBackward = (id) => { const minZ=Math.min(...items.map(i=>i.zIndex||0)); updateBoard(items=>items.map(i=>i.id===id?{...i,zIndex:minZ-1}:i)); };
  const updateItem = (id, patch) => { updateBoard(items=>items.map(i=>i.id===id?{...i,...patch}:i)); };
  const duplicateItem = (id) => { const item=items.find(i=>i.id===id); if(!item)return; const copy={...item,id:uid(),x:item.x+20,y:item.y+20,zIndex:Math.floor(Date.now()/1000000)}; updateBoard(items=>[...items,copy]); setSelectedId(copy.id); };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e) => {
      if (editingTextId) return; // don't intercept while typing
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); return; }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeItem(selectedId); return; }
      if (e.key === "Escape") { setSelectedId(null); return; }
      const NUDGE = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft")  { e.preventDefault(); updateItem(selectedId, { x: (items.find(i=>i.id===selectedId)?.x||0) - NUDGE }); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); updateItem(selectedId, { x: (items.find(i=>i.id===selectedId)?.x||0) + NUDGE }); return; }
      if (e.key === "ArrowUp")    { e.preventDefault(); updateItem(selectedId, { y: (items.find(i=>i.id===selectedId)?.y||0) - NUDGE }); return; }
      if (e.key === "ArrowDown")  { e.preventDefault(); updateItem(selectedId, { y: (items.find(i=>i.id===selectedId)?.y||0) + NUDGE }); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, items, editingTextId]);

  // ── Mouse interaction ──
  const onMouseDown = (e, id, mode) => {
    e.stopPropagation(); e.preventDefault();
    const item = items.find(i=>i.id===id);
    if (!item) return;
    setSelectedId(id);
    bringForward(id);
    if (mode === "drag") {
      dragging.current = {id, startX:e.clientX-item.x, startY:e.clientY-item.y};
    } else if (mode === "resize") {
      resizing.current = {id, startX:e.clientX, startY:e.clientY, startW:item.w, startH:item.h};
    } else if (mode === "rotate") {
      const canvas = canvasRef.current;
      const canvasRect = canvas?.getBoundingClientRect();
      // item center in page coords
      const cx = (canvasRect?.left||0) + item.x + item.w/2;
      const cy = (canvasRect?.top||0)  + item.y + item.h/2;
      rotating.current = {id, cx, cy, startAngle: Math.atan2(e.clientY-cy, e.clientX-cx) * 180/Math.PI, startRotation: item.rotation||0};
    }
  };

  const onMouseMove = (e) => {
    if (dragging.current) {
      const {id,startX,startY}=dragging.current;
      skipHistory.current = true;
      setBoards(bs=>bs.map((b,i)=>i!==activeIdx?b:{...b,items:(b.items||[]).map(it=>it.id===id?{...it,x:e.clientX-startX,y:e.clientY-startY}:it)}));
      skipHistory.current = false;
    } else if (resizing.current) {
      const {id,startX,startY,startW,startH}=resizing.current;
      const dx=e.clientX-startX; const dy=e.clientY-startY;
      skipHistory.current = true;
      setBoards(bs=>bs.map((b,i)=>i!==activeIdx?b:{...b,items:(b.items||[]).map(it=>it.id===id?{...it,w:Math.max(60,startW+dx),h:Math.max(40,startH+dy)}:it)}));
      skipHistory.current = false;
    } else if (rotating.current) {
      const {id,cx,cy,startAngle,startRotation}=rotating.current;
      const angle = Math.atan2(e.clientY-cy, e.clientX-cx) * 180/Math.PI;
      const newRot = startRotation + (angle - startAngle);
      skipHistory.current = true;
      setBoards(bs=>bs.map((b,i)=>i!==activeIdx?b:{...b,items:(b.items||[]).map(it=>it.id===id?{...it,rotation:newRot}:it)}));
      skipHistory.current = false;
    }
  };

  const onMouseUp = () => {
    if (dragging.current || resizing.current || rotating.current) {
      // Push to history on release
      pushHistory(items);
    }
    dragging.current = null; resizing.current = null; rotating.current = null;
  };

  const onTouchStart = (e,id,mode) => { const t=e.touches[0]; onMouseDown({clientX:t.clientX,clientY:t.clientY,stopPropagation:()=>{},preventDefault:()=>{}},id,mode); };
  const onTouchMove = (e) => { const t=e.touches[0]; onMouseMove({clientX:t.clientX,clientY:t.clientY}); };
  const onTouchEnd = () => onMouseUp();

  const selectedItem = items.find(i=>i.id===selectedId);

  const loadScript = (src) => new Promise((resolve,reject) => {
    if(document.querySelector(`script[src="${src}"]`)){resolve();return;}
    const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;
    document.head.appendChild(s);
  });

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js").then(()=>{
      window.html2canvas(canvas,{useCORS:true,backgroundColor:board?.bg||"#fff"}).then(c=>{
        const a=document.createElement("a"); a.href=c.toDataURL("image/jpeg",0.92); a.download=`${board?.name||"moodboard"}.jpg`; a.click();
      });
    }).catch(()=>alert("Export failed — try right-clicking the board to save manually."));
  };

  const importFromUrl = async () => {
    if(!urlInput.trim())return;
    setUrlLoading(true);
    try {
      const proxyUrl=`https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput.trim())}`;
      const res=await fetch(proxyUrl); const blob=await res.blob();
      if(!blob.type.startsWith("image/"))throw new Error("Not an image");
      const reader=new FileReader();
      reader.onload=e=>{importImages([new File([blob],"imported.jpg",{type:blob.type})]);};
      reader.readAsDataURL(blob);
      setUrlInput(""); setShowUrlImport(false);
    } catch {
      const canvas=canvasRef.current;
      const newItem={id:uid(),src:urlInput.trim(),x:canvas?canvas.offsetWidth/2-130:80,y:canvas?canvas.offsetHeight/2-100:80,w:260,h:200,rotation:0,zIndex:Math.floor(Date.now()/1000000),opacity:1,flipH:false};
      updateBoard(items=>[...items,newItem]);
      setSelectedId(newItem.id);
      setUrlInput(""); setShowUrlImport(false);
    }
    setUrlLoading(false);
  };

  if (boards.length === 0 || mbView === "grid") {
    const q = mbSearch.trim().toLowerCase();
    const filteredBoards = boards.map((b,i)=>({b,i})).filter(({b}) => {
      if (q && !b.name?.toLowerCase().includes(q)) return false;
      if (mbTagFilter !== "All" && !(b.tags||[]).includes(mbTagFilter)) return false;
      return true;
    }).sort((a,z)=>{
      if (mbSort === "pinned") return (z.b.pinned?1:0)-(a.b.pinned?1:0);
      if (mbSort === "nameAZ") return (a.b.name||"").localeCompare(z.b.name||"");
      if (mbSort === "nameZA") return (z.b.name||"").localeCompare(a.b.name||"");
      if (mbSort === "newest") return z.i - a.i;
      if (mbSort === "oldest") return a.i - z.i;
      return 0;
    });
    const archiveBoardFromGrid = (b) => {
      if (!window.confirm(`Archive "${b.name||"this board"}"? Restore from Settings → Data.`)) return;
      try {
        const archived = JSON.parse(localStorage.getItem("wardrobe_moodboards_archived_v1") || "[]");
        archived.push({ ...b, archivedAt: new Date().toISOString() });
        localStorage.setItem("wardrobe_moodboards_archived_v1", JSON.stringify(archived));
      } catch {}
      if (removeBoardById) removeBoardById(b.id);
      else setBoards(bs => bs.filter(x => x.id !== b.id));
    };
    const deleteBoardFromGrid = (b) => {
      if (!window.confirm(`Delete "${b.name||"this board"}"? This cannot be undone.`)) return;
      if (removeBoardById) removeBoardById(b.id);
      else setBoards(bs => bs.filter(x => x.id !== b.id));
    };
    return (
      <div style={{display:"flex",flexDirection:"column",padding:"0 4px"}}>
        {mbPreviewBoard && (
          <MoodboardPreviewPopup
            board={mbPreviewBoard}
            onClose={()=>setMbPreviewBoard(null)}
            onEdit={()=>{ const idx=boards.findIndex(x=>x.id===mbPreviewBoard.id); if(idx>=0){setActiveIdx(idx);setMbView&&setMbView("canvas");} setMbPreviewBoard(null); }}
            onGoToLookbook={onGoToLookbook}
          />
        )}
        {boards.length === 0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16}}>
            <div><SvgSparkle size={40} color="#ddd" /></div>
            <div style={{fontSize:18,fontWeight:800,color:"#1a1a1a"}}>No moodboards yet</div>
            <button onClick={()=>{addBoard();setMbView&&setMbView("canvas");}} style={{padding:"12px 28px",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700}}>+ Create Board</button>
          </div>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <select value={mbSort} onChange={e=>setMbSort(e.target.value)} className="pill-select">
                <option value="pinned">Pinned First</option>
                <option value="nameAZ">Name A–Z</option>
                <option value="nameZA">Name Z–A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <SvgBox size={11} color="#bbb" />
                <input type="range" min={160} max={340} step={10} value={mbGridZoom} onChange={e=>setMbGridZoom(Number(e.target.value))}
                  style={{width:72,accentColor:"#1a1a1a",cursor:"pointer"}} />
                <SvgBox size={16} color="#bbb" />
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${mbGridZoom}px,1fr))`,gap:14}}>
              {filteredBoards.map(({b,i})=>(
                <MoodboardGridCard key={b.id} board={b}
                  onPreview={()=>setMbPreviewBoard(b)}
                  onEdit={()=>{setActiveIdx(i);setMbView&&setMbView("canvas");}}
                  onArchive={()=>archiveBoardFromGrid(b)}
                  onDelete={()=>deleteBoardFromGrid(b)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 160px)",userSelect:"none",padding:"0 4px"}}>

      {/* Toolbar */}
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{importImages(e.target.files);e.target.value="";}} />
        {setMbView && <button onClick={()=>setMbView("grid")} style={{padding:"8px 12px",background:"#f5f3ef",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#666",display:"flex",alignItems:"center",gap:6}}>← All Boards</button>}
        <button onClick={()=>fileRef.current.click()} style={{padding:"8px 16px",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:8}}><SvgCamera size={13} color="#fff" />Import Images</button>
        <button onClick={addTextNote} style={{padding:"8px 16px",background:"#f5f3ef",border:"1px solid #e0dbd2",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#666",display:"flex",alignItems:"center",gap:8}}><SvgEdit size={13} color="#666" />Add Text</button>
        <button onClick={()=>setShowUrlImport(u=>!u)} style={{padding:"8px 14px",background:showUrlImport?"#f0f4ff":"#f5f3ef",border:showUrlImport?"1.5px solid #a0b4f0":"1px solid #e0dbd2",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:showUrlImport?"#3a5fe0":"#666",display:"flex",alignItems:"center",gap:8}}><SvgLink size={13} color="currentColor" />URL</button>
        <button onClick={()=>setShowClosetPicker(p=>!p)} style={{padding:"8px 14px",background:showClosetPicker?"#f0faf4":"#f5f3ef",border:showClosetPicker?"1.5px solid #b6e8c8":"1px solid #e0dbd2",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:showClosetPicker?"#2d6a3f":"#666",display:"flex",alignItems:"center",gap:8}}><SvgHanger size={13} color="currentColor" />From Closet</button>
        <div style={{display:"flex",gap:6,marginLeft:"auto",alignItems:"center"}}>
          <button onClick={undo} title="Undo (⌘Z)" style={{padding:"7px 10px",background:"#f5f3ef",border:"1px solid #e0dbd2",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,color:"#666",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
          </button>
          <button onClick={redo} title="Redo (⌘⇧Z)" style={{padding:"7px 10px",background:"#f5f3ef",border:"1px solid #e0dbd2",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,color:"#666",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
          </button>
          <button onClick={exportCanvas} title="Export as JPG" style={{padding:"7px 10px",background:"#f5f3ef",border:"1px solid #e0dbd2",borderRadius:8,cursor:"pointer",fontSize:11,color:"#777",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button onClick={() => {
            if (!board) return;
            if (window.confirm(`Archive "${board.name || "this board"}"? Restore from Settings → Data.`)) {
              try {
                const archived = JSON.parse(localStorage.getItem("wardrobe_moodboards_archived_v1") || "[]");
                archived.push({ ...board, archivedAt: new Date().toISOString() });
                localStorage.setItem("wardrobe_moodboards_archived_v1", JSON.stringify(archived));
              } catch {}
              if (removeBoardById) {
                removeBoardById(board.id);
              } else {
                setBoards(bs => bs.filter((_, i) => i !== activeIdx));
              }
              if (setActiveIdx) setActiveIdx(Math.max(0, activeIdx - 1));
            }
          }} title="Archive this board" style={{padding:"7px 10px",background:"#f5f3ef",border:"1px solid #e0dbd2",borderRadius:8,cursor:"pointer",fontSize:11,color:"#777",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            <SvgDownload size={13} color="#777" />
          </button>
          <button onClick={() => {
            if (!board) return;
            if (window.confirm(`Delete "${board.name || "this board"}"? This cannot be undone.`)) {
              if (removeBoardById) {
                removeBoardById(board.id);
              } else {
                setBoards(bs => bs.filter((_, i) => i !== activeIdx));
              }
              if (setActiveIdx) setActiveIdx(Math.max(0, activeIdx - 1));
            }
          }} title="Delete this board" style={{padding:"7px 10px",background:"#fef2f2",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,color:"#e05555",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>

      {/* URL import bar */}
      {showUrlImport && (
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input autoFocus value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste image URL…"
            onKeyDown={e=>e.key==="Enter"&&importFromUrl()}
            style={{flex:1,padding:"8px 14px",border:"1.5px solid #a0b4f0",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}} />
          <button onClick={importFromUrl} disabled={urlLoading} style={{padding:"8px 16px",background:"#3a5fe0",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{urlLoading?"…":"Import"}</button>
        </div>
      )}

      {/* Closet picker */}
      {showClosetPicker && (
        <div style={{marginBottom:8,padding:"10px 12px",background:"#f0faf4",borderRadius:12,border:"1.5px solid #b6e8c8",maxHeight:140,overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#2d6a3f",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Pin from Closet</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {(closetItemsForMoodboard||[]).filter(i=>i.image).map(item=>(
              <div key={item.id} onClick={()=>{
                const canvas=canvasRef.current;
                const newItem={id:uid(),src:item.image,x:canvas?canvas.offsetWidth/2-80+Math.random()*60-30:80,y:canvas?canvas.offsetHeight/2-100+Math.random()*60-30:80,w:160,h:200,rotation:(Math.random()-0.5)*4,zIndex:Math.floor(Date.now()/1000000),opacity:1,label:item.name,transparent:true,flipH:false};
                updateBoard(items=>[...items,newItem]);
                setSelectedId(newItem.id);
                setShowClosetPicker(false);
              }} title={item.name} style={{width:52,height:52,borderRadius:10,overflow:"hidden",background:"#f5f2ed",cursor:"pointer",flexShrink:0,border:"1.5px solid #d0f0d8"}}>
                <img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"contain"}} />
              </div>
            ))}
            {(closetItemsForMoodboard||[]).filter(i=>i.image).length===0&&<div style={{fontSize:12,color:"#aaa"}}>No items with images in your closet</div>}
          </div>
        </div>
      )}

      {/* Selected item toolbar */}
      {selectedItem && (
        <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center",flexWrap:"wrap",padding:"8px 12px",background:"#faf9f6",borderRadius:12,border:"1px solid #e8e4dc"}}>
          <span style={{fontSize:10,fontWeight:700,color:"#aaa",flexShrink:0}}>SELECTED</span>
          <button onClick={()=>bringForward(selectedId)} style={{padding:"5px 10px",fontSize:11,background:"#f5f2ed",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:"#555",fontFamily:"'DM Sans',sans-serif"}}><SvgArrowUp size={12} color="#555" style={{marginRight:4}} />Fwd</button>
          <button onClick={()=>sendBackward(selectedId)} style={{padding:"5px 10px",fontSize:11,background:"#f5f2ed",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:"#555",fontFamily:"'DM Sans',sans-serif"}}><SvgArrowDn size={12} color="#555" style={{marginRight:4}} />Back</button>
          <button onClick={()=>duplicateItem(selectedId)} style={{padding:"5px 10px",fontSize:11,background:"#f5f2ed",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:"#555",fontFamily:"'DM Sans',sans-serif"}}><SvgCopy size={12} color="#555" style={{marginRight:4}} />Dupe</button>
          {selectedItem.type !== "text" && (
            <>
              <button onClick={()=>updateItem(selectedId,{flipH:!selectedItem.flipH})} style={{padding:"5px 10px",fontSize:11,background:selectedItem.flipH?"#1a1a1a":"#f5f2ed",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:selectedItem.flipH?"#fff":"#555",fontFamily:"'DM Sans',sans-serif"}}>⇆ Flip</button>
              <label style={{fontSize:10,fontWeight:700,color:"#aaa",flexShrink:0}}>Opacity</label>
              <input type="range" min="0.1" max="1" step="0.05" value={selectedItem.opacity??1}
                onChange={e=>updateItem(selectedId,{opacity:parseFloat(e.target.value)})}
                style={{width:72}} />
            </>
          )}
          {selectedItem.type === "text" && (
            <>
              <label style={{fontSize:10,fontWeight:700,color:"#aaa",flexShrink:0}}>Size</label>
              <input type="range" min="10" max="48" step="1" value={selectedItem.fontSize??14}
                onChange={e=>updateItem(selectedId,{fontSize:parseInt(e.target.value)})}
                style={{width:64}} />
              <input type="color" value={selectedItem.color??"#1a1a1a"} onChange={e=>updateItem(selectedId,{color:e.target.value})}
                style={{width:26,height:26,border:"none",borderRadius:6,cursor:"pointer",padding:0}} title="Text color" />
              <button onClick={()=>updateItem(selectedId,{transparentBg:!selectedItem.transparentBg})}
                style={{padding:"5px 10px",fontSize:11,background:selectedItem.transparentBg?"#1a1a1a":"#f5f3ef",color:selectedItem.transparentBg?"#fff":"#555",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>
                {selectedItem.transparentBg?"◻ No BG":"◼ BG"}
              </button>
              {!selectedItem.transparentBg && (
                <input type="color" value={selectedItem.bg??"#fff9e6"} onChange={e=>updateItem(selectedId,{bg:e.target.value})}
                  style={{width:26,height:26,border:"none",borderRadius:6,cursor:"pointer",padding:0}} title="Background color" />
              )}
              <button onClick={()=>updateItem(selectedId,{bold:!selectedItem.bold})}
                style={{padding:"5px 10px",fontSize:12,background:selectedItem.bold?"#1a1a1a":"#f5f3ef",color:selectedItem.bold?"#fff":"#555",border:"none",borderRadius:8,cursor:"pointer",fontWeight:800,fontFamily:"'DM Sans',sans-serif"}}>B</button>
            </>
          )}
          <button onClick={()=>removeItem(selectedId)} style={{padding:"5px 10px",fontSize:11,background:"#fef2f2",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,color:"#e05555",fontFamily:"'DM Sans',sans-serif",marginLeft:"auto"}}><SvgTrash size={12} color="#e05555" style={{marginRight:4}} />Remove</button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseDown={e=>{if(e.target===canvasRef.current){setSelectedId(null); if(editingTextId){setEditingTextId(null); updateItem(editingTextId,{text:editingTextVal}); setEditingTextId(null);}}}}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();importImages(e.dataTransfer.files);}}
        style={{flex:1,position:"relative",background:board?.bg||"#ffffff",borderRadius:20,border:"1.5px solid #e8e4dc",overflow:"hidden",cursor:"default",minHeight:400}}
      >
        {items.length===0&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none",gap:10}}>
            <div style={{opacity:0.15}}><SvgSparkle size={32} color="#888" /></div>
            <div style={{fontSize:13,color:"#bbb",fontWeight:600}}>Import images or drag & drop to start</div>
            <div style={{fontSize:11,color:"#ccc",fontWeight:500}}>⌘Z to undo · ⌫ to delete · arrows to nudge</div>
          </div>
        )}

        {[...items].sort((a,b)=>(a.zIndex||0)-(b.zIndex||0)).map(item=>{
          const isSelected = item.id === selectedId;
          const isEditingText = item.id === editingTextId;

          if (item.type === "text") {
            return (
              <div key={item.id}
                onMouseDown={e=>{ if(!isEditingText) onMouseDown(e,item.id,"drag"); }}
                onTouchStart={e=>{ if(!isEditingText) onTouchStart(e,item.id,"drag"); }}
                onDoubleClick={e=>{
                  e.stopPropagation();
                  setEditingTextId(item.id);
                  setEditingTextVal(item.text||"");
                  setSelectedId(item.id);
                }}
                style={{
                  position:"absolute",left:item.x,top:item.y,
                  width:item.w,minHeight:item.h,
                  transform:`rotate(${item.rotation||0}deg)`,
                  zIndex:item.zIndex||1,
                  background:item.transparentBg?"transparent":(item.bg||"#fff9e6"),
                  borderRadius:10,padding:"10px 14px",
                  cursor:isEditingText?"text":"move",
                  outline:isSelected?"2px solid #2d6a3f":"2px solid transparent",
                  outlineOffset:2,
                  boxShadow:item.transparentBg?"none":(isSelected?"0 4px 20px rgba(0,0,0,0.15)":"0 2px 8px rgba(0,0,0,0.08)"),
                  fontSize:item.fontSize||14,
                  fontWeight:item.bold?800:500,
                  color:item.color||"#1a1a1a",
                  fontFamily:"'DM Sans',sans-serif",
                  lineHeight:1.5,
                  wordBreak:"break-word",
                  userSelect:isEditingText?"text":"none",
                }}
              >
                {isEditingText ? (
                  <textarea
                    ref={editingTextRef}
                    autoFocus
                    value={editingTextVal}
                    onChange={e=>setEditingTextVal(e.target.value)}
                    onBlur={()=>{ updateItem(item.id,{text:editingTextVal}); setEditingTextId(null); }}
                    onKeyDown={e=>{ if(e.key==="Escape"||((e.metaKey||e.ctrlKey)&&e.key==="Enter")){ updateItem(item.id,{text:editingTextVal}); setEditingTextId(null); } e.stopPropagation(); }}
                    style={{
                      width:"100%",minHeight:40,background:"transparent",border:"none",outline:"none",
                      fontFamily:"'DM Sans',sans-serif",fontSize:item.fontSize||14,fontWeight:item.bold?800:500,
                      color:item.color||"#1a1a1a",resize:"none",lineHeight:1.5,padding:0,
                    }}
                  />
                ) : item.text}
                {isSelected&&!isEditingText&&(
                  <>
                    {/* Resize handle */}
                    <div onMouseDown={e=>onMouseDown(e,item.id,"resize")} onTouchStart={e=>onTouchStart(e,item.id,"resize")}
                      style={{position:"absolute",bottom:0,right:0,width:18,height:18,cursor:"se-resize",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <div style={{width:8,height:8,borderRight:"2px solid #2d6a3f",borderBottom:"2px solid #2d6a3f",borderRadius:1}} />
                    </div>
                    {/* Rotation handle — top center */}
                    <div onMouseDown={e=>onMouseDown(e,item.id,"rotate")} onTouchStart={e=>onTouchStart(e,item.id,"rotate")}
                      style={{position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)",width:16,height:16,borderRadius:"50%",background:"#2d6a3f",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
                    </div>
                  </>
                )}
              </div>
            );
          }

          return (
            <div key={item.id}
              onMouseDown={e=>onMouseDown(e,item.id,"drag")}
              onTouchStart={e=>onTouchStart(e,item.id,"drag")}
              style={{
                position:"absolute",left:item.x,top:item.y,
                width:item.w,height:item.h,
                transform:`rotate(${item.rotation||0}deg)`,
                zIndex:item.zIndex||1,
                cursor:"move",
                outline:isSelected?"2px solid #2d6a3f":"2px solid transparent",
                outlineOffset:3,
                opacity:item.opacity??1,
                boxShadow:isSelected?"0 4px 24px rgba(0,0,0,0.18)":"0 2px 10px rgba(0,0,0,0.08)",
                borderRadius:4,
                overflow:item.transparent?"visible":"hidden",
              }}
            >
              <img src={item.src} alt="" draggable={false}
                style={{width:"100%",height:"100%",objectFit:item.transparent?"contain":"cover",display:"block",pointerEvents:"none",background:item.transparent?"transparent":undefined,transform:item.flipH?"scaleX(-1)":"none"}} />
              {isSelected&&(
                <>
                  {/* Resize handle */}
                  <div onMouseDown={e=>onMouseDown(e,item.id,"resize")} onTouchStart={e=>onTouchStart(e,item.id,"resize")}
                    style={{position:"absolute",bottom:0,right:0,width:22,height:22,cursor:"se-resize",background:"rgba(45,106,63,0.85)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"4px 0 4px 0"}}>
                    <div style={{width:8,height:8,borderRight:"2px solid #fff",borderBottom:"2px solid #fff",borderRadius:1}} />
                  </div>
                  {/* Rotation handle — top center */}
                  <div onMouseDown={e=>onMouseDown(e,item.id,"rotate")} onTouchStart={e=>onTouchStart(e,item.id,"rotate")}
                    style={{position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)",width:18,height:18,borderRadius:"50%",background:"#2d6a3f",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── Nav + App ────────────────────────────────────────────────────────────────

// ─── THEMES ────────────────────────────────────────────────────────────────
const THEMES = [
  { id: "parchment", label: "Parchment", bg: "#f7f5f2", card: "#fff",    nav: "#fff",    navActive: "#1a1a1a", accent: "#1a1a1a", border: "#ece8e0", text: "#1a1a1a", sub: "#888"    },
  { id: "sage",      label: "Sage",      bg: "#f0f4f0", card: "#fff",    nav: "#fff",    navActive: "#3d6b4f", accent: "#3d6b4f", border: "#d4e4d8", text: "#1e3028", sub: "#6a9278" },
  { id: "blush",     label: "Blush",     bg: "#fdf5f5", card: "#fff",    nav: "#fff",    navActive: "#b05070", accent: "#b05070", border: "#f0d8de", text: "#2a1218", sub: "#b08090" },
  { id: "sky",       label: "Sky",       bg: "#f0f6fb", card: "#fff",    nav: "#fff",    navActive: "#2a78b8", accent: "#2a78b8", border: "#cce0f0", text: "#102030", sub: "#6898b8" },
  { id: "lilac",     label: "Lilac",     bg: "#f5f0fb", card: "#fff",    nav: "#fff",    navActive: "#7048a8", accent: "#7048a8", border: "#ddd0f0", text: "#1e1030", sub: "#9878c0" },
];

const THEME_KEY = "wardrobe_theme_v1";
const getTheme = () => { try { const id = localStorage.getItem(THEME_KEY); return THEMES.find(t => t.id === id) || THEMES[0]; } catch { return THEMES[0]; } };

// ── TagListsCard ── consolidated categories/occasions/seasons editor
function TagListsCard({ customCategories, setCustomCategories, customOccasions, setCustomOccasions, customSeasons, setCustomSeasons, newCatInput, setNewCatInput, newOccInput, setNewOccInput, newSeaInput, setNewSeaInput, Card, SectionLabel }) {
  const [activeList, setActiveList] = useState("categories");
  const lists = {
    categories: { label:"Categories", items:customCategories, set:setCustomCategories, input:newCatInput, setInput:setNewCatInput, placeholder:"Add category…" },
    occasions:  { label:"Occasions",  items:customOccasions,  set:setCustomOccasions,  input:newOccInput,  setInput:setNewOccInput,  placeholder:"Add occasion…" },
    seasons:    { label:"Seasons",    items:customSeasons,    set:setCustomSeasons,    input:newSeaInput,  setInput:setNewSeaInput,  placeholder:"Add season or tag…" },
  };
  const cur = lists[activeList];
  return (
    <Card>
      <SectionLabel>Tag Lists</SectionLabel>
      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16, background:"#f5f3ef", borderRadius:10, padding:3, width:"fit-content" }}>
        {Object.entries(lists).map(([k,v]) => (
          <button key={k} onClick={()=>setActiveList(k)} style={{
            padding:"5px 14px", border:"none", borderRadius:8, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
            background: activeList===k?"#fff":"transparent",
            color: activeList===k?"#1a1a1a":"#aaa",
            boxShadow: activeList===k?"0 1px 3px rgba(0,0,0,0.08)":"none",
            transition:"all 0.15s"
          }}>{v.label}</button>
        ))}
      </div>
      {/* Tags */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12, minHeight:36 }}>
        {cur.items.map(tag => (
          <div key={tag} style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px 5px 12px", borderRadius:20, background:"#f5f3ef", border:"1px solid #e0dbd2" }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#444" }}>{tag}</span>
            <button onClick={() => cur.set(cur.items.filter(t=>t!==tag))} style={{
              background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:14, lineHeight:1, padding:"0 2px", display:"flex", alignItems:"center"
            }} onMouseEnter={e=>e.currentTarget.style.color="#e05555"} onMouseLeave={e=>e.currentTarget.style.color="#ccc"}>×</button>
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{ display:"flex", gap:8 }}>
        <input value={cur.input} onChange={e=>cur.setInput(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter"&&cur.input.trim()&&!cur.items.includes(cur.input.trim())) { cur.set([...cur.items,cur.input.trim()]); cur.setInput(""); }}}
          placeholder={cur.placeholder}
          style={{ flex:1, padding:"8px 12px", border:"1.5px solid #e0dbd2", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:"none" }} />
        <button onClick={() => { if(cur.input.trim()&&!cur.items.includes(cur.input.trim())) { cur.set([...cur.items,cur.input.trim()]); cur.setInput(""); }}}
          style={{ padding:"8px 14px", background:"#1a1a1a", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>+</button>
      </div>
    </Card>
  );
}

function SettingsTab({
  itemsDb, activeTheme, setActiveTheme,
  showNavLabels, setShowNavLabels,
  density, setDensity,
  fontSize, setFontSize,
  accentOverride, setAccentOverride,
  defaultTab, setDefaultTab,
  outfitSort, setOutfitSort,
  wlSort, setWlSort,
  guestMode, setGuestMode,
  temperatureUnit, setTemperatureUnit,
  travelCityBehavior, setTravelCityBehavior,
  outfitReminderDay, setOutfitReminderDay,
  outfitReminderTime, setOutfitReminderTime,
  rainyDaySuggestions, setRainyDaySuggestions,
  hideSoldByDefault, setHideSoldByDefault,
  hideArchivedByDefault, setHideArchivedByDefault,
  defaultClosetViewMode, setDefaultClosetViewMode,
  defaultOnlyUnworn, setDefaultOnlyUnworn,
  defaultOnlyInSeason, setDefaultOnlyInSeason,
  allDb,
  closetSort, setClosetSort,
  closetSeasonFilter, setClosetSeasonFilter,
  customCategories, setCustomCategories,
  customOccasions, setCustomOccasions,
  customSeasons, setCustomSeasons,
  lastSynced, allItemsForExport,
  monthlyBudget, setMonthlyBudget,
  annualBudget, setAnnualBudget,
  restoreLookbook,
  restoreOutfit,
  deleteOutfit,
  supabaseArchivedOutfits = [],
  homeCity, setHomeCity,
}) {
  const [settingsTab, setSettingsTab] = useState("appearance");
  const [themeId, setThemeId] = useState(() => { try { return localStorage.getItem(THEME_KEY) || "parchment"; } catch { return "parchment"; } });
  const [homeCityInput, setHomeCityInput] = useState(homeCity || "");
  const [homeCitySaved, setHomeCitySaved] = useState(false);
  const [showAdvancedAppearance, setShowAdvancedAppearance] = useState(Boolean(accentOverride));
  const [styleGoal, setStyleGoal] = useState(() => { try { return localStorage.getItem("wardrobe_style_goal_v1") || ""; } catch { return ""; } });
  const [shoppingIntention, setShoppingIntention] = useState(() => { try { return localStorage.getItem("wardrobe_shopping_intention_v1") || ""; } catch { return ""; } });
  const [buyLessOf, setBuyLessOf] = useState(() => { try { return localStorage.getItem("wardrobe_buy_less_v1") || ""; } catch { return ""; } });
  const [buyMoreOf, setBuyMoreOf] = useState(() => { try { return localStorage.getItem("wardrobe_buy_more_v1") || ""; } catch { return ""; } });

  // Wear counts
  const [wornItems, setWornItems] = useState(() => itemsDb.rows.filter(i => (i.wornCount || 0) > 0).sort((a,b) => (b.wornCount||0)-(a.wornCount||0)));
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(null);

  // Custom lists editing
  const [newCatInput, setNewCatInput] = useState("");
  const [newOccInput, setNewOccInput] = useState("");
  const [newSeaInput, setNewSeaInput] = useState("");

  // Data & sync
  const [importMsg, setImportMsg] = useState(null);
  const importRef = useRef(null);

  // Archived moodboards
  const MB_ARCHIVE_KEY = "wardrobe_moodboards_archived_v1";
  const MB_ACTIVE_KEY  = "wardrobe_moodboards_v1";
  const [archivedBoards, setArchivedBoards] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_moodboards_archived_v1") || "[]"); } catch { return []; } });

  // Archived lookbooks
  const LB_ARCHIVE_KEY = "wardrobe_lookbooks_archived_v1";
  const [archivedLookbooks, setArchivedLookbooks] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_lookbooks_archived_v1") || "[]"); } catch { return []; } });

  // Archived outfits
  const OUTFIT_ARCHIVE_KEY = "wardrobe_outfits_archived_v1";
  const [archivedOutfits, setArchivedOutfits] = useState(() => { try { return JSON.parse(localStorage.getItem(OUTFIT_ARCHIVE_KEY) || "[]"); } catch { return []; } });

  useEffect(() => {
    setWornItems(itemsDb.rows.filter(i => (i.wornCount || 0) >= 0).sort((a,b) => (b.wornCount||0)-(a.wornCount||0)));
  }, [itemsDb.rows]);

  const applyTheme = (id) => {
    setThemeId(id);
    try { localStorage.setItem(THEME_KEY, id); } catch {}
    const t = THEMES.find(th => th.id === id) || THEMES[0];
    if (setActiveTheme) setActiveTheme(t);
  };

  const saveWorn = (item, val) => {
    const count = Math.max(0, parseInt(val) || 0);
    itemsDb.update({ ...item, wornCount: count });
    setEditingId(null);
    setSaved(item.id);
    setTimeout(() => setSaved(null), 1500);
  };

  const resetAllWorn = () => {
    itemsDb.rows.forEach(item => { if ((item.wornCount||0) > 0) itemsDb.update({ ...item, wornCount: 0 }); });
    setConfirmReset(false);
    setSaved("all");
    setTimeout(() => setSaved(null), 2000);
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const rows = allItemsForExport || itemsDb.rows;
    const headers = ["id","name","brand","category","color","price","season","occasions","wornCount","purchaseDate","notes","link"];
    const lines = [headers.join(",")];
    rows.forEach(item => {
      const row = headers.map(h => {
        let val = item[h] || "";
        if (Array.isArray(val)) val = val.join(";");
        val = String(val).replace(/"/g, '""');
        if (val.includes(",") || val.includes('"') || val.includes("\n")) val = `"${val}"`;
        return val;
      });
      lines.push(row.join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wardrobe_closet.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export JSON ──
  const exportJSON = () => {
    const rows = allItemsForExport || itemsDb.rows;
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wardrobe_closet.json"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import CSV ──
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split("\n").filter(Boolean);
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        let imported = 0;
        lines.slice(1).forEach(line => {
          const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,))/g) || [];
          const obj = {};
          headers.forEach((h, i) => {
            let v = (vals[i] || "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
            obj[h] = v;
          });
          if (obj.name) { itemsDb.add(obj); imported++; }
        });
        setImportMsg(`✓ Imported ${imported} items`);
        setTimeout(() => setImportMsg(null), 3000);
      } catch(err) {
        setImportMsg("✗ Import failed — check CSV format");
        setTimeout(() => setImportMsg(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const fmtSynced = (ts) => {
    if (!ts) return "Never";
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
  };

  const Card = ({ children, style={} }) => (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #ece8e0", padding:"20px 22px", marginBottom:16, ...style }}>{children}</div>
  );
  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:10, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>{children}</div>
  );
  const Toggle = ({ value, onChange, label, sub }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f5f3ef" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{
        width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
        background: value ? "#1a1a1a" : "#e0dbd2",
        position:"relative", transition:"background 0.2s", flexShrink:0
      }}>
        <div style={{
          position:"absolute", top:3, left: value?20:3,
          width:18, height:18, borderRadius:"50%", background:"#fff",
          transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)"
        }} />
      </button>
    </div>
  );

  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const effectiveAccent = accentOverride || activeTheme.accent;

  useEffect(() => { try { localStorage.setItem("wardrobe_style_goal_v1", styleGoal); } catch {} }, [styleGoal]);
  useEffect(() => { try { localStorage.setItem("wardrobe_shopping_intention_v1", shoppingIntention); } catch {} }, [shoppingIntention]);
  useEffect(() => { try { localStorage.setItem("wardrobe_buy_less_v1", buyLessOf); } catch {} }, [buyLessOf]);
  useEffect(() => { try { localStorage.setItem("wardrobe_buy_more_v1", buyMoreOf); } catch {} }, [buyMoreOf]);

  const parsePrice = (p) => parseFloat((p || "").replace(/[^0-9.]/g, "")) || 0;
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const thisYear = String(now.getFullYear());
  const spentThisMonth = itemsDb.rows.filter(i => (i.purchaseDate||"").startsWith(thisMonth)).reduce((s,i) => s + parsePrice(i.price), 0);
  const spentThisYear = itemsDb.rows.filter(i => (i.purchaseDate||"").startsWith(thisYear)).reduce((s,i) => s + parsePrice(i.price), 0);
  const monthPct = monthlyBudget > 0 ? Math.min((spentThisMonth / monthlyBudget) * 100, 100) : 0;
  const yearPct = annualBudget > 0 ? Math.min((spentThisYear / annualBudget) * 100, 100) : 0;
  const monthOver = monthlyBudget > 0 && spentThisMonth > monthlyBudget;
  const yearOver = annualBudget > 0 && spentThisYear > annualBudget;
  const monthColor = monthPct > 90 ? "#e05555" : monthPct > 70 ? "#d97706" : "#3aaa6e";
  const yearColor = yearPct > 90 ? "#e05555" : yearPct > 70 ? "#d97706" : "#3aaa6e";

  const TABS = [["appearance","Appearance"],["goals","Goals"],["defaults","Wardrobe Defaults"],["backup","Backup & Recovery"],["account","Account"]];

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"4px 0 40px" }}>

      {/* Tab nav */}
      <div style={{ display:"flex", gap:4, marginBottom:24, background:"#f5f3ef", borderRadius:14, padding:4, width:"fit-content" }}>
        {TABS.map(([v,l]) => (
          <button key={v} onClick={()=>setSettingsTab(v)} style={{
            padding:"7px 16px", border:"none", borderRadius:11, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700,
            background: settingsTab===v?"#fff":"transparent",
            color: settingsTab===v?"#1a1a1a":"#aaa",
            boxShadow: settingsTab===v?"0 1px 4px rgba(0,0,0,0.1)":"none",
            transition:"all 0.15s"
          }}>{l}</button>
        ))}
      </div>

      {/* ════════════ APPEARANCE ════════════ */}
      {settingsTab === "appearance" && (<>

        {/* Theme */}
        <Card>
          <SectionLabel>App Theme</SectionLabel>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => applyTheme(t.id)} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                background:"none", border:"none", cursor:"pointer", padding:0
              }}>
                <div style={{
                  width:72, height:72, borderRadius:16, overflow:"hidden",
                  border: themeId===t.id ? "2.5px solid #1a1a1a" : "2px solid #e0dbd2",
                  boxShadow: themeId===t.id ? "0 4px 16px rgba(0,0,0,0.14)" : "0 1px 4px rgba(0,0,0,0.06)",
                  display:"flex", position:"relative",
                }}>
                  <div style={{ width:15, background:t.nav, borderRight:`1px solid ${t.border}`, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:8, gap:5 }}>
                    <div style={{ width:9, height:9, borderRadius:3, background:t.navActive }} />
                    {[1,2,3].map(x => <div key={x} style={{ width:6, height:4, borderRadius:2, background:t.border }} />)}
                  </div>
                  <div style={{ flex:1, background:t.bg, padding:"6px 5px", display:"flex", flexDirection:"column", gap:4 }}>
                    <div style={{ height:7, borderRadius:3, background:t.card, border:`1px solid ${t.border}` }} />
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                      {[1,2,3,4].map(x => <div key={x} style={{ height:16, borderRadius:4, background:t.card, border:`1px solid ${t.border}` }} />)}
                    </div>
                  </div>
                  {themeId===t.id && (
                    <div style={{ position:"absolute", bottom:5, right:5, width:16, height:16, borderRadius:"50%", background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <span style={{ fontSize:10, fontWeight:themeId===t.id?700:500, color:themeId===t.id?"#1a1a1a":"#888", fontFamily:"'DM Sans',sans-serif" }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Density */}
        <Card>
          <SectionLabel>Display Density</SectionLabel>
          <div style={{ display:"flex", gap:10 }}>
            {[["compact","Compact"],["comfortable","Comfortable"],["spacious","Spacious"]].map(([v,l]) => (
              <button key={v} onClick={() => setDensity(v)} style={{
                flex:1, padding:"14px 10px", borderRadius:14,
                border: density===v ? "2px solid #1a1a1a" : "1.5px solid #e0dbd2",
                background: density===v ? "#1a1a1a" : "#fafaf8",
                color: density===v ? "#fff" : "#888",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700,
                display:"flex", flexDirection:"column", alignItems:"center", gap:8
              }}>
                {/* Mini density preview */}
                <div style={{ display:"flex", flexDirection:"column", gap: v==="compact"?2:v==="comfortable"?4:7, width:40 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: v==="compact"?4:v==="comfortable"?5:7, borderRadius:3, background: density===v?"rgba(255,255,255,0.3)":"#e0dbd2" }} />)}
                </div>
                {l}
              </button>
            ))}
          </div>
        </Card>

        {/* Font Size */}
        <Card>
          <SectionLabel>Font Size</SectionLabel>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:11, color:"#aaa", fontWeight:700, flexShrink:0 }}>A</span>
            <input type="range" min={12} max={18} step={1} value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ flex:1, accentColor: effectiveAccent }} />
            <span style={{ fontSize:17, color:"#aaa", fontWeight:700, flexShrink:0 }}>A</span>
            <span style={{ fontSize:12, color:"#888", minWidth:34, textAlign:"right" }}>{fontSize}px</span>
          </div>
        </Card>

        {/* Toggles */}
        <Card>
          <SectionLabel>Display Options</SectionLabel>
          <Toggle value={showNavLabels} onChange={setShowNavLabels} label="Show nav labels" sub="Display text labels under sidebar icons" />
        </Card>

        <Card>
          <SectionLabel>Advanced Appearance</SectionLabel>
          <button onClick={() => setShowAdvancedAppearance(v => !v)} style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 14px", borderRadius:12, border:"1.5px solid #e0dbd2", background:"#fafaf8",
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#1a1a1a"
          }}>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Accent override</div>
              <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{accentOverride ? accentOverride : "Using theme default"}</div>
            </div>
            <div style={{ fontSize:12, color:"#888", fontWeight:700 }}>{showAdvancedAppearance ? "Hide" : "Show"}</div>
          </button>
          {showAdvancedAppearance && (
            <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:14 }}>
              <input type="color" value={accentOverride || activeTheme.accent}
                onChange={e => setAccentOverride(e.target.value)}
                style={{ width:40, height:40, border:"1.5px solid #e0dbd2", borderRadius:10, cursor:"pointer", padding:2, background:"#fff" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>
                  {accentOverride ? "Custom override active" : "Using theme default"}
                </div>
                <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>
                  {accentOverride || activeTheme.accent}
                </div>
              </div>
              {accentOverride && (
                <button onClick={() => setAccentOverride("")} style={{
                  padding:"6px 12px", borderRadius:8, border:"1.5px solid #e0dbd2",
                  background:"#fff", color:"#888", fontSize:11, fontWeight:600, cursor:"pointer"
                }}>Reset</button>
              )}
            </div>
          )}
        </Card>
      </>)}

      {/* ════════════ GOALS ════════════ */}
      {settingsTab === "goals" && (<>

        <Card>
          <SectionLabel>Wardrobe Direction</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Style goal</div>
              <textarea
                value={styleGoal}
                onChange={e => setStyleGoal(e.target.value)}
                placeholder="What are you optimizing for this season?"
                rows={3}
                style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid #e0dbd2", fontSize:13, fontFamily:"'DM Sans', sans-serif", background:"#fafaf8", color:"#1a1a1a", outline:"none", resize:"vertical" }}
              />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Shopping intention</div>
              <textarea
                value={shoppingIntention}
                onChange={e => setShoppingIntention(e.target.value)}
                placeholder="Define how you want to shop right now: more intentional, fewer duplicates, event-specific, etc."
                rows={3}
                style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid #e0dbd2", fontSize:13, fontFamily:"'DM Sans', sans-serif", background:"#fafaf8", color:"#1a1a1a", outline:"none", resize:"vertical" }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <SectionLabel>Buy Less / Buy More</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Buy less of</div>
              <textarea
                value={buyLessOf}
                onChange={e => setBuyLessOf(e.target.value)}
                placeholder="Impulse basics, duplicates, occasion-only pieces..."
                rows={4}
                style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid #e0dbd2", fontSize:13, fontFamily:"'DM Sans', sans-serif", background:"#fafaf8", color:"#1a1a1a", outline:"none", resize:"vertical" }}
              />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Buy more of</div>
              <textarea
                value={buyMoreOf}
                onChange={e => setBuyMoreOf(e.target.value)}
                placeholder="Workhorse pieces, layering items, better shoes..."
                rows={4}
                style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid #e0dbd2", fontSize:13, fontFamily:"'DM Sans', sans-serif", background:"#fafaf8", color:"#1a1a1a", outline:"none", resize:"vertical" }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <SectionLabel>Spending Targets</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>Monthly Budget</div>
                  <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>Resets each calendar month</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13, color:"#888", fontWeight:600 }}>$</span>
                  <input
                    type="number" min="0" step="50"
                    value={monthlyBudget || ""}
                    onChange={e => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width:90, padding:"7px 10px", border:"1.5px solid #e0dbd2", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, textAlign:"right", outline:"none", background:"#fafaf8" }}
                  />
                </div>
              </div>
              {monthlyBudget > 0 && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:600, marginBottom:5 }}>
                    <span style={{ color: monthOver ? "#e05555" : "#888" }}>
                      {monthOver ? `$${(spentThisMonth - monthlyBudget).toFixed(0)} over` : `$${spentThisMonth.toFixed(0)} spent`}
                    </span>
                    <span style={{ color:"#bbb" }}>${monthlyBudget.toFixed(0)} target</span>
                  </div>
                  <div style={{ height:8, borderRadius:99, background:"#f0ede8", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${monthPct}%`, background: monthColor, borderRadius:99, transition:"width 0.5s" }} />
                  </div>
                  <div style={{ fontSize:11, color: monthOver ? "#e05555" : monthColor, fontWeight:700, marginTop:5, textAlign:"right" }}>
                    {monthOver ? "Over budget" : `$${Math.max(monthlyBudget - spentThisMonth, 0).toFixed(0)} remaining`}
                  </div>
                </div>
              )}
            </div>

            <div style={{ height:1, background:"#f0ede8" }} />

            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>Annual Budget</div>
                  <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>Tracks spending across {thisYear}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13, color:"#888", fontWeight:600 }}>$</span>
                  <input
                    type="number" min="0" step="100"
                    value={annualBudget || ""}
                    onChange={e => setAnnualBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width:90, padding:"7px 10px", border:"1.5px solid #e0dbd2", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, textAlign:"right", outline:"none", background:"#fafaf8" }}
                  />
                </div>
              </div>
              {annualBudget > 0 && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:600, marginBottom:5 }}>
                    <span style={{ color: yearOver ? "#e05555" : "#888" }}>
                      {yearOver ? `$${(spentThisYear - annualBudget).toFixed(0)} over` : `$${spentThisYear.toFixed(0)} spent`}
                    </span>
                    <span style={{ color:"#bbb" }}>${annualBudget.toFixed(0)} target</span>
                  </div>
                  <div style={{ height:8, borderRadius:99, background:"#f0ede8", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${yearPct}%`, background: yearColor, borderRadius:99, transition:"width 0.5s" }} />
                  </div>
                  <div style={{ fontSize:11, color: yearOver ? "#e05555" : yearColor, fontWeight:700, marginTop:5, textAlign:"right" }}>
                    {yearOver ? "Over budget" : `$${Math.max(annualBudget - spentThisYear, 0).toFixed(0)} remaining`}
                  </div>
                </div>
              )}
            </div>

          </div>
        </Card>
      </>)}

      {/* ════════════ WARDROBE DEFAULTS ════════════ */}
      {settingsTab === "defaults" && (<>

        {/* Home Location */}
        <Card>
          <SectionLabel>Home Location</SectionLabel>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>
            Used for weather across the app — Home tab and outfit calendar. You can still override the city in the calendar for travel.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={homeCityInput}
              onChange={e => { setHomeCityInput(e.target.value); setHomeCitySaved(false); }}
              onKeyDown={e => { if (e.key === "Enter") { const c = homeCityInput.trim(); if (c) { setHomeCity(c); setHomeCitySaved(true); setTimeout(() => setHomeCitySaved(false), 2000); } } }}
              placeholder="e.g. New York, NY"
              style={{ flex: 1, padding: "9px 11px", borderRadius: 10, border: "1.5px solid #e0dbd2", fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "#fafaf8", color: "#1a1a1a", outline: "none" }}
            />
            <button
              onClick={() => { const c = homeCityInput.trim(); if (!c) return; setHomeCity(c); setHomeCitySaved(true); setTimeout(() => setHomeCitySaved(false), 2000); }}
              disabled={!homeCityInput.trim()}
              style={{ padding: "9px 16px", borderRadius: 10, background: homeCitySaved ? "#3aaa6e" : "#1a1a1a", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, transition: "background 0.2s", opacity: !homeCityInput.trim() ? 0.5 : 1 }}
            >
              {homeCitySaved ? "Saved ✓" : "Save"}
            </button>
          </div>
          {homeCity && <div style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>Current: {homeCity}</div>}
        </Card>

        {/* Default Landing Tab */}
        <Card>
          <SectionLabel>Default Landing Tab</SectionLabel>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["closet","Closet"],["outfits","Outfits"],["lookbooks","Lookbooks"],["wishlist","Wishlist"],["moodboard","Moodboard"],["stats","Stats"],["settings","Settings"]].map(([v,l]) => (
              <button key={v} onClick={() => setDefaultTab(v)} style={{
                padding:"7px 14px", borderRadius:20,
                border: defaultTab===v ? `1.5px solid ${effectiveAccent}` : "1.5px solid #e0dbd2",
                background: defaultTab===v ? effectiveAccent : "#fff",
                color: defaultTab===v ? "#fff" : "#888",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
              }}>{l}</button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Calendar + Weather Defaults</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Temperature unit</div>
              <div style={{ display:"flex", gap:8 }}>
                {[["fahrenheit","Fahrenheit"],["celsius","Celsius"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTemperatureUnit(v)} style={{
                    padding:"7px 14px", borderRadius:20,
                    border: temperatureUnit===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                    background: temperatureUnit===v ? "#1a1a1a" : "#fff",
                    color: temperatureUnit===v ? "#fff" : "#888",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Travel city behavior</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["ask","Ask when traveling"],["home","Prefer home city"],["travel","Prefer travel city"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTravelCityBehavior(v)} style={{
                    padding:"7px 14px", borderRadius:20,
                    border: travelCityBehavior===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                    background: travelCityBehavior===v ? "#1a1a1a" : "#fff",
                    color: travelCityBehavior===v ? "#fff" : "#888",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Outfit reminder day</div>
                <select value={outfitReminderDay} onChange={e => setOutfitReminderDay(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e0dbd2", fontSize:13, fontFamily:"'DM Sans', sans-serif", background:"#fafaf8", color:"#1a1a1a", outline:"none" }}>
                  {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Outfit reminder time</div>
                <input type="time" value={outfitReminderTime} onChange={e => setOutfitReminderTime(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e0dbd2", fontSize:13, fontFamily:"'DM Sans', sans-serif", background:"#fafaf8", color:"#1a1a1a", outline:"none" }} />
              </div>
            </div>
            <Toggle value={rainyDaySuggestions} onChange={setRainyDaySuggestions} label="Rainy-day suggestions" sub="Prefer weather-aware prompts when rain is in the forecast" />
          </div>
        </Card>

        {/* Default sort + season */}
        <Card>
          <SectionLabel>Closet Rules</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:14 }}>
            <Toggle value={hideSoldByDefault} onChange={setHideSoldByDefault} label="Hide sold items by default" sub="Keep sold pieces out of everyday browsing" />
            <Toggle value={hideArchivedByDefault} onChange={setHideArchivedByDefault} label="Hide archived items by default" sub="Show only active wardrobe pieces in regular views" />
            <Toggle value={defaultOnlyUnworn} onChange={setDefaultOnlyUnworn} label="Start with only unworn items" sub="Useful when you want outfit building to begin with underused pieces" />
            <Toggle value={defaultOnlyInSeason} onChange={setDefaultOnlyInSeason} label="Start with only in-season items" sub="Bias closet browsing toward your saved season filter" />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Default view mode</div>
              <div style={{ display:"flex", gap:8 }}>
                {[["grid","Grid"],["list","List"]].map(([v, l]) => (
                  <button key={v} onClick={() => setDefaultClosetViewMode(v)} style={{
                    padding:"7px 14px", borderRadius:20,
                    border: defaultClosetViewMode===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                    background: defaultClosetViewMode===v ? "#1a1a1a" : "#fff",
                    color: defaultClosetViewMode===v ? "#fff" : "#888",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Default Sort</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {[["default","Date Added"],["az","A → Z"],["price","Price"],["worn","Most Worn"],["newest","Newest First"]].map(([v,l]) => (
                  <button key={v} onClick={() => setClosetSort(v)} style={{
                    padding:"7px 14px", borderRadius:20,
                    border: closetSort===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                    background: closetSort===v ? "#1a1a1a" : "#fff",
                    color: closetSort===v ? "#fff" : "#888",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:8 }}>Default Season Filter</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {["All", ...customSeasons].map(v => (
                  <button key={v} onClick={() => setClosetSeasonFilter(v)} style={{
                    padding:"7px 14px", borderRadius:20,
                    border: closetSeasonFilter===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                    background: closetSeasonFilter===v ? "#1a1a1a" : "#fff",
                    color: closetSeasonFilter===v ? "#fff" : "#888",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
                  }}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Default Outfits Sort */}
        <Card>
          <SectionLabel>Default Outfits Sort</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[["default","Date Added"],["az","A → Z"],["worn","Most Worn"],["newest","Newest"]].map(([v,l]) => (
              <button key={v} onClick={() => setOutfitSort(v)} style={{
                padding:"7px 14px", borderRadius:20,
                border: outfitSort===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                background: outfitSort===v ? "#1a1a1a" : "#fff",
                color: outfitSort===v ? "#fff" : "#888",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
              }}>{l}</button>
            ))}
          </div>
        </Card>

        {/* Default Wishlist Sort */}
        <Card>
          <SectionLabel>Default Wishlist Sort</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[["priority","Priority"],["store","Store"],["category","Category"],["price","Price"],["added","Recently Added"]].map(([v,l]) => (
              <button key={v} onClick={() => setWlSort(v)} style={{
                padding:"7px 14px", borderRadius:20,
                border: wlSort===v ? "1.5px solid #1a1a1a" : "1.5px solid #e0dbd2",
                background: wlSort===v ? "#1a1a1a" : "#fff",
                color: wlSort===v ? "#fff" : "#888",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700
              }}>{l}</button>
            ))}
          </div>
        </Card>

        {/* Tag Lists — consolidated */}
        <TagListsCard
          customCategories={customCategories} setCustomCategories={setCustomCategories}
          customOccasions={customOccasions} setCustomOccasions={setCustomOccasions}
          customSeasons={customSeasons} setCustomSeasons={setCustomSeasons}
          newCatInput={newCatInput} setNewCatInput={setNewCatInput}
          newOccInput={newOccInput} setNewOccInput={setNewOccInput}
          newSeaInput={newSeaInput} setNewSeaInput={setNewSeaInput}
          Card={Card} SectionLabel={SectionLabel}
        />
      </>)}

      {/* ════════════ BACKUP & RECOVERY ════════════ */}
      {settingsTab === "backup" && (<>

        {/* Storage Usage */}
        {(() => {
          const tables = [
            ["Closet items", allDb?.items?.length || 0],
            ["Outfits", allDb?.outfits?.length || 0],
            ["Lookbooks", allDb?.lookbooks?.length || 0],
            ["Wishlist", allDb?.wishlist?.length || 0],
            ["Moodboards", allDb?.moodboards?.length || 0],
          ];
          const total = tables.reduce((s, [,n]) => s + n, 0);
          return (
            <Card>
              <SectionLabel>Storage</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {tables.map(([label, count]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, color:"#666" }}>{label}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:80, height:5, borderRadius:99, background:"#f0ede8", overflow:"hidden" }}>
                        <div style={{ height:"100%", width: total > 0 ? `${(count/Math.max(total,1))*100}%` : "0%", background: effectiveAccent, borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", minWidth:24, textAlign:"right" }}>{count}</span>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid #f0ede8", paddingTop:10, display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:13 }}>
                  <span style={{ color:"#888" }}>Total</span>
                  <span>{total}</span>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* App Password */}
        <AppPasswordCard />

        {/* Supabase status */}
        <Card>
          <SectionLabel>Sync Status</SectionLabel>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"#f0faf4", borderRadius:12, border:"1px solid #c8e8d0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#3aaa6e", flexShrink:0, boxShadow:"0 0 6px #3aaa6e" }} />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#2d6a3f" }}>Connected to Supabase</div>
                <div style={{ fontSize:11, color:"#5aaa7e", marginTop:1 }}>Last synced: {fmtSynced(lastSynced)}</div>
              </div>
            </div>
            <div style={{ textAlign:"right", fontSize:11, color:"#5aaa7e", fontWeight:600 }}>{itemsDb.rows.length} items</div>
          </div>
        </Card>

        {/* Archived Moodboards */}
        {archivedBoards.length > 0 && (
          <Card>
            <SectionLabel>Archived Moodboards</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {archivedBoards.map((board, i) => (
                <div key={board.id||i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#fafaf8", borderRadius:12, border:"1px solid #ece8e0" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{board.name||"Unnamed Board"}</div>
                    <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>{(board.items||[]).length} items · archived {board.archivedAt ? new Date(board.archivedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</div>
                  </div>
                  <button onClick={() => {
                    try {
                      const active = JSON.parse(localStorage.getItem(MB_ACTIVE_KEY)||"[]");
                      const restored = { ...board }; delete restored.archivedAt;
                      active.push(restored);
                      localStorage.setItem(MB_ACTIVE_KEY, JSON.stringify(active));
                      const updated = archivedBoards.filter((_,idx)=>idx!==i);
                      localStorage.setItem(MB_ARCHIVE_KEY, JSON.stringify(updated));
                      setArchivedBoards(updated);
                    } catch {}
                  }} style={{ padding:"6px 12px", background:"#f0faf4", border:"1px solid #b6e8c8", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#2d6a3f", flexShrink:0 }}>Restore</button>
                  <button onClick={() => {
                    if (window.confirm(`Permanently delete "${board.name||"this board"}"?`)) {
                      const updated = archivedBoards.filter((_,idx)=>idx!==i);
                      localStorage.setItem(MB_ARCHIVE_KEY, JSON.stringify(updated));
                      setArchivedBoards(updated);
                    }
                  }} style={{ padding:"6px 10px", background:"#fff8f8", border:"1px solid #ffd0d0", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#e05555", flexShrink:0 }}>Delete</button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Archived Lookbooks */}
        {archivedLookbooks.length > 0 && (
          <Card>
            <SectionLabel>Archived Lookbooks</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {archivedLookbooks.map((lb, i) => (
                <div key={lb.id||i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#fafaf8", borderRadius:12, border:"1px solid #ece8e0" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lb.name||"Unnamed Lookbook"}</div>
                    <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>{(lb.outfitIds||[]).length} looks · archived {lb.archivedAt ? new Date(lb.archivedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</div>
                  </div>
                  <button onClick={async () => {
                    const restored = { ...lb }; delete restored.archivedAt;
                    if (restoreLookbook) await restoreLookbook(restored);
                    const updated = archivedLookbooks.filter((_,idx)=>idx!==i);
                    localStorage.setItem(LB_ARCHIVE_KEY, JSON.stringify(updated));
                    setArchivedLookbooks(updated);
                  }} style={{ padding:"6px 12px", background:"#f0faf4", border:"1px solid #b6e8c8", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#2d6a3f", flexShrink:0 }}>Restore</button>
                  <button onClick={() => {
                    if (window.confirm(`Permanently delete "${lb.name||"this lookbook"}"?`)) {
                      const updated = archivedLookbooks.filter((_,idx)=>idx!==i);
                      localStorage.setItem(LB_ARCHIVE_KEY, JSON.stringify(updated));
                      setArchivedLookbooks(updated);
                    }
                  }} style={{ padding:"6px 10px", background:"#fff8f8", border:"1px solid #ffd0d0", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#e05555", flexShrink:0 }}>Delete</button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Archived Outfits */}
        {(() => {
          const lsIds = new Set(archivedOutfits.map(o => o.id));
          const merged = [...archivedOutfits, ...supabaseArchivedOutfits.filter(o => !lsIds.has(o.id))];
          return merged.length > 0 && (
          <Card>
            <SectionLabel>Archived Outfits</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {merged.map((outfit, i) => (
                <div key={outfit.id||i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#fafaf8", borderRadius:12, border:"1px solid #ece8e0" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{outfit.name||"Unnamed Outfit"}</div>
                    <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>{(outfit.layers||outfit.itemIds||[]).length} pieces · archived {outfit.archivedAt ? new Date(outfit.archivedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</div>
                  </div>
                  <button onClick={async () => {
                    if (restoreOutfit) await restoreOutfit(outfit);
                    const updated = archivedOutfits.filter(o => o.id !== outfit.id);
                    localStorage.setItem(OUTFIT_ARCHIVE_KEY, JSON.stringify(updated));
                    setArchivedOutfits(updated);
                  }} style={{ padding:"6px 12px", background:"#f0faf4", border:"1px solid #b6e8c8", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#2d6a3f", flexShrink:0 }}>Restore</button>
                  <button onClick={async () => {
                    if (window.confirm(`Permanently delete "${outfit.name||"this outfit"}"?`)) {
                      if (deleteOutfit) await deleteOutfit(outfit);
                      const updated = archivedOutfits.filter(o => o.id !== outfit.id);
                      localStorage.setItem(OUTFIT_ARCHIVE_KEY, JSON.stringify(updated));
                      setArchivedOutfits(updated);
                    }
                  }} style={{ padding:"6px 10px", background:"#fff8f8", border:"1px solid #ffd0d0", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#e05555", flexShrink:0 }}>Delete</button>
                </div>
              ))}
            </div>
          </Card>
        );})()}

        {/* Export */}
        <Card>
          <SectionLabel>Export</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#fafaf8", borderRadius:12, border:"1px solid #e8e4dc" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>Export as CSV</div>
                <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>Spreadsheet-compatible, all closet fields</div>
              </div>
              <button onClick={exportCSV} style={{
                padding:"8px 18px", background:"#1a1a1a", color:"#fff", border:"none",
                borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, flexShrink:0
              }}>Download CSV</button>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#fafaf8", borderRadius:12, border:"1px solid #e8e4dc" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>Export as JSON</div>
                <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>Full data with all fields, for backup or import</div>
              </div>
              <button onClick={exportJSON} style={{
                padding:"8px 18px", background:"#1a1a1a", color:"#fff", border:"none",
                borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, flexShrink:0
              }}>Download JSON</button>
            </div>
          </div>
        </Card>

        {/* Import */}
        <Card>
          <SectionLabel>Import</SectionLabel>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#fafaf8", borderRadius:12, border:"1px solid #e8e4dc" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>Import from CSV</div>
              <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>Adds items to your closet. Requires a "name" column.</div>
            </div>
            <button onClick={() => importRef.current?.click()} style={{
              padding:"8px 18px", background:"#f5f3ef", color:"#555", border:"1.5px solid #e0dbd2",
              borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, flexShrink:0
            }}>Choose CSV</button>
            <input ref={importRef} type="file" accept=".csv" style={{ display:"none" }} onChange={importCSV} />
          </div>
          {importMsg && (
            <div style={{ marginTop:10, padding:"8px 14px", borderRadius:10, background: importMsg.startsWith("✓")?"#f0faf4":"#fff0f0", color: importMsg.startsWith("✓")?"#2d6a3f":"#e05555", fontSize:12, fontWeight:700 }}>
              {importMsg}
            </div>
          )}
        </Card>

        {/* Wear Counts */}
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <SectionLabel>Wear Counts</SectionLabel>
            <button onClick={() => setConfirmReset(true)} style={{
              padding:"5px 12px", borderRadius:20, border:"1px solid #ffd0d0",
              background:"#fff8f8", color:"#e05555", fontSize:11, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5
            }}>Reset All to 0</button>
          </div>
          <div style={{ position:"relative", marginBottom:14 }}>
            <SvgSearch size={13} color="#bbb" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
              style={{ width:"100%", padding:"8px 12px 8px 34px", border:"1px solid #e0dbd2", borderRadius:100, fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:"none", background:"#fafaf8", boxSizing:"border-box" }} />
          </div>
          {saved==="all" && <div style={{ background:"#f0faf4", border:"1px solid #b6e8c8", borderRadius:10, padding:"8px 14px", marginBottom:12, fontSize:12, color:"#2d6a3f", fontWeight:600 }}>✓ All wear counts reset to 0</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:420, overflowY:"auto" }}>
            {(search ? itemsDb.rows.filter(i => (i.name||"").toLowerCase().includes(search.toLowerCase()) || (i.brand||"").toLowerCase().includes(search.toLowerCase())) : wornItems).map(item => (
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 10px", borderRadius:12, background:saved===item.id?"#f0faf4":"#fafaf8", border:`1px solid ${saved===item.id?"#b6e8c8":"#ece8e0"}`, transition:"all 0.2s" }}>
                <div style={{ width:40, height:40, borderRadius:8, overflow:"hidden", background:"#f5f2ed", flexShrink:0 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><SvgHanger size={16} color="#ccc" /></div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name||"Unnamed"}</div>
                  <div style={{ fontSize:11, color:"#aaa" }}>{item.brand||item.category||""}</div>
                </div>
                {editingId===item.id ? (
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <input type="number" min="0" value={editVal} onChange={e=>setEditVal(e.target.value)}
                      autoFocus onKeyDown={e=>{ if(e.key==="Enter")saveWorn(item,editVal); if(e.key==="Escape")setEditingId(null); }}
                      style={{ width:56, padding:"4px 8px", border:"1.5px solid #1a1a1a", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, textAlign:"center", outline:"none" }} />
                    <button onClick={()=>saveWorn(item,editVal)} style={{ padding:"4px 10px", borderRadius:8, background:"#1a1a1a", border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Save</button>
                    <button onClick={()=>setEditingId(null)} style={{ padding:"4px 8px", borderRadius:8, background:"#f0f0f0", border:"none", color:"#888", fontSize:11, cursor:"pointer" }}>✕</button>
                  </div>
                ) : (
                  <button onClick={()=>{ setEditingId(item.id); setEditVal(String(item.wornCount||0)); }} style={{
                    display:"flex", alignItems:"center", gap:6, padding:"5px 12px",
                    borderRadius:20, border:"1px solid #e0dbd2", background:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
                  }}>
                    <span style={{ fontSize:14, fontWeight:800, color:"#1a1a1a" }}>{item.wornCount||0}</span>
                    <span style={{ fontSize:10, color:"#aaa", fontWeight:600 }}>worn</span>
                    <SvgEdit size={11} color="#bbb" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </>)}

      {/* ════════════ ACCOUNT ════════════ */}
      {settingsTab === "account" && (<>

        <Card>
          <SectionLabel>Sync</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background: guestMode ? "#fff8e8" : "#f0faf4", borderRadius:12, border: guestMode ? "1px solid #f0d888" : "1px solid #c8e8d0" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background: guestMode ? "#d39b1b" : "#3aaa6e", flexShrink:0, boxShadow: guestMode ? "0 0 6px rgba(211,155,27,0.35)" : "0 0 6px #3aaa6e" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color: guestMode ? "#8a6a10" : "#2d6a3f" }}>
                  {guestMode ? "Local-only mode is on" : "Sync is active"}
                </div>
                <div style={{ fontSize:11, color: guestMode ? "#a3832d" : "#5aaa7e", marginTop:1 }}>
                  {guestMode ? "Changes stay on this device until sync is turned back on." : `Last synced: ${fmtSynced(lastSynced)}`}
                </div>
              </div>
              <div style={{ textAlign:"right", fontSize:11, color: guestMode ? "#a3832d" : "#5aaa7e", fontWeight:700 }}>
                {itemsDb.rows.length} items
              </div>
            </div>
            <Toggle value={guestMode} onChange={setGuestMode} label="Local only mode" sub="Disable Supabase sync and keep wardrobe changes on this device only" />
            <div style={{ fontSize:11, color:"#aaa", lineHeight:1.6 }}>
              Connection: {SUPABASE_URL.replace(/https?:\/\//, "").slice(0, 36)}
            </div>
          </div>
        </Card>

        {/* Clear All Data */}
        <Card>
          <SectionLabel>Danger Zone</SectionLabel>
          <div style={{ fontSize:13, color:"#888", marginBottom:14, lineHeight:1.5 }}>
            Permanently clear all app data from this browser. This cannot be undone.
          </div>
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} style={{
              padding:"10px 20px", borderRadius:12, border:"1.5px solid #e05555",
              background:"#fff", color:"#e05555", fontSize:13, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
            }}>Reset App…</button>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#e05555" }}>
                Type RESET to confirm:
              </div>
              <input
                value={resetConfirmText}
                onChange={e => setResetConfirmText(e.target.value)}
                placeholder="RESET"
                style={{ padding:"8px 12px", border:"1.5px solid #e05555", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", width:180 }}
              />
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { setShowResetConfirm(false); setResetConfirmText(""); }} style={{
                  padding:"9px 18px", borderRadius:10, border:"1px solid #e0dbd2",
                  background:"#fafaf8", cursor:"pointer", fontWeight:600, fontFamily:"'DM Sans',sans-serif", fontSize:13
                }}>Cancel</button>
                <button
                  disabled={resetConfirmText !== "RESET"}
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  style={{
                    padding:"9px 18px", borderRadius:10, border:"none",
                    background: resetConfirmText === "RESET" ? "#e05555" : "#f0dbd8",
                    color: resetConfirmText === "RESET" ? "#fff" : "#c0a0a0",
                    cursor: resetConfirmText === "RESET" ? "pointer" : "not-allowed",
                    fontWeight:700, fontFamily:"'DM Sans',sans-serif", fontSize:13
                  }}>Reset App</button>
              </div>
            </div>
          )}
        </Card>
      </>)}

      {/* Reset confirmation modal */}
      {confirmReset && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"28px 32px", maxWidth:360, width:"90%", textAlign:"center" }}>
            <div style={{ fontSize:16, fontWeight:800, marginBottom:8 }}>Reset all wear counts?</div>
            <div style={{ fontSize:13, color:"#888", marginBottom:24, lineHeight:1.5 }}>This will set every item's wear count back to 0. This cannot be undone.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmReset(false)} style={{ flex:1, padding:"10px", borderRadius:12, border:"1px solid #e0dbd2", background:"#fafaf8", cursor:"pointer", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={resetAllWorn} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", background:"#e05555", color:"#fff", cursor:"pointer", fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Reset All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {title}
      </div>
      {action && (
        <button onClick={action.onClick} style={{ fontSize: 12, fontWeight: 600, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

function HomeTab({ outfitCalendar, outfitsDb, itemsDb, lookbooksDb, wishlistDb, setTab, setActiveLookbook, setActiveLookbookView, setOutfitPopup, homeCity: homeCityProp, setHomeCity: setHomeCityProp, homeWeather: homeWeatherProp }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const todayKey = now.toISOString().slice(0, 10);
  const rawIds = outfitCalendar[todayKey] || [];
  const todayIds = Array.isArray(rawIds) ? rawIds : rawIds ? [rawIds] : [];
  const todayOutfits = todayIds.map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);

  const pinnedLookbooks = lookbooksDb.rows.filter(lb => lb.pinned);
  const allItems = itemsDb.rows;
  const closetItems = allItems.filter(i => !i.forSale);
  const parsePrice = (p) => parseFloat((p || "").replace(/[^0-9.]/g, "")) || 0;
  const totalValue = closetItems.reduce((s, i) => s + parsePrice(i.price), 0);
  const unwornCount = closetItems.filter(i => !(i.wornCount > 0)).length;
  const wornItems = closetItems.filter(i => (i.wornCount || 0) > 0);
  const wornPct = closetItems.length > 0 ? Math.round(wornItems.length / closetItems.length * 100) : 0;
  const cpwItems = closetItems.filter(i => (i.wornCount || 0) > 0 && parsePrice(i.price) > 0);
  const EXPECTED_CATS = ["Tops", "Trousers", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories"];
  const catsPresent = new Set(closetItems.map(i => i.category || ""));
  const missingCatCount = EXPECTED_CATS.filter(c => !catsPresent.has(c)).length;
  const totalWears = closetItems.reduce((s, i) => s + (i.wornCount || 0), 0);
  const healthScore = closetItems.length === 0 ? 0 : Math.min(100, Math.round(
    Math.min((totalWears / closetItems.length) * 20, 40) +
    Math.max(0, 30 - missingCatCount * 5) +
    (cpwItems.length > 0 ? Math.min((cpwItems.length / closetItems.length) * 60, 30) : 0)
  ));
  const healthColor = healthScore >= 80 ? "#3aaa6e" : healthScore >= 60 ? "#2090c0" : healthScore >= 40 ? "#a07000" : "#e05555";
  const healthLabel = healthScore >= 80 ? "Thriving" : healthScore >= 60 ? "Healthy" : healthScore >= 40 ? "Growing" : "Needs Love";

  // Monthly budget
  const monthlyBudget = (() => { try { return parseFloat(localStorage.getItem("wardrobe_monthly_budget") || "") || 0; } catch { return 0; } })();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthlySpend = closetItems.reduce((s, i) => {
    const d = new Date(i.purchaseDate || i.created_at || 0).getTime();
    return d >= thisMonthStart ? s + parsePrice(i.price) : s;
  }, 0);

  // Wear again suggestion
  const wearAgainItem = useMemo(() => {
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    const candidates = closetItems.filter(i => {
      if (!i.image) return false;
      if (!(i.wornCount > 0)) return true;
      const lastWorn = new Date(i.lastWornDate || 0).getTime();
      return lastWorn > 0 && lastWorn < sixtyDaysAgo;
    });
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, []); // eslint-disable-line

  // New In
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newInItems = closetItems
    .filter(i => { const d = new Date(i.created_at || i.purchaseDate || 0).getTime(); return d >= thirtyDaysAgo; })
    .sort((a, b) => new Date(b.created_at || b.purchaseDate || 0) - new Date(a.created_at || a.purchaseDate || 0))
    .slice(0, 8);

  // Seller stats
  const sellerItems = allItems.filter(i => i.forSale || i.status === "listed" || i.status === "sold" || i.status === "pending");
  const sellerListed = sellerItems.filter(i => (i.status === "listed" || i.forSale) && i.status !== "sold").length;
  const sellerSold = sellerItems.filter(i => i.status === "sold").length;
  const sellerPending = sellerItems.filter(i => i.status === "pending").length;
  const sellerEarned = sellerItems.filter(i => i.status === "sold").reduce((s, i) => s + parsePrice(i.netRevenue || i.salePrice), 0);
  const sellerPotential = sellerItems.filter(i => i.status !== "sold").reduce((s, i) => s + parsePrice(i.salePrice || i.price), 0);
  const hasSeller = sellerItems.length > 0;

  const highPriorityWish = wishlistDb.rows.filter(i => i.priority === "high").slice(0, 4);

  const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
  const cardStyle = { background: "#fff", borderRadius: 16, border: "1.5px solid #e8e4dc", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

  // Weather
  const homeCity = homeCityProp || "";
  const setHomeCity = (c) => { if (setHomeCityProp) setHomeCityProp(c); };
  const [homeCityInput, setHomeCityInput] = useState(homeCity);
  const [localHomeWeather, setLocalHomeWeather] = useState(null);
  const homeWeather = homeWeatherProp || localHomeWeather;
  const [wxLoading, setWxLoading] = useState(false);

  const fetchHomeWeather = useCallback(async (city) => {
    if (!city || homeWeatherProp) return;
    setWxLoading(true);
    const q = city.split(",")[0].trim();
    try {
      const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=1&language=en&format=json");
      const geo = await geoRes.json();
      const loc = geo.results?.[0];
      if (!loc) { setLocalHomeWeather({ error: "City not found" }); setWxLoading(false); return; }
      const wRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + loc.latitude + "&longitude=" + loc.longitude + "&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=7");
      const w = await wRes.json();
      const days = (w.daily?.time || []).map((d, i) => ({
        date: d, high: Math.round(w.daily.temperature_2m_max[i]),
        low: Math.round(w.daily.temperature_2m_min[i]), code: w.daily.weathercode[i],
      }));
      setLocalHomeWeather({ city: loc.name, days });
    } catch(e) { setLocalHomeWeather({ error: "Weather unavailable" }); }
    setWxLoading(false);
  }, [homeWeatherProp]);

  useEffect(() => { if (homeCity) { setHomeCityInput(homeCity); fetchHomeWeather(homeCity); } }, [homeCity]); // eslint-disable-line

  const wxIcon = (code) => {
    if (code === 0) return "☀️";
    if (code <= 2) return "⛅";
    if (code <= 45) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  };

  const todayWx = homeWeather?.days?.find(d => d.date === todayKey);
  const [hoveredTodayId, setHoveredTodayId] = useState(null);

  // Week strip
  const weekDays = (() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const ids = (() => { const v = outfitCalendar[key] || []; return Array.isArray(v) ? v : v ? [v] : []; })();
      days.push({ key, date: d, ids, isToday: i === 0 });
    }
    return days;
  })();
  const weekLogged = weekDays.filter(d => d.ids.length > 0).length;

  // Upcoming trips
  const todayMidnight = new Date(todayKey + "T00:00:00");
  const upcomingTrips = lookbooksDb.rows
    .filter(lb => lb.dateStart || lb.dateEnd)
    .map(lb => {
      const start = lb.dateStart ? new Date(lb.dateStart + "T00:00:00") : null;
      const end = lb.dateEnd ? new Date(lb.dateEnd + "T00:00:00") : null;
      const daysUntil = start ? Math.round((start - todayMidnight) / 86400000) : null;
      const isActive = (start && start <= todayMidnight && end && end >= todayMidnight) || (!start && end && end >= todayMidnight);
      return { ...lb, daysUntil, isActive };
    })
    .filter(lb => lb.isActive || (lb.daysUntil !== null && lb.daysUntil >= 0))
    .sort((a, b) => (a.isActive ? -1 : b.isActive ? 1 : (a.daysUntil || 0) - (b.daysUntil || 0)))
    .slice(0, 3);

  const packCheckedAll = useMemo(() => { try { return JSON.parse(localStorage.getItem("wardrobe_pack_checked_v1") || "{}"); } catch { return {}; } }, []);
  const getPackProgress = (lb) => {
    const lbOutfits = (lb.outfitIds || []).map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);
    const seen = {};
    lbOutfits.forEach(o => (o.layers || o.itemIds || []).forEach(id => { const item = allItems.find(i => i.id === id); if (item) seen[id] = item; }));
    const items = Object.values(seen);
    const checked = packCheckedAll[lb.id] || {};
    return { total: items.length, packed: Object.keys(checked).filter(k => checked[k]).length };
  };

  const EH = ({ eyebrow, title, action }) => (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 10, fontWeight: 700, color: "#b8aea1", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>{eyebrow}</div>}
        <div style={{ fontFamily: "’Cormorant Garamond’, serif", fontStyle: "italic", fontWeight: 300, fontSize: 26, color: "#1a1a1a", lineHeight: 1 }}>{title}</div>
      </div>
      {action && <button onClick={action.onClick} style={{ fontSize: 11, color: "#9f978b", background: "none", border: "none", cursor: "pointer", fontFamily: "’DM Sans’, sans-serif", padding: 0, flexShrink: 0 }}>{action.label}</button>}
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 80px" }}>

      {/* ── Hero: greeting + weather ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 6, paddingTop: 4 }}>
        <div>
          <div style={{ fontFamily: "’Cormorant Garamond’, serif", fontStyle: "italic", fontWeight: 300, fontSize: 56, color: "#1a1a1a", lineHeight: 0.9, marginBottom: 12 }}>{greeting}</div>
          <div style={{ fontSize: 13, color: "#9f978b", fontWeight: 500 }}>{dayName}, {dateLabel}</div>
        </div>
        <div style={{ flexShrink: 0, paddingTop: 10 }}>
          {homeWeather?.days && todayWx ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{wxIcon(todayWx.code)}</span>
                <span style={{ fontSize: 30, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>{todayWx.high}°</span>
                <span style={{ fontSize: 13, color: "#bbb", fontWeight: 600 }}>{todayWx.low}°</span>
              </div>
              <div style={{ fontSize: 11, color: "#b8aea1", fontWeight: 600, marginBottom: 8 }}>{homeWeather.city}</div>
              <div style={{ display: "flex", gap: 14, justifyContent: "flex-end" }}>
                {homeWeather.days.slice(1, 4).map(d => (
                  <div key={d.date} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#ccc", fontWeight: 700 }}>{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div style={{ fontSize: 13 }}>{wxIcon(d.code)}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa" }}>{d.high}°</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); const c = homeCityInput.trim(); if (!c) return; setHomeCity(c); try { localStorage.setItem("wardrobe_home_city", c); } catch {} fetchHomeWeather(c); }} style={{ display: "flex", gap: 8 }}>
              <input value={homeCityInput} onChange={e => setHomeCityInput(e.target.value)} placeholder="Add your city for weather…" style={{ width: 200, padding: "8px 12px", borderRadius: 10, border: "1.5px solid #e8e4dc", fontSize: 12, fontFamily: "’DM Sans’, sans-serif", outline: "none" }} />
              <button type="submit" disabled={wxLoading} style={{ padding: "8px 14px", borderRadius: 10, background: "#1a1a1a", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "’DM Sans’, sans-serif", opacity: wxLoading ? 0.6 : 1 }}>{wxLoading ? "…" : "Go"}</button>
            </form>
          )}
        </div>
      </div>

      {/* ── Snapshot bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, paddingBottom: 28, borderBottom: "1px solid #f0ece4", marginBottom: 44 }}>
        {[`${closetItems.length} items`, `$${totalValue.toFixed(0)} value`, `${wornPct}% worn`].map((s, i) => (
          <span key={s} style={{ fontSize: 12, color: "#c0b8af", fontWeight: 500 }}>
            {i > 0 && <span style={{ margin: "0 8px", color: "#e0dbd4" }}>·</span>}
            {s}
          </span>
        ))}
        <button onClick={() => setTab("stats")} style={{ marginLeft: "auto", fontSize: 11, color: "#9f978b", background: "none", border: "none", cursor: "pointer", fontFamily: "’DM Sans’, sans-serif", padding: 0 }}>View profile →</button>
      </div>

      {/* ── Trip countdown ── */}
      {upcomingTrips[0] && (() => {
        const trip = upcomingTrips[0];
        const countdown = trip.isActive ? "Active now" : trip.daysUntil === 0 ? "Today" : trip.daysUntil === 1 ? "Tomorrow" : `in ${trip.daysUntil} days`;
        const pack = getPackProgress(trip);
        const packPct = pack.total > 0 ? Math.round(pack.packed / pack.total * 100) : 0;
        return (
          <div onClick={() => { setActiveLookbookView("editorial"); setActiveLookbook(trip); setTab("lookbooks"); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", background: "#f8f5f0", borderRadius: 14, border: "1.5px solid #ece7de", cursor: "pointer", marginBottom: 44 }}>
            <span style={{ fontSize: 16 }}>✈</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "’Cormorant Garamond’, serif", fontStyle: "italic", fontSize: 16, color: "#1a1a1a", fontWeight: 300 }}>{trip.name}</span>
              <span style={{ fontSize: 12, color: "#9f978b", marginLeft: 10 }}>{countdown}</span>
              {pack.total > 0 && <span style={{ fontSize: 11, color: "#c0b8af", marginLeft: 8 }}>· {pack.packed}/{pack.total} packed</span>}
            </div>
            {pack.total > 0 && (
              <div style={{ width: 80, height: 3, borderRadius: 2, background: "#e0d9cf", flexShrink: 0, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: packPct === 100 ? "#3aaa6e" : "#1a1a1a", width: `${packPct}%` }} />
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Today’s Outfit ── */}
      <div style={{ marginBottom: 44 }}>
        <EH eyebrow="Daily Dressing" title="Today’s Outfit" action={{ label: "Outfits →", onClick: () => setTab("outfits") }} />
        {todayOutfits.length === 0 ? (
          <div style={{ ...cardStyle, padding: "22px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>No outfit planned today</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>What are you wearing?</div>
            </div>
            <button onClick={() => setTab("outfits")} style={{ fontSize: 13, fontWeight: 600, color: "#888", background: "#f5f3ef", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "’DM Sans’, sans-serif" }}>Plan one →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: todayOutfits.length > 1 ? "1.4fr 0.8fr" : "1fr", gap: 14 }}>
            {todayOutfits.slice(0, 2).map((outfit, idx) => {
              const layerIds = outfit.layers || outfit.itemIds || [];
              const thumbItems = layerIds.slice(0, 4).map(id => allItems.find(x => x.id === id)).filter(Boolean);
              const isHov = hoveredTodayId === outfit.id;
              return (
                <div key={outfit.id} onClick={() => setOutfitPopup(outfit)}
                  onMouseEnter={() => setHoveredTodayId(outfit.id)} onMouseLeave={() => setHoveredTodayId(null)}
                  className="card" style={{ cursor: "pointer", borderRadius: 18, overflow: "hidden", border: "1.5px solid #e8e4dc", aspectRatio: idx === 0 ? "16/10" : "4/5", position: "relative", background: "#f5f3ef", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  {outfit.previewImage ? (
                    <img src={outfit.previewImage} alt={outfit.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      {[0,1,2,3].map(qi => {
                        const it = thumbItems[qi];
                        return (
                          <div key={qi} style={{ background: it?.image ? `url(${it.image}) center/contain no-repeat #f5f3ef` : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", borderRight: qi%2===0 ? "1px solid #fff" : "none", borderBottom: qi<2 ? "1px solid #fff" : "none" }}>
                            {!it?.image && <HangerIcon size={14} color="#ddd" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {todayWx && (
                    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, background: "rgba(255,255,255,0.92)", borderRadius: 10, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#1a1a1a", backdropFilter: "blur(4px)" }}>
                      <span>{wxIcon(todayWx.code)}</span><span>{todayWx.high}°</span>
                    </div>
                  )}
                  {(isHov || idx === 0) && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)", padding: idx === 0 ? "40px 16px 16px" : "24px 12px 12px" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{idx === 0 ? "Today’s look" : "Also planned"}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outfit.name || "Untitled Outfit"}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── This Week (compact) ── */}
      <div style={{ marginBottom: 44 }}>
        <EH eyebrow="Wardrobe Rhythm" title="This Week" action={{ label: "Calendar →", onClick: () => setTab("outfits") }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {weekDays.map(day => {
            const outfit = day.ids.length > 0 ? outfitsDb.rows.find(o => o.id === day.ids[0]) : null;
            const dayShort = day.date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
            const dateNum = day.date.getDate();
            return (
              <div key={day.key} onClick={() => setTab("outfits")} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: day.isToday ? "#1a1a1a" : "#ccc", letterSpacing: "0.06em" }}>{dayShort}</div>
                <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: 10, border: day.isToday ? "2px dashed #1a1a1a" : "1.5px solid #ece8e2", background: outfit?.previewImage ? `url(${outfit.previewImage}) center/cover no-repeat` : day.isToday ? "#fafaf8" : "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", transition: "transform 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  {!outfit?.previewImage && (outfit
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    : <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#e0dbd4" }} />)}
                  {day.ids.length > 1 && <div style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(255,255,255,0.92)", borderRadius: 4, padding: "1px 3px", fontSize: 7, fontWeight: 800, color: "#1a1a1a" }}>+{day.ids.length}</div>}
                </div>
                <div style={{ fontSize: 9, color: day.isToday ? "#1a1a1a" : "#ccc", fontWeight: day.isToday ? 800 : 500 }}>{day.isToday ? "Today" : dateNum}</div>
              </div>
            );
          })}
        </div>
        {weekLogged === 0 && (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <span style={{ fontSize: 11, color: "#ccc" }}>Log your first outfit this week from <strong style={{ color: "#aaa", cursor: "pointer" }} onClick={() => setTab("outfits")}>Outfits → Calendar</strong></span>
          </div>
        )}
      </div>

      {/* ── New In (horizontal scroll) ── */}
      {newInItems.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <EH eyebrow="Recent Arrivals" title="New In" action={{ label: "View closet →", onClick: () => setTab("closet") }} />
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {newInItems.map((item, idx) => (
              <div key={item.id} onClick={() => setTab("closet")} className="card" style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e8e4dc", background: "#fff", flexShrink: 0, width: idx === 0 ? 200 : 150, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ aspectRatio: "3/4", background: item.image ? `url(${item.image}) center/cover no-repeat` : "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {!item.image && <HangerIcon size={20} color="#ccc" />}
                  {idx === 0 && <div style={{ position: "absolute", left: 8, top: 8, background: "rgba(255,255,255,0.9)", color: "#6f6558", borderRadius: 100, padding: "3px 8px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>New</div>}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name || "Untitled"}</div>
                  {item.price && <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{item.price}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pinned Lookbooks ── */}
      <div style={{ marginBottom: 44 }}>
        <EH eyebrow="Collections" title="Pinned Lookbooks" action={{ label: "All lookbooks →", onClick: () => setTab("lookbooks") }} />
        {pinnedLookbooks.length === 0 ? (
          <div style={{ padding: "22px 20px", borderRadius: 14, border: "1.5px dashed #e0dbd2", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#ccc" }}>Pin lookbooks from the Lookbooks tab</div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {pinnedLookbooks.map(lb => {
              const lbOutfits = (lb.outfitIds || []).map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);
              const dateStr = [fmtDate(lb.dateStart), fmtDate(lb.dateEnd)].filter(Boolean).join(" – ");
              return (
                <div key={lb.id} onClick={() => { setActiveLookbookView("editorial"); setActiveLookbook(lb); setTab("lookbooks"); }} className="card"
                  style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e8e4dc", background: "#fff", flexShrink: 0, width: 200, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ aspectRatio: "4/3", background: lb.coverImage ? `url(${lb.coverImage}) center/cover no-repeat` : "linear-gradient(135deg, #f4ede4, #ece2d4)", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.3), transparent)" }} />
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lb.name}</div>
                    <div style={{ fontSize: 11, color: "#9f978b", marginTop: 3 }}>{lbOutfits.length} look{lbOutfits.length !== 1 ? "s" : ""}{dateStr && ` · ${dateStr}`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Wear Again ── */}
      {wearAgainItem && (
        <div style={{ marginBottom: 44 }}>
          <EH eyebrow="Wardrobe Refresh" title="Wear Again" />
          <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 18px", ...cardStyle, borderRadius: 16 }}>
            <div style={{ width: 72, height: 88, borderRadius: 12, background: wearAgainItem.image ? `url(${wearAgainItem.image}) center/cover no-repeat` : "#f5f3ef", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{wearAgainItem.name}</div>
              <div style={{ fontSize: 11, color: "#9f978b", marginBottom: 10 }}>{wearAgainItem.category}{wearAgainItem.brand ? ` · ${wearAgainItem.brand}` : ""}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setTab("outfits")} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e0dbd2", background: "#fff", fontSize: 11, fontWeight: 700, color: "#1a1a1a", cursor: "pointer", fontFamily: "’DM Sans’, sans-serif" }}>Wear it →</button>
                <button onClick={() => setTab("seller")} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#f5f3ef", fontSize: 11, fontWeight: 700, color: "#888", cursor: "pointer", fontFamily: "’DM Sans’, sans-serif" }}>Sell it</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Seller ── */}
      {hasSeller && (
        <div style={{ marginBottom: 44 }}>
          <EH eyebrow="Sales" title="Seller" action={{ label: "Go to Seller →", onClick: () => setTab("seller") }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {[
              { label: "Listed", value: sellerListed, color: "#2090c0" },
              { label: "Pending", value: sellerPending, color: "#a07000" },
              { label: "Sold", value: sellerSold, color: "#3aaa6e" },
              { label: "Earned", value: `$${sellerEarned.toFixed(0)}`, color: "#3aaa6e" },
              { label: "Potential", value: `$${sellerPotential.toFixed(0)}`, color: "#888" },
            ].map(s => (
              <div key={s.label} onClick={() => setTab("seller")} className="card" style={{ ...cardStyle, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#b8aea1", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Budget bar ── */}
      {monthlyBudget > 0 && (
        <div style={{ marginBottom: 44 }}>
          <EH eyebrow="Spending" title="Monthly Budget" action={{ label: "Settings →", onClick: () => setTab("settings") }} />
          <div style={{ ...cardStyle, borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#9f978b" }}>Spent this month</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>${monthlySpend.toFixed(0)} <span style={{ color: "#c0b8af", fontWeight: 400 }}>of ${monthlyBudget.toFixed(0)}</span></span>
            </div>
            <div style={{ height: 4, borderRadius: 3, background: "#f0ece4", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, background: monthlySpend > monthlyBudget ? "#e05555" : "#1a1a1a", width: `${Math.min(100, monthlySpend / monthlyBudget * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Closet Health ── */}
      <div style={{ marginBottom: 44 }}>
        <EH eyebrow="Overview" title="Closet Health" action={{ label: "Full profile →", onClick: () => setTab("stats") }} />
        <div onClick={() => setTab("stats")} className="card" style={{ ...cardStyle, borderRadius: 16, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", border: `3px solid ${healthColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: healthColor }}>{healthScore}</span>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{healthLabel}</div>
            <div style={{ fontSize: 11, color: "#9f978b" }}>Based on wear, variety & value</div>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {[{ label: "Value", value: `$${totalValue.toFixed(0)}` }, { label: "Items", value: closetItems.length }, { label: "Unworn", value: unwornCount }].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#c0b8af", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Wishlist ── */}
      {highPriorityWish.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <EH eyebrow="Wish List" title="On My Radar" action={{ label: "All →", onClick: () => setTab("wishlist") }} />
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {highPriorityWish.map(item => (
              <div key={item.id} onClick={() => setTab("wishlist")} className="card" style={{ cursor: "pointer", borderRadius: 14, overflow: "hidden", border: "1.5px solid #e8e4dc", background: "#fff", flexShrink: 0, width: 140 }}>
                <div style={{ aspectRatio: "3/4", background: item.image ? `url(${item.image}) center/cover no-repeat` : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {!item.image && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
                </div>
                <div style={{ padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  {item.price && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{item.price}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "closet", label: "My Closet" },
  { id: "outfits", label: "Outfits" },
  { id: "lookbooks", label: "Lookbooks" },
  { id: "wishlist", label: "Wishlist" },
  { id: "moodboard", label: "Moodboard" },
  { id: "seller", label: "Seller" },
  { id: "stats", label: "Style Profile" },
  { id: "settings", label: "Settings" },
];


// ── OutfitCalendar ───────────────────────────────────────────────────────────
function OutfitCalendar({ outfits, calendar, onSaveCalendar, month, onMonthChange, weather, onSetWeather, onOpenOutfit, allItems, events, onSaveEvents, defaultCity }) {
  // calendar shape: { [dateStr]: string[] }  (array of outfit IDs)
  // migrate old shape where value was a single string
  const normalizeDay = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  };

  const [assignPicker, setAssignPicker] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [activeLooks, setActiveLooks] = useState({});
  const [draggingInfo, setDraggingInfo] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [dayPopup, setDayPopup] = useState(null);
  const [dayPopupTab, setDayPopupTab] = useState(0);
  const [dayAddSearch, setDayAddSearch] = useState("");
  const [showDayAdd, setShowDayAdd] = useState(false);
  // week/month toggle
  const [calView, setCalView] = useState("month");
  const [weekAnchor, setWeekAnchor] = useState(() => new Date().toISOString().slice(0, 10));
  // event planning modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("event");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  // plan my week modal
  const [showPlanWeekModal, setShowPlanWeekModal] = useState(false);
  const [planWeekSuggestions, setPlanWeekSuggestions] = useState({});
  // hover state for outfit name tooltip
  const [hoveredDay, setHoveredDay] = useState(null);
  // custom markers
  const [calMarkers, setCalMarkers] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_cal_markers_v1") || "[]"); } catch { return []; } });
  const saveMarkers = (m) => { setCalMarkers(m); try { localStorage.setItem("wardrobe_cal_markers_v1", JSON.stringify(m)); } catch {} };
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [editingMarker, setEditingMarker] = useState(null);
  const [markerLabel, setMarkerLabel] = useState("");
  const [markerColor, setMarkerColor] = useState("#f9a8d4");
  const [markerDate, setMarkerDate] = useState("");
  const MARKER_COLORS = ["#b8e0b8","#ffd97d","#e8a870","#a8c8e8","#f9a8d4","#c4b5fd","#6ee7b7","#fca5a5","#93c5fd","#fde68a"];

  const { year, month: mo } = month;
  const firstDay = (new Date(year, mo, 1).getDay() + 6) % 7; // 0=Mon…6=Sun
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthName = new Date(year, mo, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => mo === 0 ? onMonthChange({ year: year - 1, month: 11 }) : onMonthChange({ year, month: mo - 1 });
  const nextMonth = () => mo === 11 ? onMonthChange({ year: year + 1, month: 0 }) : onMonthChange({ year, month: mo + 1 });

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showWeatherConfig, setShowWeatherConfig] = useState(false);
  const [weatherCity, setWeatherCity] = useState(() => defaultCity || "Orlando, FL");
  const todayISO = new Date().toISOString().slice(0, 10);
  const [weatherDateStart, setWeatherDateStart] = useState(todayISO);
  const [weatherDateEnd, setWeatherDateEnd] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 13);
    return d.toISOString().slice(0, 10);
  });
  const [weatherGeoError, setWeatherGeoError] = useState("");

  const geocodeCity = async (cityName) => {
    const cleaned = cityName.replace(/,\s*[A-Z]{2}$/, "").trim();
    const res = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(cleaned) + "&count=1&language=en&format=json");
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name + (data.results[0].admin1 ? ", " + data.results[0].admin1 : "") };
    }
    return null;
  };

  const fetchWeather = async (cityOverride, startOverride, endOverride) => {
    const city = cityOverride || weatherCity;
    const start = startOverride || weatherDateStart;
    const end = endOverride || weatherDateEnd;
    setWeatherLoading(true);
    setWeatherGeoError("");
    try {
      const geo = await geocodeCity(city);
      if (!geo) { setWeatherGeoError("City not found — try a different spelling"); setWeatherLoading(false); return; }
      // Calculate forecast_days from start to end (max 16)
      const msDay = 86400000;
      const startMs = new Date(start + "T00:00:00").getTime();
      const endMs = new Date(end + "T00:00:00").getTime();
      const days = Math.min(16, Math.max(1, Math.round((endMs - startMs) / msDay) + 1));
      const wRes = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=" + geo.lat + "&longitude=" + geo.lon +
        "&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=" + days
      );
      const w = await wRes.json();
      const weatherDays = (w.daily && w.daily.time) ? w.daily.time.map((d, i) => ({
        date: d, high: Math.round(w.daily.temperature_2m_max[i]),
        low: Math.round(w.daily.temperature_2m_min[i]), code: w.daily.weathercode[i],
      })) : [];
      onSetWeather({ city: geo.name, days: weatherDays });
      setShowWeatherConfig(false);
    } catch(e) { setWeatherGeoError("Fetch failed — check connection"); }
    setWeatherLoading(false);
  };

  const weatherIcon = (code) => {
    if (code === 0) return "☀";
    if (code <= 2) return "⛅";
    if (code <= 45) return "☁";
    if (code <= 67) return "🌧";
    if (code <= 77) return "❄";
    if (code <= 82) return "🌦";
    return "⛈";
  };

  const getWeatherForDate = (dateStr) => {
    if (!weather || !weather.days) return null;
    return weather.days.find(d => d.date === dateStr) || null;
  };

  const getIds = (dateStr) => normalizeDay(calendar[dateStr]);

  const addOutfitToDay = (dateStr, outfitId) => {
    const ids = getIds(dateStr);
    if (ids.includes(outfitId)) return;
    const updated = { ...calendar, [dateStr]: [...ids, outfitId] };
    onSaveCalendar(updated);
    setActiveLooks(a => ({ ...a, [dateStr]: ids.length }));
    setAssignPicker(null);
    setSearchQ("");
  };

  const removeOutfitFromDay = (dateStr, outfitId) => {
    const ids = getIds(dateStr).filter(id => id !== outfitId);
    const updated = { ...calendar };
    if (ids.length === 0) delete updated[dateStr];
    else updated[dateStr] = ids;
    onSaveCalendar(updated);
    setActiveLooks(a => ({ ...a, [dateStr]: Math.max(0, (a[dateStr] || 0) - 1) }));
  };

  const moveOutfitToDay = (outfitId, fromDate, toDate) => {
    if (fromDate === toDate) return;
    const fromIds = getIds(fromDate).filter(id => id !== outfitId);
    const toIds = getIds(toDate);
    if (toIds.includes(outfitId)) return;
    const updated = { ...calendar };
    if (fromIds.length === 0) delete updated[fromDate];
    else updated[fromDate] = fromIds;
    updated[toDate] = [...toIds, outfitId];
    onSaveCalendar(updated);
  };

  const filteredOutfits = outfits.filter(o =>
    !searchQ || (o.name || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  // Event helpers
  const EVENT_COLORS = { trip: "#4a7fc1", event: "#9b72cf", work: "#3aaa6e", other: "#e8823a" };
  const eventsOnDate = (dateStr) => (events || []).filter(ev => ev.startDate <= dateStr && ev.endDate >= dateStr);
  const saveEvent = () => {
    if (!eventName.trim() || !eventStart || !eventEnd) return;
    const ev = { id: editingEvent?.id || ("ev_" + Date.now()), name: eventName.trim(), type: eventType, startDate: eventStart, endDate: eventEnd };
    const updated = editingEvent ? (events || []).map(e => e.id === ev.id ? ev : e) : [...(events || []), ev];
    onSaveEvents(updated);
    setShowEventModal(false); setEditingEvent(null); setEventName(""); setEventType("event"); setEventStart(""); setEventEnd("");
  };
  const deleteEvent = (id) => { onSaveEvents((events || []).filter(e => e.id !== id)); };
  const openNewEvent = (dateStr) => { setEditingEvent(null); setEventName(""); setEventType("event"); setEventStart(dateStr || ""); setEventEnd(dateStr || ""); setShowEventModal(true); };
  const openEditEvent = (ev) => { setEditingEvent(ev); setEventName(ev.name); setEventType(ev.type); setEventStart(ev.startDate); setEventEnd(ev.endDate); setShowEventModal(true); };
  // Custom marker helpers
  const markersOnDate = (dateStr) => calMarkers.filter(m => m.date === dateStr);
  const openNewMarker = (dateStr) => { setEditingMarker(null); setMarkerLabel(""); setMarkerColor("#f9a8d4"); setMarkerDate(dateStr || todayStr); setShowMarkerModal(true); };
  const openEditMarker = (mk) => { setEditingMarker(mk); setMarkerLabel(mk.label); setMarkerColor(mk.color); setMarkerDate(mk.date); setShowMarkerModal(true); };
  const saveMarker = () => {
    if (!markerLabel.trim() || !markerDate) return;
    const m = { id: editingMarker?.id || ("mk_" + Date.now()), date: markerDate, label: markerLabel.trim(), color: markerColor };
    saveMarkers(editingMarker ? calMarkers.map(x => x.id === m.id ? m : x) : [...calMarkers, m]);
    setShowMarkerModal(false);
  };
  const deleteMarker = (id) => { saveMarkers(calMarkers.filter(m => m.id !== id)); setShowMarkerModal(false); };

  // Weather warning helper
  const getWeatherWarning = (outfit, wx) => {
    if (!wx || !outfit) return null;
    const seasons = outfit.seasons || [];
    if (seasons.length === 0) return null;
    const isWinterOnly = seasons.length > 0 && seasons.every(s => s === "Winter" || s === "Holiday");
    const isSummerOnly = seasons.length > 0 && seasons.every(s => s === "Summer");
    if (isWinterOnly && wx.high > 78) return "Too warm for this look";
    if (isSummerOnly && wx.high < 45) return "Too cold for this look";
    return null;
  };

  // Plan My Week
  const planWeek = () => {
    const anchor = new Date(weekAnchor + "T00:00:00");
    const dow = new Date().getDay();
    const weekStart = new Date(); weekStart.setDate(new Date().getDate() - dow);
    const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d.toISOString().slice(0, 10); });
    const unplanned = weekDays.filter(ds => getIds(ds).length === 0);
    const usedIds = new Set();
    const suggestions = {};
    unplanned.forEach(ds => {
      const wx = getWeatherForDate(ds);
      let candidates = outfits.filter(o => !usedIds.has(o.id));
      if (wx) {
        const high = wx.high;
        const target = high >= 75 ? "Summer" : high >= 55 ? "Spring" : high >= 40 ? "Fall" : "Winter";
        const matched = candidates.filter(o => (o.seasons || []).includes(target));
        if (matched.length > 0) candidates = matched;
      }
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        suggestions[ds] = pick.id; usedIds.add(pick.id);
      }
    });
    setPlanWeekSuggestions(suggestions); setShowPlanWeekModal(true);
  };
  const applyPlanWeek = () => {
    let updated = { ...calendar };
    Object.entries(planWeekSuggestions).forEach(([ds, id]) => {
      const ids = normalizeDay(updated[ds]);
      if (!ids.includes(id)) updated[ds] = [...ids, id];
    });
    onSaveCalendar(updated); setShowPlanWeekModal(false);
  };

  // Week view helpers
  const getWeekDays = (anchorStr) => {
    const d = new Date(anchorStr + "T00:00:00");
    const dow = (d.getDay() + 6) % 7; // 0=Mon…6=Sun
    const start = new Date(d); start.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => { const day = new Date(start); day.setDate(start.getDate() + i); return day.toISOString().slice(0, 10); });
  };
  const weekDays = getWeekDays(weekAnchor);
  const prevWeek = () => { const d = new Date(weekAnchor + "T00:00:00"); d.setDate(d.getDate() - 7); setWeekAnchor(d.toISOString().slice(0, 10)); };
  const nextWeek = () => { const d = new Date(weekAnchor + "T00:00:00"); d.setDate(d.getDate() + 7); setWeekAnchor(d.toISOString().slice(0, 10)); };
  const weekLabel = (() => { const s = new Date(weekDays[0] + "T00:00:00"); const e = new Date(weekDays[6] + "T00:00:00"); return s.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " – " + e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); })();

  const prevMonthDays = new Date(year, mo, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    const d = prevMonthDays - firstDay + 1 + i;
    const prevMo = mo === 0 ? 11 : mo - 1;
    const prevYr = mo === 0 ? year - 1 : year;
    cells.push({ day: d, month: prevMo, year: prevYr, overflow: true });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: mo, year, overflow: false });
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const nextMo = mo === 11 ? 0 : mo + 1;
    const nextYr = mo === 11 ? year + 1 : year;
    for (let d = 1; d <= 7 - remainder; d++) cells.push({ day: d, month: nextMo, year: nextYr, overflow: true });
  }

  // Season helpers
  const getSeason = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00"); const m = d.getMonth() + 1; const dy = d.getDate();
    if ((m === 3 && dy >= 20) || m === 4 || m === 5 || (m === 6 && dy <= 20)) return "Spring";
    if ((m === 6 && dy >= 21) || m === 7 || m === 8 || (m === 9 && dy <= 21)) return "Summer";
    if ((m === 9 && dy >= 22) || m === 10 || m === 11 || (m === 12 && dy <= 20)) return "Fall";
    return "Winter";
  };
  const SEASON_COLORS = { Spring: "#b8e0b8", Summer: "#ffd97d", Fall: "#e8a870", Winter: "#a8c8e8" };
  const SEASON_STARTS = [[3,20,"Spring"],[6,21,"Summer"],[9,22,"Fall"],[12,21,"Winter"]];
  const isSeasonStart = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00"); const m = d.getMonth()+1; const dy = d.getDate();
    return SEASON_STARTS.find(([sm,sd]) => m===sm && dy===sd)?.[2] || null;
  };
  // Heatmap: normalize wear count by day-of-week across all calendar entries
  const dowCounts = (() => {
    const c = [0,0,0,0,0,0,0];
    Object.keys(calendar).forEach(ds => { if (normalizeDay(calendar[ds]).length > 0) c[new Date(ds+"T00:00:00").getDay()]++; });
    const mx = Math.max(...c, 1); return c.map(v => v/mx);
  })();
  // Month-at-a-glance: unique outfit preview images planned this month
  const glanceImages = (() => {
    const seen = new Set(); const imgs = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = year+"-"+String(mo+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
      getIds(ds).forEach(id => { const o = outfits.find(x=>x.id===id); if(o?.previewImage && !seen.has(o.previewImage)){seen.add(o.previewImage);imgs.push(o.previewImage);} });
    }
    return imgs;
  })();
  // Go to today
  const goToToday = () => { const t = new Date(); onMonthChange({ year: t.getFullYear(), month: t.getMonth() }); setWeekAnchor(t.toISOString().slice(0,10)); };

  return (
    <div>
      {/* Calendar header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <button onClick={calView === "week" ? prevWeek : prevMonth} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e8e4dc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SvgArrowL size={11} color="#888" />
          </button>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", flex: 1, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{calView === "week" ? weekLabel : monthName}</div>
          <button onClick={calView === "week" ? nextWeek : nextMonth} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e8e4dc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SvgArrowR size={11} color="#888" />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 8, padding: 2, gap: 1 }}>
            {["month","week"].map(v => (
              <button key={v} onClick={() => setCalView(v)} style={{ padding: "4px 10px", border: "none", borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", background: calView===v?"#fff":"transparent", color: calView===v?"#1a1a1a":"#aaa", boxShadow: calView===v?"0 1px 3px rgba(0,0,0,0.08)":"none", textTransform: "capitalize" }}>{v}</button>
            ))}
          </div>
          <button onClick={goToToday} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #e8e4dc", background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>Today</button>
          <div style={{ width: 1, height: 14, background: "#e8e4dc" }} />
          <button onClick={planWeek} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #e8e4dc", background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#2d6a3f", fontFamily: "'DM Sans', sans-serif" }}>✦ Plan Week</button>
          <button onClick={() => setShowWeatherConfig(true)} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #e8e4dc", background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>
            {weatherLoading ? "…" : `⛅${weather ? " " + weather.city : " Weather"}`}
          </button>
        </div>
      </div>

        {/* Weather config modal */}
        {showWeatherConfig && (
          <div onClick={() => setShowWeatherConfig(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "24px 26px", width: "min(420px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>⛅ Weather Forecast</div>
                <button onClick={() => setShowWeatherConfig(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>City</label>
                <input value={weatherCity} onChange={e => setWeatherCity(e.target.value)} placeholder="e.g. Orlando, FL"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>From</label>
                  <input type="date" value={weatherDateStart} onChange={e => setWeatherDateStart(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>To</label>
                  <input type="date" value={weatherDateEnd} onChange={e => setWeatherDateEnd(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 14 }}>Forecast up to 16 days ahead · temperatures in °F</div>
              {weatherGeoError && <div style={{ fontSize: 12, color: "#c0392b", background: "#fef2f2", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{weatherGeoError}</div>}
              <button onClick={() => fetchWeather(weatherCity, weatherDateStart, weatherDateEnd)} disabled={weatherLoading || !weatherCity.trim()} style={{
                width: "100%", padding: "11px", background: weatherLoading ? "#ccc" : "#1a1a1a", color: "#fff", border: "none",
                borderRadius: 12, cursor: weatherLoading ? "default" : "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif"
              }}>{weatherLoading ? "Fetching…" : "Get Forecast"}</button>
            </div>
          </div>
        )}

      {/* Day labels */}
      {calView === "month" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", padding: "5px 0", fontFamily: "'DM Sans', sans-serif" }}>{d}</div>
          ))}
        </div>
      )}

      {/* Week view — horizontal spread */}
      {calView === "week" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, alignItems: "stretch" }}>
          {weekDays.map(dateStr => {
            const ids = getIds(dateStr);
            const wx = getWeatherForDate(dateStr);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const dayEvts = eventsOnDate(dateStr);
            const seasonMark = isSeasonStart(dateStr);
            const d = new Date(dateStr + "T00:00:00");
            const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
            const dayNum = d.getDate();
            const dow = d.getDay();
            const heatAlpha = dowCounts[dow] * 0.08;
            return (
              <div key={dateStr} onClick={() => { setDayPopup(dateStr); setDayPopupTab(0); setShowDayAdd(false); setDayAddSearch(""); }}
                style={{
                  borderRadius: 10,
                  border: isToday ? "2px solid #1a1a1a" : "1px solid #ede9e2",
                  background: "#fff",
                  cursor: "pointer", minHeight: 280, overflow: "hidden", position: "relative",
                  transition: "box-shadow 0.12s",
                  opacity: isPast ? 0.6 : 1,
                  filter: isPast ? "saturate(0.5)" : "none",
                  display: "flex", flexDirection: "column",
                }}
                onMouseEnter={e => { setHoveredDay(dateStr); e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; if(isPast) e.currentTarget.style.opacity="0.85"; }}
                onMouseLeave={e => { setHoveredDay(null); e.currentTarget.style.boxShadow = "none"; if(isPast) e.currentTarget.style.opacity="0.6"; }}>
                {/* Season marker */}
                {seasonMark && <div style={{ height: 3, background: SEASON_COLORS[seasonMark] }} />}
                {/* Custom markers */}
                {markersOnDate(dateStr).map(mk => (
                  <div key={mk.id} onClick={e => { e.stopPropagation(); openEditMarker(mk); }} style={{ height: 3, background: mk.color, cursor: "pointer" }} />
                ))}
                {/* Day header */}
                <div style={{ padding: "8px 8px 6px", borderBottom: "1px solid rgba(0,0,0,0.05)", flexShrink: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 800, color: "#bbb", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>{dayName}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 20, fontWeight: isToday ? 900 : 700, color: isToday ? "#1a1a1a" : "#555", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{dayNum}</div>
                    {wx && <div style={{ fontSize: 10, color: "#888", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 3 }}><span>{weatherIcon(wx.code)}</span><span>{wx.high}°<span style={{ color: "#bbb", fontWeight: 500 }}>/{wx.low}°</span></span></div>}
                  </div>
                  {isToday && <div style={{ width: 18, height: 2, background: "#1a1a1a", borderRadius: 1, marginTop: 3 }} />}
                </div>
                {/* Marker labels */}
                {markersOnDate(dateStr).map(mk => (
                  <div key={mk.id} onClick={e => { e.stopPropagation(); openEditMarker(mk); }}
                    style={{ margin: "2px 6px 0", borderRadius: 6, background: mk.color, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{mk.label}</div>
                ))}
                {/* Event blocks — full-width wash labels */}
                {dayEvts.map(ev => (
                  <div key={ev.id} onClick={e => { e.stopPropagation(); openEditEvent(ev); }}
                    style={{ margin: "2px 6px 0", borderRadius: 6, background: EVENT_COLORS[ev.type], color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{ev.name}</div>
                ))}
                {/* Outfit image — fills remaining space */}
                {(() => {
                  const o = ids.length > 0 ? outfits.find(x => x.id === ids[0]) : null;
                  return (
                    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                      {o ? (
                        o.previewImage
                          ? <img src={o.previewImage} alt={o.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f3ef" }}><span style={{ fontSize: 10, color: "#aaa", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 8 }}>{o.name}</span></div>
                      ) : (
                        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.018) 3px, rgba(0,0,0,0.018) 6px)", background: "#faf8f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 20, color: "#ddd" }}>+</span>
                        </div>
                      )}
                      {/* Multiple outfits badge */}
                      {ids.length > 1 && (
                        <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 999, padding: "2px 6px", fontSize: 9, fontWeight: 700 }}>+{ids.length - 1}</div>
                      )}
                      {/* Name — hover only, white bg black text */}
                      {o && hoveredDay === dateStr && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#fff", padding: "5px 8px" }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{o.name}</div>
                          {getWeatherWarning(o, wx) && <div style={{ fontSize: 8, color: "#f59e0b", fontWeight: 700, marginTop: 1 }}>⚠ {getWeatherWarning(o, wx)}</div>}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}


      {/* Month Calendar grid */}
      {calView === "month" && <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((cell, idx) => {
          const { day, month: cellMo, year: cellYr, overflow } = cell;
          const dateStr = cellYr + "-" + String(cellMo + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
          const ids = getIds(dateStr);
          const isToday = !overflow && dateStr === todayStr;
          const isPast = dateStr < todayStr;
          const wx = getWeatherForDate(dateStr);
          const isDragOver = !overflow && dragOver === dateStr;
          const dayEvts = eventsOnDate(dateStr);
          const seasonMark = isSeasonStart(dateStr);
          const cellOutfit = ids.length > 0 ? outfits.find(x => x.id === ids[0]) : null;
          const isEmptyFuture = ids.length === 0 && !isPast;

          return (
            <div key={dateStr + (overflow ? "-ov" : "")}
              draggable={!overflow && !!cellOutfit}
              onDragStart={!overflow && cellOutfit ? () => { setDraggingInfo({ outfitId: ids[0], fromDate: dateStr }); } : undefined}
              onDragEnd={!overflow && cellOutfit ? () => setDraggingInfo(null) : undefined}
              onClick={overflow ? undefined : () => { setDayPopup(dateStr); setDayPopupTab(0); setShowDayAdd(false); setDayAddSearch(""); }}
              onDragOver={overflow ? undefined : e => { e.preventDefault(); setDragOver(dateStr); }}
              onDragLeave={overflow ? undefined : () => setDragOver(null)}
              onDrop={overflow ? undefined : e => { e.preventDefault(); setDragOver(null); if (draggingInfo) { moveOutfitToDay(draggingInfo.outfitId, draggingInfo.fromDate, dateStr); setDraggingInfo(null); } }}
              style={{
                borderRadius: 8,
                border: overflow ? "1px solid #f5f3ef" : isToday ? "2px solid #1a1a1a" : isDragOver ? "1.5px dashed #2d6a3f" : "1px solid #ede9e2",
                background: overflow ? "#faf9f7" : isDragOver ? "#f0faf4" : isEmptyFuture ? "#fff" : cellOutfit ? "#f5f3ef" : "#fff",
                cursor: overflow ? "default" : "pointer", aspectRatio: "3/4", overflow: "hidden", position: "relative",
                transition: "box-shadow 0.12s",
                opacity: overflow ? 0.32 : isPast ? 0.55 : 1,
                filter: overflow ? "none" : isPast ? "saturate(0.45)" : "none",
              }}
              onMouseEnter={overflow ? undefined : e => { setHoveredDay(dateStr); e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"; if(isPast) e.currentTarget.style.opacity="0.8"; }}
              onMouseLeave={overflow ? undefined : e => { setHoveredDay(null); e.currentTarget.style.boxShadow = "none"; if(isPast) e.currentTarget.style.opacity="0.55"; }}
            >
              {/* Outfit image — absolutely fills cell (works because cell has aspectRatio) */}
              {cellOutfit?.previewImage && (
                <img src={cellOutfit.previewImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", zIndex: 1 }} />
              )}

              {/* Linen texture for unplanned future days */}
              {!overflow && isEmptyFuture && !isDragOver && (
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.018) 3px, rgba(0,0,0,0.018) 6px)", zIndex: 1 }} />
              )}

              {/* Season start marker */}
              {!overflow && seasonMark && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: SEASON_COLORS[seasonMark], zIndex: 4 }} />}
              {!overflow && seasonMark && <div style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", background: SEASON_COLORS[seasonMark], color: "#fff", fontSize: 6, fontWeight: 800, padding: "1px 4px", borderRadius: "0 0 4px 4px", zIndex: 4, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{seasonMark}</div>}

              {/* Custom marker bars */}
              {!overflow && markersOnDate(dateStr).map((mk, mki) => {
                const topOff = (seasonMark ? 12 : 0) + mki * 10;
                return (<>
                  <div key={mk.id + "_bar"} onClick={e => { e.stopPropagation(); openEditMarker(mk); }} style={{ position: "absolute", top: topOff, left: 0, right: 0, height: 2, background: mk.color, zIndex: 4, cursor: "pointer" }} />
                  <div key={mk.id + "_lbl"} onClick={e => { e.stopPropagation(); openEditMarker(mk); }} style={{ position: "absolute", top: topOff + 2, left: "50%", transform: "translateX(-50%)", background: mk.color, color: "#fff", fontSize: 6, fontWeight: 800, padding: "1px 4px", borderRadius: "0 0 4px 4px", zIndex: 4, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>{mk.label}</div>
                </>);
              })}

              {/* +N badge for multiple outfits */}
              {ids.length > 1 && <div style={{ position: "absolute", top: 4, right: 4, background: "rgba(26,26,26,0.7)", color: "#fff", borderRadius: 8, padding: "1px 5px", fontSize: 7, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", zIndex: 5 }}>+{ids.length - 1}</div>}

              {/* Event pills — visible even on empty days */}
              {!overflow && dayEvts.length > 0 && (
                <div style={{ position: "absolute", bottom: ids.length > 0 ? 0 : 18, left: 0, right: 0, zIndex: 5 }}>
                  {dayEvts.slice(0, 2).map(ev => (
                    <div key={ev.id} onClick={e => { e.stopPropagation(); openEditEvent(ev); }}
                      style={{ height: 3, background: EVENT_COLORS[ev.type], marginBottom: 1, opacity: 0.9, cursor: "pointer" }} />
                  ))}
                  {dayEvts.length > 0 && hoveredDay === dateStr && (
                    <div style={{ background: EVENT_COLORS[dayEvts[0].type], color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 6px", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {dayEvts[0].name}{dayEvts.length > 1 ? ` +${dayEvts.length - 1}` : ""}
                    </div>
                  )}
                </div>
              )}

              {/* Content overlay */}
              <div style={{ position: "relative", zIndex: 10, padding: "4px 5px 3px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", minHeight: 88, pointerEvents: "none" }}>
                {/* Day number + weather */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 10, fontWeight: isToday ? 900 : 700, color: isToday ? "#fff" : ids.length > 0 ? "rgba(255,255,255,0.9)" : "#999", fontFamily: "'DM Sans', sans-serif", background: isToday ? "#1a1a1a" : ids.length > 0 ? "rgba(0,0,0,0.28)" : "transparent", borderRadius: 10, padding: "1px 5px", lineHeight: 1.4 }}>{day}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    {ids.length > 0 && getWeatherWarning(outfits.find(o=>o.id===ids[0]), wx) && <span style={{ fontSize: 7, background: "#f59e0b", color: "#fff", borderRadius: 3, padding: "1px 3px", fontWeight: 800 }}>⚠</span>}
                    {wx && hoveredDay === dateStr && (
                      <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 6, padding: "2px 5px", display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap", backdropFilter: "blur(4px)" }}>
                        <span style={{ fontSize: 11 }}>{weatherIcon(wx.code)}</span>
                        <span>{wx.high}°<span style={{ color: "#aaa", fontWeight: 500 }}>/{wx.low}°</span></span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1 }} />

                {/* Outfit name — hover only, as gradient fade */}
                {!overflow && ids.length > 0 && hoveredDay === dateStr && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "5px 6px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, pointerEvents: "auto" }} onClick={e => e.stopPropagation()}>
                    <div style={{ flex: 1, fontSize: 7, color: "#1a1a1a", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                      {outfits.find(o=>o.id===ids[0])?.name || ""}
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeOutfitFromDay(dateStr, ids[0]); }} style={{ width: 12, height: 12, borderRadius: "50%", border: "none", background: "none", color: "#1a1a1a", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0, lineHeight: 1 }}>×</button>
                  </div>
                )}
                {/* Empty hint */}
                {!overflow && ids.length === 0 && !isPast && (
                  <div style={{ fontSize: 14, color: "#d8d2ca", textAlign: "center", lineHeight: 1 }}>+</div>
                )}
              </div>
            </div>
          );
        })}
      </div>}


      {/* ── Day Detail Popup ── */}
      {dayPopup && (() => {
        const dateStr = dayPopup;
        const ids = getIds(dateStr);
        const wx = getWeatherForDate(dateStr);
        const dateLabel = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        const activeTabIdx = Math.min(dayPopupTab, ids.length - 1);
        const focusedOutfit = ids.length > 0 ? outfits.find(o => o.id === ids[activeTabIdx]) : null;
        const pieces = focusedOutfit ? (focusedOutfit.layers || focusedOutfit.itemIds || []).map(id => (allItems || []).find(i => i.id === id)).filter(Boolean) : [];
        const weatherDesc = (code) => {
          if (code === 0) return "Clear skies";
          if (code <= 2) return "Partly cloudy";
          if (code <= 45) return "Cloudy";
          if (code <= 67) return "Rainy";
          if (code <= 77) return "Snow";
          if (code <= 82) return "Rain showers";
          return "Thunderstorms";
        };

        return (
          <div onClick={() => setDayPopup(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: "min(1080px, 96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}>

              {/* Header */}
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f0ece4", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a" }}>{dateLabel}</div>
                  {wx && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 20, fontWeight: 800 }}>{weatherIcon(wx.code)}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{wx.high}° / {wx.low}°</span>
                      <span style={{ fontSize: 13, color: "#888" }}>{weatherDesc(wx.code)}{weather?.city ? " · " + weather.city : ""}</span>
                      {focusedOutfit && getWeatherWarning(focusedOutfit, wx) && (
                        <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>⚠ {getWeatherWarning(focusedOutfit, wx)}</span>
                      )}
                    </div>
                  )}
                  {!wx && <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>No weather data — click ⛅ Weather to load</div>}
                </div>
                <button onClick={() => setDayPopup(null)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Body */}
              <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

                {/* Left — outfit preview + look tabs */}
                <div style={{ width: 360, flexShrink: 0, borderRight: "1px solid #f0ece4", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Look tabs + toggle */}
                  {ids.length > 0 && (
                    <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f5f2ed", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        {ids.length} Look{ids.length !== 1 ? "s" : ""}
                      </div>
                      {ids.length > 1 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button onClick={() => setDayPopupTab((activeTabIdx - 1 + ids.length) % ids.length)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e8e4dc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <SvgArrowL size={11} color="#666" />
                          </button>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {outfits.find(x => x.id === ids[activeTabIdx])?.name || "Look " + (activeTabIdx + 1)}
                            </div>
                            <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{activeTabIdx + 1} of {ids.length}</div>
                          </div>
                          <button onClick={() => setDayPopupTab((activeTabIdx + 1) % ids.length)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e8e4dc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <SvgArrowR size={11} color="#666" />
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>
                          {outfits.find(x => x.id === ids[0])?.name || "Look 1"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outfit image */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#faf9f7", overflow: "hidden" }}>
                    {focusedOutfit ? (
                      focusedOutfit.previewImage
                        ? <img src={focusedOutfit.previewImage} alt={focusedOutfit.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12 }} />
                        : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#ccc" }}><HangerIcon size={48} color="#ddd" /><div style={{ fontSize: 13, fontWeight: 700 }}>{focusedOutfit.name}</div></div>
                    ) : (
                      <div style={{ textAlign: "center", color: "#ccc" }}>
                        <HangerIcon size={40} color="#ddd" />
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No outfits yet</div>
                      </div>
                    )}
                  </div>

                  {/* Remove button for focused outfit */}
                  {focusedOutfit && (
                    <div style={{ padding: "10px 14px", borderTop: "1px solid #f0ece4", flexShrink: 0 }}>
                      <button onClick={() => { removeOutfitFromDay(dateStr, focusedOutfit.id); setDayPopupTab(Math.max(0, activeTabIdx - 1)); }} style={{
                        width: "100%", padding: "8px", background: "#fef2f2", border: "1px solid #fdd", borderRadius: 10,
                        color: "#c0392b", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer"
                      }}>Remove "{focusedOutfit.name}"</button>
                    </div>
                  )}
                </div>

                {/* Right — pieces + add outfit */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Pieces */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
                    {focusedOutfit && pieces.length > 0 ? (<>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Pieces ({pieces.length})</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {pieces.map(item => (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#faf9f6", borderRadius: 12, border: "1px solid #f0ece4" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "#f5f2ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <HangerIcon size={16} color="#ccc" />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: "#aaa" }}>{[item.brand, item.category].filter(Boolean).join(" · ")}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>) : (
                      <div style={{ paddingTop: 20, textAlign: "center", color: "#ccc" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>No pieces yet</div>
                      </div>
                    )}
                  </div>

                  {/* Add outfit section */}
                  <div style={{ borderTop: "1px solid #f0ece4", padding: "12px 16px", flexShrink: 0 }}>
                    {!showDayAdd ? (
                      <button onClick={() => setShowDayAdd(true)} style={{
                        width: "100%", padding: "9px", background: "#1a1a1a", color: "#fff", border: "none",
                        borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif"
                      }}>+ Add Another Look</button>
                    ) : (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>Add a look</div>
                          <button onClick={() => { setShowDayAdd(false); setDayAddSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16 }}>×</button>
                        </div>
                        <input value={dayAddSearch} onChange={e => setDayAddSearch(e.target.value)} placeholder="Search outfits…"
                          style={{ width: "100%", padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                          {outfits.filter(o => !dayAddSearch || o.name.toLowerCase().includes(dayAddSearch.toLowerCase())).map(o => {
                            const alreadyAdded = ids.includes(o.id);
                            return (
                              <div key={o.id} onClick={() => { if (!alreadyAdded) { addOutfitToDay(dateStr, o.id); setDayPopupTab(ids.length); setShowDayAdd(false); setDayAddSearch(""); } }} style={{
                                borderRadius: 8, overflow: "hidden", background: alreadyAdded ? "#f0faf4" : "#f5f2ed",
                                cursor: alreadyAdded ? "default" : "pointer", border: alreadyAdded ? "2px solid #3aaa6e" : "2px solid transparent", position: "relative"
                              }}>
                                <div style={{ aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {o.previewImage ? <img src={o.previewImage} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <HangerIcon size={18} color="#ccc" />}
                                </div>
                                {alreadyAdded && <div style={{ position: "absolute", top: 3, right: 3, background: "#3aaa6e", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><SvgCheck size={8} color="#fff" /></div>}
                                <div style={{ padding: "3px 5px 5px", fontSize: 9, fontWeight: 700, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Event Modal */}
      {showEventModal && (
        <div onClick={() => setShowEventModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "26px 28px", width: "min(400px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>{editingEvent ? "Edit Event" : "Add Event"}</div>
              <button onClick={() => setShowEventModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Name</label>
              <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Paris Trip" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["trip","✈ Trip","#4a7fc1"],["event","★ Event","#9b72cf"],["work","💼 Work","#3aaa6e"],["other","• Other","#e8823a"]].map(([val, lbl, clr]) => (
                  <button key={val} onClick={() => setEventType(val)} style={{ flex: 1, padding: "7px 0", borderRadius: 10, border: eventType === val ? `2px solid ${clr}` : "1.5px solid #e8e4dc", background: eventType === val ? clr : "#fafaf8", color: eventType === val ? "#fff" : "#888", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{lbl}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Start</label>
                <input type="date" value={eventStart} onChange={e => setEventStart(e.target.value)} style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>End</label>
                <input type="date" value={eventEnd} onChange={e => setEventEnd(e.target.value)} style={{ width: "100%", padding: "9px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {editingEvent && <button onClick={() => { deleteEvent(editingEvent.id); setShowEventModal(false); }} style={{ padding: "10px 16px", background: "#fef2f2", color: "#e05555", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700 }}>Delete</button>}
              <button onClick={saveEvent} disabled={!eventName.trim() || !eventStart || !eventEnd} style={{ flex: 1, padding: "11px", background: !eventName.trim() || !eventStart || !eventEnd ? "#ccc" : "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Save Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan My Week Modal */}
      {showPlanWeekModal && (
        <div onClick={() => setShowPlanWeekModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "26px 28px", width: "min(480px, 94vw)", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>✦ Plan My Week</div>
              <button onClick={() => setShowPlanWeekModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>Suggested outfits for unplanned days this week{weather ? " (matched to forecast)" : ""}:</div>
            {Object.keys(planWeekSuggestions).length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#bbb", fontSize: 13 }}>All days this week already have outfits planned!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {Object.entries(planWeekSuggestions).map(([ds, id]) => {
                  const o = outfits.find(x => x.id === id);
                  const wx = getWeatherForDate(ds);
                  const label = new Date(ds + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                  return (
                    <div key={ds} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e8e4dc", background: "#fafaf8" }}>
                      {o?.previewImage ? <img src={o.previewImage} alt="" style={{ width: 48, height: 54, objectFit: "contain", borderRadius: 8, background: "#f5f2ed" }} /> : <div style={{ width: 48, height: 54, borderRadius: 8, background: "#f5f2ed" }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{label}</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 1 }}>{o?.name || "Unknown"}</div>
                        {wx && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{weatherIcon(wx.code)} {wx.high}°/{wx.low}°</div>}
                      </div>
                      <button onClick={() => setPlanWeekSuggestions(s => { const n = { ...s }; delete n[ds]; return n; })} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16 }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
            {Object.keys(planWeekSuggestions).length > 0 && (
              <button onClick={applyPlanWeek} style={{ width: "100%", padding: "11px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Apply Suggestions</button>
            )}
          </div>
        </div>
      )}

      {/* Custom Marker Modal */}
      {showMarkerModal && (
        <div onClick={() => setShowMarkerModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "26px 28px", width: "min(360px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>{editingMarker ? "Edit Marker" : "Add Marker"}</div>
              <button onClick={() => setShowMarkerModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Label</label>
              <input value={markerLabel} onChange={e => setMarkerLabel(e.target.value)} placeholder="e.g. First Day of Spring" autoFocus
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Date</label>
              <input type="date" value={markerDate} onChange={e => setMarkerDate(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {MARKER_COLORS.map(c => (
                  <button key={c} onClick={() => setMarkerColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: markerColor === c ? "3px solid #1a1a1a" : "3px solid transparent", cursor: "pointer", padding: 0, boxSizing: "border-box", transition: "border 0.1s" }} />
                ))}
                <input type="color" value={markerColor} onChange={e => setMarkerColor(e.target.value)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #e8e4dc", padding: 0, cursor: "pointer", background: markerColor }} title="Custom color" />
              </div>
              {markerLabel && <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", background: markerColor, color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>{markerLabel}</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {editingMarker && <button onClick={() => deleteMarker(editingMarker.id)} style={{ padding: "10px 16px", background: "#fef2f2", color: "#e05555", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700 }}>Delete</button>}
              <button onClick={saveMarker} disabled={!markerLabel.trim() || !markerDate} style={{ flex: 1, padding: "11px", background: !markerLabel.trim() || !markerDate ? "#ccc" : "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Save Marker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



const EVENT_TYPE_OPTIONS = [["trip","✈ Trip","#4a7fc1"],["event","★ Event","#9b72cf"],["work","💼 Work","#3aaa6e"],["other","• Other","#e8823a"]];
function UpcomingEventsCard({ events, onAdd, onRemove, onSelect, onEdit }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("event");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [multiDay, setMultiDay] = useState(false);
  const typeColor = EVENT_TYPE_OPTIONS.find(([v]) => v === type)?.[2] || "#9b72cf";
  const canAdd = name.trim() && startDate;
  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({ name: name.trim(), type, startDate, endDate: multiDay && endDate ? endDate : startDate });
    setName(""); setStartDate(""); setEndDate(""); setMultiDay(false); setType("event");
  };
  const upcoming = events.filter(ev => ev.endDate >= new Date().toISOString().slice(0,10)).sort((a,b) => a.startDate.localeCompare(b.startDate));
  const fmtDate = (s, e) => {
    const fmt = d => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return s === e ? fmt(s) : fmt(s) + " – " + fmt(e);
  };
  return (
    <div className="right-card">
      <div className="right-card-title">Upcoming Events</div>
      {/* Name */}
      <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} placeholder="Event name..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", marginBottom: 8 }} />
      {/* Date row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); if (!multiDay) setEndDate(e.target.value); }} style={{ flex: 1, padding: "7px 8px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
        <button onClick={() => setMultiDay(m => !m)} style={{ flexShrink: 0, padding: "7px 8px", borderRadius: 10, border: multiDay ? "1.5px solid #1a1a1a" : "1.5px solid #e8e4dc", background: multiDay ? "#1a1a1a" : "#fff", color: multiDay ? "#fff" : "#aaa", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Multi-day</button>
      </div>
      {multiDay && (
        <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} placeholder="End date" style={{ width: "100%", boxSizing: "border-box", padding: "7px 8px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 11, outline: "none", marginBottom: 8 }} />
      )}
      <button onClick={handleAdd} disabled={!canAdd} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", background: canAdd ? "#1a1a1a" : "#e8e4dc", color: canAdd ? "#fff" : "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, cursor: canAdd ? "pointer" : "default", marginBottom: upcoming.length > 0 ? 12 : 0 }}>Add to Calendar</button>
      {upcoming.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {upcoming.slice(0, 5).map(ev => {
            const clr = EVENT_TYPE_OPTIONS.find(([v]) => v === ev.type)?.[2] || "#9b72cf";
            return (
              <div key={ev.id} onClick={() => onSelect && onSelect(ev)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#faf9f6", borderRadius: 10, padding: "7px 9px", border: "1px solid #f0ece4", cursor: "pointer" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: clr, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.name}</div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{fmtDate(ev.startDate, ev.endDate)}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onRemove(ev.id); }} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 15, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// HOME VIEW COMPONENT
// ─────────────────────────────────────────
function HomeView({
  items,
  outfits,
  lookbooks,
  moodboards,
  onGoCloset,
  onGoOutfits,
  onGoLookbooks,
  onGoMoodboards,
  onGoSeller,
  onOpenLookbook
}) {

  const now = new Date()

  const newItems = items.filter(i => {
    const d = new Date(i.created_at || i.purchaseDate || 0)
    return (now - d) < 1000 * 60 * 60 * 24 * 30
  })

  const pinnedLookbooks = (lookbooks || []).filter(l => l.pinned)
  const pinnedMoodboards = (moodboards || []).filter(b => b.pinned)

  return (
    <div className="app-layout">

      <div className="app-main">

        <div className="right-card" style={{marginBottom:22}}>
          <div className="right-card-title">This Week</div>
          <div style={{
            height:180,
            border:"1px solid #ece8e0",
            borderRadius:12,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:13,
            color:"#999"
          }}>
            Weekly calendar
          </div>
        </div>

        <div className="right-card" style={{marginBottom:22}}>
          <div className="right-card-title">Upcoming Plans</div>

          {(lookbooks || [])
            .filter(l => l.startDate)
            .sort((a,b)=>new Date(a.startDate)-new Date(b.startDate))
            .slice(0,4)
            .map(lb=>(
              <div
                key={lb.id}
                style={{padding:"6px 0",fontSize:13,cursor:"pointer"}}
                onClick={()=>onOpenLookbook?.(lb)}
              >
                {lb.name}
              </div>
            ))
          }
        </div>

        <div className="right-card" style={{marginBottom:22}}>
          <div className="right-card-title">Pinned</div>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(3,1fr)",
            gap:12
          }}>

            {pinnedLookbooks.map(lb=>(
              <div key={lb.id} className="item-card">
                {lb.cover && <img src={lb.cover} className="item-card-img"/>}
                <div className="item-card-label">
                  <div className="item-card-name">{lb.name}</div>
                </div>
              </div>
            ))}

            {pinnedMoodboards.map(m=>(
              <div key={m.id} className="item-card">
                <div className="item-card-label">
                  <div className="item-card-name">{m.name}</div>
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="right-card">
          <div className="right-card-title">New In</div>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(5,1fr)",
            gap:12
          }}>

            {newItems.slice(0,10).map(item=>(
              <div key={item.id} className="item-card">

                {item.image && (
                  <img src={item.image} className="item-card-img"/>
                )}

                <div className="item-card-label">
                  <div className="item-card-name">{item.name}</div>
                  <div className="item-card-brand">{item.brand}</div>
                </div>

              </div>
            ))}

          </div>
        </div>

      </div>

      <div className="app-right-panel">

        <div className="right-card">
          <div className="right-card-title">Overview</div>

          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span>Closet</span>
            <strong>{(items||[]).length}</strong>
          </div>

          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span>Outfits</span>
            <strong>{(outfits||[]).length}</strong>
          </div>

          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span>Lookbooks</span>
            <strong>{(lookbooks||[]).length}</strong>
          </div>

        </div>

        <div className="right-card">
          <div className="right-card-title">Seller Snapshot</div>
          <div style={{fontSize:13,color:"#888"}}>
            Seller stats coming soon
          </div>
        </div>

      </div>

    </div>
  )
}

// ── Login / Auth ─────────────────────────────────────────────────────────────
const PW_HASH_KEY = "wardrobe_pw_hash_v1";
const SESSION_KEY = "wardrobe_authed_v1";

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function AppPasswordCard() {
  const [pwMode, setPwMode] = useState("idle"); // "idle" | "change" | "remove"
  const [hasAppPw, setHasAppPw] = useState(() => !!localStorage.getItem(PW_HASH_KEY));
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const resetForm = () => { setOldPw(""); setNewPw(""); setConfirmPw(""); setPwError(""); setPwSuccess(""); setPwMode("idle"); };

  const handleSave = async () => {
    setPwError(""); setPwSuccess("");
    if (hasAppPw) {
      const oldHash = await sha256(oldPw);
      if (oldHash !== localStorage.getItem(PW_HASH_KEY)) { setPwError("Current password is incorrect."); return; }
    }
    if (newPw.length < 4) { setPwError("New password must be at least 4 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    localStorage.setItem(PW_HASH_KEY, await sha256(newPw));
    setHasAppPw(true);
    setPwSuccess("Password updated.");
    setTimeout(resetForm, 1500);
  };

  const handleRemove = async () => {
    setPwError(""); setPwSuccess("");
    const oldHash = await sha256(oldPw);
    if (oldHash !== localStorage.getItem(PW_HASH_KEY)) { setPwError("Current password is incorrect."); return; }
    localStorage.removeItem(PW_HASH_KEY);
    setHasAppPw(false);
    setPwSuccess("Password removed.");
    setTimeout(resetForm, 1500);
  };

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e8e8e8", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid #ece8e0", marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>App Password</div>
      {pwMode === "idle" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, color: "#888" }}>
            {hasAppPw ? "A backup password is set." : "No backup password — Google sign-in only."}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPwMode("change")} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e8e8e8", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {hasAppPw ? "Change" : "Set Password"}
            </button>
            {hasAppPw && (
              <button onClick={() => setPwMode("remove")} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fce8e8", background: "#fff8f8", fontSize: 12, fontWeight: 600, color: "#c0392b", cursor: "pointer" }}>
                Remove
              </button>
            )}
          </div>
        </div>
      )}
      {(pwMode === "change" || pwMode === "remove") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {hasAppPw && <input type="password" placeholder="Current password" value={oldPw} onChange={e => setOldPw(e.target.value)} style={inp} autoFocus />}
          {pwMode === "change" && <>
            <input type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inp} autoFocus={!hasAppPw} />
            <input type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inp} />
          </>}
          {pwError && <div style={{ fontSize: 12, color: "#c0392b" }}>{pwError}</div>}
          {pwSuccess && <div style={{ fontSize: 12, color: "#3aaa6e" }}>{pwSuccess}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={pwMode === "change" ? handleSave : handleRemove}
              style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: pwMode === "remove" ? "#c0392b" : "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {pwMode === "change" ? (hasAppPw ? "Update Password" : "Set Password") : "Remove Password"}
            </button>
            <button onClick={resetForm} style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #e8e8e8", background: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Google "G" SVG logo
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function BrandIcon({ size = 40, radius = 12, style = {} }) {
  return (
    <img
      src="/icon.svg?v=4"
      alt="HC Closet"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "block",
        objectFit: "cover",
        ...style,
      }}
    />
  );
}

function LoginScreen({ onAuth }) {
  const hasPassword = !!localStorage.getItem(PW_HASH_KEY);
  const [mode, setMode] = useState(hasPassword ? "login" : "setup");
  const [showPassword, setShowPassword] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) { setError(err.message); setLoading(false); }
    // On success: page redirects to Google, then back — onAuthStateChange handles it
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (pw.length < 4) { setError("Password must be at least 4 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const hash = await sha256(pw);
    localStorage.setItem(PW_HASH_KEY, hash);
    sessionStorage.setItem(SESSION_KEY, "1");
    onAuth();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const hash = await sha256(pw);
    if (hash === localStorage.getItem(PW_HASH_KEY)) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onAuth();
    } else {
      setError("Incorrect password.");
      setPw("");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e8e8e8",
    fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  };
  const btnBase = {
    width: "100%", padding: "12px", borderRadius: 10, border: "none",
    fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #faf9f7 0%, #f3ede8 100%)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 40px", width: 360,
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <BrandIcon size={52} radius={14} style={{ marginBottom: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 26, color: "#1a1a1a", marginBottom: 6 }}>
          {mode === "setup" ? "Create a password" : "Welcome back"}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 28, textAlign: "center" }}>
          {mode === "setup" ? "Set a backup password for your wardrobe." : "Sign in to continue."}
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{ ...btnBase, background: "#fff", border: "1.5px solid #e8e8e8", color: "#1a1a1a", marginBottom: 16, opacity: loading ? 0.6 : 1 }}
        >
          <GoogleLogo /> Continue with Google
        </button>

        {/* Divider */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#efefef" }} />
          <span style={{ fontSize: 11, color: "#bbb", whiteSpace: "nowrap" }}>or use password</span>
          <div style={{ flex: 1, height: 1, background: "#efefef" }} />
        </div>

        {/* Password form */}
        {!showPassword && mode === "login" ? (
          <button
            onClick={() => setShowPassword(true)}
            style={{ ...btnBase, background: "transparent", border: "1.5px solid #e8e8e8", color: "#888" }}
          >
            Sign in with password
          </button>
        ) : (
          <form onSubmit={mode === "setup" ? handleSetup : handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="password" placeholder="Password" value={pw} autoFocus
              onChange={e => { setPw(e.target.value); setError(""); }} style={inputStyle} />
            {mode === "setup" && (
              <input type="password" placeholder="Confirm password" value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(""); }} style={inputStyle} />
            )}
            {error && <div style={{ fontSize: 12, color: "#c0392b", textAlign: "center" }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ ...btnBase, background: "#1a1a1a", color: "#fff", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {mode === "setup" ? "Set Password" : "Unlock"}
            </button>
          </form>
        )}

        {mode === "login" && (
          <button
            onClick={() => { setMode("setup"); setPw(""); setConfirm(""); setError(""); setShowPassword(false); localStorage.removeItem(PW_HASH_KEY); }}
            style={{ marginTop: 14, background: "none", border: "none", fontSize: 12, color: "#bbb", cursor: "pointer" }}
          >
            Forgot password? Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [authLoading, setAuthLoading] = useState(() => sessionStorage.getItem(SESSION_KEY) !== "1");
  const [activeTheme, setActiveTheme] = useState(() => getTheme());
  const itemsDb = useSupabaseTable("items");
  const wishlistDb = useSupabaseTable("wishlist");
  const outfitsDb = useSupabaseTable("outfits");
  const lookbooksDb = useSupabaseTable("lookbooks");
  const moodboardsDb = useMoodboardsDb();

  const [tab, setTabRaw] = useState(() => { try { return localStorage.getItem("wardrobe_active_tab") || "home"; } catch { return "home"; } });
  const setTab = (t) => { setTabRaw(t); try { localStorage.setItem("wardrobe_active_tab", t); } catch {} };
  const [modal, setModal] = useState(null);
  const [homeAddOpen, setHomeAddOpen] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [catFilters, setCatFilters] = useState([]); // multi-select categories
  const [closetZoom, setClosetZoom] = useState(148); // card min-width in px
  const [shopMode, setShopMode] = useState(false); // editorial "shop your closet" view
  const [shopSort, setShopSort] = useState("rediscover"); // "rediscover" | "leastWorn" | "cpwHigh" | "cpwLow"
  const [outfitZoom, setOutfitZoom] = useState(200); // outfit card min-width in px
  const [showNewOnly, setShowNewOnly] = useState(false); // "What's New" filter
  const [showNeedsStylingOnly, setShowNeedsStylingOnly] = useState(false);
  const [showDisneyOnly, setShowDisneyOnly] = useState(false);
  const [capsules, setCapsules] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_capsules_v1") || "[]"); } catch { return []; } });
  const [activeCapsule, setActiveCapsule] = useState(null);
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [capsuleName, setCapsuleName] = useState("");
  const [capsulePreselect, setCapsulePreselect] = useState(null); // item ids to preselect in capsule modal
  const [capsuleEditId, setCapsuleEditId] = useState(null); // id of capsule being edited
  const [editItem, setEditItem] = useState(null);
  const [outfitBuilder, setOutfitBuilder] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [outfitSeedItem, setOutfitSeedItem] = useState(null);
  const [outfitPrefillName, setOutfitPrefillName] = useState("");
  const [lbPickerOutfit, setLbPickerOutfit] = useState(null);
  const [outfitTagFilter, setOutfitTagFilter] = useState("All");
  const [outfitSeasonFilter, setOutfitSeasonFilter] = useState("All");
  const [outfitSearch, setOutfitSearch] = useState("");
  const [outfitSort, setOutfitSortState] = useState(() => { try { return localStorage.getItem("wardrobe_outfit_sort_v1") || "default"; } catch { return "default"; } });
  const setOutfitSort = v => { setOutfitSortState(v); try { localStorage.setItem("wardrobe_outfit_sort_v1", v); } catch {} };
  const [homeCity, setHomeCityState] = useState(() => { try { return localStorage.getItem("wardrobe_home_city") || ""; } catch { return ""; } });
  const setHomeCity = (c) => { setHomeCityState(c); try { localStorage.setItem("wardrobe_home_city", c); } catch {} };
  const [upcomingEvents, setUpcomingEvents] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_upcoming_events_v1") || "[]"); } catch { return []; } });
  const [eventDraftName, setEventDraftName] = useState("");
  const [eventDraftDate, setEventDraftDate] = useState("");
  const [outfitPopup, setOutfitPopup] = useState(null); // outfit object
  const [outfitsView, setOutfitsView] = useState("grid"); // "grid" | "calendar"
  const [outfitSelectMode, setOutfitSelectMode] = useState(false);
  const [selectedOutfitIds, setSelectedOutfitIds] = useState(new Set());
  const [hoveredSidebarToday, setHoveredSidebarToday] = useState(false);
  const [outfitBulkLbPicker, setOutfitBulkLbPicker] = useState(false);
  const [outfitBulkNewLb, setOutfitBulkNewLb] = useState(false);
  const [outfitBulkNewLbName, setOutfitBulkNewLbName] = useState("");
  const [outfitBulkCalModal, setOutfitBulkCalModal] = useState(false);
  const [outfitBulkCalDate, setOutfitBulkCalDate] = useState(() => new Date().toISOString().slice(0, 10));
  const OUTFIT_CALENDAR_KEY = "wardrobe_outfit_calendar_v1";
  const [outfitCalendar, setOutfitCalendar] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_outfit_calendar_v1") || "{}"); } catch { return {}; } });
  const saveOutfitCalendar = (cal) => { setOutfitCalendar(cal); localStorage.setItem("wardrobe_outfit_calendar_v1", JSON.stringify(cal)); };
  const saveUpcomingEvents = (next) => {
    setUpcomingEvents(next);
    try { localStorage.setItem("wardrobe_upcoming_events_v1", JSON.stringify(next)); } catch {}
  };
  const eventSortKey = (dateStr) => {
    const m = /^\s*(\d{1,2})\/(\d{1,2})\s*$/.exec(dateStr || "");
    if (!m) return Number.MAX_SAFE_INTEGER;
    const month = Number(m[1]);
    const day = Number(m[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return Number.MAX_SAFE_INTEGER;
    const now = new Date();
    const year = now.getFullYear();
    const thisYear = new Date(year, month - 1, day);
    const target = thisYear < new Date(year, now.getMonth(), now.getDate()) ? new Date(year + 1, month - 1, day) : thisYear;
    return target.getTime();
  };
  const sortEventsByDate = (events) => [...events].sort((a, b) => eventSortKey(a.date) - eventSortKey(b.date));
  const addUpcomingEvent = ({ name, type, startDate, endDate }) => {
    const newEv = { id: uid(), name, type, startDate, endDate };
    saveCalendarEvents([...calendarEvents, newEv]);
  };
  const removeUpcomingEvent = (eventId) => {
    saveCalendarEvents(calendarEvents.filter(ev => ev.id !== eventId));
  };
  const startOutfitFromEvent = (event) => {
    if (!event?.name) return;
    setTab("outfits");
    setEditingOutfit(null);
    setOutfitSeedItem(null);
    setOutfitPrefillName(event.name);
    setOutfitBuilder(true);
  };
  const [calendarMonth, setCalendarMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [calendarWeather, setCalendarWeather] = useState(null);
  const [homeWeather, setHomeWeather] = useState(null);
  const fetchHomeWeather = useCallback(async (city) => {
    if (!city) return;
    const q = city.split(",")[0].trim();
    try {
      const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=1&language=en&format=json");
      const geo = await geoRes.json();
      const loc = geo.results?.[0];
      if (!loc) return;
      const wRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + loc.latitude + "&longitude=" + loc.longitude + "&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=7");
      const w = await wRes.json();
      const days = (w.daily?.time || []).map((d, i) => ({ date: d, high: Math.round(w.daily.temperature_2m_max[i]), low: Math.round(w.daily.temperature_2m_min[i]), code: w.daily.weathercode[i] }));
      setHomeWeather({ city: loc.name, days });
    } catch(e) {}
  }, []);
  useEffect(() => { if (homeCity) fetchHomeWeather(homeCity); }, [homeCity]); // eslint-disable-line
  const [calendarEvents, setCalendarEvents] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_cal_events_v1") || "[]"); } catch { return []; } });
  const saveCalendarEvents = (evts) => { setCalendarEvents(evts); try { localStorage.setItem("wardrobe_cal_events_v1", JSON.stringify(evts)); } catch {} };
  const [itemDetail, setItemDetail] = useState(null); // closet item detail popup
  const [closetSort, setClosetSort] = useState(() => { try { return localStorage.getItem("wardrobe_default_sort_v1") || "default"; } catch { return "default"; } });
  const [closetSeasonFilter, setClosetSeasonFilter] = useState(() => { try { return localStorage.getItem("wardrobe_default_season_v1") || "All"; } catch { return "All"; } });
  const [closetColorFilter, setClosetColorFilter] = useState([]);
  const [closetItemOrder, setClosetItemOrder] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_item_order_v1") || "[]"); } catch { return []; } });
  const saveItemOrder = (order) => { setClosetItemOrder(order); try { localStorage.setItem("wardrobe_item_order_v1", JSON.stringify(order)); } catch {} };
  const dragItemRef = useRef(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [showNavLabels, setShowNavLabels] = useState(() => { try { return localStorage.getItem("wardrobe_nav_labels_v1") !== "0"; } catch { return true; } });
  const [density, setDensity] = useState(() => { try { return localStorage.getItem("wardrobe_density_v1") || "comfortable"; } catch { return "comfortable"; } });
  const [fontSize, setFontSizeState] = useState(() => { try { return parseInt(localStorage.getItem("wardrobe_font_size_v1")) || 14; } catch { return 14; } });
  const setFontSize = v => { setFontSizeState(v); try { localStorage.setItem("wardrobe_font_size_v1", String(v)); } catch {} };
  const [accentOverride, setAccentOverrideState] = useState(() => { try { return localStorage.getItem("wardrobe_accent_override_v1") || ""; } catch { return ""; } });
  const setAccentOverride = v => { setAccentOverrideState(v); try { localStorage.setItem("wardrobe_accent_override_v1", v); } catch {} };
  const [guestMode, setGuestModeState] = useState(() => { try { return localStorage.getItem("wardrobe_guest_mode_v1") === "1"; } catch { return false; } });
  const setGuestMode = v => { setGuestModeState(v); try { localStorage.setItem("wardrobe_guest_mode_v1", v ? "1" : "0"); } catch {} };
  const [defaultTab, setDefaultTabState] = useState(() => { try { return localStorage.getItem("wardrobe_default_tab_v1") || "closet"; } catch { return "closet"; } });
  const setDefaultTab = v => { setDefaultTabState(v); try { localStorage.setItem("wardrobe_default_tab_v1", v); } catch {} };
  const CUSTOM_CATS_KEY = "wardrobe_custom_cats_v1";
  const CUSTOM_OCC_KEY = "wardrobe_custom_occ_v1";
  const CUSTOM_SEAS_KEY = "wardrobe_custom_seas_v1";
  const [customCategories, setCustomCategories] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_custom_cats_v1") || "null") || ["Tops","Bottoms","Dresses","Outerwear","Shoes","Bags","Accessories","Activewear","Swimwear","Jewelry","Other"]; } catch { return ["Tops","Bottoms","Dresses","Outerwear","Shoes","Bags","Accessories","Activewear","Swimwear","Jewelry","Other"]; } });
  const [customOccasions, setCustomOccasions] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_custom_occ_v1") || "null") || ["WFH","Disney","Universal","Date Night","Travel","Sport","Weekend","Event"]; } catch { return ["WFH","Disney","Universal","Date Night","Travel","Sport","Weekend","Event"]; } });
  const [customSeasons, setCustomSeasons] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_custom_seas_v1") || "null") || ["Spring","Summer","Fall","Winter","All Season","Holiday","Disney"]; } catch { return ["Spring","Summer","Fall","Winter","All Season","Holiday","Disney"]; } });
  const [lastSynced, setLastSynced] = useState(() => { try { return localStorage.getItem("wardrobe_last_synced_v1") || null; } catch { return null; } });
  const [monthlyBudget, setMonthlyBudgetState] = useState(() => { try { return parseFloat(localStorage.getItem("wardrobe_monthly_budget_v1")) || 0; } catch { return 0; } });
  const [annualBudget, setAnnualBudgetState] = useState(() => { try { return parseFloat(localStorage.getItem("wardrobe_annual_budget_v1")) || 0; } catch { return 0; } });
  const [temperatureUnit, setTemperatureUnitState] = useState(() => { try { return localStorage.getItem("wardrobe_temperature_unit_v1") || "fahrenheit"; } catch { return "fahrenheit"; } });
  const [travelCityBehavior, setTravelCityBehaviorState] = useState(() => { try { return localStorage.getItem("wardrobe_travel_city_behavior_v1") || "ask"; } catch { return "ask"; } });
  const [outfitReminderDay, setOutfitReminderDayState] = useState(() => { try { return localStorage.getItem("wardrobe_outfit_reminder_day_v1") || "Sunday"; } catch { return "Sunday"; } });
  const [outfitReminderTime, setOutfitReminderTimeState] = useState(() => { try { return localStorage.getItem("wardrobe_outfit_reminder_time_v1") || "19:00"; } catch { return "19:00"; } });
  const [rainyDaySuggestions, setRainyDaySuggestionsState] = useState(() => { try { return localStorage.getItem("wardrobe_rainy_suggestions_v1") !== "0"; } catch { return true; } });
  const [hideSoldByDefault, setHideSoldByDefaultState] = useState(() => { try { return localStorage.getItem("wardrobe_hide_sold_v1") === "1"; } catch { return false; } });
  const [hideArchivedByDefault, setHideArchivedByDefaultState] = useState(() => { try { return localStorage.getItem("wardrobe_hide_archived_v1") !== "0"; } catch { return true; } });
  const [defaultClosetViewMode, setDefaultClosetViewModeState] = useState(() => { try { return localStorage.getItem("wardrobe_default_view_mode_v1") || "grid"; } catch { return "grid"; } });
  const [defaultOnlyUnworn, setDefaultOnlyUnwornState] = useState(() => { try { return localStorage.getItem("wardrobe_default_only_unworn_v1") === "1"; } catch { return false; } });
  const [defaultOnlyInSeason, setDefaultOnlyInSeasonState] = useState(() => { try { return localStorage.getItem("wardrobe_default_only_in_season_v1") === "1"; } catch { return false; } });
  const setMonthlyBudget = (v) => { setMonthlyBudgetState(v); try { localStorage.setItem("wardrobe_monthly_budget_v1", String(v)); } catch {} };
  const setAnnualBudget = (v) => { setAnnualBudgetState(v); try { localStorage.setItem("wardrobe_annual_budget_v1", String(v)); } catch {} };
  const setTemperatureUnit = (v) => { setTemperatureUnitState(v); try { localStorage.setItem("wardrobe_temperature_unit_v1", v); } catch {} };
  const setTravelCityBehavior = (v) => { setTravelCityBehaviorState(v); try { localStorage.setItem("wardrobe_travel_city_behavior_v1", v); } catch {} };
  const setOutfitReminderDay = (v) => { setOutfitReminderDayState(v); try { localStorage.setItem("wardrobe_outfit_reminder_day_v1", v); } catch {} };
  const setOutfitReminderTime = (v) => { setOutfitReminderTimeState(v); try { localStorage.setItem("wardrobe_outfit_reminder_time_v1", v); } catch {} };
  const setRainyDaySuggestions = (v) => { setRainyDaySuggestionsState(v); try { localStorage.setItem("wardrobe_rainy_suggestions_v1", v ? "1" : "0"); } catch {} };
  const setHideSoldByDefault = (v) => { setHideSoldByDefaultState(v); try { localStorage.setItem("wardrobe_hide_sold_v1", v ? "1" : "0"); } catch {} };
  const setHideArchivedByDefault = (v) => { setHideArchivedByDefaultState(v); try { localStorage.setItem("wardrobe_hide_archived_v1", v ? "1" : "0"); } catch {} };
  const setDefaultClosetViewMode = (v) => { setDefaultClosetViewModeState(v); try { localStorage.setItem("wardrobe_default_view_mode_v1", v); } catch {} };
  const setDefaultOnlyUnworn = (v) => { setDefaultOnlyUnwornState(v); try { localStorage.setItem("wardrobe_default_only_unworn_v1", v ? "1" : "0"); } catch {} };
  const setDefaultOnlyInSeason = (v) => { setDefaultOnlyInSeasonState(v); try { localStorage.setItem("wardrobe_default_only_in_season_v1", v ? "1" : "0"); } catch {} };
  // ── Google / Supabase Auth session check ──────────────────────────────────
  useEffect(() => {
    // Check for an existing Supabase session (handles Google OAuth redirect callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setIsAuthenticated(true);
      }
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setIsAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        sessionStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (itemsDb.rows.length > 0) {
      const ts = new Date().toISOString();
      setLastSynced(ts);
      try { localStorage.setItem("wardrobe_last_synced_v1", ts); } catch {}
    }
  }, [itemsDb.rows]);
  const [closetSearch, setClosetSearch] = useState("");
  const [activeLookbook, setActiveLookbook] = useState(null);
  const [activeLookbookView, setActiveLookbookView] = useState("editorial");
  const [moodboardActiveIdx, setMoodboardActiveIdx] = useState(0);
  const [moodboardView, setMoodboardView] = useState("grid"); // "grid" | "canvas"
  const [moodboardSearch, setMoodboardSearch] = useState("");
  const [moodboardTagFilter, setMoodboardTagFilter] = useState("All");
  const LOOKBOOK_TYPES = ["trip", "event", "season", "capsule", "inspiration"];
  const LOOKBOOK_OCCASIONS = ["All", "WFH", "Disney", "Universal", "Date Night", "Travel", "Sport", "Weekend", "Event"];
  const LOOKBOOK_OCCASION_ALIASES = {
    "WFH": ["WFH", "Work Week", "Work"],
    "Event": ["Event", "Occasion", "Vacation"],
  };
  const [lbSearch, setLbSearch] = useState("");
  const [lbSort, setLbSort] = useState("newest");
  const [lbPreview, setLbPreview] = useState(null); // lookbook preview popup
  const [lbZoom, setLbZoom] = useState(210);
  const [lbTagFilter, setLbTagFilter] = useState("All");
  const [lbTypeFilter, setLbTypeFilter] = useState("All");
  const [bulkMode, setBulkMode] = useState(false);
  const [wishlistDest, setWishlistDest] = useState(false);
  const [wlSort, setWlSortState] = useState(() => { try { return localStorage.getItem("wardrobe_wl_sort_v1") || "priority"; } catch { return "priority"; } });
  const setWlSort = v => { setWlSortState(v); try { localStorage.setItem("wardrobe_wl_sort_v1", v); } catch {} };
  const [wlSortCat, setWlSortCat] = useState("All");
  const [wlZoom, setWlZoom] = useState(180);
  const [activeWishlistId, setActiveWishlistId] = useState(null); // null = "All"
  const [wishlistsDb, setWishlistsLocal] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_wishlists_v1") || "[]"); } catch { return []; } });
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [wlSelectMode, setWlSelectMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [lookbookModal, setLookbookModal] = useState(false);
  const [newLbName, setNewLbName] = useState("");
  const [newLbNotes, setNewLbNotes] = useState("");
  const [newLbCover, setNewLbCover] = useState(""); // base64 data URL
  const [newLbDateStart, setNewLbDateStart] = useState("");
  const [newLbTags, setNewLbTags] = useState([]);
  const [newLbType, setNewLbType] = useState("trip");
  const [newLbCity, setNewLbCity] = useState("");
  const [newLbDateEnd, setNewLbDateEnd] = useState("");
  const [newLbSelected, setNewLbSelected] = useState([]);
  const [newLbMoodboardId, setNewLbMoodboardId] = useState("");
  const [newLbCalEventId, setNewLbCalEventId] = useState("");

  const saveWishlistsMeta = (wls) => {
    setWishlistsLocal(wls);
    try { localStorage.setItem("wardrobe_wishlists_v1", JSON.stringify(wls)); } catch {}
  };
  const closeModal = () => { setModal(null); setEditItem(null); };

  const saveItem = async (form) => {
    if (editItem) await itemsDb.update({ ...form, id: editItem.id });
    else await itemsDb.add({ ...form, id: uid() });
    closeModal();
  };

  const saveWishItem = async (form) => {
    if (editItem) await wishlistDb.update({ ...form, id: editItem.id });
    else await wishlistDb.add({ ...form, id: uid(), addedAt: new Date().toISOString() });
    closeModal();
  };

  const moveToCloset = async (wish, purchasedDate, finalPrice) => {
    const today = purchasedDate || new Date().toISOString().slice(0, 10);
    await itemsDb.add({ ...wish, purchaseDate: today, forSale: false, saleStatus: undefined, ...(finalPrice ? { spent: String(finalPrice) } : {}) });
    await wishlistDb.remove(wish.id);
  };

  const openNewOutfit = (prefillName = "") => { try { localStorage.removeItem("wardrobe_builder_draft"); } catch {} setEditingOutfit(null); setOutfitSeedItem(null); setOutfitPrefillName(prefillName); setOutfitBuilder(true); };
  const duplicateOutfit = async (outfit) => {
    const copy = { ...outfit, id: uid(), name: outfit.name + " (copy)" };
    await outfitsDb.add(copy);
  };
  const openEditOutfit = (outfit) => { setEditingOutfit(outfit); setOutfitBuilder(true); };

  const saveOutfit = async (data) => {
    if (editingOutfit) await outfitsDb.update({ ...data, id: editingOutfit.id });
    else await outfitsDb.add({ ...data, id: uid() });
    setOutfitBuilder(false); setEditingOutfit(null); setOutfitPrefillName("");
  };

  const createLookbook = async () => {
    if (!newLbName.trim()) return;
    const newLb = {
      id: uid(),
      name: newLbName.trim(),
      notes: newLbNotes,
      coverImage: newLbCover,
      dateStart: newLbDateStart,
      dateEnd: newLbDateEnd,
      city: newLbCity,
      outfitIds: newLbSelected,
      type: newLbType,
      tags: newLbTags,
      lookMeta: {},
      ...(newLbMoodboardId ? { moodboardId: newLbMoodboardId } : {}),
      ...(newLbCalEventId ? { linkedCalEventId: newLbCalEventId } : {}),
    };
    setLookbookModal(false);
    setNewLbName(""); setNewLbNotes(""); setNewLbCover("");
    setNewLbDateStart(""); setNewLbDateEnd(""); setNewLbSelected([]); setNewLbTags([]); setNewLbType("trip"); setNewLbCity("");
    setNewLbMoodboardId(""); setNewLbCalEventId("");
    // Try wrapped {id, data} schema first, fall back to flat insert
    let { error } = await supabase.from("lookbooks").insert({ id: newLb.id, data: newLb });
    if (error) {
      console.warn("[lookbooks] wrapped insert failed, trying flat:", error.message);
      ({ error } = await supabase.from("lookbooks").insert(newLb));
    }
    if (error) console.error("[lookbooks] create failed:", error.message, error.details, error.hint);
    await lookbooksDb.refresh();
  };

  const addOutfitToLookbook = async (outfitId, lookbookId) => {
    const lb = lookbooksDb.rows.find(l => l.id === lookbookId);
    if (!lb) return;
    const updated = { ...lb, outfitIds: [...(lb.outfitIds || []), outfitId] };
    await lookbooksDb.update(updated);
  };

  const updateLookbook = async (lb) => {
    try {
      await lookbooksDb.update(lb);
    } catch(e) {
      console.error("updateLookbook error:", e);
    }
    // Don't call setActiveLookbook here — it re-keys the viewer and resets all state
  };

  const closeAndSaveLookbook = (lb) => {
    if (lb) {
      try { lookbooksDb.update(lb); } catch(e) {}
    }
    setActiveLookbook(null);
    setActiveLookbookView("editorial");
  };

  const LB_ARCHIVE_KEY = "wardrobe_lookbooks_archived_v1";
  const archiveLookbook = (lb) => {
    try {
      const archived = JSON.parse(localStorage.getItem(LB_ARCHIVE_KEY) || "[]");
      archived.push({ ...lb, archivedAt: new Date().toISOString() });
      localStorage.setItem(LB_ARCHIVE_KEY, JSON.stringify(archived));
    } catch {}
    try { lookbooksDb.remove(lb.id); } catch(e) {}
    setActiveLookbook(null);
    setActiveLookbookView("editorial");
  };

  const OUTFIT_ARCHIVE_KEY = "wardrobe_outfits_archived_v1";
  const archiveOutfit = async (outfit) => {
    const withMeta = { ...outfit, archived: true, archivedAt: new Date().toISOString() };
    try { await outfitsDb.update(withMeta); } catch (e) {}
    try {
      const archived = JSON.parse(localStorage.getItem(OUTFIT_ARCHIVE_KEY) || "[]");
      if (!archived.find(o => o.id === outfit.id)) {
        archived.push(withMeta);
        localStorage.setItem(OUTFIT_ARCHIVE_KEY, JSON.stringify(archived));
      }
    } catch {}
    setOutfitPopup(null);
  };

  const markOutfitWorn = async (outfit, dateStr) => {
    const ids = outfit.layers || outfit.itemIds || [];
    const today = dateStr || new Date().toISOString().slice(0, 10);
    for (const id of ids) {
      const item = itemsDb.rows.find(i => i.id === id);
      if (item) await itemsDb.update({ ...item, wornCount: (item.wornCount || 0) + 1, lastWorn: today });
    }
    // Log to outfit's wornDates array
    const updated = { ...outfit, wornCount: (outfit.wornCount || 0) + 1, wornDates: [...(outfit.wornDates || []), today] };
    await outfitsDb.update(updated);
  };

  const markWorn = async (item) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...item, wornCount: (item.wornCount || 0) + 1, lastWorn: today };
    await itemsDb.update(updated);
    if (itemDetail?.id === item.id) setItemDetail(updated);
  };

  const duplicateItem = async (item) => {
    const { id, ...rest } = item;
    await itemsDb.add({ ...rest, id: uid(), name: `${item.name} Copy` });
  };

  const filteredItems = (() => {
    const q = closetSearch.trim().toLowerCase();
    const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const capsuleItemIds = activeCapsule ? new Set((capsules.find(c => c.id === activeCapsule)?.itemIds || [])) : null;
    let rows = itemsDb.rows.filter(i => {
      if (i.forSale) return false;
      const matchCat = catFilters.length === 0 || catFilters.includes(i.category);
      const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.brand||"").toLowerCase().includes(q) || (i.color||"").toLowerCase().includes(q) || (i.category||"").toLowerCase().includes(q);
      const matchSeason = closetSeasonFilter === "All" || (i.seasons || []).includes(closetSeasonFilter) || i.season === closetSeasonFilter;
      const matchNew = !showNewOnly || (i.purchaseDate && new Date(i.purchaseDate) >= threeMonthsAgo);
      const matchNeedsStyling = !showNeedsStylingOnly || !!i.needsStyling;
      const disneyTags = [
        ...(i.tags || []),
        ...(i.occasions || []),
        ...(i.seasons || []),
        i.occasion,
        i.season,
      ].filter(Boolean).map(v => String(v).toLowerCase());
      const isDisney = disneyTags.includes("disney");
      const matchDisney = showDisneyOnly ? isDisney : !isDisney;
      const matchCapsule = !capsuleItemIds || capsuleItemIds.has(i.id);
      const matchColor = closetColorFilter.length === 0 || closetColorFilter.some(c => (i.color||"").toLowerCase() === c.toLowerCase());
      return matchCat && matchSearch && matchSeason && matchNew && matchNeedsStyling && matchDisney && matchCapsule && matchColor;
    });
    if (closetSort === "az") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    else if (closetSort === "price") rows = [...rows].sort((a, b) => (parseFloat((b.price||"").replace(/[^0-9.]/g,""))||0) - (parseFloat((a.price||"").replace(/[^0-9.]/g,""))||0));
    else if (closetSort === "worn") rows = [...rows].sort((a, b) => (b.wornCount||0) - (a.wornCount||0));
    else if (closetSort === "newest") rows = [...rows].sort((a, b) => (b.purchaseDate||"").localeCompare(a.purchaseDate||""));
    else if (closetSort === "color") rows = [...rows].sort((a, b) => (a.color||"zzz").localeCompare(b.color||"zzz"));
    else if (closetSort === "default" && closetItemOrder.length > 0) {
      const orderMap = new Map(closetItemOrder.map((id, idx) => [id, idx]));
      rows = [...rows].sort((a, b) => {
        const ai = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
        const bi = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
        return ai - bi;
      });
    }
    return rows;
  })();
  // Shop view helpers
  const shopDaysSince = (d) => d ? Math.floor((Date.now() - new Date(d)) / 86400000) : 9999;
  const shopCpw = (item) => { const p = parseFloat(item.price || item.spent || 0); return p > 0 ? p / Math.max(1, item.wornCount || 0) : null; };
  const shopNeedsLove = (item) => (item.wornCount || 0) === 0 || shopDaysSince(item.lastWorn) > 60;
  const shopSortedItems = shopMode ? [...filteredItems].sort((a, b) => {
    if (shopSort === "rediscover") {
      const aZ = (a.wornCount || 0) === 0, bZ = (b.wornCount || 0) === 0;
      if (aZ !== bZ) return aZ ? -1 : 1;
      return shopDaysSince(b.lastWorn) - shopDaysSince(a.lastWorn);
    }
    if (shopSort === "leastWorn") return (a.wornCount || 0) - (b.wornCount || 0);
    if (shopSort === "cpwHigh") return (shopCpw(b) ?? -1) - (shopCpw(a) ?? -1);
    if (shopSort === "cpwLow") return (shopCpw(a) ?? 9999) - (shopCpw(b) ?? 9999);
    return 0;
  }) : [];
  const shopNeedsLoveCount = shopMode ? filteredItems.filter(shopNeedsLove).length : 0;
  const shopWithPrice = shopMode ? filteredItems.filter(i => shopCpw(i) !== null) : [];
  const shopAvgCpw = shopWithPrice.length ? shopWithPrice.reduce((s, i) => s + shopCpw(i), 0) / shopWithPrice.length : null;
  const SHOP_SORT_OPTS = [
    { key: "rediscover", label: "Needs Love" },
    { key: "leastWorn", label: "Least Worn" },
    { key: "cpwHigh", label: "CPW ↑" },
    { key: "cpwLow", label: "CPW ↓" },
  ];

  const saveCapsules = (updated) => {
    setCapsules(updated);
    try { localStorage.setItem("wardrobe_capsules_v1", JSON.stringify(updated)); } catch {}
  };

  const filteredOutfits = (() => {
    const q = outfitSearch.trim().toLowerCase();
    let rows = outfitsDb.rows.filter(o => {
      if (o.archived) return false;
      const matchTag = outfitTagFilter === "All" || (o.tags || []).includes(outfitTagFilter);
      const matchSeason = outfitSeasonFilter === "All" || (o.seasons || []).includes(outfitSeasonFilter);
      const matchSearch = !q || (o.name || "").toLowerCase().includes(q);
      return matchTag && matchSeason && matchSearch;
    });
    if (outfitSort === "az") rows = [...rows].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (outfitSort === "newest") rows = [...rows].sort((a, b) => (b.id || "").localeCompare(a.id || ""));
    else if (outfitSort === "pieces") rows = [...rows].sort((a, b) => ((b.layers || b.itemIds || []).length) - ((a.layers || a.itemIds || []).length));
    return rows;
  })();
  const allItems = [...itemsDb.rows, ...wishlistDb.rows];
  const globalResults = (() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    const items = itemsDb.rows.filter(i => !i.forSale && (i.name.toLowerCase().includes(q) || (i.brand||"").toLowerCase().includes(q)));
    const outfits = outfitsDb.rows.filter(o => (o.name||"").toLowerCase().includes(q));
    const lbs = lookbooksDb.rows.filter(lb => (lb.name||"").toLowerCase().includes(q));
    return [
      ...items.map(i => ({ type: "item", item: i })),
      ...outfits.map(o => ({ type: "outfit", item: o })),
      ...lbs.map(lb => ({ type: "lookbook", item: lb })),
    ];
  })();

  // Filled glyph nav icons
  // Custom nav icons — place SVG files in /public/icons/
  // CSS filter: brightness(0) = black icon (default), brightness(0) invert(1) = white icon (active)
  const NAV_SVG_SRCS = {
    home:      "/icons/HOME.svg",
    closet:    "/icons/CLOSET_TAB.svg",
    outfits:   "/icons/Outfits.svg",
    lookbooks: "/icons/Lookbook.svg",
    stats:     "/icons/STYLE_PROFILE.svg",
    moodboard: "/icons/Moodboard.svg",
    seller:    "/icons/Seller_Dashboard.svg",
    wishlist:  "/icons/Wishlist.svg",
    settings:  "/icons/Settings.svg",
  };
  const NAV_ICON_MAP = Object.fromEntries(
    Object.entries(NAV_SVG_SRCS).map(([id, src]) => [
      id,
      (active) => (
        <img
          src={src}
          alt=""
          width={28}
          height={28}
          style={{
            display: "block",
            objectFit: "contain",
            filter: active
              ? "brightness(0) invert(1)"
              : "brightness(0) opacity(0.55)",
            transition: "filter 0.15s ease",
          }}
        />
      ),
    ])
  );

  const PAGE_TITLES = {
    home: ["", ""],
    closet: ["My Closet", ""],
    outfits: ["My Outfits", ""],
    lookbooks: ["Lookbooks", ""],
    stats: ["Style Profile", "Your wardrobe in focus"],
    moodboard: ["Moodboard", ""],
    seller: ["Seller Dashboard", ""],
    wishlist: ["Wishlist", ""],
    settings: ["Settings", "Customize your wardrobe"],
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #faf9f7 0%, #f3ede8 100%)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e8e8e8", borderTopColor: "#1a1a1a", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onAuth={() => setIsAuthenticated(true)} />;
  }

  const effectiveAccent = accentOverride || activeTheme.accent;

  return (
    <div className={`density-${density}`} style={{ background: activeTheme.bg, minHeight: "100vh", color: activeTheme.text, fontSize: fontSize + "px" }}>
      <style>{globalStyles}</style>
      <style>{`:root { --accent: ${effectiveAccent}; }`}</style>

      {/* ── Vertical nav sidebar ── */}
      <nav className="app-nav-sidebar" style={{ background: activeTheme.nav, borderRightColor: activeTheme.border }}>
        <div className="app-nav-logo" style={{ background: "transparent" }}>
          <BrandIcon size={40} radius={12} />
        </div>
        {NAV_ITEMS.map(n => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={"nav-icon-btn" + (active ? " active" : "")}
              title={n.label}
            >
              <span className="nav-icon-wrap">{NAV_ICON_MAP[n.id]?.(active)}</span>
              {showNavLabels && <span className="nav-label">{n.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Main body (right of sidebar) ── */}
      <div className="app-body">

        {/* ── Main scrollable area ── */}
        <div className="app-main-area">

          {/* Page hero + global search */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
            {tab !== "home" && (
              <div className="page-hero" style={{ marginBottom: 0 }}>
                <div className="page-hero-eyebrow">My Wardrobe</div>
                <div className="page-hero-title">{PAGE_TITLES[tab]?.[0]}</div>
                <div className="page-hero-sub">{PAGE_TITLES[tab]?.[1]}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 6, flexShrink: 0 }}>
              {/* Global search */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowGlobalSearch(s => !s); setGlobalSearch(""); }} style={{ width: 40, height: 40, borderRadius: 14, background: showGlobalSearch ? "#1a1a1a" : "#fff", border: "1.5px solid #e4dfd6", cursor: "pointer", fontSize: 16, color: showGlobalSearch ? "#fff" : "#888", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
                {showGlobalSearch && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, zIndex: 200 }}>
                    <input autoFocus value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}
                      placeholder="Search everything…"
                      style={{ width: "100%", padding: "11px 16px", border: "1.5px solid #e4dfd6", borderRadius: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }} />
                    {globalSearch && (
                      <div style={{ marginTop: 4, background: "#fff", border: "1.5px solid #e4dfd6", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.10)", maxHeight: 320, overflowY: "auto" }}>
                        {globalResults.length === 0 && <div style={{ padding: "14px 16px", fontSize: 13, color: "#aaa", textAlign: "center" }}>No results for "{globalSearch}"</div>}
                        {globalResults.map(({ type, item }) => (
                          <div key={item.id} onClick={() => {
                            setShowGlobalSearch(false); setGlobalSearch("");
                            if (type === "item") { setTab("closet"); setItemDetail(item); }
                            else if (type === "outfit") { setTab("outfits"); setOutfitPopup(item); }
                            else if (type === "lookbook") { setTab("lookbooks"); setActiveLookbook(item); }
                          }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f5f2ed" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#faf9f6"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            {item.image || item.previewImage || item.coverImage
                              ? <img src={item.image || item.previewImage || item.coverImage} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "contain", background: "#f5f2ed", flexShrink: 0 }} />
                              : <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f2ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 14 }}>{type === "outfit" ? <SvgSparkle size={14} color="#888" /> : type === "lookbook" ? <SvgGrid size={14} color="#888" /> : <SvgHanger size={14} color="#888" />}</span></div>
                            }
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Bulk select for closet */}
              {tab === "closet" && <button onClick={() => { setBulkMode(b => !b); setBulkSelected(new Set()); }} style={{ padding: "10px 16px", borderRadius: 14, background: bulkMode ? "#1a1a1a" : "#fff", border: "1.5px solid #e4dfd6", cursor: "pointer", fontSize: 13, fontWeight: 600, color: bulkMode ? "#fff" : "#888", fontFamily: "'DM Sans', sans-serif" }}>{bulkMode ? "Cancel" : "Select"}</button>}
              {/* Bulk select for wishlist */}
              {tab === "wishlist" && <button onClick={() => setWlSelectMode(b => !b)} style={{ padding: "10px 16px", borderRadius: 14, background: wlSelectMode ? "#1a1a1a" : "#fff", border: "1.5px solid #e4dfd6", cursor: "pointer", fontSize: 13, fontWeight: 600, color: wlSelectMode ? "#fff" : "#888", fontFamily: "'DM Sans', sans-serif" }}>{wlSelectMode ? "Cancel" : "Select"}</button>}
              {/* Add button */}
              {tab === "home" && (
                <div style={{ position: "relative" }}>
                  <button className="btn-primary" onClick={() => setHomeAddOpen(o => !o)} style={{
                    padding: "10px 20px", borderRadius: 14, background: "#1a1a1a",
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff",
                    display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
                  }}>+ Add</button>
                  {homeAddOpen && (
                    <>
                      <div onClick={() => setHomeAddOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
                      <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 1000, background: "#fff", borderRadius: 14, border: "1.5px solid #e8e4dc", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 180 }}>
                        {[
                          { label: "Add to Closet",    action: () => { setEditItem(null); setWishlistDest(false); setModal("item"); setHomeAddOpen(false); } },
                          { label: "Add Outfit",       action: () => { openNewOutfit(); setHomeAddOpen(false); } },
                          { label: "Create Lookbook",  action: () => { setLookbookModal(true); setHomeAddOpen(false); } },
                        ].map((opt, i, arr) => (
                          <button key={opt.label} onClick={opt.action} style={{
                            display: "block", width: "100%", textAlign: "left",
                            padding: "12px 18px", background: "none", border: "none",
                            borderBottom: i < arr.length - 1 ? "1px solid #f0ece4" : "none",
                            fontSize: 13, fontWeight: 600, color: "#1a1a1a", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8f6f2"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                          >{opt.label}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {tab === "outfits" && outfitsView === "grid" && (
                <button onClick={() => { if (outfitSelectMode) { setOutfitSelectMode(false); setSelectedOutfitIds(new Set()); } else { setOutfitSelectMode(true); } }} style={{
                  padding: "10px 16px", borderRadius: 14, background: outfitSelectMode ? "#e8e4dc" : "#f0ece4",
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  color: outfitSelectMode ? "#1a1a1a" : "#666",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{outfitSelectMode ? "Cancel" : "Select"}</button>
              )}
              {tab === "moodboard" && moodboardView === "grid" && (
                <button className="btn-primary" onClick={() => {
                  const newBoard = {id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: `Board ${(moodboardsDb.boards||[]).length + 1}`, items: [], bg: "#ffffff"};
                  moodboardsDb.updateBoards(bs => { const next = [...bs, newBoard]; setMoodboardActiveIdx(next.length - 1); return next; });
                  setMoodboardView("canvas");
                }} style={{
                  padding: "10px 20px", borderRadius: 14, background: "#1a1a1a",
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
                }}>+ Add</button>
              )}
              {tab !== "stats" && tab !== "moodboard" && tab !== "home" && tab !== "settings" && (
                <button className="btn-primary" onClick={() => {
                  if (tab === "outfits") openNewOutfit();
                  else if (tab === "lookbooks") setLookbookModal(true);
                  else if (tab === "wishlist") { setEditItem(null); setWishlistDest(true); setModal("item"); }
                  else { setEditItem(null); setWishlistDest(false); setModal("item"); }
                }} style={{
                  padding: "10px 20px", borderRadius: 14, background: "#1a1a1a",
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
                }}>+ Add</button>
              )}
            </div>
          </div>

          {/* ── HOME TAB ── */}
          {tab === "home" && (
            <HomeTab
              outfitCalendar={outfitCalendar}
              outfitsDb={outfitsDb}
              itemsDb={itemsDb}
              lookbooksDb={lookbooksDb}
              wishlistDb={wishlistDb}
              setTab={setTab}
              setActiveLookbook={setActiveLookbook}
              setActiveLookbookView={setActiveLookbookView}
              setOutfitPopup={setOutfitPopup}
              homeCity={homeCity}
              setHomeCity={setHomeCity}
              homeWeather={homeWeather}
            />
          )}

          {/* Content — 2-column layout (left sidebar + main) */}
          {tab !== "home" && <div className="app-layout">

        {/* ── LEFT SIDEBAR (closet + outfits + lookbooks + moodboard grid) ── */}
        {(tab === "closet" || tab === "outfits" || tab === "lookbooks" || (tab === "moodboard" && moodboardView === "grid")) && (
          <div className="app-left-sidebar">
            <div className="closet-sidebar" style={{ position: "sticky", top: 80 }}>
              {tab === "closet" && (<>
                <div className="sidebar-section">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display:"flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="closet-search" value={closetSearch} onChange={e => setClosetSearch(e.target.value)} placeholder="Search…" />
                  </div>
                </div>
                <div className="right-card" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div className="right-card-title" style={{ marginBottom: 0 }}>Category</div>
                    {catFilters.length > 0 && <button onClick={() => setCatFilters([])} style={{ fontSize: 10, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Clear</button>}
                  </div>
                  {CATEGORIES.slice(1).map(cat => {
                    const active = catFilters.includes(cat);
                    return (
                      <button key={cat} className={"sidebar-btn" + (active ? " active" : "")}
                        onClick={() => setCatFilters(prev => active ? prev.filter(c => c !== cat) : [...prev, cat])}>
                        {cat}
                      </button>
                    );
                  })}
                </div>

              </>)}
              {tab === "outfits" && (<>
                <div className="sidebar-section">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display:"flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="closet-search" value={outfitSearch} onChange={e => setOutfitSearch(e.target.value)} placeholder="Search outfits…" />
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ece8e0", padding: "18px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#c0b8b0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Occasion</div>
                  {["All", "WFH", "Disney", "Universal", "Date Night", "Travel", "Sport", "Weekend", "Event"].map(tag => (
                    <button key={tag} className={"sidebar-btn" + (outfitTagFilter === tag ? " active" : "")} onClick={() => setOutfitTagFilter(tag)}>{tag}</button>
                  ))}
                </div>
              </>)}
              {tab === "lookbooks" && (<>
                <div className="sidebar-section">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display:"flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="closet-search" value={lbSearch} onChange={e => setLbSearch(e.target.value)} placeholder="Search lookbooks…" />
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ece8e0", padding: "18px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#c0b8b0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Type</div>
                  {["All", ...LOOKBOOK_TYPES.map(t => t[0].toUpperCase() + t.slice(1))].map(typeLabel => (
                    <button key={typeLabel} className={"sidebar-btn" + (lbTypeFilter === typeLabel ? " active" : "")} onClick={() => setLbTypeFilter(typeLabel)}>{typeLabel}</button>
                  ))}
                </div>
              </>)}
              {tab === "moodboard" && (<>
                <div className="sidebar-section">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display:"flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="closet-search" value={moodboardSearch} onChange={e => setMoodboardSearch(e.target.value)} placeholder="Search boards…" />
                  </div>
                </div>
                <div className="right-card" style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#c0b8b0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Tag</div>
                  {["All", "Inspiration", "Planning", "Travel", "Seasonal", "Wishlist", "Archive"].map(tag => (
                    <button key={tag} className={"sidebar-btn" + (moodboardTagFilter === tag ? " active" : "")} onClick={() => setMoodboardTagFilter(tag)}>{tag}</button>
                  ))}
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="app-main">
          {itemsDb.loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#ccc", fontSize: 13, fontWeight: 600 }}>Loading…</div>
          ) : (
            <>
              {/* CLOSET */}
              {tab === "closet" && (
                <div className="fade-up">
                  {/* Closet toolbar: sort + season dropdowns */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                    <select value={closetSort} onChange={e => setClosetSort(e.target.value)} className="pill-select" style={{}}>
                      <option value="default">Sort: Default</option>
                      <option value="az">Sort: A – Z</option>
                      <option value="color">Sort: Color</option>
                      <option value="price">Sort: Price ↓</option>
                      <option value="worn">Sort: Most Worn</option>
                      <option value="newest">Sort: Newest</option>
                    </select>
                    <select value={closetSeasonFilter} onChange={e => setClosetSeasonFilter(e.target.value)} className="pill-select" style={{}}>
                      <option value="All">All Seasons</option>
                      {SEASONS.filter(s => s !== "All Season").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {/* View toggle + Zoom slider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                      {/* Shop mode toggle */}
                      <button title={shopMode ? "Grid view" : "Shop view"} onClick={() => setShopMode(m => !m)} style={{ width: 28, height: 28, border: "1.5px solid", borderColor: shopMode ? "#1a1a1a" : "#ddd", borderRadius: 7, background: shopMode ? "#1a1a1a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={shopMode ? "#fff" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                      </button>
                      {!shopMode && <>
                        <SvgBox size={12} color="#bbb" />
                        <input type="range" min={110} max={220} step={10} value={closetZoom} onChange={e => setClosetZoom(Number(e.target.value))}
                          style={{ width: 80, accentColor: "#1a1a1a", cursor: "pointer" }} />
                        <SvgBox size={16} color="#bbb" />
                      </>}
                    </div>
                  </div>
                  {/* Bulk action bar */}
                  {bulkMode && bulkSelected.size > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 14, padding: "10px 14px", background: "#fff", borderRadius: 14, border: "1.5px solid #e8e4dc", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{bulkSelected.size} selected</span>
                      <button onClick={async () => { for (const id of bulkSelected) { const item = itemsDb.rows.find(i => i.id === id); if (item) await itemsDb.update({ ...item, forSale: true, saleStatus: "listed" }); } setBulkSelected(new Set()); setBulkMode(false); setTab("seller"); }} style={{ padding: "6px 14px", background: "#fff8ee", border: "1.5px solid #f5c842", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#a07000", fontFamily: "'DM Sans', sans-serif" }}><SvgTag size={12} color="currentColor" style={{marginRight:6}} />List for Sale</button>
                      <button onClick={async () => { if (window.confirm(`Delete ${bulkSelected.size} items?`)) { for (const id of bulkSelected) await itemsDb.remove(id); setBulkSelected(new Set()); setBulkMode(false); }}} style={{ padding: "6px 14px", background: "#fef2f2", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif" }}><SvgTrash size={13} color="#e05555" style={{marginRight:6}} />Delete</button>
                      <button onClick={() => setBulkSelected(new Set(filteredItems.map(i => i.id)))} style={{ padding: "6px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Select All</button>
                      <button onClick={() => setBulkSelected(new Set())} style={{ padding: "6px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Deselect All</button>
                    </div>
                  )}
                  {filteredItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 24px" }}>
                      {closetSearch ? (
                        <>
                          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.15 }}>🔍</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 8 }}>No results</div>
                          <div style={{ fontSize: 13, color: "#bbb" }}>Nothing matched "{closetSearch}"</div>
                        </>
                      ) : catFilter !== "All" ? (
                        <>
                          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.15 }}>👗</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 8 }}>No {catFilter} yet</div>
                          <div style={{ fontSize: 13, color: "#bbb", marginBottom: 20 }}>Add your first {catFilter.toLowerCase()} to get started.</div>
                          <button onClick={() => setModal("item")} style={{ padding: "11px 24px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add {catFilter} →</button>
                        </>
                      ) : (
                        <>
                          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
                            <rect width="88" height="88" rx="26" fill="#f5f3ef"/>
                            <path d="M44 26a5 5 0 014.99 4.63L49 31v3.46l11.72 7.04A4 4 0 0162.5 45H25.5a4 4 0 01-1.5-3.5l12-7.04V31a6 6 0 0112 0" fill="none" stroke="#c5bdb3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="25" y1="47" x2="63" y2="47" stroke="#c5bdb3" strokeWidth="2.2" strokeLinecap="round"/>
                            <rect x="32" y="49" width="24" height="11" rx="3.5" fill="#e8e4dc"/>
                            <circle cx="63" cy="27" r="7" fill="#f0c840" opacity="0.95"/>
                            <path d="M60.3 27l1.7 1.7 3.4-3.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 10 }}>Your closet is empty</div>
                          <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.8, maxWidth: 300, margin: "0 auto 28px" }}>Start building your digital wardrobe — add pieces, track what you wear, and discover your style.</div>
                          <button onClick={() => setModal("item")} style={{ padding: "13px 28px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>Add your first piece →</button>
                          <div style={{ marginTop: 16, fontSize: 12, color: "#ccc" }}>Upload a photo or paste a product link</div>
                        </>
                      )}
                    </div>
                  ) : shopMode ? (
                    <div>
                      {/* Shop header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 12, color: "#b0a898", flexShrink: 0 }}>
                          {shopNeedsLoveCount > 0
                            ? <><strong style={{ color: "#b97a00" }}>{shopNeedsLoveCount}</strong> items need love{shopAvgCpw !== null ? <> · avg CPW <strong>${shopAvgCpw.toFixed(2)}</strong></> : ""}</>
                            : shopAvgCpw !== null ? <>avg CPW <strong>${shopAvgCpw.toFixed(2)}</strong></> : ""}
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{ display: "flex", gap: 5 }}>
                          {SHOP_SORT_OPTS.map(o => (
                            <button key={o.key} onClick={() => setShopSort(o.key)}
                              style={{ padding: "4px 10px", borderRadius: 100, border: "1.5px solid", borderColor: shopSort === o.key ? "#1a1a1a" : "#e0dbd2", background: shopSort === o.key ? "#1a1a1a" : "transparent", color: shopSort === o.key ? "#fff" : "#888", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s" }}>
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {shopSortedItems.map((item) => (
                          <ShopCard key={item.id} item={item} onClick={() => setItemDetail(item)} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${closetZoom}px, 1fr))`, gap: 12 }}>
                      {filteredItems.map((item, i) => (
                        <div key={item.id} className="fade-up"
                          draggable={closetSort === "default" && !bulkMode}
                          onDragStart={() => { dragItemRef.current = item.id; }}
                          onDragEnter={e => { e.preventDefault(); setDragOverId(item.id); }}
                          onDragOver={e => e.preventDefault()}
                          onDragLeave={() => setDragOverId(null)}
                          onDrop={() => {
                            const fromId = dragItemRef.current;
                            const toId = item.id;
                            setDragOverId(null);
                            dragItemRef.current = null;
                            if (!fromId || fromId === toId) return;
                            const ids = filteredItems.map(x => x.id);
                            const from = ids.indexOf(fromId), to = ids.indexOf(toId);
                            if (from < 0 || to < 0) return;
                            const reordered = [...ids];
                            reordered.splice(from, 1);
                            reordered.splice(to, 0, fromId);
                            const invisible = itemsDb.rows.map(x => x.id).filter(id => !new Set(reordered).has(id));
                            saveItemOrder([...reordered, ...invisible]);
                          }}
                          onDragEnd={() => { dragItemRef.current = null; setDragOverId(null); }}
                          onClick={bulkMode ? () => setBulkSelected(s => { const n = new Set(s); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; }) : undefined}
                          style={{ animationDelay: `${i * 0.02}s`, opacity: 0, position: "relative", borderRadius: 16, outline: dragOverId === item.id ? "2px dashed #1a1a1a" : "none", outlineOffset: 2 }}
                        >
                          {bulkMode && (
                            <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, width: 22, height: 22, borderRadius: "50%", background: bulkSelected.has(item.id) ? "#2d6a3f" : "rgba(255,255,255,0.9)", border: `2px solid ${bulkSelected.has(item.id) ? "#2d6a3f" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", pointerEvents: "none" }}>
                              {bulkSelected.has(item.id) && <SvgCheck size={12} color="#fff" />}
                            </div>
                          )}
                          <ItemCard item={item}
                            onClick={bulkMode ? undefined : () => setItemDetail(item)}
                            onEdit={bulkMode ? undefined : () => { setEditItem(item); setWishlistDest(false); setModal("item"); }}
                            onCreateLook={bulkMode ? undefined : () => { setEditingOutfit(null); setOutfitSeedItem(item); setOutfitBuilder(true); }}
                            onAddToCapsule={bulkMode ? undefined : () => { setCapsulePreselect([item.id]); setCapsuleName(""); setShowCapsuleModal(true); }}
                            onDelete={bulkMode ? undefined : () => { if (window.confirm(`Delete "${item.name || "this item"}"?`)) { itemsDb.remove(item.id); } }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* OUTFITS */}
            {tab === "outfits" && (
              <div className="fade-up">
                {/* Outfits toolbar */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  {outfitsView === "grid" && (<>
                    <select value={outfitSort} onChange={e => setOutfitSort(e.target.value)} className="pill-select">
                      <option value="default">Sort: Default</option>
                      <option value="az">Sort: A – Z</option>
                      <option value="newest">Sort: Newest</option>
                      <option value="pieces">Sort: Most Pieces</option>
                    </select>
                    <select value={outfitSeasonFilter} onChange={e => setOutfitSeasonFilter(e.target.value)} className="pill-select">
                      <option value="All">All Seasons</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </>)}
                  <div style={{ flex: 1 }} />
                  {/* Grid / Calendar toggle */}
                  <div style={{ display: "flex", background: "#f0ece4", borderRadius: 10, padding: 3, gap: 0 }}>
                    {[["grid","Grid"],["calendar","Calendar"]].map(([v,lbl]) => (
                      <button key={v} onClick={() => setOutfitsView(v)} style={{
                        padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: outfitsView === v ? "#fff" : "transparent",
                        color: outfitsView === v ? "#1a1a1a" : "#aaa",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                        boxShadow: outfitsView === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s"
                      }}>{lbl}</button>
                    ))}
                  </div>
                  {outfitsView === "grid" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SvgBox size={12} color="#bbb" />
                      <input type="range" min={140} max={300} step={10} value={outfitZoom} onChange={e => setOutfitZoom(Number(e.target.value))}
                        style={{ width: 80, accentColor: "#1a1a1a", cursor: "pointer" }} />
                      <SvgBox size={17} color="#bbb" />
                    </div>
                  )}
                </div>

                {/* Bulk action bar */}
                {outfitSelectMode && outfitsView === "grid" && (
                  <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "#f8f6f2", borderRadius: 14, marginBottom: 14, alignItems: "center", flexWrap: "wrap", border: "1px solid #ede9e2" }}>
                    <button onClick={() => { const allIds = new Set(filteredOutfits.map(o => o.id)); setSelectedOutfitIds(prev => prev.size === filteredOutfits.length ? new Set() : allIds); }} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #d0ccc4", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>
                      {selectedOutfitIds.size === filteredOutfits.length && filteredOutfits.length > 0 ? "Deselect All" : `Select All (${filteredOutfits.length})`}
                    </button>
                    {selectedOutfitIds.size > 0 && (<>
                      <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{selectedOutfitIds.size} selected</span>
                      <div style={{ width: 1, height: 20, background: "#e0dbd3" }} />
                      <button onClick={() => { if (window.confirm(`Delete ${selectedOutfitIds.size} outfit${selectedOutfitIds.size > 1 ? "s" : ""}?`)) { [...selectedOutfitIds].forEach(id => outfitsDb.remove(id)); setSelectedOutfitIds(new Set()); setOutfitSelectMode(false); } }} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #fca5a5", background: "#fef2f2", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
                      <button onClick={() => setOutfitBulkLbPicker(true)} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #d0ccc4", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>Add to Lookbook</button>
                      <button onClick={() => { setOutfitBulkNewLbName(""); setOutfitBulkNewLb(true); }} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #d0ccc4", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>New Lookbook</button>
                      <button onClick={() => setOutfitBulkCalModal(true)} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #d0ccc4", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>Add to Calendar</button>
                    </>)}
                  </div>
                )}

                {outfitsView === "calendar" ? (
                  <OutfitCalendar
                    outfits={outfitsDb.rows}
                    allItems={[...itemsDb.rows, ...wishlistDb.rows]}
                    calendar={outfitCalendar}
                    onSaveCalendar={saveOutfitCalendar}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    weather={calendarWeather}
                    onSetWeather={setCalendarWeather}
                    onOpenOutfit={setOutfitPopup}
                    events={calendarEvents}
                    onSaveEvents={saveCalendarEvents}
                    defaultCity={homeCity}
                  />
                ) : filteredOutfits.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 24px" }}>
                    {outfitTagFilter === "All" && outfitSeasonFilter === "All" ? (<>
                      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
                        <rect width="88" height="88" rx="26" fill="#f5f3ef"/>
                        <path d="M44 18h12l3 8-7 5v21a2 2 0 01-2 2h-6a2 2 0 01-2-2V31l-7-5 3-8z" fill="none" stroke="#c5bdb3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32 31l-8 9 6 3 5-5" fill="none" stroke="#c5bdb3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                        <path d="M56 31l8 9-6 3-5-5" fill="none" stroke="#c5bdb3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                        <rect x="36" y="54" width="16" height="7" rx="2.5" fill="#e8e4dc"/>
                        <circle cx="62" cy="26" r="7" fill="#7c6fe0" opacity="0.85"/>
                        <path d="M59.5 26l1.7 1.7 3.3-3.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 10 }}>No outfits yet</div>
                      <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.8, maxWidth: 300, margin: "0 auto 24px" }}>Combine pieces from your closet into looks you love — then log when you wear them.</div>
                      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
                        {[["🧩","Mix & match items"],["📅","Log when you wear it"],["📖","Save to a lookbook"]].map(([icon, label]) => (
                          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{ fontSize: 22 }}>{icon}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb" }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={openNewOutfit} style={{ padding: "13px 28px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Build your first look →</button>
                    </>) : (
                      <div style={{ fontSize: 14, color: "#bbb", fontWeight: 600 }}>No outfits match these filters</div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${outfitZoom}px, 1fr))`, gap: 16 }}>
                    {filteredOutfits.map((outfit, i) => {
                      const outfitItems = (outfit.layers || outfit.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean);
                      const tags = outfit.tags || [];
                      const outfitSeasons = outfit.seasons || [];
                      const isSelected = selectedOutfitIds.has(outfit.id);
                      return (
                        <div key={outfit.id} className={"card fade-up" + (outfitSelectMode ? "" : " outfit-card")} onClick={() => {
                          if (outfitSelectMode) { setSelectedOutfitIds(prev => { const n = new Set(prev); n.has(outfit.id) ? n.delete(outfit.id) : n.add(outfit.id); return n; }); }
                          else { setOutfitPopup(outfit); }
                        }} style={{
                          background: "#fff", borderRadius: 20,
                          border: isSelected ? "2px solid #1a1a1a" : "1.5px solid #e8e4dc",
                          overflow: "hidden",
                          boxShadow: isSelected ? "0 0 0 3px rgba(26,26,26,0.08)" : "0 2px 12px rgba(0,0,0,0.04)",
                          animationDelay: `${i * 0.05}s`, opacity: 0, cursor: "pointer", position: "relative",
                          transition: "border 0.12s, box-shadow 0.12s"
                        }}>
                          {/* Select mode checkbox */}
                          {outfitSelectMode && (
                            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: "50%", background: isSelected ? "#1a1a1a" : "rgba(255,255,255,0.92)", border: `2px solid ${isSelected ? "#1a1a1a" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.12)", pointerEvents: "none" }}>
                              {isSelected && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          )}
                          {/* Lookbook badge */}
                          {(() => { const lbCount = lookbooksDb.rows.filter(lb => (lb.outfitIds || []).includes(outfit.id)).length; return lbCount > 0 ? <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2, background: "rgba(124,111,224,0.92)", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)" }}>▤ {lbCount}</div> : null; })()}
                          {/* Preview: use saved previewImage if available, else item collage */}
                          {outfit.previewImage ? (
                            <div style={{ aspectRatio: "4/5", background: `url(${outfit.previewImage}) center/contain no-repeat #f5f3ef`, position: "relative" }} />
                          ) : (
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: outfitItems.length === 1 ? "1fr" : outfitItems.length === 2 ? "1fr 1fr" : "2fr 1fr",
                              gridTemplateRows: outfitItems.length >= 3 ? "1fr 1fr" : "1fr",
                              aspectRatio: "4/5",
                            }}>
                              {outfitItems.slice(0, 1).map(item => (
                                <div key={item.id} style={{ gridRow: outfitItems.length >= 3 ? "1 / 3" : "1", background: item.image ? `url(${item.image}) center/cover no-repeat` : "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {!item.image && <HangerIcon size={24} color="#ccc" />}
                                </div>
                              ))}
                              {outfitItems.slice(1, 4).map(item => (
                                <div key={item.id} style={{ background: item.image ? `url(${item.image}) center/cover no-repeat` : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "2px solid #fff", borderBottom: "2px solid #fff" }}>
                                  {!item.image && <HangerIcon size={14} color="#ccc" />}
                                </div>
                              ))}
                              {outfitItems.length > 4 && (
                                <div style={{ background: "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "2px solid #fff", borderBottom: "2px solid #fff", fontSize: 12, fontWeight: 700, color: "#aaa" }}>+{outfitItems.length - 3}</div>
                              )}
                            </div>
                          )}
                          {/* Hover-expand label */}
                          {!outfitSelectMode && (
                          <div className="outfit-card-label">
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: tags[0] ? 4 : 0 }}>{outfit.name}</div>
                            {tags[0] && (() => { const oc = OCCASION_COLORS[tags[0]] || { bg: "#f5f3ef", color: "#888" }; return <div style={{ display: "inline-block", background: oc.bg, color: oc.color, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{tags[0]}</div>; })()}
                            <div className="outfit-card-btns" style={{ display: "flex", gap: 6, marginTop: 8 }}>
                              <button onClick={e => { e.stopPropagation(); openEditOutfit(outfit); }} title="Edit" style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                              <button onClick={e => { e.stopPropagation(); setLbPickerOutfit(outfit); }} title="Add to lookbook" style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgGrid size={13} color="#666" /></button>
                              <button onClick={e => { e.stopPropagation(); archiveOutfit(outfit); }} title="Archive" style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgDownload size={13} color="#666" /></button>
                              <button onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${outfit.name}"?`)) outfitsDb.remove(outfit.id); }} title="Delete" style={{ width: 32, height: 32, borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgTrash size={14} color="#e05555" /></button>
                            </div>
                          </div>
                          )}
                          {/* Select mode name label */}
                          {outfitSelectMode && (
                            <div style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{outfit.name}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LOOKBOOKS */}
            {tab === "lookbooks" && (
              <div className="fade-up">
                <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <select value={lbSort} onChange={e => setLbSort(e.target.value)} className="pill-select">
                    <option value="newest">Newest</option>
                    <option value="az">A – Z</option>
                    <option value="most">Most Outfits</option>
                  </select>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <SvgBox size={11} color="#bbb" />
                    <input type="range" min={160} max={340} step={10} value={lbZoom} onChange={e => setLbZoom(Number(e.target.value))}
                      style={{ width: 72, accentColor: "#1a1a1a", cursor: "pointer" }} />
                    <SvgBox size={16} color="#bbb" />
                  </div>
                </div>

                {(() => {
                  const fmtDate = (d) => {
                    if (!d) return null;
                    const dt = new Date(d + "T00:00:00");
                    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  };
                  let filtered = lookbooksDb.rows.filter(lb => {
                    const matchSearch = !lbSearch || lb.name.toLowerCase().includes(lbSearch.toLowerCase());
                    const typeLabel = (lb.type || "").toString();
                    const normalizedTypeLabel = typeLabel ? typeLabel[0].toUpperCase() + typeLabel.slice(1) : "";
                    const matchType = lbTypeFilter === "All" || normalizedTypeLabel === lbTypeFilter;
                    return matchSearch && matchType;
                  });
                  if (lbSort === "az") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                  else if (lbSort === "most") filtered = [...filtered].sort((a, b) => (b.outfitIds || []).length - (a.outfitIds || []).length);

                  if (filtered.length === 0) return (
                    <div style={{ textAlign: "center", padding: "80px 24px" }}>
                      {lbSearch ? (
                        <>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 8 }}>No results</div>
                          <div style={{ fontSize: 13, color: "#bbb" }}>Nothing matched "{lbSearch}"</div>
                        </>
                      ) : (<>
                        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
                          <rect width="88" height="88" rx="26" fill="#f5f3ef"/>
                          <rect x="18" y="22" width="34" height="44" rx="5" fill="#e8e4dc"/>
                          <rect x="24" y="16" width="34" height="44" rx="5" fill="none" stroke="#c5bdb3" strokeWidth="2.2"/>
                          <line x1="30" y1="30" x2="50" y2="30" stroke="#c5bdb3" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                          <line x1="30" y1="36" x2="46" y2="36" stroke="#c5bdb3" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                          <line x1="30" y1="42" x2="44" y2="42" stroke="#c5bdb3" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                          <circle cx="62" cy="26" r="7" fill="#4aaa6e" opacity="0.9"/>
                          <path d="M59.5 26l1.7 1.7 3.3-3.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", color: "#b0a898", marginBottom: 10 }}>No lookbooks yet</div>
                        <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.8, maxWidth: 300, margin: "0 auto 24px" }}>Group outfits into a collection — for a trip, a season, or a vibe.</div>
                        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
                          {[["✈️","Trip packing"],["🌸","Seasonal edits"],["🎨","Mood collections"]].map(([icon, label]) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <div style={{ fontSize: 22 }}>{icon}</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb" }}>{label}</div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setLookbookModal(true)} style={{ padding: "13px 28px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Create your first lookbook →</button>
                      </>)}
                    </div>
                  );

                  return (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${lbZoom}px, 1fr))`, gap: 16 }}>
                      {filtered.map((lb, i) => {
                        const lbOutfits = (lb.outfitIds || []).map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);
                        const previewItems = lbOutfits.slice(0, 4).flatMap(o =>
                          (o.layers || o.itemIds || []).slice(0, 1).map(id => allItems.find(x => x.id === id)).filter(Boolean)
                        );
                        const totalVal = lbOutfits.flatMap(o => (o.layers || o.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean))
                          .reduce((s, it) => s + (parseFloat((it.price || "").replace(/[^0-9.]/g, "")) || 0), 0);
                        const dateStr = (lb.dateStart || lb.dateEnd)
                          ? [fmtDate(lb.dateStart), fmtDate(lb.dateEnd)].filter(Boolean).join(" – ")
                          : null;
                        return (
                          <div key={lb.id} className="card fade-up lb-card" onClick={() => setLbPreview(lb)} style={{
                            background: "#fff", borderRadius: 20, border: "1.5px solid #e8e4dc", overflow: "hidden",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.04)", cursor: "pointer",
                            animationDelay: `${i * 0.06}s`, opacity: 0, position: "relative"
                          }}>
                            {/* Cover */}
                            {lb.coverImage ? (
                              <div style={{ aspectRatio: "4/5", background: `url(${lb.coverImage}) center/cover no-repeat` }} />
                            ) : (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", aspectRatio: "4/5" }}>
                                {[0,1,2,3].map(qi => {
                                  const item = previewItems[qi];
                                  return (
                                    <div key={qi} style={{ background: item?.image ? `url(${item.image}) center/contain no-repeat #f5f3ef` : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", borderRight: qi % 2 === 0 ? "1.5px solid #fff" : "none", borderBottom: qi < 2 ? "1.5px solid #fff" : "none" }}>
                                      {!item?.image && <HangerIcon size={18} color="#ddd" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div style={{ padding: "12px 14px 14px" }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>{lb.name}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{lbOutfits.length} look{lbOutfits.length !== 1 ? "s" : ""}</span>
                                {totalVal > 0 && <span style={{ fontSize: 11, color: "#aaa" }}>· ${totalVal.toFixed(0)} total</span>}
                              </div>
                              {dateStr && <div style={{ fontSize: 11, color: "#b0a898", marginTop: 4, fontWeight: 600, display:"flex", alignItems:"center", gap:5 }}><SvgCalendar size={11} color="#b0a898" style={{marginRight:4, verticalAlign:"middle", flexShrink:0}} />{dateStr}</div>}
                            </div>
                            {/* Hover action buttons */}
                            <div className="lb-card-actions" style={{ display: "flex", gap: 6 }}>
                              <button onClick={e => { e.stopPropagation(); setActiveLookbook(lb); }} title="Edit lookbook"
                                style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={e => { e.stopPropagation(); lookbooksDb.update({ ...lb, pinned: !lb.pinned }); }} title={lb.pinned ? "Unpin" : "Pin to Home"}
                                style={{ width: 30, height: 30, borderRadius: "50%", background: lb.pinned ? "#1a1a1a" : "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill={lb.pinned ? "#fff" : "none"} stroke={lb.pinned ? "#fff" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="17" x2="12" y2="22"/>
                                  <path d="M5 17h14"/>
                                  <path d="M15 5h1a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h1"/>
                                  <rect x="9" y="2" width="6" height="4" rx="1" fill={lb.pinned ? "#fff" : "#666"} stroke="none"/>
                                </svg>
                              </button>
                              <button onClick={e => { e.stopPropagation(); if (window.confirm(`Archive "${lb.name}"? Restore from Settings → Data.`)) { archiveLookbook(lb); } }} title="Archive"
                                style={{ width: 30, height: 30, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <SvgDownload size={13} color="#666" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${lb.name}"?`)) { lookbooksDb.remove(lb.id); } }} title="Delete"
                                style={{ width: 30, height: 30, borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <SvgTrash size={13} color="#e05555" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

            </div>
            )}

            {/* STATS */}

            {tab === "stats" && <StatsTab itemsDb={itemsDb} outfitsDb={outfitsDb} lookbooksDb={lookbooksDb} wishlistDb={wishlistDb} outfitCalendar={outfitCalendar} onViewItem={item => setItemDetail(item)} monthlyBudget={monthlyBudget} annualBudget={annualBudget} />}

            {/* SELLER DASHBOARD */}
            {tab === "seller" && <SellerDashboard itemsDb={itemsDb} allClosetItems={itemsDb.rows.filter(i => !i.forSale)} onViewItem={(item) => setItemDetail(item)} />}

            {/* MOODBOARD */}
            {tab === "moodboard" && <Moodboard closetItems={itemsDb.rows.filter(i => !i.forSale)} activeIdx={moodboardActiveIdx} setActiveIdx={setMoodboardActiveIdx} boards={moodboardsDb.boards} updateBoards={moodboardsDb.updateBoards} removeBoardById={moodboardsDb.removeBoardById} mbView={moodboardView} setMbView={setMoodboardView} mbSearch={moodboardSearch} mbTagFilter={moodboardTagFilter}
              onGoToLookbook={(lb) => { const fresh = lookbooksDb.rows.find(r=>r.id===lb.id)||lb; setActiveLookbookView("editorial"); setTab("lookbooks"); setActiveLookbook(fresh); }} />}

            {/* SETTINGS */}
            {tab === "settings" && <SettingsTab
                itemsDb={itemsDb}
                activeTheme={activeTheme} setActiveTheme={setActiveTheme}
                showNavLabels={showNavLabels} setShowNavLabels={v => { setShowNavLabels(v); try { localStorage.setItem("wardrobe_nav_labels_v1", v?"1":"0"); } catch {} }}
                density={density} setDensity={v => { setDensity(v); try { localStorage.setItem("wardrobe_density_v1", v); } catch {} }}
                fontSize={fontSize} setFontSize={setFontSize}
                accentOverride={accentOverride} setAccentOverride={setAccentOverride}
                defaultTab={defaultTab} setDefaultTab={setDefaultTab}
                outfitSort={outfitSort} setOutfitSort={setOutfitSort}
                wlSort={wlSort} setWlSort={setWlSort}
                guestMode={guestMode} setGuestMode={setGuestMode}
                temperatureUnit={temperatureUnit} setTemperatureUnit={setTemperatureUnit}
                travelCityBehavior={travelCityBehavior} setTravelCityBehavior={setTravelCityBehavior}
                outfitReminderDay={outfitReminderDay} setOutfitReminderDay={setOutfitReminderDay}
                outfitReminderTime={outfitReminderTime} setOutfitReminderTime={setOutfitReminderTime}
                rainyDaySuggestions={rainyDaySuggestions} setRainyDaySuggestions={setRainyDaySuggestions}
                hideSoldByDefault={hideSoldByDefault} setHideSoldByDefault={setHideSoldByDefault}
                hideArchivedByDefault={hideArchivedByDefault} setHideArchivedByDefault={setHideArchivedByDefault}
                defaultClosetViewMode={defaultClosetViewMode} setDefaultClosetViewMode={setDefaultClosetViewMode}
                defaultOnlyUnworn={defaultOnlyUnworn} setDefaultOnlyUnworn={setDefaultOnlyUnworn}
                defaultOnlyInSeason={defaultOnlyInSeason} setDefaultOnlyInSeason={setDefaultOnlyInSeason}
                allDb={{ items: itemsDb.rows, outfits: outfitsDb.rows, lookbooks: lookbooksDb.rows, wishlist: wishlistDb.rows, moodboards: moodboardsDb.boards }}
                closetSort={closetSort} setClosetSort={v => { setClosetSort(v); try { localStorage.setItem("wardrobe_default_sort_v1", v); } catch {} }}
                closetSeasonFilter={closetSeasonFilter} setClosetSeasonFilter={v => { setClosetSeasonFilter(v); try { localStorage.setItem("wardrobe_default_season_v1", v); } catch {} }}
                customCategories={customCategories} setCustomCategories={v => { setCustomCategories(v); try { localStorage.setItem("wardrobe_custom_cats_v1", JSON.stringify(v)); } catch {} }}
                customOccasions={customOccasions} setCustomOccasions={v => { setCustomOccasions(v); try { localStorage.setItem("wardrobe_custom_occ_v1", JSON.stringify(v)); } catch {} }}
                customSeasons={customSeasons} setCustomSeasons={v => { setCustomSeasons(v); try { localStorage.setItem("wardrobe_custom_seas_v1", JSON.stringify(v)); } catch {} }}
                lastSynced={lastSynced}
                allItemsForExport={itemsDb.rows}
                monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget}
                annualBudget={annualBudget} setAnnualBudget={setAnnualBudget}
                homeCity={homeCity} setHomeCity={setHomeCity}
                restoreLookbook={async (lb) => {
                  try {
                    let { error } = await supabase.from("lookbooks").insert({ id: lb.id, data: lb });
                    if (error) ({ error } = await supabase.from("lookbooks").insert(lb));
                    await lookbooksDb.refresh();
                  } catch(e) { console.error("restore lookbook error", e); }
                }}
                supabaseArchivedOutfits={outfitsDb.rows.filter(o => o.archived)}
                restoreOutfit={async (outfit) => {
                  try {
                    const restored = { ...outfit }; delete restored.archived; delete restored.archivedAt;
                    await outfitsDb.update(restored);
                  } catch (e) { console.error("restore outfit error", e); }
                }}
                deleteOutfit={async (outfit) => {
                  try { await outfitsDb.remove(outfit.id); } catch (e) { console.error("delete outfit error", e); }
                }}
              />}

            {/* WISHLIST */}
            {tab === "wishlist" && <WishlistTab
              wishlistDb={wishlistDb}
              wishlistsDb={wishlistsDb}
              saveWishlistsMeta={saveWishlistsMeta}
              activeWishlistId={activeWishlistId}
              setActiveWishlistId={setActiveWishlistId}
              wlSort={wlSort} setWlSort={setWlSort}
              wlSortCat={wlSortCat} setWlSortCat={setWlSortCat}
              wlZoom={wlZoom} setWlZoom={setWlZoom}
              moveToCloset={moveToCloset}
              onEdit={(item) => { setEditItem(item); setWishlistDest(true); setModal("item"); }}
              onItemClick={(item) => setItemDetail(item)}
              moodboardsDb={moodboardsDb.boards}
              lookbooksDb={lookbooksDb.rows}
              wlSelectMode={wlSelectMode}
              setWlSelectMode={setWlSelectMode}
              onCreateLook={(item) => { setEditingOutfit(null); setOutfitSeedItem(item); setOutfitBuilder(true); }}
            />}

            </>
          )}
        </div>

        {/* ── RIGHT PANEL (closet / outfits / moodboard canvas only) ── */}
        {(["closet","outfits"].includes(tab) || (tab === "moodboard" && moodboardView === "canvas")) && <div className="app-right-panel" style={{ top: 24 }}>

          {/* Sort moved to top toolbar for closet/outfits */}

          {/* Moodboard board info */}
          {tab === "moodboard" && <MoodboardInfoPanel
            activeIdx={moodboardActiveIdx} setActiveIdx={setMoodboardActiveIdx}
            boards={moodboardsDb.boards} updateBoards={moodboardsDb.updateBoards} updateBoardById={moodboardsDb.updateBoardById} removeBoardById={moodboardsDb.removeBoardById}
            closetItems={itemsDb.rows.filter(i => !i.forSale)}
            lookbooksDb={lookbooksDb.rows}
            createLookbook={async ({id: newId, name, moodboardId}) => {
              const lbId = newId || uid();
              const newLb = { id: lbId, name, notes: "", coverImage: "", dateStart: "", dateEnd: "", outfitIds: [], lookMeta: {}, moodboardId };
              let { error } = await supabase.from("lookbooks").insert({ id: lbId, data: newLb });
              if (error) ({ error } = await supabase.from("lookbooks").insert(newLb));
              await lookbooksDb.refresh();
            }}
            addMoodboardToLookbook={async (lookbookId, board) => {
              const lb = lookbooksDb.rows.find(l => l.id === lookbookId);
              if (!lb) return;
              const updated = { ...lb, moodboardId: board.id };
              await lookbooksDb.update(updated);
              // Set immediately — don't wait for refresh
              setActiveLookbook(updated);
            }}
            onGoToLookbook={(lb) => {
              // lb already has moodboardId set by setLinkedLb
              const fresh = lookbooksDb.rows.find(r => r.id === lb.id);
              const withMb = { ...(fresh || lb), moodboardId: lb.moodboardId || fresh?.moodboardId };
              setActiveLookbookView("moodboard");
              setTab("lookbooks");
              setActiveLookbook(withMb);
            }}
          />}

          {tab === "outfits" && (() => {
            const todayKey = new Date().toISOString().slice(0, 10);
            const todayRaw = outfitCalendar[todayKey];
            const todayIds = Array.isArray(todayRaw) ? todayRaw : (todayRaw ? [todayRaw] : []);
            const todayOutfit = todayIds.length > 0 ? outfitsDb.rows.find(o => o.id === todayIds[0]) : null;
            const sidebarWx = (homeWeather || calendarWeather)?.days?.find(d => d.date === todayKey);
            const sidebarWxIcon = (code) => { if (code === 0) return "☀️"; if (code <= 2) return "⛅"; if (code <= 45) return "☁️"; if (code <= 67) return "🌧️"; if (code <= 77) return "❄️"; return "⛈️"; };
            return (
              <div className="right-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <div className="right-card-title" style={{ marginBottom: 0 }}>Today</div>
                  {sidebarWx && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>
                      <span>{sidebarWxIcon(sidebarWx.code)}</span>
                      <span>{sidebarWx.high}°<span style={{ color: "#aaa", fontWeight: 500 }}> / {sidebarWx.low}°</span></span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 800, marginBottom: 10 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                {todayOutfit ? (
                    <div onClick={() => setOutfitPopup(todayOutfit)}
                      onMouseEnter={() => setHoveredSidebarToday(true)}
                      onMouseLeave={() => setHoveredSidebarToday(false)}
                      style={{ cursor: "pointer", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", position: "relative", background: "#f5f3ef" }}>
                      {todayOutfit.previewImage && (
                        <img src={todayOutfit.previewImage} alt={todayOutfit.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      )}
                      {hoveredSidebarToday && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, background: "#fff", padding: "8px 12px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{todayOutfit.name}</div>
                        </div>
                      )}
                    </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
                    <div style={{ fontSize: 12, color: "#bbb", fontWeight: 600, marginBottom: 10 }}>No outfit planned</div>
                    <button onClick={() => { setOutfitsView("calendar"); }} style={{
                      padding: "7px 14px", background: "#1a1a1a", color: "#fff", border: "none",
                      borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif"
                    }}>Open Calendar</button>
                  </div>
                )}
              </div>
            );
          })()}

          {tab === "outfits" && (
            <UpcomingEventsCard
              events={calendarEvents}
              onAdd={addUpcomingEvent}
              onRemove={removeUpcomingEvent}
              onSelect={startOutfitFromEvent}
            />
          )}

          {/* Season filter moved to top toolbar for closet */}

          {/* Capsules right card — closet tab only */}
          {tab === "closet" && (() => {
            const allClosetColors = [...new Set(itemsDb.rows.filter(i => !i.forSale && i.color).map(i => i.color))].sort((a,b) => a.localeCompare(b));
            // getColorSwatch is defined at module level
            return (<>
            <div className="right-card">
              <div className="right-card-title" style={{ marginBottom: 10 }}>Filters</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "What's New", active: showNewOnly, toggle: () => setShowNewOnly(n => !n), icon: <SvgStar size={16} color={showNewOnly ? "#2d6a3f" : "#aaa"} />, activeStyle: { border: "1.5px solid #b6e8c8", background: "#f0faf4", color: "#2d6a3f" }, inactiveStyle: { border: "1px solid #e8e4dc", background: "#faf9f7", color: "#666" } },
                  { label: "Needs Styling", active: showNeedsStylingOnly, toggle: () => setShowNeedsStylingOnly(n => !n), icon: <SvgHanger size={16} color={showNeedsStylingOnly ? "#b64b78" : "#aaa"} />, activeStyle: { border: "1.5px solid #f3b4ce", background: "#fff0f6", color: "#b64b78" }, inactiveStyle: { border: "1px solid #e8e4dc", background: "#faf9f7", color: "#666" } },
                  { label: "Disney", active: showDisneyOnly, toggle: () => setShowDisneyOnly(n => !n), icon: <SvgCastle size={16} color={showDisneyOnly ? "#d040b0" : "#aaa"} />, activeStyle: { border: "1.5px solid #f1c0e8", background: "#fff0fb", color: "#d040b0" }, inactiveStyle: { border: "1px solid #e8e4dc", background: "#faf9f7", color: "#666" } },
                ].map(({ label, active, toggle, icon, activeStyle, inactiveStyle }) => (
                  <button key={label} onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, textAlign: "left", transition: "all 0.15s", ...(active ? activeStyle : inactiveStyle) }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>

            {allClosetColors.length > 0 && (
              <div className="right-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div className="right-card-title" style={{ marginBottom: 0 }}>Colors</div>
                  {closetColorFilter.length > 0 && <button onClick={() => setClosetColorFilter([])} style={{ fontSize: 10, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Clear</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                  {allClosetColors.map(color => {
                    const active = closetColorFilter.includes(color);
                    const swatch = getColorSwatch(color);
                    return (
                      <button key={color} title={color} onClick={() => setClosetColorFilter(prev => active ? prev.filter(c => c !== color) : [...prev, color])}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: swatch, border: active ? "2.5px solid #1a1a1a" : "2px solid transparent", boxShadow: active ? "0 0 0 1px #1a1a1a" : "0 1px 3px rgba(0,0,0,0.12)", transition: "all 0.15s" }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="right-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="right-card-title" style={{ marginBottom: 0 }}>Capsules</div>
                <button onClick={() => { setCapsuleName(""); setShowCapsuleModal(true); }} style={{
                  width: 26, height: 26, borderRadius: "50%", background: "#f5f2ed", border: "none",
                  cursor: "pointer", fontSize: 18, fontWeight: 300, color: "#888", display: "flex", alignItems: "center", justifyContent: "center"
                }}>+</button>
              </div>
              {capsules.length === 0 ? (
                <div style={{ fontSize: 12, color: "#ccc", textAlign: "center", padding: "14px 0" }}>
                  <div style={{ marginBottom: 6 }}><SvgBox size={24} color="#ddd" /></div>
                  No capsules yet — click + to create one
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className={"sidebar-btn" + (!activeCapsule ? " active" : "")} onClick={() => setActiveCapsule(null)} style={{ textAlign: "left" }}>All Items</button>
                  {capsules.map(c => {
                    const count = (c.itemIds || []).length;
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button className={"sidebar-btn" + (activeCapsule === c.id ? " active" : "")}
                          onClick={() => setActiveCapsule(activeCapsule === c.id ? null : c.id)}
                          style={{ flex: 1, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>{c.name}</span>
                          <span style={{ fontSize: 10, opacity: 0.55, fontWeight: 600 }}>{count}</span>
                        </button>
                        <button onClick={() => { if (window.confirm("Delete capsule?")) saveCapsules(capsules.filter(x => x.id !== c.id)); if (activeCapsule === c.id) setActiveCapsule(null); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 16, padding: "2px 4px", flexShrink: 0, lineHeight: 1 }}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>);
          })()}



        </div>}


        {tab === "seller" && (() => {
          const forSaleItems = itemsDb.rows.filter(i => i.forSale);
          const listed = forSaleItems.filter(i => i.saleStatus === "listed" || !i.saleStatus).length;
          const pending = forSaleItems.filter(i => i.saleStatus === "pending").length;
          const drafts = forSaleItems.filter(i => i.saleStatus === "draft").length;
          const sold = forSaleItems.filter(i => i.saleStatus === "sold").length;
          const totalEarned = forSaleItems.filter(i => i.saleStatus === "sold")
            .reduce((s, i) => s + (parseFloat((i.netRevenue || i.salePrice || "").replace(/[^0-9.]/g, "")) || 0), 0);
          const potentialEarnings = forSaleItems.filter(i => i.saleStatus !== "sold")
            .reduce((s, i) => s + (parseFloat((i.salePrice || "").replace(/[^0-9.]/g, "")) || 0), 0);
          const totalSpent = itemsDb.rows.reduce((s, i) => s + (parseFloat((i.price||"").replace(/[^0-9.]/g,""))||0), 0);
          const earnedPct = totalSpent > 0 ? Math.min(100, (totalEarned / totalSpent) * 100) : 0;
          const soldWithDates = forSaleItems.filter(i => i.saleStatus === "sold" && i.soldDate && i.listedDate);
          const avgDaysToSell = soldWithDates.length > 0
            ? Math.round(soldWithDates.reduce((s, i) => s + Math.max(0, (new Date(i.soldDate) - new Date(i.listedDate)) / 86400000), 0) / soldWithDates.length)
            : null;
          const sellThrough = forSaleItems.length > 0 ? Math.round((sold / forSaleItems.length) * 100) : 0;
          // Platform breakdown (sold items only)
          const platformMap = {};
          forSaleItems.filter(i => i.saleStatus === "sold" && i.salePlatform).forEach(i => {
            if (!platformMap[i.salePlatform]) platformMap[i.salePlatform] = { count: 0, revenue: 0 };
            platformMap[i.salePlatform].count++;
            platformMap[i.salePlatform].revenue += parseFloat((i.netRevenue || i.salePrice||"").replace(/[^0-9.]/g,""))||0;
          });
          const platforms = Object.entries(platformMap).sort((a,b) => b[1].revenue - a[1].revenue);
          // Sales history chart
          const soldItems = forSaleItems.filter(i => i.saleStatus === "sold" && i.soldDate);
          const byMonth = {};
          soldItems.forEach(i => {
            const m = i.soldDate.slice(0, 7);
            if (!byMonth[m]) byMonth[m] = { count: 0, revenue: 0 };
            byMonth[m].count++;
            byMonth[m].revenue += parseFloat((i.netRevenue || i.salePrice||"").replace(/[^0-9.]/g,""))||0;
          });
          const months = Object.keys(byMonth).sort().slice(-6);
          const maxRev = Math.max(...months.map(m => byMonth[m].revenue), 1);
          // Sell candidates: non-listed closet items unworn or not worn in 12+ months
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
          const sellCandidates = itemsDb.rows.filter(i => {
            if (i.forSale) return false;
            if ((i.wornCount || 0) === 0) return true;
            if (i.lastWorn && new Date(i.lastWorn) < twelveMonthsAgo) return true;
            if (!i.lastWorn && i.purchaseDate && new Date(i.purchaseDate) < twelveMonthsAgo) return true;
            return false;
          }).sort((a, b) => (a.wornCount || 0) - (b.wornCount || 0)).slice(0, 6);
          // Best category analytics
          const soldCats = {};
          forSaleItems.filter(i => i.saleStatus === "sold" && i.category).forEach(i => {
            const cat = i.category;
            if (!soldCats[cat]) soldCats[cat] = { totalDays: 0, count: 0, pctSum: 0, pctCount: 0 };
            if (i.listedDate && i.soldDate) {
              soldCats[cat].totalDays += Math.max(0, (new Date(i.soldDate) - new Date(i.listedDate)) / 86400000);
              soldCats[cat].count++;
            }
            const orig = parseFloat((i.price || "").replace(/[^0-9.]/g, "")) || 0;
            const sale = parseFloat((i.salePrice || "").replace(/[^0-9.]/g, "")) || 0;
            if (orig > 0 && sale > 0) { soldCats[cat].pctSum += (sale / orig) * 100; soldCats[cat].pctCount++; }
          });
          const topCats = Object.entries(soldCats).filter(([, d]) => d.count > 0)
            .map(([cat, d]) => ({ cat, avgDays: Math.round(d.totalDays / d.count), avgPct: d.pctCount > 0 ? Math.round(d.pctSum / d.pctCount) : null }))
            .sort((a, b) => a.avgDays - b.avgDays).slice(0, 3);
          if (sellCandidates.length === 0 && months.length === 0 && platforms.length === 0 && topCats.length === 0) return null;
          return (
            <div className="app-right-panel" style={{ top: 24 }}>
              {/* Sell Candidates */}
              {sellCandidates.length > 0 && (
                <div className="right-card">
                  <div className="right-card-title">Sell Candidates</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>Unworn or not worn in 12+ months</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sellCandidates.map(item => {
                      const origPrice = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
                      const suggestedPrice = origPrice > 0 ? Math.round(origPrice * 0.4) : null;
                      const today = new Date().toISOString().slice(0, 10);
                      return (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: item.image ? `url(${item.image}) center/contain no-repeat #f8f6f2` : "#f8f6f2", flexShrink: 0, border: "1px solid #e8e4dc" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                            <div style={{ fontSize: 10, color: "#aaa" }}>{item.category}{suggestedPrice ? ` · suggest $${suggestedPrice}` : ""}</div>
                          </div>
                          <button onClick={() => itemsDb.update({ ...item, forSale: true, saleStatus: "listed", listedDate: today, ...(suggestedPrice ? { salePrice: String(suggestedPrice) } : {}) })}
                            style={{ padding: "4px 9px", background: "#f0faf4", border: "1.5px solid #b6e8c8", borderRadius: 8, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#2d6a3f", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                            List →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Best Category */}
              {topCats.length > 0 && (
                <div className="right-card">
                  <div className="right-card-title">Best Category</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>Fastest-selling categories</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {topCats.map(({ cat, avgDays, avgPct }, idx) => (
                      <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: idx === 0 ? "#fff8ee" : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: idx === 0 ? "#a07000" : "#aaa" }}>#{idx + 1}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</div>
                          <div style={{ fontSize: 10, color: "#aaa" }}>avg {avgDays}d to sell{avgPct !== null ? ` · ${avgPct}% of asking` : ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Sales History chart */}
              {months.length > 0 && (
                <div className="right-card">
                  <div className="right-card-title">Sales History</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                    {months.map(m => {
                      const d = new Date(m + "-01T00:00:00");
                      const label = d.toLocaleDateString("en-US", { month: "short" });
                      return (
                        <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <div style={{ fontSize: 8, color: "#7c6fe0", fontWeight: 700 }}>${byMonth[m].revenue.toFixed(0)}</div>
                          <div style={{ width: "100%", background: "#7c6fe0", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (byMonth[m].revenue / maxRev) * 36)}px` }} />
                          <div style={{ fontSize: 8, color: "#aaa", fontWeight: 600 }}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Platform breakdown */}
              {platforms.length > 0 && (
                <div className="right-card">
                  <div className="right-card-title">By Platform</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {platforms.map(([name, data]) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>{name}</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#aaa" }}>{data.count}×</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#2d6a3f" }}>${data.revenue.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── RIGHT PANEL (lookbooks tab) — packing lists ── */}
        {tab === "lookbooks" && (() => {
          const lbsWithPacking = lookbooksDb.rows.filter(lb => {
            const lbOutfits = (lb.outfitIds || []).map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);
            const allLayerIds = lbOutfits.flatMap(o => o.layers || o.itemIds || []);
            return allLayerIds.length > 0;
          });
          if (lbsWithPacking.length === 0) return null;
          return (
            <div className="app-right-panel" style={{ top: 24 }}>
              <div className="right-card">
                <div className="right-card-title" style={{ marginBottom: 12 }}>Packing Lists</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {lbsWithPacking.map(lb => {
                    const lbOutfits = (lb.outfitIds || []).map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);
                    const allLayerIds = [...new Set(lbOutfits.flatMap(o => o.layers || o.itemIds || []))];
                    const packItems = allLayerIds.map(id => allItems.find(x => x.id === id)).filter(Boolean);
                    return (
                      <button key={lb.id} onClick={() => {
                        setActiveLookbook(lb);
                        setActiveLookbookView("editorial");
                        // slight delay then open packing list view
                        setTimeout(() => {
                          // signal to open packing list immediately
                          localStorage.setItem("wardrobe_open_packing_v1", lb.id);
                        }, 50);
                      }} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
                        background: "#faf9f6", border: "1.5px solid #e8e4dc", borderRadius: 12,
                        cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                        transition: "border-color 0.15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e4dc"}
                      >
                        {lb.coverImage ? (
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: `url(${lb.coverImage}) center/cover no-repeat`, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lb.name}</div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{packItems.length} item{packItems.length !== 1 ? "s" : ""}</div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

          </div>}{/* end app-layout */}
        </div>{/* end app-main-area */}
        {/* ── RIGHT RAIL (stats/sort/etc) ── */}
      </div>{/* end app-body */}

      {/* Modals */}
      <Modal open={modal === "item"} onClose={closeModal} title="" maxWidth={860}>
        <AddItemModal
          initial={editItem || BLANK}
          editMode={editItem ? "manual" : null}
          initialDest={wishlistDest ? "wishlist" : undefined}
          onSave={saveItem}
          onSaveWish={(form, listId) => saveWishItem({ ...form, wishlistId: listId || undefined })}
          onCancel={closeModal}
          wishlistsDb={wishlistsDb}
          saveWishlistsMeta={saveWishlistsMeta}
        />
      </Modal>

      {/* Create Lookbook Modal */}
      <Modal open={lookbookModal} onClose={() => setLookbookModal(false)} title="Create Lookbook">
        <Input label="Lookbook Name *" value={newLbName} onChange={e => setNewLbName(e.target.value)} placeholder="e.g. Summer Vacation" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Cover Image (optional)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px dashed #e0dbd0", borderRadius: 12, cursor: "pointer", background: "#faf9f6" }}>
              <SvgCamera size={16} color="currentColor" />
              <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{newLbCover ? "Change cover image" : "Upload cover image"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => setNewLbCover(ev.target.result);
                reader.readAsDataURL(file);
              }} />
            </label>
            {newLbCover && (
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 100 }}>
                <img src={newLbCover} alt="cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => setNewLbCover("")} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notes</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={newLbNotes} onChange={e => setNewLbNotes(e.target.value)} placeholder="Styling notes…" />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Start Date</label>
            <input type="date" value={newLbDateStart} onChange={e => setNewLbDateStart(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>End Date</label>
            <input type="date" value={newLbDateEnd} onChange={e => setNewLbDateEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>City (for weather)</label>
          <input value={newLbCity} onChange={e => setNewLbCity(e.target.value)} placeholder="e.g. Orlando, FL" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Lookbook Type</label>
          <select value={newLbType} onChange={e => setNewLbType(e.target.value)} style={inputStyle}>
            {LOOKBOOK_TYPES.map(type => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
          </select>
          {newLbType === "trip" && <div style={{ fontSize: 11, color: "#bbb", marginTop: 5 }}>Trip lookbooks focus on weather, packing, hotel, and day-by-day planning.</div>}
          {newLbType === "event" && <div style={{ fontSize: 11, color: "#bbb", marginTop: 5 }}>Event lookbooks are built around a specific occasion or date.</div>}
          {newLbType === "season" && <div style={{ fontSize: 11, color: "#bbb", marginTop: 5 }}>Season lookbooks collect looks for a recurring time of year.</div>}
        </div>

        {/* ── Link Calendar Event ── */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Link Calendar Event</label>
          {calendarEvents.length === 0 ? (
            <div style={{ padding: "10px 12px", background: "#faf9f6", borderRadius: 10, border: "1.5px solid #f0ece4" }}>
              <div style={{ fontSize: 12, color: "#bbb", fontWeight: 600 }}>No events yet</div>
              <div style={{ fontSize: 11, color: "#ccc", marginTop: 2 }}>Add events in the Outfits tab → Calendar view.</div>
            </div>
          ) : (
            <>
              <select value={newLbCalEventId} onChange={e => {
                const id = e.target.value;
                setNewLbCalEventId(id);
                if (!id) return;
                const ev = calendarEvents.find(x => x.id === id);
                if (ev) {
                  if (ev.startDate) setNewLbDateStart(ev.startDate);
                  if (ev.endDate) setNewLbDateEnd(ev.endDate);
                  if (!newLbName.trim()) setNewLbName(ev.name);
                }
              }} style={{ ...inputStyle, color: newLbCalEventId ? "#1a1a1a" : "#aaa" }}>
                <option value="">— None —</option>
                {calendarEvents.map(ev => {
                  const fmtD = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
                  const dateRange = [fmtD(ev.startDate), fmtD(ev.endDate)].filter(Boolean).join("–");
                  return <option key={ev.id} value={ev.id}>{ev.name}{dateRange ? ` (${dateRange})` : ""}</option>;
                })}
              </select>
              {newLbCalEventId && <div style={{ fontSize: 11, color: "#888", marginTop: 5 }}>&#10003; Dates auto-filled. You can still adjust them above.</div>}
            </>
          )}
        </div>

        {/* ── Link Moodboard ── */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Link Moodboard</label>
          {moodboardsDb.boards.length === 0 ? (
            <div style={{ padding: "10px 12px", background: "#faf9f6", borderRadius: 10, border: "1.5px solid #f0ece4" }}>
              <div style={{ fontSize: 12, color: "#bbb", fontWeight: 600 }}>No boards yet</div>
              <div style={{ fontSize: 11, color: "#ccc", marginTop: 2 }}>Create one in the Moodboard tab first.</div>
            </div>
          ) : (
            <select value={newLbMoodboardId} onChange={e => setNewLbMoodboardId(e.target.value)}
              style={{ ...inputStyle, color: newLbMoodboardId ? "#1a1a1a" : "#aaa" }}>
              <option value="">— None —</option>
              {moodboardsDb.boards.map(b => (
                <option key={b.id} value={b.id}>{b.name || "Untitled Board"}</option>
              ))}
            </select>
          )}
        </div>

        {outfitsDb.rows.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Add Looks (optional)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              {outfitsDb.rows.map(o => {
                const sel = newLbSelected.includes(o.id);
                return (
                  <div key={o.id} onClick={() => setNewLbSelected(s => sel ? s.filter(x => x !== o.id) : [...s, o.id])} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 12, border: sel ? "1.5px solid #2d6a3f" : "1.5px solid #e8e4dc",
                    background: sel ? "#f0faf4" : "#fafaf8", cursor: "pointer"
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid", borderColor: sel ? "#2d6a3f" : "#ccc", background: sel ? "#2d6a3f" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, flexShrink: 0 }}>{sel ? <SvgCheck size={10} color="#fff" /> : ""}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{o.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setLookbookModal(false)} style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button className="btn-primary" onClick={createLookbook} style={{ padding: "10px 22px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700 }}>Create</button>
        </div>
      </Modal>

      {/* Capsule Modal */}
      {showCapsuleModal && (() => {
        const CapsuleModal = () => {
          const [capName, setCapName] = useState(capsuleName || "");
          const [selIds, setSelIds] = useState(new Set(capsulePreselect || []));
          const [capCatF, setCapCatF] = useState("All");
          const [capColF, setCapColF] = useState("All");
          const [capSeaF, setCapSeaF] = useState("All");
          const allColors = [...new Set(itemsDb.rows.flatMap(i => i.colors || (i.color ? [i.color] : [])).filter(Boolean))].sort();
          const visItems = itemsDb.rows.filter(i => !i.forSale
            && (capCatF === "All" || i.category === capCatF)
            && (capColF === "All" || (i.colors || [i.color]).includes(capColF))
            && (capSeaF === "All" || (i.season || []).includes(capSeaF))
          );
          const toggle = id => setSelIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
          const save = () => {
            if (!capName.trim()) return;
            const itemIds = [...selIds];
            if (capsuleEditId) {
              saveCapsules(capsules.map(c => c.id === capsuleEditId ? { ...c, name: capName.trim(), itemIds } : c));
            } else {
              const nc = { id: Date.now().toString(), name: capName.trim(), itemIds };
              saveCapsules([...capsules, nc]);
              setActiveCapsule(nc.id);
            }
            setShowCapsuleModal(false);
            setCapsulePreselect(null);
            setCapsuleEditId(null);
          };
          const selPill = (val, cur, set) => (
            <button onClick={() => set(v => v === val ? "All" : val)} style={{
              padding: "4px 10px", borderRadius: 100, border: cur === val ? "1.5px solid #1a1a1a" : "1px solid #e0dbd2",
              background: cur === val ? "#1a1a1a" : "#fff", color: cur === val ? "#fff" : "#666",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap"
            }}>{val}</button>
          );
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }} onClick={() => { setShowCapsuleModal(false); setCapsulePreselect(null); setCapsuleEditId(null); }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: "24px 24px 20px", width: "min(780px, 96vw)", maxHeight: "88vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{capsuleEditId ? "Edit Capsule" : capsulePreselect ? "Add to Capsule" : "New Capsule"}</div>
                  <button onClick={() => { setShowCapsuleModal(false); setCapsulePreselect(null); setCapsuleEditId(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#aaa", lineHeight: 1 }}>×</button>
                </div>
                {capsulePreselect && capsules.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Add to existing</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {capsules.map(c => (
                        <button key={c.id} onClick={() => {
                          const updated = capsules.map(x => x.id === c.id ? { ...x, itemIds: [...new Set([...(x.itemIds||[]), ...(capsulePreselect||[])])] } : x);
                          saveCapsules(updated);
                          setShowCapsuleModal(false); setCapsulePreselect(null);
                        }} style={{ padding: "5px 12px", borderRadius: 100, border: "1.5px solid #e0dbd2", background: "#fafaf8", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{c.name}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#ccc", textAlign: "center", margin: "10px 0 0" }}>— or create new —</div>
                  </div>
                )}
                <input value={capName} onChange={e => setCapName(e.target.value)} placeholder="New capsule name…"
                  style={{ padding: "9px 14px", border: "1.5px solid #e0dbd2", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 12, outline: "none" }} />
                {/* Filter row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  <select value={capCatF} onChange={e => setCapCatF(e.target.value)} className="pill-select" style={{ fontSize: 11, padding: "4px 28px 4px 10px" }}>
                    <option value="All">All Categories</option>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={capSeaF} onChange={e => setCapSeaF(e.target.value)} className="pill-select" style={{ fontSize: 11, padding: "4px 28px 4px 10px" }}>
                    <option value="All">All Seasons</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={capColF} onChange={e => setCapColF(e.target.value)} className="pill-select" style={{ fontSize: 11, padding: "4px 28px 4px 10px" }}>
                    <option value="All">All Colors</option>
                    {allColors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {(capCatF !== "All" || capSeaF !== "All" || capColF !== "All") && (
                    <button onClick={() => { setCapCatF("All"); setCapSeaF("All"); setCapColF("All"); }} style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: "#f5f2ed", color: "#888", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear</button>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                  {selIds.size > 0 ? selIds.size + " selected" : "Select items"}
                  {visItems.length !== itemsDb.rows.filter(i => !i.forSale).length && " (filtered: " + visItems.length + ")"}
                </div>
                <div style={{ overflowY: "auto", flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(82px, 1fr))", gap: 8, marginBottom: 14 }}>
                  {visItems.map(item => {
                    const on = selIds.has(item.id);
                    return (
                      <div key={item.id} onClick={() => toggle(item.id)} style={{
                        position: "relative", cursor: "pointer", borderRadius: 10, overflow: "hidden",
                        border: on ? "2.5px solid #1a1a1a" : "2px solid #e8e4dc",
                        boxShadow: on ? "0 0 0 2px rgba(0,0,0,0.08)" : "none",
                        transition: "border-color 0.12s"
                      }}>
                        {on && <div style={{ position: "absolute", top: 5, right: 5, zIndex: 2, width: 18, height: 18, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgCheck size={10} color="#fff" /></div>}
                        <div style={{ aspectRatio: "1/1", background: item.image ? "transparent" : "#f5f2ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <SvgHanger size={20} color="#ccc" />}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#555", padding: "3px 5px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", textAlign: "center", background: on ? "#f5f2ed" : "#fff" }}>{item.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowCapsuleModal(false); setCapsulePreselect(null); setCapsuleEditId(null); }} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #e0dbd2", background: "#fafaf8", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                  <button onClick={save} disabled={!capName.trim()} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: capName.trim() ? "#1a1a1a" : "#e0dbd2", color: "#fff", cursor: capName.trim() ? "pointer" : "default", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{capsuleEditId ? "Save Changes" : "Create Capsule"}</button>
                </div>
              </div>
            </div>
          );
        };
        return <CapsuleModal key="capsule-modal" />;
      })()}

      {/* Item Detail Popup */}
      {itemDetail && (() => {
        const isWishlistItem = wishlistDb.rows.some(w => w.id === itemDetail.id);
        return (
          <ItemDetailPopup
            item={itemDetail}
            onClose={() => setItemDetail(null)}
            onEdit={() => { setEditItem(itemDetail); setWishlistDest(isWishlistItem); setModal("item"); setItemDetail(null); }}
            onDelete={() => { isWishlistItem ? wishlistDb.remove(itemDetail.id) : itemsDb.remove(itemDetail.id); setItemDetail(null); }}
            onWorn={isWishlistItem ? null : () => markWorn(itemDetail)}
            onDuplicate={isWishlistItem ? null : async () => { await duplicateItem(itemDetail); setItemDetail(null); }}
            onToggleNeedsStyling={isWishlistItem ? null : async () => {
              const updated = { ...itemDetail, needsStyling: !itemDetail.needsStyling };
              await itemsDb.update(updated);
              setItemDetail(updated);
            }}
            onMoveToCloset={isWishlistItem ? (date, finalPrice, keepLink) => { const itemToMove = keepLink ? itemDetail : { ...itemDetail, link: undefined }; moveToCloset(itemToMove, date, finalPrice); setItemDetail(null); } : null}
            onCreateOutfit={() => { setEditingOutfit(null); setOutfitSeedItem(itemDetail); setOutfitBuilder(true); setItemDetail(null); }}
            onListForSale={isWishlistItem ? null : () => { itemsDb.update({ ...itemDetail, forSale: true, saleStatus: "listed", listedDate: new Date().toISOString().slice(0,10) }); setItemDetail(null); setTab("seller"); }}
            onAddToCapsule={isWishlistItem ? null : () => { setCapsulePreselect([itemDetail.id]); setCapsuleName(""); setShowCapsuleModal(true); }}
            onOpenItem={(nextItem) => setItemDetail(nextItem)}
            onOpenOutfit={(nextOutfit) => { setItemDetail(null); setOutfitPopup(nextOutfit); }}
            onOpenLookbook={(nextLookbook) => { setItemDetail(null); setActiveLookbook(nextLookbook); }}
            outfits={outfitsDb.rows}
            lookbooks={lookbooksDb.rows}
            capsules={capsules}
            isWishlist={isWishlistItem}
            allItems={allItems}
          />
        );
      })()}

      {/* Lookbook picker modal (from outfit card) */}
      {lbPickerOutfit && (() => {
        const alreadyIn = lookbooksDb.rows.filter(lb => (lb.outfitIds || []).includes(lbPickerOutfit.id));
        const available = lookbooksDb.rows.filter(lb => !(lb.outfitIds || []).includes(lbPickerOutfit.id));
        return (
          <div onClick={() => setLbPickerOutfit(null)} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "24px 22px", width: 320, boxShadow: "0 12px 48px rgba(0,0,0,0.18)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Add to Lookbook</div>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lbPickerOutfit.name}</div>
              {available.length === 0 && alreadyIn.length === 0 && (
                <div style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No lookbooks yet — create one in the Lookbooks tab.</div>
              )}
              {alreadyIn.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#c0b8b0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Already in</div>
                  {alreadyIn.map(lb => <div key={lb.id} style={{ fontSize: 13, color: "#aaa", padding: "6px 0", borderBottom: "1px solid #f5f2ee" }}>{lb.name}</div>)}
                </div>
              )}
              {available.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#c0b8b0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Add to</div>
                  {available.map(lb => (
                    <button key={lb.id} onClick={() => { addOutfitToLookbook(lbPickerOutfit.id, lb.id); setLbPickerOutfit(null); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 6, background: "#f7f5f2", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                      {lb.name}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setLbPickerOutfit(null)} style={{ marginTop: 12, width: "100%", padding: "9px 0", background: "#f5f3ef", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#888" }}>Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* Bulk lookbook picker */}
      {outfitBulkLbPicker && (
        <div onClick={() => setOutfitBulkLbPicker(false)} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "24px 22px", width: 320, boxShadow: "0 12px 48px rgba(0,0,0,0.18)", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Add to Lookbook</div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{selectedOutfitIds.size} outfits selected</div>
            {lookbooksDb.rows.length === 0 ? (
              <div style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No lookbooks yet — create one in the Lookbooks tab.</div>
            ) : (
              lookbooksDb.rows.map(lb => (
                <button key={lb.id} onClick={async () => {
                  for (const id of selectedOutfitIds) { await addOutfitToLookbook(id, lb.id); }
                  setOutfitBulkLbPicker(false); setOutfitSelectMode(false); setSelectedOutfitIds(new Set());
                }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 6, background: "#f7f5f2", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                  {lb.name}
                </button>
              ))
            )}
            <button onClick={() => setOutfitBulkLbPicker(false)} style={{ marginTop: 12, width: "100%", padding: "9px 0", background: "#f5f3ef", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#888" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Bulk new lookbook modal */}
      {outfitBulkNewLb && (
        <div onClick={() => setOutfitBulkNewLb(false)} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "24px 22px", width: 320, boxShadow: "0 12px 48px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>New Lookbook</div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{selectedOutfitIds.size} outfit{selectedOutfitIds.size > 1 ? "s" : ""} will be added</div>
            <input value={outfitBulkNewLbName} onChange={e => setOutfitBulkNewLbName(e.target.value)} placeholder="Lookbook name…" onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8e4dc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, outline: "none", boxSizing: "border-box", marginBottom: 14 }} autoFocus />
            <button onClick={async () => {
              if (!outfitBulkNewLbName.trim()) return;
              const newLb = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: outfitBulkNewLbName.trim(), outfitIds: [...selectedOutfitIds], type: "collection", tags: [], notes: "", lookMeta: {} };
              await lookbooksDb.update(newLb);
              setOutfitBulkNewLb(false); setOutfitSelectMode(false); setSelectedOutfitIds(new Set());
            }} style={{ width: "100%", padding: "11px 0", background: "#1a1a1a", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Create Lookbook</button>
            <button onClick={() => setOutfitBulkNewLb(false)} style={{ width: "100%", padding: "9px 0", background: "#f5f3ef", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#888" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Bulk add to calendar modal */}
      {outfitBulkCalModal && (
        <div onClick={() => setOutfitBulkCalModal(false)} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "24px 22px", width: 320, boxShadow: "0 12px 48px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Add to Calendar</div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{selectedOutfitIds.size} outfit{selectedOutfitIds.size > 1 ? "s" : ""} → pick a date</div>
            <input type="date" value={outfitBulkCalDate} onChange={e => setOutfitBulkCalDate(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8e4dc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
            <button onClick={() => {
              if (!outfitBulkCalDate) return;
              const existing = outfitCalendar[outfitBulkCalDate] || [];
              const toAdd = [...selectedOutfitIds].filter(id => !existing.includes(id));
              saveOutfitCalendar({ ...outfitCalendar, [outfitBulkCalDate]: [...existing, ...toAdd] });
              setOutfitBulkCalModal(false); setOutfitSelectMode(false); setSelectedOutfitIds(new Set());
            }} style={{ width: "100%", padding: "11px 0", background: "#1a1a1a", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Add to Calendar</button>
            <button onClick={() => setOutfitBulkCalModal(false)} style={{ width: "100%", padding: "9px 0", background: "#f5f3ef", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#888" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Outfit Detail Popup */}
      {outfitPopup && (
        <OutfitDetailPopup
          outfit={outfitPopup}
          allItems={allItems}
          wishlistIds={new Set(wishlistDb.rows.map(i => i.id))}
          allOutfits={outfitsDb.rows}
          lookbooks={lookbooksDb.rows}
          onClose={() => setOutfitPopup(null)}
          onEdit={() => { openEditOutfit(outfitPopup); setOutfitPopup(null); }}
          onArchive={() => { archiveOutfit(outfitPopup); setOutfitPopup(null); }}
          onDelete={() => { if (window.confirm(`Permanently delete "${outfitPopup.name}"?`)) { outfitsDb.remove(outfitPopup.id); setOutfitPopup(null); } }}
          onMarkWorn={() => markOutfitWorn(outfitPopup)}
          onDuplicate={() => { duplicateOutfit(outfitPopup); setOutfitPopup(null); }}
          onAddToLookbook={addOutfitToLookbook}
          onGoToLookbook={(lb) => { setOutfitPopup(null); setActiveLookbook(lb); }}
          onItemClick={(item) => { setOutfitPopup(null); setItemDetail(item); }}
          onSimilarClick={(o) => setOutfitPopup(o)}
        />
      )}

      {/* Outfit Builder */}
      {outfitBuilder && (
        <OutfitBuilder
          itemsDb={itemsDb}
          wishlistDb={wishlistDb}
          capsules={capsules}
          initial={editingOutfit || (outfitPrefillName ? { name: outfitPrefillName } : null)}
          seedItem={outfitSeedItem}
          onSave={saveOutfit}
          onClose={() => { setOutfitBuilder(false); setEditingOutfit(null); setOutfitSeedItem(null); setOutfitPrefillName(""); }}
          lookbooks={lookbooksDb.rows}
          onSaveToLookbook={async (outfitData, lookbookId) => {
            const lb = lookbooksDb.rows.find(l => l.id === lookbookId);
            if (!lb) return;
            const savedOutfit = outfitsDb.rows.find(o => o.name === outfitData.name) || { id: null };
            const outfitId = savedOutfit.id || ("o_" + Date.now());
            const updated = { ...lb, outfitIds: [...(lb.outfitIds || []), outfitId] };
            try { await lookbooksDb.update(updated); } catch(e) { console.error("Add to lookbook error:", e); }
          }}
        />
      )}

      {/* Lookbook Preview Popup */}
      {lbPreview && (() => {
        const previewLb = lbPreview;
        const previewLooks = (previewLb.outfitIds || []).map(id => outfitsDb.rows.find(o => o.id === id)).filter(Boolean);
        const fmtDate = (d) => { if (!d) return null; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
        const dateStr = (previewLb.dateStart || previewLb.dateEnd) ? [fmtDate(previewLb.dateStart), fmtDate(previewLb.dateEnd)].filter(Boolean).join(" – ") : null;
        return (
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, background: "#fff", borderRadius: 24, width: "min(720px, calc(100vw - 48px))", maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.14)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0ece6", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>{previewLb.name}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{previewLooks.length} look{previewLooks.length !== 1 ? "s" : ""}</span>
                  {previewLb.type && <span style={{ fontSize: 11, color: "#b0a898", background: "#f5f2ed", borderRadius: 20, padding: "2px 9px", fontWeight: 600, textTransform: "capitalize" }}>{previewLb.type}</span>}
                  {dateStr && <span style={{ fontSize: 11, color: "#b0a898", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><SvgCalendar size={11} color="#b0a898" />{dateStr}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 16 }}>
                <button onClick={() => { setLbPreview(null); setActiveLookbook(previewLb); }} style={{ padding: "8px 16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Open</button>
                <button onClick={() => setLbPreview(null)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: "20px 24px 24px", flex: 1 }}>
              {previewLooks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb", fontSize: 13 }}>No looks added yet.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                  {previewLooks.map((outfit) => {
                    const outfitItems = (outfit.layers || outfit.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean);
                    return (
                      <div key={outfit.id} style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #e8e4dc", background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                        {outfit.previewImage ? (
                          <div style={{ aspectRatio: "4/5", background: `url(${outfit.previewImage}) center/contain no-repeat #f5f3ef` }} />
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: outfitItems.length === 1 ? "1fr" : "1fr 1fr", aspectRatio: "4/5" }}>
                            {(outfitItems.length === 0 ? [null] : outfitItems).slice(0, 4).map((item, ii) => (
                              <div key={ii} style={{ background: item?.image ? `url(${item.image}) center/contain no-repeat #f5f3ef` : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", borderRight: ii % 2 === 0 && outfitItems.length > 1 ? "1.5px solid #fff" : "none", borderBottom: ii < 2 && outfitItems.length > 2 ? "1.5px solid #fff" : "none" }}>
                                {!item?.image && <HangerIcon size={16} color="#ddd" />}
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ padding: "8px 10px 10px" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outfit.name}</div>
                          {outfitItems.length > 0 && <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{outfitItems.length} piece{outfitItems.length !== 1 ? "s" : ""}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Lookbook Viewer */}
      {activeLookbook && (
        <LookbookViewer
          key={activeLookbook.id}
          lookbook={activeLookbook}
          outfits={outfitsDb.rows}
          markOutfitWorn={markOutfitWorn}
          allItems={allItems}
          closetItems={itemsDb.rows}
          moodboardsProp={moodboardsDb.boards}
          moodboardsUpdateBoards={moodboardsDb.updateBoards}
          initialView={activeLookbookView}
          onClose={(finalLb) => closeAndSaveLookbook(finalLb)}
          onArchive={(finalLb) => archiveLookbook(finalLb)}
          onUpdate={updateLookbook}
          onOpenOutfit={(outfit) => { setActiveLookbook(null); setActiveLookbookView("editorial"); setOutfitPopup(outfit); }}
        />
      )}
    </div>
  );
}
