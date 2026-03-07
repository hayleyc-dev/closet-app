import { useState, useEffect, useRef } from "react";
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
const SvgGrid     = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Ico>;
const SvgBox      = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Ico>;
const SvgShop     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></Ico>;
const SvgCalendar = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>;
const SvgLuggage  = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></Ico>;
const SvgLock     = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Ico>;
const SvgUnlock   = ({size=14,color="currentColor"}) => <Ico size={size} color={color}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></Ico>;
const SvgPalette  = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><circle cx="13.5" cy="6.5" r=".5" fill={color}/><circle cx="17.5" cy="10.5" r=".5" fill={color}/><circle cx="8.5" cy="7.5" r=".5" fill={color}/><circle cx="6.5" cy="12.5" r=".5" fill={color}/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.28 0 .5-.22.5-.5 0-.26-.1-.49-.26-.68-.44-.52-.26-1.32.4-1.32H14c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z"/></Ico>;
const SvgSparkle  = ({size=16,color="currentColor"}) => <Ico size={size} color={color}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></Ico>;


const SUPABASE_URL = "https://gucqffnjwvbvycfqvtcw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y3FmZm5qd3ZidnljZnF2dGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDAyMTQsImV4cCI6MjA4ODA3NjIxNH0.rXbJ1E2BKmn5T_3pm2zK1TFqeE5yogDjDjQyqNcepd4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ["All", "Accessories", "Activewear", "Bags", "Denim", "Dresses", "Intimates", "Jewelry", "Knits", "Loungewear", "Outerwear", "Shoes", "Shorts + Skirts", "Sleepwear", "Socks + Tights", "Sweaters", "Swim", "Tops", "Trousers"];
const COLORS = ["Black", "Blue", "Brown", "Clear", "Cream", "Gold", "Green", "Grey", "Orange", "Pink", "Purple", "Red", "Silver", "Tan", "White", "Yellow"];
const SIZES = ["XS", "S", "M", "L", "XL", "00/24", "0/25", "2/26", "4/27", "6/28", "OS", "34B", "S Tall", "XS Long", "S/M", "7", "9"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season", "Holiday", "Disney"];
const OCCASIONS = ["WFH", "Disney", "Universal", "Date Night", "Travel", "Sport", "Weekend", "Occasion"];

const OCCASION_COLORS = {
  "WFH":        { bg: "#f0faf4", color: "#3aaa6e" },
  "Disney":     { bg: "#fff0f5", color: "#e05588" },
  "Universal":  { bg: "#fff8f0", color: "#e07e30" },
  "Date Night": { bg: "#fdf4ff", color: "#a855f7" },
  "Travel":     { bg: "#f0fbff", color: "#2bafd4" },
  "Sport":      { bg: "#f0f4ff", color: "#5b7fe6" },
  "Weekend":    { bg: "#fafaf0", color: "#9aaa30" },
  "Occasion":   { bg: "#f5f0ff", color: "#7c6fe0" },
};

const uid = () => Math.random().toString(36).slice(2);

// SVG hanger icon
const HangerIcon = ({ size = 20, color = "currentColor", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ opacity, flexShrink: 0 }}>
    <path d="M12 4a2 2 0 0 1 2 2c0 1.5-2 2.5-2 4" />
    <path d="M3 18l9-6 9 6" />
    <path d="M2 18h20" />
    <circle cx="12" cy="4" r="1" fill={color} stroke="none" />
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
    width: 76px; flex-shrink: 0; background: #fff;
    border-right: 1px solid #ece8e0;
    display: flex; flex-direction: column; align-items: center;
    padding: 22px 0 18px; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
  }
  .app-nav-logo {
    width: 36px; height: 36px; background: #1a1a1a; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 28px; flex-shrink: 0;
  }
  .nav-icon-btn {
    width: 100%; height: 52px; border-radius: 0; border: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; transition: all 0.15s; background: transparent;
    font-family: 'DM Sans', sans-serif; margin-bottom: 0; position: relative;
  }
  .nav-icon-btn:hover { background: #f7f5f2; }
  .nav-icon-btn.active { background: #1a1a1a; }
  .nav-icon-btn::after {
    content: ''; position: absolute; left: -1px; top: 50%; transform: translateY(-50%);
    width: 3px; height: 0; background: #1a1a1a; border-radius: 0 3px 3px 0;
    transition: height 0.15s;
  }
  .nav-icon-btn.active::after { height: 0; }
  .nav-icon-btn .nav-label { font-size: 9px; font-weight: 600; letter-spacing: 0.02em; color: #c0b8b0; text-transform: uppercase; line-height: 1; }
  .nav-icon-btn.active .nav-label { color: rgba(255,255,255,0.6); }
  .nav-icon-btn-bottom { margin-top: auto; }
  .pill-select { padding: 7px 32px 7px 14px !important; border-radius: 100px; border: 1px solid #e0dbd2; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; background: #fff; color: #444; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }

  .app-body { margin-left: 76px; flex: 1; display: flex; min-height: 100vh; }
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
  .item-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 16px 40px rgba(0,0,0,0.09); border-color: #d8d2c8; }
  .item-card-label {
    padding: 10px 12px 12px;
    border-top: 1px solid #f5f2ee;
  }
  .item-card-name { font-size: 12px; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
  .item-card-brand { font-size: 11px; color: #b0a898; font-weight: 400; }
  .item-card-img { width: 100%; aspect-ratio: 3/4; object-fit: contain; display: block; background: #f7f5f2; padding: 8px; }

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
function useSupabaseTable(table) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const parseRows = (data) => data.map(r => {
    if (r.data && typeof r.data === "object") return { ...r.data, id: r.id };
    const { id, created_at, ...rest } = r;
    return { ...rest, id };
  }).filter(r => r.id);
  const fetchRows = async (setter) => {
    let { data, error } = await supabase.from(table).select("*").order("created_at");
    if (error) ({ data, error } = await supabase.from(table).select("*"));
    if (!error && data) setter(parseRows(data));
    else if (error) console.error("[" + table + "] fetch:", error.message);
  };
  useEffect(() => {
    fetchRows(setRows).then(() => setLoading(false));
  }, [table]);
  const add = async (item) => {
    const { error } = await supabase.from(table).insert({ id: item.id, data: item });
    if (!error) setRows(r => [...r, item]);
    else console.error("[" + table + "] add:", error.message);
  };
  const update = async (item) => {
    const { error } = await supabase.from(table).update({ data: item }).eq("id", item.id);
    if (!error) setRows(r => r.map(i => i.id === item.id ? item : i));
    else console.error("[" + table + "] update:", error.message);
  };
  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) setRows(r => r.filter(i => i.id !== id));
    else console.error("[" + table + "] remove:", error.message);
  };
  const refresh = async () => {
    setLoading(true);
    await fetchRows(setRows);
    setLoading(false);
  };
  return { rows, loading, add, update, remove, refresh };
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

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fade-in" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)"
    }}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, padding: "28px 24px", width: "100%",
        maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f5f2ed", cursor: "pointer", fontSize: 16, color: "#888", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const BLANK = { name: "", brand: "", category: "", color: "", colors: [], size: "", season: "", seasons: [], price: "", spent: "", notes: "", image: "", purchaseDate: "", wornCount: 0, link: "" };
const BLANK_WISH = { name: "", brand: "", price: "", image: "", link: "" };

// ── Shared image helpers ─────────────────────────────────────────────────────

// Canvas-based background removal: floods from corners to find background colour,
// then makes near-matching pixels transparent using a tolerance walk.
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

      // Sample background colour from the 4 corners
      const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1]];
      let rSum=0, gSum=0, bSum=0;
      corners.forEach(([x,y]) => {
        const i = (y*w+x)*4;
        rSum+=data[i]; gSum+=data[i+1]; bSum+=data[i+2];
      });
      const bgR=rSum/4, bgG=gSum/4, bgB=bSum/4;

      // Flood-fill from all 4 corners with tolerance
      const tolerance = 38;
      const visited = new Uint8Array(w * h);

      const colorMatch = (i) => {
        const dr = data[i]-bgR, dg = data[i+1]-bgG, db = data[i+2]-bgB;
        return Math.sqrt(dr*dr+dg*dg+db*db) < tolerance;
      };

      const queue = [];
      corners.forEach(([x,y]) => {
        const idx = y*w+x;
        if (!visited[idx] && colorMatch(idx*4)) { visited[idx]=1; queue.push(idx); }
      });

      while (queue.length) {
        const idx = queue.pop();
        data[idx*4+3] = 0; // make transparent
        const x = idx % w, y = Math.floor(idx / w);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
          const nx=x+dx, ny=y+dy;
          if (nx<0||nx>=w||ny<0||ny>=h) return;
          const ni = ny*w+nx;
          if (!visited[ni] && colorMatch(ni*4)) { visited[ni]=1; queue.push(ni); }
        });
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Fetch an external image via CORS proxy and return base64 data URL
async function fetchImageAsDataUrl(url) {
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
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
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
  const [tool, setTool] = useState("erase");   // "erase" | "restore"
  const [brushSize, setBrushSize] = useState(24);
  const [painting, setPainting] = useState(false);
  const lastPos = useRef(null);
  // We keep two ImageData objects in refs so we don't re-render on every stroke
  const currentDataRef = useRef(null);
  const originalDataRef = useRef(null);
  const scaleRef = useRef({ x: 1, y: 1 });

  // Load both images onto hidden canvases to get pixel data
  useEffect(() => {
    const load = (src) => new Promise((res, rej) => {
      const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src;
    });
    Promise.all([load(current), load(original)]).then(([cur, orig]) => {
      const w = cur.width, h = cur.height;
      // current (possibly already has transparency)
      const c1 = document.createElement("canvas"); c1.width=w; c1.height=h;
      c1.getContext("2d").drawImage(cur,0,0);
      currentDataRef.current = c1.getContext("2d").getImageData(0,0,w,h);
      // original (full colour, no transparency)
      const c2 = document.createElement("canvas"); c2.width=w; c2.height=h;
      c2.getContext("2d").drawImage(orig,0,0);
      originalDataRef.current = c2.getContext("2d").getImageData(0,0,w,h);
      // Draw current state to visible canvas — use image's natural dimensions
      // CSS (maxWidth/maxHeight) will scale it visually without stretching
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
      scaleRef.current = { x: 1, y: 1 }; // actual pixel coords handled via getBoundingClientRect in paintAt
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0,0,w,h);
      const tmp = document.createElement("canvas"); tmp.width=w; tmp.height=h;
      tmp.getContext("2d").putImageData(currentDataRef.current,0,0);
      ctx.drawImage(tmp, 0, 0);
    });
  }, []);  // eslint-disable-line

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const paintAt = (x, y) => {
    const cur = currentDataRef.current;
    const orig = originalDataRef.current;
    if (!cur || !orig) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = cur.width / rect.width;
    const scaleY = cur.height / rect.height;
    const px = x * scaleX, py = y * scaleY;
    const r = (brushSize / 2) * scaleX;
    const data = cur.data, odata = orig.data;
    const w = cur.width;

    const minX = Math.max(0, Math.floor(px-r)), maxX = Math.min(w-1, Math.ceil(px+r));
    const minY = Math.max(0, Math.floor(py-r)), maxY = Math.min(cur.height-1, Math.ceil(py+r));
    for (let iy=minY; iy<=maxY; iy++) for (let ix=minX; ix<=maxX; ix++) {
      const dist = Math.sqrt((ix-px)**2+(iy-py)**2);
      if (dist > r) continue;
      // soft edge: full opacity at center, fades at edge
      const strength = Math.max(0, 1 - (dist/r)**2);
      const idx = (iy*w+ix)*4;
      if (tool === "erase") {
        data[idx+3] = Math.max(0, data[idx+3] - Math.round(strength * 255));
      } else {
        // restore: blend original alpha back in
        const newA = Math.min(255, data[idx+3] + Math.round(strength * odata[idx+3]));
        const t = strength;
        data[idx]   = Math.round(data[idx]*(1-t)   + odata[idx]*t);
        data[idx+1] = Math.round(data[idx+1]*(1-t) + odata[idx+1]*t);
        data[idx+2] = Math.round(data[idx+2]*(1-t) + odata[idx+2]*t);
        data[idx+3] = newA;
      }
    }
    // Redraw canvas from updated pixel data
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tmp = document.createElement("canvas"); tmp.width=cur.width; tmp.height=cur.height;
    tmp.getContext("2d").putImageData(cur,0,0);
    ctx.drawImage(tmp, 0, 0);
  };

  const paintLine = (from, to) => {
    const dist = Math.sqrt((to.x-from.x)**2+(to.y-from.y)**2);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i=0; i<=steps; i++) {
      const t = i/steps;
      paintAt(from.x*(1-t)+to.x*t, from.y*(1-t)+to.y*t);
    }
  };

  const onDown = (e) => { e.preventDefault(); setPainting(true); const p=getCanvasPos(e); lastPos.current=p; paintAt(p.x,p.y); };
  const onMove = (e) => { e.preventDefault(); if (!painting) return; const p=getCanvasPos(e); paintLine(lastPos.current,p); lastPos.current=p; };
  const onUp   = (e) => { e.preventDefault(); setPainting(false); lastPos.current=null; };

  const applyEdit = () => {
    const cur = currentDataRef.current;
    if (!cur) return;
    const out = document.createElement("canvas");
    out.width=cur.width; out.height=cur.height;
    out.getContext("2d").putImageData(cur,0,0);
    onDone(out.toDataURL("image/png"));
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:700, background:"rgba(0,0,0,0.85)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, overflow:"hidden", width:"100%", maxWidth:580, boxShadow:"0 30px 80px rgba(0,0,0,0.5)", display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #e8e4dc", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", marginRight:"auto" }}>Edit Mask</span>

          {/* Tool toggle */}
          <div style={{ display:"flex", background:"#f5f3ef", borderRadius:9, padding:3, gap:0 }}>
            {[["erase","Erase"],["restore","Restore"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setTool(id)} style={{
                padding:"6px 14px", borderRadius:7, border:"none", cursor:"pointer",
                background: tool===id ? "#1a1a1a" : "transparent",
                color: tool===id ? "#fff" : "#aaa",
                fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, transition:"all 0.12s"
              }}>{lbl}</button>
            ))}
          </div>

          {/* Brush size */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#bbb", textTransform:"uppercase" }}>Brush</span>
            <input type="range" min={6} max={80} value={brushSize} onChange={e=>setBrushSize(+e.target.value)} style={{ width:80, accentColor:"#1a1a1a" }} />
            <span style={{ fontSize:11, color:"#aaa", minWidth:20 }}>{brushSize}</span>
          </div>
        </div>

        {/* Canvas — no forced height so image keeps its natural aspect ratio */}
        <div style={{ position:"relative", background:"repeating-conic-gradient(#e8e4dc 0% 25%,#fff 0% 50%) 0 0/20px 20px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <canvas
            ref={canvasRef}
            style={{ display:"block", maxWidth:"100%", maxHeight:"58vh", cursor: tool==="erase" ? "cell" : "crosshair", touchAction:"none" }}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          />
          {/* Brush cursor hint */}
          <div style={{ position:"absolute", bottom:10, left:10, fontSize:11, color:"rgba(255,255,255,0.7)", background:"rgba(0,0,0,0.4)", borderRadius:6, padding:"3px 8px", fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
            {tool==="erase" ? "Paint to erase" : "Paint to restore"}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 18px", display:"flex", gap:10, justifyContent:"flex-end", borderTop:"1px solid #e8e4dc" }}>
          <button onClick={onCancel} style={{ padding:"9px 18px", background:"none", border:"none", cursor:"pointer", color:"#aaa", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:600 }}>Cancel</button>
          <button onClick={applyEdit} style={{ padding:"9px 22px", background:"#1a1a1a", border:"none", borderRadius:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:"#fff" }}>Apply</button>
        </div>
      </div>
    </div>
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

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
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
    </div>
  );
}

function ImageUploadField({ value, onChange }) {
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
      const result = await removeBgCanvas(value);
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
      const result = await autoCropCanvas(value);
      onChange(result);
    } catch {
      alert("Auto-crop failed.");
    } finally {
      setAutoCropping(false);
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
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
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></span><span>{removing ? "Working…" : "Remove BG"}</span>
            </button>
            <button onClick={() => setShowMaskEditor(true)} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#f0ece4", border: "none", borderRadius: 10,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#444", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></span><span>Edit Mask</span>
            </button>
            <button onClick={() => setShowCropTool(true)} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#f5f2ed", border: "none", borderRadius: 10,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#444", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span>⊡</span><span>Crop</span>
            </button>
            <button onClick={handleAutoCrop} disabled={removing || autoCropping} style={{
              padding: "9px 4px", background: "#f5f2ed", border: "none", borderRadius: 10,
              cursor: autoCropping ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#444", opacity: removing || autoCropping ? 0.5 : 1
            }}>
              <span>⊹</span><span>{autoCropping ? "Working…" : "Auto-Crop"}</span>
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
function AddItemModal({ onSave, onSaveWish, onCancel, initial, editMode, initialDest }) {
  const isWishInitial = !!(initial?.link) || initialDest === "wishlist";
  const [dest, setDest] = useState(isWishInitial ? "wishlist" : "closet"); // "closet" | "wishlist"
  const [form, setForm] = useState({
    ...BLANK,
    colors: [], seasons: [], spent: "",
    ...initial,
    colors: initial?.colors || (initial?.color ? [initial.color] : []),
    seasons: initial?.seasons || (initial?.season ? [initial.season] : []),
  });
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState(loadDrafts);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

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
    if (dest === "wishlist") onSaveWish(out);
    else onSave(out);
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
      {/* Closet / Wishlist toggle + draft button — rendered INSIDE modal by AddItemModal */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {/* Toggle */}
        <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 12, padding: 3, flex: 1 }}>
          {[["closet","My Closet"],["wishlist","Wishlist"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setDest(id)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: dest === id ? "#1a1a1a" : "transparent",
              color: dest === id ? "#fff" : "#aaa",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
              transition: "all 0.15s"
            }}>{lbl}</button>
          ))}
        </div>
        {/* Draft folder button */}
        <button onClick={() => { refreshDrafts(); setShowDrafts(true); }} style={{
          width: 38, height: 38, borderRadius: 10, background: "#f5f2ed", border: "none",
          cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, position: "relative"
        }}>
          <SvgBox size={16} color="#888" />
          {drafts.length > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#e05588", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{drafts.length}</span>}
        </button>
      </div>

      {/* Photo */}
      <ImageUploadField value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />

      {/* Wishlist-only: product link */}
      {dest === "wishlist" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Product Link</label>
          <input style={{ ...inputStyle, width: "100%" }} value={form.link || ""} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://zara.com/..." />
        </div>
      )}

      {/* Core fields */}
      <Input label="Name" value={form.name} onChange={set("name")} placeholder="e.g. White linen shirt" />
      <Input label="Brand" value={form.brand} onChange={set("brand")} placeholder="e.g. Zara" />
      {dest === "wishlist" && <Input label="Store" value={form.store || ""} onChange={e => setForm(f => ({ ...f, store: e.target.value }))} placeholder="e.g. Zara, ASOS, Amazon" />}

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><SelectField label="Category" options={CATEGORIES.slice(1)} value={form.category} onChange={set("category")} /></div>
        <div style={{ flex: 1 }}><SelectField label="Size" options={SIZES} value={form.size} onChange={set("size")} /></div>
      </div>

      {/* Multi-select Color + Season */}
      <MultiPills label="Color" options={COLORS} selected={form.colors || []} onChange={v => setForm(f => ({ ...f, colors: v }))} />
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

      {/* Notes */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notes</label>
        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 56 }} value={form.notes || ""} onChange={set("notes")} placeholder="Care instructions, fit notes…" />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={saveDraft} style={{
          padding: "10px 14px", background: "#f5f2ed", border: "none", borderRadius: 12,
          cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#888",
          fontFamily: "'DM Sans', sans-serif"
        }}>Save Draft</button>
        <button onClick={onCancel} style={{
          padding: "10px 14px", background: "none", border: "none",
          cursor: "pointer", color: "#bbb", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600
        }}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} style={{
          flex: 1, padding: "10px 0", background: "#1a1a1a", color: "#fff",
          border: "none", borderRadius: 12, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700
        }}>{dest === "wishlist" ? "Save to Wishlist" : (editMode ? "Save Changes" : "Add to Closet")}</button>
      </div>
    </div>
  );
}

// Clean minimal card: photo dominant (3:4), name + brand + chips below
function ItemCard({ item, onClick, onEdit }) {
  return (
    <div className="item-card" onClick={onClick} style={{ position: "relative", cursor: "pointer", overflow: "hidden", borderRadius: 16 }}>
      <div style={{ width: "100%", aspectRatio: "1/1", background: "#f5f2ed", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 6 }} />
          : <HangerIcon size={36} color="#ddd" />
        }
        <button
          onClick={e => { e.stopPropagation(); onEdit && onEdit(); }}
          style={{
            position: "absolute", bottom: 7, right: 7,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)", border: "none",
            cursor: "pointer", fontSize: 13, color: "#555",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
          }}
        >&#9998;</button>
      </div>
    </div>
  );
}

// ── Item Detail Popup ────────────────────────────────────────────────────────
function ItemDetailPopup({ item, onClose, onEdit, onDelete, onWorn, onCreateOutfit, onListForSale, outfits, lookbooks }) {
  const priceNum = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
  const spentNum = parseFloat((item.spent || "").replace(/[^0-9.]/g, "")) || 0;
  const worn = item.wornCount || 0;
  const cpw = worn > 0 && (spentNum || priceNum) > 0 ? ((spentNum || priceNum) / worn).toFixed(2) : null;
  const featuredOutfits = (outfits || []).filter(o => (o.layers || o.itemIds || []).includes(item.id));
  const featuredOutfitIds = new Set(featuredOutfits.map(o => o.id));
  const featuredLookbookCount = (lookbooks || []).filter(lb => (lb.outfitIds || []).some(oid => featuredOutfitIds.has(oid))).length;

  const chip = (label, bg = "#f5f3ef", color = "#666") => (
    <span style={{ background: bg, color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{label}</span>
  );

  return (
    <div className="item-detail-overlay fade-in" onClick={onClose}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 860,
        maxHeight: "90vh", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "row"
      }}>

        {/* ── LEFT: image + info ── */}
        <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Image */}
          <div style={{ width: "100%", aspectRatio: "3/4", background: "#f5f2ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {item.image
              ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 8 }} />
              : <HangerIcon size={56} color="#ddd" />
            }

          </div>

          {/* Info */}
          <div style={{ padding: "18px 20px 22px", flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.01em", marginBottom: 2 }}>{item.name}</h2>
            {item.brand && <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>{item.brand}</div>}

            {/* Tags */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
              {item.category && chip(item.category)}
              {item.size && chip(item.size)}
              {(item.colors?.length ? item.colors : item.color ? [item.color] : []).map(c => chip(c))}
              {(item.seasons?.length ? item.seasons : item.season ? [item.season] : []).map(s => chip(s, "#f0fbff", "#2bafd4"))}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Price", value: priceNum > 0 ? `$${priceNum.toFixed(0)}` : "—" },
                { label: "Spent", value: spentNum > 0 ? `$${spentNum.toFixed(0)}` : "—" },
                { label: "Worn", value: worn > 0 ? `${worn}×` : "—" },
                { label: "Cost/wear", value: cpw ? `$${cpw}` : "—" },
                { label: "Outfits", value: featuredOutfits.length },
                { label: "Lookbooks", value: featuredLookbookCount },
              ].map(s => (
                <div key={s.label} style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={onWorn} style={{
              width: "100%", padding: "10px", marginBottom: 10,
              background: "#f0faf4", border: "1.5px solid #b6e8c8", borderRadius: 12,
              cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#2d6a3f",
              fontFamily: "'DM Sans', sans-serif"
            }}><SvgHanger size={13} color="currentColor" style={{marginRight:4}} />Mark as Worn{worn > 0 ? ` (${worn}×)` : ""}</button>

            {item.purchaseDate && (
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10, textAlign: "center" }}>
                Purchased {new Date(item.purchaseDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            )}
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#2bafd4", fontWeight: 700, textAlign: "center", marginBottom: 10, textDecoration: "none" }}>View Product</a>
            )}
            {item.notes && (
              <div style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#555", lineHeight: 1.6 }}>{item.notes}</div>
            )}
          </div>
        </div>

        {/* ── RIGHT: outfits grid ── */}
        <div style={{ flex: 1, borderLeft: "1px solid #e8e4dc", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e4dc", flexShrink: 0, gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>Featured In</div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{featuredOutfits.length} outfit{featuredOutfits.length !== 1 ? "s" : ""}</div>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {/* Worn badge */}
              {worn > 0 && (
                <div style={{ padding: "6px 12px", background: "#f0faf4", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#2d6a3f" }}><SvgHanger size={12} color="#2d6a3f" style={{marginRight:3}} />{worn}×</div>
              )}
              {/* Edit */}
              <button onClick={onEdit} title="Edit" style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", fontSize: 15, color: "#444", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              {/* Delete */}
              <button onClick={onDelete} title="Delete" style={{ width: 34, height: 34, borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", fontSize: 15, color: "#e05555", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
              {/* List for Sale */}
              <button onClick={onListForSale} title="List for Sale" style={{ padding: "6px 12px", background: "#fff8ee", border: "1.5px solid #f5c842", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#a07000", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}><SvgTag size={12} color="currentColor" style={{marginRight:4}} />List for Sale</button>
              {/* Create Outfit */}
              <button onClick={onCreateOutfit} style={{
                padding: "8px 14px", background: "#1a1a1a", border: "none", borderRadius: 12,
                cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff",
                fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6
              }}><SvgSparkle size={13} color="currentColor" style={{marginRight:4}} />Create Outfit</button>
              {/* Close */}
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", fontSize: 15, color: "#888", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          </div>

          {/* Outfit grid */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {featuredOutfits.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", gap: 10, paddingTop: 40 }}>
                <div><SvgSparkle size={40} color="#ddd" /></div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Not in any outfits yet</div>
                <div style={{ fontSize: 12 }}>Click Create Outfit to style it</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {featuredOutfits.map(outfit => (
                  <div key={outfit.id} style={{ borderRadius: 14, overflow: "hidden", background: "#f5f2ed", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {outfit.previewImage
                      ? <img src={outfit.previewImage} alt={outfit.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <HangerIcon size={28} color="#ddd" />
                    }
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "18px 8px 8px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outfit.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
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
function OutfitDetailPopup({ outfit, allItems, lookbooks, onClose, onEdit, onDelete, onMarkWorn, onDuplicate, onAddToLookbook, onGoToLookbook, onItemClick }) {
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
  const nonMemberLookbooks = lookbooks.filter(lb => !(lb.outfitIds || []).includes(outfit.id));
  const totalValue = outfitItems.reduce((sum, item) => sum + (parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const totalSpent = outfitItems.reduce((sum, item) => sum + (parseFloat((item.spent || "").replace(/[^0-9.]/g, "")) || 0), 0);

  return (
    <div className="item-detail-overlay fade-in" onClick={onClose}>
      <div className="fade-up" onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 860,
        maxHeight: "90vh", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "row"
      }}>

        {/* ── LEFT: preview + info ── */}
        <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
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
                    }}><SvgGrid size={12} color="currentColor" style={{marginRight:4}} />{lb.name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to lookbook */}
            {nonMemberLookbooks.length > 0 && (
              addingToLb ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={selectedLb} onChange={e => setSelectedLb(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
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
        </div>

        {/* ── RIGHT: tabbed pieces / lookbooks ── */}
        <div style={{ flex: 1, borderLeft: "1px solid #e8e4dc", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e4dc", flexShrink: 0, gap: 8, flexWrap: "wrap" }}>
            {/* Tab toggle */}
            <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2 }}>
              {[["pieces", `Pieces (${outfitItems.length})`], ["lookbooks", `Lookbooks (${memberLookbooks.length})`]].map(([v, lbl]) => (
                <button key={v} onClick={() => setRightTab(v)} style={{
                  padding: "6px 14px", border: "none", borderRadius: 8, cursor: "pointer",
                  background: rightTab === v ? "#fff" : "transparent",
                  color: rightTab === v ? "#1a1a1a" : "#aaa",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                  boxShadow: rightTab === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s"
                }}>{lbl}</button>
              ))}
            </div>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={handleMarkWorn} style={{ padding: "6px 12px", borderRadius: 10, background: wornFlash ? "#2d6a3f" : "#f0faf4", border: "1.5px solid #b6e8c8", cursor: "pointer", fontSize: 12, fontWeight: 700, color: wornFlash ? "#fff" : "#2d6a3f", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}><SvgHanger size={12} color="currentColor" style={{marginRight:4}} />{wornFlash ? "Marked!" : "Worn"}</button>
              <button onClick={onDuplicate} style={{ padding: "6px 12px", borderRadius: 10, background: "#f5f2ed", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}><SvgCopy size={12} color="currentColor" style={{marginRight:4}} />Copy</button>
              {outfit.previewImage && <button onClick={exportPreview} style={{ padding: "6px 12px", borderRadius: 10, background: exported ? "#f0faf4" : "#f5f3ef", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: exported ? "#2d6a3f" : "#666", fontFamily: "'DM Sans', sans-serif" }}>{exported ? <><SvgCheck size={12} color="currentColor" style={{marginRight:3}} />Saved</> : <><SvgDownload size={12} color="currentColor" style={{marginRight:3}} />Export</>}</button>}
              <button onClick={onEdit} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f2ed", border: "none", cursor: "pointer", fontSize: 14, color: "#444", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button onClick={onDelete} style={{ width: 32, height: 32, borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", color: "#e05555", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgTrash size={14} color="#e05555" /></button>
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
                    <div key={item.id} onClick={() => onItemClick && onItemClick(item)} style={{ borderRadius: 14, overflow: "hidden", background: "#f5f2ed", cursor: "pointer", border: "1.5px solid transparent", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#d0c8bc"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
                    >
                      <div style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} /> : <HangerIcon size={24} color="#ddd" />}
                      </div>
                      <div style={{ padding: "6px 8px 8px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                        {item.brand && <div style={{ fontSize: 10, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.brand}</div>}
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
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Lookbook Viewer ──────────────────────────────────────────────────────────
function LookbookViewer({ lookbook, outfits, allItems, onClose, onUpdate, onOpenOutfit }) {
  const [view, setView] = useState("slide");
  const [idx, setIdx] = useState(0);
  const [slideDir, setSlideDir] = useState("left");
  const [notes, setNotes] = useState(lookbook.notes || "");
  const [lbName, setLbName] = useState(lookbook.name);
  const [editingName, setEditingName] = useState(false);
  const [lookIds, setLookIds] = useState(lookbook.outfitIds || []);
  const [lookMeta, setLookMeta] = useState(lookbook.lookMeta || {});
  const [reordering, setReordering] = useState(false);
  const [addingOutfit, setAddingOutfit] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showPackList, setShowPackList] = useState(false);

  const looks = lookIds.map(id => outfits.find(o => o.id === id)).filter(Boolean);
  const availableToAdd = outfits.filter(o => !lookIds.includes(o.id));

  const fmtDate = (d) => {
    if (!d) return null;
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const dateStr = (lookbook.dateStart || lookbook.dateEnd)
    ? [fmtDate(lookbook.dateStart), fmtDate(lookbook.dateEnd)].filter(Boolean).join(" – ")
    : null;

  const totalVal = looks.flatMap(o => (o.layers || o.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean))
    .reduce((s, it) => s + (parseFloat((it.price || "").replace(/[^0-9.]/g, "")) || 0), 0);

  const go = (dir) => {
    setSlideDir(dir === 1 ? "left" : "right");
    setIdx(i => Math.max(0, Math.min(looks.length - 1, i + dir)));
  };

  const moveLook = (from, to) => {
    const next = [...lookIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLookIds(next);
  };

  const removeLook = (outfitId) => {
    const next = lookIds.filter(id => id !== outfitId);
    setLookIds(next);
    setIdx(i => Math.min(i, Math.max(0, next.length - 1)));
    onUpdate({ ...lookbook, name: lbName, notes, outfitIds: next, lookMeta });
  };

  const addLook = (outfitId) => {
    const next = [...lookIds, outfitId];
    setLookIds(next);
    setAddingOutfit(false);
    onUpdate({ ...lookbook, name: lbName, notes, outfitIds: next, lookMeta });
  };

  const updateMeta = (outfitId, field, value) => {
    setLookMeta(m => ({ ...m, [outfitId]: { ...(m[outfitId] || {}), [field]: value } }));
  };

  const save = () => onUpdate({ ...lookbook, name: lbName, notes, outfitIds: lookIds, lookMeta });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2200);
    });
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script"); s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const handleExport = async () => {
    setExportingPdf(true);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const pdf = new window.jspdf.jsPDF({ orientation: "portrait", unit: "px", format: [400, 520] });
      for (let i = 0; i < looks.length; i++) {
        const look = looks[i];
        if (i > 0) pdf.addPage();
        pdf.setFontSize(16); pdf.setFont("helvetica", "bold");
        pdf.text(look.name || `Look ${i + 1}`, 20, 36);
        if (look.previewImage) {
          pdf.addImage(look.previewImage, "JPEG", 20, 50, 360, 420);
        }
      }
      pdf.save(`${lbName}.pdf`);
    } catch(e) {
      // fallback: open images in new tab
      const imgs = looks.filter(l => l.previewImage).map(l => `<img src="${l.previewImage}" style="max-width:100%;margin:10px 0;display:block"/>`).join("");
      const w = window.open("", "_blank");
      w.document.write(`<html><body style="background:#111;padding:20px">${imgs}</body></html>`);
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
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="lookbook-overlay">
      <style>{globalStyles}</style>

      {/* Share toast */}
      {shareToast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", padding: "10px 22px", borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
          Link copied to clipboard!
        </div>
      )}

      <div className="lookbook-topbar">
        <button onClick={() => { save(); onClose(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
          <SvgArrowL size={18} color="#aaa" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
          {editingName
            ? <input autoFocus value={lbName} onChange={e => setLbName(e.target.value)} onBlur={() => { setEditingName(false); save(); }}
                style={{ fontSize: 16, fontWeight: 700, border: "none", borderBottom: "2px solid #1a1a1a", outline: "none", fontFamily: "'DM Sans', sans-serif", background: "transparent", textAlign: "center", minWidth: 120 }} />
            : <span onClick={() => setEditingName(true)} style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", cursor: "pointer" }}>{lbName}</span>
          }
          <span style={{ fontSize: 12, color: "#aaa" }}>{looks.length} look{looks.length !== 1 ? "s" : ""}</span>
          {dateStr && <span style={{ fontSize: 11, color: "#b0a898", fontWeight: 600, background: "#f5f2ed", borderRadius: 8, padding: "2px 8px" }}><SvgCalendar size={11} color="#b0a898" style={{marginRight:3,verticalAlign:"middle"}} />{dateStr}</span>}
          {totalVal > 0 && <span style={{ fontSize: 11, color: "#7c6fe0", fontWeight: 700, background: "#f5f0ff", borderRadius: 8, padding: "2px 8px" }}>${totalVal.toFixed(0)}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={handleShare} title="Copy link" style={{ ...btnBase, padding: "6px 10px", background: "#f5f2ed", fontSize: 13, color: "#666" }}>Share</button>
          <button onClick={handleExport} disabled={exportingPdf} title="Export as PDF" style={{ ...btnBase, padding: "6px 10px", background: "#f5f2ed", fontSize: 13, color: "#666" }}>{exportingPdf ? "…" : <><SvgDownload size={13} color="#666" style={{marginRight:4}} />Export</>}</button>
          <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2 }}>
            {[{ id: "slide", icon: "⊡" }, { id: "grid", icon: "⊞" }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                ...btnBase, padding: "5px 12px", borderRadius: 8, fontSize: 16,
                background: view === v.id ? "#fff" : "transparent",
                color: view === v.id ? "#1a1a1a" : "#aaa",
                boxShadow: view === v.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
              }}>{v.icon}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {looks.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ccc", gap: 12 }}>
              <div><SvgGrid size={36} color="#ddd" /></div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No looks yet</div>
              <button onClick={() => setAddingOutfit(true)} style={{ ...btnBase, padding: "10px 22px", background: "#1a1a1a", color: "#fff", fontSize: 13 }}>+ Add Outfits</button>
            </div>
          ) : view === "slide" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ textAlign: "center", padding: "12px 0 4px", fontSize: 13, fontWeight: 700, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span>{currentLook?.name || `Look ${idx + 1}`} · {idx + 1} / {looks.length}</span>
                {currentLook && <button onClick={() => onOpenOutfit && onOpenOutfit(currentLook)} style={{ ...btnBase, fontSize: 11, padding: "3px 10px", background: "#f5f2ed", color: "#666", border: "none" }}>View Details</button>}
                {currentLook && <button onClick={() => removeLook(currentLook.id)} style={{ ...btnBase, fontSize: 11, padding: "3px 10px", background: "#fef2f2", color: "#e05555", border: "none" }}>Remove</button>}
              </div>
              {/* Preview: previewImage first, canvas fallback */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 24px 0", overflow: "hidden" }}>
                <div className={`slide-enter-${slideDir}`} key={idx} style={{ position: "relative", width: "100%", maxWidth: 480, height: 380, background: "#fff", borderRadius: 20, border: "1.5px solid #e8e4dc", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {currentLook?.previewImage ? (
                    <img src={currentLook.previewImage} alt={currentLook.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : canvasItems.length > 0 ? (
                    canvasItems.map(({ item, pos }, i) => (
                      <div key={item.id} style={{ position: "absolute", left: pos.x, top: pos.y, width: pos.w, zIndex: i + 1, pointerEvents: "none" }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: pos.w, height: pos.h, objectFit: "contain", display: "block" }} />
                          : <div style={{ width: pos.w, height: pos.h, background: "#f0ece4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><HangerIcon size={28} color="#ccc" /></div>
                        }
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>No preview available</div>
                  )}
                </div>
              </div>

              {/* Per-look meta */}
              {currentLook && (
                <div style={{ padding: "12px 24px 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select value={lookMeta[currentLook.id]?.day || ""} onChange={e => updateMeta(currentLook.id, "day", e.target.value)} onBlur={save}
                    style={{ flex: "1 1 130px", padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#1a1a1a", background: "#fff" }}>
                    <option value="">Day of week…</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" value={lookMeta[currentLook.id]?.occasion || ""} onChange={e => updateMeta(currentLook.id, "occasion", e.target.value)} onBlur={save}
                    placeholder="Occasion (e.g. Wedding)"
                    style={{ flex: "2 1 160px", padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
                  <input type="date" value={lookMeta[currentLook.id]?.date || ""} onChange={e => updateMeta(currentLook.id, "date", e.target.value)} onBlur={save}
                    style={{ flex: "1 1 140px", padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
                </div>
              )}

              {/* Nav */}
              <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "8px 0 16px" }}>
                <button onClick={() => go(-1)} disabled={idx === 0} style={{ ...btnBase, width: 40, height: 40, borderRadius: "50%", background: idx === 0 ? "#f0ece4" : "#1a1a1a", color: idx === 0 ? "#ccc" : "#fff", fontSize: 18, cursor: idx === 0 ? "default" : "pointer" }}><SvgArrowL size={18} color="currentColor" /></button>
                <button onClick={() => go(1)} disabled={idx === looks.length - 1} style={{ ...btnBase, width: 40, height: 40, borderRadius: "50%", background: idx === looks.length - 1 ? "#f0ece4" : "#1a1a1a", color: idx === looks.length - 1 ? "#ccc" : "#fff", fontSize: 18, cursor: idx === looks.length - 1 ? "default" : "pointer" }}><SvgArrowR size={18} color="currentColor" /></button>
              </div>
            </div>
          ) : (
            /* Grid view */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, padding: 20, overflowY: "auto", flex: 1 }}>
              {looks.map((look, i) => {
                const items = (look.layers || look.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean);
                const meta = lookMeta[look.id] || {};
                return (
                  <div key={look.id} style={{ cursor: "pointer", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e8e4dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", position: "relative" }}>
                    <div onClick={() => { setIdx(i); setView("slide"); }}>
                      {look.previewImage ? (
                        <div style={{ height: 140, background: `url(${look.previewImage}) center/contain no-repeat #f5f3ef` }} />
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: items.length >= 2 ? "1fr 1fr" : "1fr", height: 140 }}>
                          {items.slice(0, 4).map(item => (
                            <div key={item.id} style={{ background: item.image ? `url(${item.image}) center/contain no-repeat #f5f3ef` : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {!item.image && <HangerIcon size={20} color="#ccc" />}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ padding: "8px 10px 10px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{look.name || `Look ${i + 1}`}</div>
                        {(meta.day || meta.occasion) && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{[meta.day, meta.occasion].filter(Boolean).join(" · ")}</div>}
                        <div style={{ fontSize: 10, color: "#ccc", marginTop: 2 }}>{items.length} piece{items.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    {/* Actions overlay */}
                    <div style={{ display: "flex", gap: 4, padding: "0 10px 10px" }}>
                      <button onClick={() => onOpenOutfit && onOpenOutfit(look)} style={{ ...btnBase, flex: 1, fontSize: 10, padding: "4px 6px", background: "#f5f2ed", color: "#666", border: "none" }}>Details</button>
                      <button onClick={() => removeLook(look.id)} style={{ ...btnBase, flex: 1, fontSize: 10, padding: "4px 6px", background: "#fef2f2", color: "#e05555", border: "none" }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 260, background: "#fff", borderLeft: "1.5px solid #e8e4dc", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", flexShrink: 0 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Outfits", value: looks.length },
              { label: "Total Value", value: totalVal > 0 ? `$${totalVal.toFixed(0)}` : "—" },
            ].map(s => (
              <div key={s.label} style={{ background: "#faf9f6", borderRadius: 10, padding: "10px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pack List generator */}
          {looks.length > 0 && (
            <div>
              <button onClick={() => setShowPackList(p => !p)} style={{ width: "100%", padding: "8px 12px", background: showPackList ? "#f0faf4" : "#f5f3ef", border: showPackList ? "1.5px solid #b6e8c8" : "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: showPackList ? "#2d6a3f" : "#666", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
                <SvgLuggage size={13} color="currentColor" style={{marginRight:4}} />{showPackList ? "Hide" : "Generate"} Pack List
              </button>
              {showPackList && (() => {
                const packed = {};
                looks.forEach(look => {
                  (look.layers || look.itemIds || []).forEach(id => {
                    const item = allItems.find(i => i.id === id);
                    if (item) packed[id] = item;
                  });
                });
                const packItems = Object.values(packed);
                return (
                  <div style={{ marginTop: 8, background: "#faf9f6", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{packItems.length} unique piece{packItems.length !== 1 ? "s" : ""}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {packItems.map(item => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, border: "1.5px solid #ccc", flexShrink: 0 }} />
                          <div style={{ fontSize: 12, color: "#444", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                          {item.category && <div style={{ fontSize: 10, color: "#bbb", flexShrink: 0 }}>{item.category}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {/* Notes */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Styling Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={save}
              placeholder="Add notes…"
              style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontSize: 12 }} />
          </div>

          {/* Add outfit */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Looks</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setAddingOutfit(a => !a)} style={{ fontSize: 11, fontWeight: 700, color: addingOutfit ? "#2d6a3f" : "#888", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  {addingOutfit ? "Cancel" : "+ Add"}
                </button>
                <button onClick={() => { setReordering(r => !r); if (reordering) save(); }} style={{ fontSize: 11, fontWeight: 700, color: reordering ? "#2d6a3f" : "#888", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  {reordering ? "Done" : "Reorder"}
                </button>
              </div>
            </div>

            {/* Add outfit picker */}
            {addingOutfit && (
              <div style={{ marginBottom: 10, maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
                {availableToAdd.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#aaa", padding: "8px 0" }}>All outfits already added</div>
                ) : availableToAdd.map(o => (
                  <button key={o.id} onClick={() => addLook(o.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                    background: "#faf9f6", border: "1.5px solid #e8e4dc", borderRadius: 10,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", width: "100%"
                  }}>
                    {o.previewImage && <img src={o.previewImage} alt="" style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6, background: "#f0ece4" }} />}
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#2d6a3f", fontWeight: 700 }}>+ Add</span>
                  </button>
                ))}
              </div>
            )}

            {/* Looks list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {looks.map((look, i) => {
                const meta = lookMeta[look.id] || {};
                return (
                  <div key={look.id} onClick={() => { setIdx(i); setView("slide"); }} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                    background: idx === i ? "#f0faf4" : "#fafaf8", borderRadius: 10,
                    border: idx === i ? "1.5px solid #3aaa6e" : "1.5px solid #e8e4dc", cursor: "pointer"
                  }}>
                    {reordering && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={e => { e.stopPropagation(); if (i > 0) moveLook(i, i - 1); }} disabled={i === 0}
                          style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", color: i === 0 ? "#ccc" : "#888", fontSize: 10, padding: 0 }}>▲</button>
                        <button onClick={e => { e.stopPropagation(); if (i < looks.length - 1) moveLook(i, i + 1); }} disabled={i === looks.length - 1}
                          style={{ background: "none", border: "none", cursor: i === looks.length - 1 ? "default" : "pointer", color: i === looks.length - 1 ? "#ccc" : "#888", fontSize: 10, padding: 0 }}>▼</button>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{look.name || `Look ${i + 1}`}</div>
                      {(meta.day || meta.occasion) && <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{[meta.day, meta.occasion].filter(Boolean).join(" · ")}</div>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeLook(look.id); }} style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 12, padding: "0 2px", flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#e05555"} onMouseLeave={e => e.currentTarget.style.color = "#ddd"}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BoardSizer — measures available space and renders a 4:5 white board ──────
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
function OutfitBuilder({ itemsDb, wishlistDb, onSave, onClose, initial, seedItem }) {
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
  const [panelTab, setPanelTab] = useState("closet");
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
  const [lockedIds, setLockedIds] = useState(new Set());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const history = useRef([]);
  const historyIdx = useRef(-1);
  const dragging = useRef(null);
  const resizing = useRef(null);
  const canvasRef = useRef(null);
  const boardRef = useRef(null);

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

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const activeDb = panelTab === "closet" ? itemsDb : wishlistDb;
  const allItems = [...itemsDb.rows, ...wishlistDb.rows];
  const activeFilterCount = (filterCat !== "All" ? 1 : 0) + (filterColor ? 1 : 0) + (filterSeason ? 1 : 0);

  const panelItems = activeDb.rows.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.brand || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || i.category === filterCat;
    const matchColor = !filterColor || i.color === filterColor;
    const matchSeason = !filterSeason || i.season === filterSeason;
    return matchSearch && matchCat && matchColor && matchSeason;
  });

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

  const moveLayerUp = (id) => setLayers(ls => { const i = ls.indexOf(id); if (i === ls.length - 1) return ls; const n = [...ls]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; pushHistory(n, positions); return n; });
  const moveLayerDown = (id) => setLayers(ls => { const i = ls.indexOf(id); if (i === 0) return ls; const n = [...ls]; [n[i], n[i - 1]] = [n[i - 1], n[i]]; pushHistory(n, positions); return n; });
  const bringToFront = (id) => setLayers(ls => [...ls.filter(x => x !== id), id]);

  const onMouseDown = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setActiveId(id);
    if (lockedIds.has(id)) return; // locked — select only, no drag
    bringToFront(id);
    const board = boardRef.current;
    const rect = board.getBoundingClientRect();
    const startX = e.clientX - rect.left - positions[id].x;
    const startY = e.clientY - rect.top - positions[id].y;
    dragging.current = { id, startX, startY };
    const onMove = (ev) => {
      if (!dragging.current) return;
      const r = board.getBoundingClientRect();
      setPositions(p => ({ ...p, [dragging.current.id]: { ...p[dragging.current.id], x: ev.clientX - r.left - dragging.current.startX, y: ev.clientY - r.top - dragging.current.startY } }));
    };
    const onUp = () => {
      if (dragging.current) pushHistory(layers, positions);
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
        img.onload = () => { imgs[idx] = { img, pos }; loaded++; if (loaded === itemsToDraw.length) finish(); };
        img.onerror = () => { loaded++; if (loaded === itemsToDraw.length) finish(); };
        img.src = item.image;
      });

      function finish() {
        imgs.forEach(entry => { if (entry) ctx.drawImage(entry.img, entry.pos.x, entry.pos.y, entry.pos.w, entry.pos.h); });
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      }
    });
  };

  const handleSave = async () => {
    if (!name || layers.length === 0) return;
    const previewImage = await capturePreview();
    try { localStorage.removeItem("wardrobe_builder_draft"); } catch(e) {}
    onSave({ name, notes, tags, seasons, itemIds: layers, layers, positions, previewImage });
  };

  const btnBase = { border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 10, transition: "all 0.15s" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 };
  const fieldStyle = { width: "100%", padding: "8px 12px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a1a", background: "#fff" };

  return (
    <div className="builder-overlay">
      <style>{globalStyles}</style>
      <div className="builder-topbar">
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#888", lineHeight: 1, padding: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={undo} disabled={!canUndo} title="Undo" style={{ ...btnBase, padding: "6px 10px", background: canUndo ? "#f5f3ef" : "transparent", color: canUndo ? "#444" : "#ccc", fontSize: 13, cursor: canUndo ? "pointer" : "default" }}>↩</button>
          <button onClick={redo} disabled={!canRedo} title="Redo" style={{ ...btnBase, padding: "6px 10px", background: canRedo ? "#f5f3ef" : "transparent", color: canRedo ? "#444" : "#ccc", fontSize: 13, cursor: canRedo ? "pointer" : "default" }}>↪</button>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginLeft: 4 }}>Build a Look</span>
        </div>
        <button onClick={handleSave} disabled={!name || layers.length === 0} style={{
          ...btnBase, padding: "8px 20px", fontSize: 13,
          background: (!name || layers.length === 0) ? "#ccc" : "#2d6a3f",
          color: "#fff", cursor: (!name || layers.length === 0) ? "not-allowed" : "pointer"
        }}>Save Look</button>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Spring", "Summer", "Fall", "Winter"].map(s => (
                <button key={s} onClick={() => setSeasons(ss => ss.includes(s) ? ss.filter(x => x !== s) : [...ss, s])} style={{
                  ...btnBase, padding: "5px 12px", borderRadius: 16, fontSize: 12,
                  border: seasons.includes(s) ? "1.5px solid #2bafd4" : "1.5px solid #e8e4dc",
                  background: seasons.includes(s) ? "#f0fbff" : "#fafaf8",
                  color: seasons.includes(s) ? "#2bafd4" : "#aaa"
                }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
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
        </div>

        {/* CANVAS — centered white 4:5 board */}
        <div className="builder-canvas" ref={canvasRef} onClick={() => setActiveId(null)}>
          <BoardSizer boardRef={boardRef}>
            {(boardW, boardH) => (
              <div
                ref={boardRef}
                className="outfit-board"
                style={{ width: boardW, height: boardH }}
                onClick={e => e.stopPropagation()}
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
                  const isTop = zIndex === layers.length - 1;
                  const isBottom = zIndex === 0;
                  return (
                    <div key={id} className="canvas-item" style={{ left: x, top: y, width: w, zIndex: zIndex + 1 }}
                      onMouseDown={e => onMouseDown(e, id)} onClick={e => e.stopPropagation()}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: w, height: h, objectFit: "contain", borderRadius: 4, display: "block", pointerEvents: "none", outline: isActive ? (lockedIds.has(id) ? "2px solid #f0c040" : "2px solid #2d6a3f") : "none", outlineOffset: 2 }} />
                          : <div style={{ width: w, height: h, background: "#f0ece4", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", outline: isActive ? "2px solid #2d6a3f" : "none" }}><HangerIcon size={32} color="#ccc" /></div>
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
                          position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
                          display: "flex", gap: 1, background: "#1a1a1a", borderRadius: 20, padding: "4px 6px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.3)", whiteSpace: "nowrap", zIndex: 9999
                        }}>
                          {!lockedIds.has(id) && [{ label: "Fwd", icon: <SvgArrowUp size={11} color="#555" />, action: () => moveLayerUp(id), disabled: isTop }, { label: "Back", icon: <SvgArrowDn size={11} color="#555" />, action: () => moveLayerDown(id), disabled: isBottom }].map(btn => (
                            <button key={btn.label} onClick={btn.action} disabled={btn.disabled} style={{
                              background: "none", border: "none", color: btn.disabled ? "#555" : "#fff",
                              cursor: btn.disabled ? "default" : "pointer", padding: "3px 9px",
                              fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 14
                            }}>{btn.label}</button>
                          ))}
                          <div style={{ width: 1, background: "#333", margin: "3px 1px" }} />
                          <button onClick={() => toggleLock(id)} title={lockedIds.has(id) ? "Unlock" : "Lock"} style={{ background: "none", border: "none", color: lockedIds.has(id) ? "#f0c040" : "#aaa", cursor: "pointer", padding: "3px 8px", fontSize: 13, borderRadius: 14 }}>{lockedIds.has(id) ? <SvgLock size={13} color="#f0c040" /> : <SvgUnlock size={13} color="#aaa" />}</button>
                          {!lockedIds.has(id) && <><div style={{ width: 1, background: "#333", margin: "3px 1px" }} /><button onClick={() => toggleItem(id)} style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", padding: "3px 8px", fontSize: 13, borderRadius: 14 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </BoardSizer>
        </div>

        {/* RIGHT PANEL */}
        <div className="builder-right">
          {layers.length > 0 && (
            <div style={{ borderBottom: "1.5px solid #e8e4dc", flexShrink: 0 }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Selected</div>
              <div className="selected-strip">
                {layers.map(id => {
                  const item = allItems.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="selected-thumb" onClick={() => toggleItem(id)} title="Click to remove">
                      {item.image ? <img src={item.image} alt={item.name} /> : <HangerIcon size={18} color="#ccc" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ padding: "10px 12px 8px", borderBottom: "1.5px solid #e8e4dc", flexShrink: 0 }}>
            {/* Tab toggle */}
            <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2, marginBottom: 8 }}>
              {[{ id: "closet", label: "Closet" }, { id: "wishlist", label: "Wishlist" }].map(t => (
                <button key={t.id} onClick={() => setPanelTab(t.id)} style={{
                  flex: 1, padding: "6px 0", border: "none", borderRadius: 8,
                  background: panelTab === t.id ? "#fff" : "transparent",
                  color: panelTab === t.id ? "#1a1a1a" : "#aaa",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: panelTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s"
                }}>{t.label}</button>
              ))}
            </div>

            {/* Search */}
            <input className="builder-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ marginBottom: 8 }} />

            {/* Filter toggle button */}
            <button onClick={() => setShowFilters(f => !f)} style={{
              ...btnBase, width: "100%", padding: "6px", marginBottom: showFilters ? 8 : 0,
              background: activeFilterCount > 0 ? "#f0faf4" : "#f5f3ef",
              color: activeFilterCount > 0 ? "#2d6a3f" : "#888", fontSize: 12
            }}>
              {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active` : "Filters"}
            </button>

            {showFilters && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...fieldStyle }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                </select>
                <select value={filterColor} onChange={e => setFilterColor(e.target.value)} style={{ ...fieldStyle }}>
                  <option value="">All Colors</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
                  <div className={`product-thumb${sel ? " selected" : ""}`} onClick={() => toggleItem(item.id)}>
                    {item.image && <img src={item.image} alt={item.name} />}
                    {!item.image && <HangerIcon size={28} color="#ccc" />}
                    {sel && <div className="check"><SvgCheck size={10} color="#fff" /></div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setItemPopup({ mode: "edit", item }); }} title="Edit" style={{
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

      {/* Item popup */}
      {itemPopup && (
        <div onClick={() => setItemPopup(null)} style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(3px)"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "24px 22px",
            width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>{itemPopup.mode === "add" ? `Add to ${panelTab}` : "Edit item"}</h3>
              <button onClick={() => setItemPopup(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
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
    </div>
  );
}




// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({ itemsDb, outfitsDb, lookbooksDb, onViewItem }) {
  const items = itemsDb.rows.filter(i => !i.forSale);
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [statsView, setStatsView] = useState("profile"); // "profile" | "insights"

  // Rewear suggestions
  const unworn = items.filter(i => !(i.wornCount > 0)).slice(0, 20);
  const rewear = items.filter(i => (i.wornCount || 0) > 0).sort((a,b) => (a.wornCount||0)-(b.wornCount||0)).slice(0, 12);

  // Monthly recap
  const addedThisMonth = items.filter(i => (i.purchaseDate || "").startsWith(thisMonth));
  const totalSpentThisMonth = addedThisMonth.reduce((s,i) => s + (parseFloat((i.price||"").replace(/[^0-9.]/g,""))||0), 0);

  // Color palette
  const colorCounts = {};
  items.forEach(i => {
    const c = i.color || (i.colors && i.colors[0]);
    if (c) colorCounts[c] = (colorCounts[c] || 0) + 1;
  });
  const colorEntries = Object.entries(colorCounts).sort((a,b) => b[1]-a[1]);

  // Duplicate detection: same category + similar name (first word match)
  const duplicates = [];
  const seen = {};
  items.forEach(item => {
    const key = `${item.category || ""}|${(item.name || "").split(" ")[0].toLowerCase()}`;
    if (!seen[key]) seen[key] = [];
    seen[key].push(item);
  });
  Object.values(seen).filter(g => g.length > 1).forEach(g => duplicates.push(g));

  // Monthly spend chart data (last 6 months)
  const monthlyData = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const spent = items.filter(i => (i.purchaseDate||"").startsWith(key))
      .reduce((s,i) => s + (parseFloat((i.price||"").replace(/[^0-9.]/g,""))||0), 0);
    const added = items.filter(i => (i.purchaseDate||"").startsWith(key)).length;
    monthlyData.push({ key, label, spent, added });
  }
  const maxSpent = Math.max(...monthlyData.map(m => m.spent), 1);

  // ── Style Profile data ──
  const COLOR_HEX = { Black:"#1a1a1a", White:"#f5f5f5", Grey:"#9a9a9a", Blue:"#4a7fd4", Navy:"#1e3a6e", Brown:"#7a5c3e", Tan:"#c4a882", Cream:"#f5eed8", Red:"#e05555", Pink:"#f0a0b0", Orange:"#e07e30", Yellow:"#f0c840", Green:"#4aaa6e", Purple:"#9a6fe0", Gold:"#d4a820", Silver:"#c0c0c0", Clear:"#e8f4ff" };

  const topColors = (() => {
    const counts = {};
    items.forEach(i => { const c = i.color || (i.colors&&i.colors[0]); if (c) counts[c] = (counts[c]||0) + 1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  })();

  const topCategories = (() => {
    const counts = {};
    items.forEach(i => { if (i.category && i.category !== "All") counts[i.category] = (counts[i.category]||0) + 1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  const topBrands = (() => {
    const counts = {};
    items.forEach(i => { if (i.brand) counts[i.brand] = (counts[i.brand]||0) + 1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  const topSeasons = (() => {
    const counts = {};
    items.forEach(i => (i.seasons||[i.season]).filter(Boolean).forEach(s => { counts[s] = (counts[s]||0)+1; }));
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  })();

  const topOccasions = (() => {
    const counts = {};
    items.forEach(i => (i.occasions||[i.occasion]).filter(Boolean).forEach(o => { counts[o] = (counts[o]||0)+1; }));
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  const totalValue = items.reduce((s,i) => s + (parseFloat((i.price||"").replace(/[^0-9.]/g,""))||0), 0);
  const totalWears = items.reduce((s,i) => s + (i.wornCount||0), 0);
  const mostWorn = [...items].sort((a,b)=>(b.wornCount||0)-(a.wornCount||0)).slice(0,5);
  const mostValuable = [...items].sort((a,b)=>(parseFloat((b.price||"").replace(/[^0-9.]/g,""))||0)-(parseFloat((a.price||"").replace(/[^0-9.]/g,""))||0)).slice(0,3);

  // Style archetype based on top occasion
  const ARCHETYPES = {
    "WFH": { label: "The Professional", desc: "Your wardrobe leans work-ready — polished, functional, and put-together." },
    "Date Night": { label: "The Romantic", desc: "You dress with intention. Your closet is built for moments that matter." },
    "Weekend": { label: "The Casual Cool", desc: "Effortlessly stylish — your wardrobe is made for living life at ease." },
    "Sport": { label: "The Athlete", desc: "Performance meets style. You keep it active and functional." },
    "Disney": { label: "The Dreamer", desc: "Bold, fun, and full of personality — you dress for the magic." },
    "Travel": { label: "The Adventurer", desc: "Versatile and ready for anything. Your wardrobe goes where you go." },
    "Occasion": { label: "The Elegante", desc: "You always dress for the occasion — polished and event-ready." },
    "Universal": { label: "The Trendsetter", desc: "Pop culture meets personal style. You always stand out." },
  };
  const archetype = topOccasions[0] ? (ARCHETYPES[topOccasions[0][0]] || { label: "The Individualist", desc: "Your style defies categories — uniquely and completely you." }) : null;

  const SEASON_COLORS = { Spring:"#e8f5ee", Summer:"#fff8ee", Fall:"#fff2e8", Winter:"#eef0ff", "All Season":"#f5f3ef", Holiday:"#fff0f5", Disney:"#fff0fb" };
  const SEASON_TEXT = { Spring:"#3aaa6e", Summer:"#a07000", Fall:"#c06020", Winter:"#4a5fe0", "All Season":"#888", Holiday:"#e05588", Disney:"#d040b0" };
  const CAT_ICONS = {}; // emoji removed

  const maxCat = topCategories[0]?.[1] || 1;
  const maxBrand = topBrands[0]?.[1] || 1;

  const SI = ({ d }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>{d}</svg>
  );
  const IC = {
    palette: <SI d={<><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/></>} />,
    grid:    <SI d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>} />,
    tag:     <SI d={<><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>} />,
    sun:     <SI d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>} />,
    star:    <SI d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>} />,
    diamond: <SI d={<><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></>} />,
    recycle: <SI d={<><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></>} />,
    users:   <SI d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
  };

  const SECTION = ({ title, children }) => (
    <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e8e4dc", padding: "20px 22px", marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", marginBottom: 16, letterSpacing: "-0.01em" }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="fade-up">
      {/* Tab toggle */}
      <div style={{ display: "flex", gap: 24, marginBottom: 28, borderBottom: "1px solid #ece8e0", paddingBottom: 0 }}>
        {[["profile","Style Profile"],["insights","Insights"]].map(([v,l]) => (
          <button key={v} onClick={() => setStatsView(v)} style={{
            padding: "0 0 14px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: statsView === v ? 700 : 500,
            color: statsView === v ? "#1a1a1a" : "#b0a898",
            borderBottom: statsView === v ? "2px solid #1a1a1a" : "2px solid transparent",
            marginBottom: -1, transition: "all 0.15s", letterSpacing: "0.01em"
          }}>{l}</button>
        ))}
      </div>

      {/* ── STYLE PROFILE ── */}
      {statsView === "profile" && (
        <div>
          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#ccc" }}>
              <div style={{ marginBottom:12 }}><SvgSparkle size={36} color="#fff" /></div>
              <div style={{ fontSize:14, fontWeight:700 }}>Add items to your closet to see your style profile</div>
            </div>
          ) : (
            <>
              {/* Archetype hero */}
              {archetype && (
                <div style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", borderRadius: 22, padding: "28px 26px", marginBottom: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -10, right: 10, fontSize: 80, opacity: 0.06, lineHeight: 1, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#fff" }}>✦</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Style Archetype</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.01em", marginBottom: 8 }}>{archetype.label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 340 }}>{archetype.desc}</div>
                  <div style={{ display:"flex", gap:16, marginTop:20, flexWrap:"wrap" }}>
                    {[
                      { label: "Pieces", value: items.length },
                      { label: "Total Value", value: `$${totalValue.toFixed(0)}` },
                      { label: "Total Wears", value: totalWears },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color DNA */}
              {topColors.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e8e4dc", padding: "20px 22px", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", marginBottom: 14 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/></svg>Color DNA</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {topColors.map(([color, count], idx) => {
                      const hex = COLOR_HEX[color] || "#ccc";
                      const size = idx === 0 ? 56 : idx === 1 ? 48 : 40;
                      return (
                        <div key={color} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                          <div style={{ width:size, height:size, borderRadius:"50%", background:hex, border:(color==="White"||color==="Cream")?"1.5px solid #e0dbd0":"none", boxShadow:"0 3px 10px rgba(0,0,0,0.12)", transition:"transform 0.15s" }}
                            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
                            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"} />
                          <div style={{ fontSize:10, fontWeight:700, color:"#555" }}>{color}</div>
                          <div style={{ fontSize:10, color:"#bbb" }}>{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Two col: categories + brands */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                {/* Top categories */}
                <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"18px 18px" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:14 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Categories</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {topCategories.slice(0,5).map(([cat, count]) => (
                      <div key={cat}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"#444" }}>{cat}</span>
                          <span style={{ fontSize:11, color:"#aaa", fontWeight:600 }}>{count}</span>
                        </div>
                        <div style={{ height:5, background:"#f0ece4", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(count/maxCat)*100}%`, background:"#1a1a1a", borderRadius:99, transition:"width 0.4s" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top brands */}
                <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"18px 18px" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:14 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>Brands</div>
                  {topBrands.length === 0 ? (
                    <div style={{ fontSize:12, color:"#ccc", textAlign:"center", paddingTop:16 }}>No brands tagged yet</div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {topBrands.map(([brand, count]) => (
                        <div key={brand}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"#444", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:90 }}>{brand}</span>
                            <span style={{ fontSize:11, color:"#aaa", fontWeight:600 }}>{count}</span>
                          </div>
                          <div style={{ height:5, background:"#f0ece4", borderRadius:99, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${(count/maxBrand)*100}%`, background:"#7c6fe0", borderRadius:99, transition:"width 0.4s" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Seasons + Occasions */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"18px 18px" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:12 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Seasons</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {topSeasons.map(([s, count]) => (
                      <div key={s} style={{ padding:"5px 11px", background:SEASON_COLORS[s]||"#f5f3ef", borderRadius:20, fontSize:11, fontWeight:700, color:SEASON_TEXT[s]||"#888" }}>{s} <span style={{ opacity:0.6 }}>·{count}</span></div>
                    ))}
                  </div>
                </div>
                <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"18px 18px" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:12 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Occasions</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {topOccasions.length === 0 ? <div style={{ fontSize:12, color:"#ccc" }}>None tagged yet</div> : topOccasions.map(([o, count]) => (
                      <div key={o} style={{ padding:"5px 11px", background: (OCCASION_COLORS[o]||{bg:"#f5f3ef"}).bg, borderRadius:20, fontSize:11, fontWeight:700, color:(OCCASION_COLORS[o]||{color:"#888"}).color }}>{o} <span style={{ opacity:0.6 }}>·{count}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Most worn + most valuable */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"18px 18px" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:12 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Most Worn</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {mostWorn.filter(i=>i.wornCount>0).slice(0,4).map((item,idx)=>(
                      <div key={item.id} onClick={()=>onViewItem(item)} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                        <div style={{ fontSize:12, fontWeight:800, color:"#ddd", width:16, flexShrink:0 }}>#{idx+1}</div>
                        <div style={{ width:32, height:32, borderRadius:8, overflow:"hidden", background:"#f5f3ef", flexShrink:0 }}>
                          {item.image ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <HangerIcon size={14} color="#ddd" />}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                          <div style={{ fontSize:10, color:"#aaa" }}>{item.wornCount}× worn</div>
                        </div>
                      </div>
                    ))}
                    {mostWorn.filter(i=>i.wornCount>0).length===0 && <div style={{ fontSize:12, color:"#ccc" }}>Start marking outfits as worn</div>}
                  </div>
                </div>
                <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e8e4dc", padding:"18px 18px" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", marginBottom:12 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle",display:"inline-block"}}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>Most Valuable</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {mostValuable.filter(i=>parseFloat((i.price||"").replace(/[^0-9.]/g,""))).slice(0,4).map((item,idx)=>{
                      const price = parseFloat((item.price||"").replace(/[^0-9.]/g,""));
                      return (
                        <div key={item.id} onClick={()=>onViewItem(item)} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                          <div style={{ fontSize:12, fontWeight:800, color:"#ddd", width:16, flexShrink:0 }}>#{idx+1}</div>
                          <div style={{ width:32, height:32, borderRadius:8, overflow:"hidden", background:"#f5f3ef", flexShrink:0 }}>
                            {item.image ? <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <HangerIcon size={14} color="#ddd" />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                            <div style={{ fontSize:10, color:"#aaa" }}>${price.toFixed(0)}</div>
                          </div>
                        </div>
                      );
                    })}
                    {mostValuable.filter(i=>parseFloat((i.price||"").replace(/[^0-9.]/g,""))).length===0 && <div style={{ fontSize:12, color:"#ccc" }}>Add prices to your items</div>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── INSIGHTS ── */}
      {statsView === "insights" && (
        <div>
          {/* Monthly recap */}
          <SECTION title={`${now.toLocaleDateString('en-US',{month:'long',year:'numeric'})} Recap`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {[
            { label: "Items Added", value: addedThisMonth.length, color: "#2d6a3f", bg: "#f0faf4" },
            { label: "Spent", value: totalSpentThisMonth > 0 ? `$${totalSpentThisMonth.toFixed(0)}` : "—", color: "#a07000", bg: "#fff8ee" },
            { label: "Total Items", value: items.length, color: "#1a1a1a", bg: "#fafaf8" },
            { label: "Never Worn", value: unworn.length, color: unworn.length > 10 ? "#e05555" : "#aaa", bg: "#fafaf8" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Spend bar chart */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Monthly Spend (last 6 months)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {monthlyData.map(m => (
              <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: "#aaa", fontWeight: 600 }}>{m.spent > 0 ? `$${m.spent.toFixed(0)}` : ""}</div>
                <div style={{ width: "100%", background: m.key === thisMonth ? "#2d6a3f" : "#e8f5ee", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (m.spent / maxSpent) * 56)}px`, transition: "height 0.3s" }} />
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </SECTION>

      {/* Color palette */}
      {colorEntries.length > 0 && (
        <SECTION title={<span style={{display:"inline-flex",alignItems:"center"}}>{IC.palette}Color Palette</span>}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {colorEntries.map(([color, count]) => (
              <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 48 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLOR_HEX[color] || "#ccc", border: color === "White" || color === "Cream" ? "1.5px solid #e0dbd0" : "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: "#666", textAlign: "center" }}>{color}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>{count}</div>
              </div>
            ))}
          </div>
        </SECTION>
      )}

      {/* Rewear suggestions */}
      {(unworn.length > 0 || rewear.length > 0) && (
        <SECTION title={<span style={{display:"inline-flex",alignItems:"center"}}>{IC.recycle}Rewear Suggestions</span>}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Items you haven't worn yet or worn the least</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
            {[...unworn, ...rewear].slice(0,16).map(item => (
              <div key={item.id} onClick={() => onViewItem(item)} style={{ cursor: "pointer", borderRadius: 12, overflow: "hidden", background: "#f5f2ed", border: "1.5px solid #e8e4dc" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#2d6a3f"}
                onMouseLeave={e => e.currentTarget.style.borderColor="#f0ece4"}>
                <div style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding: 4 }} /> : <HangerIcon size={20} color="#ddd" />}
                </div>
                <div style={{ padding: "4px 6px 6px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{item.wornCount || 0}× worn</div>
                </div>
              </div>
            ))}
          </div>
        </SECTION>
      )}

      {/* Duplicate detection */}
      {duplicates.length > 0 && (
        <SECTION title={<span style={{display:"inline-flex",alignItems:"center"}}>{IC.users}Possible Duplicates</span>}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Items in the same category with similar names</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {duplicates.slice(0, 6).map((group, gi) => (
              <div key={gi} style={{ background: "#faf9f6", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", marginBottom: 8, textTransform: "uppercase" }}>{group[0].category || "Item"}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {group.map(item => (
                    <div key={item.id} onClick={() => onViewItem(item)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 10px", background: "#fff", borderRadius: 10, border: "1.5px solid #e8e4dc" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor="#d0c8bc"}
                      onMouseLeave={e => e.currentTarget.style.borderColor="#f0ece4"}>
                      {item.image && <img src={item.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain", background: "#f5f2ed" }} />}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{item.name}</div>
                        {item.price && <div style={{ fontSize: 11, color: "#aaa" }}>{item.price}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SECTION>
      )}
        </div>
      )}
    </div>
  );
}


// ── Wishlist Tab ──────────────────────────────────────────────────────────────
function WishlistTab({ wishlistDb, wishlistsDb, saveWishlistsMeta, activeWishlistId, setActiveWishlistId, wlSort, setWlSort, wlSortCat, setWlSortCat, moveToCloset, onEdit }) {
  const [showNewWl, setShowNewWl] = useState(false);
  const [newWlName, setNewWlName] = useState("");
  const [newWlNotes, setNewWlNotes] = useState("");
  const [editingWlId, setEditingWlId] = useState(null);

  const priorityMeta = { high: { label: "High", bg: "#fff0f0", color: "#e05555", border: "#ffc5c5" }, medium: { label: "Medium", bg: "#fff8ee", color: "#a07000", border: "#f5c842" }, low: { label: "Low", bg: "#f5f3ef", color: "#aaa", border: "#e0dbd0" } };

  const visibleItems = wishlistDb.rows.filter(i =>
    !activeWishlistId || i.wishlistId === activeWishlistId
  );
  const sortedItems = [...visibleItems].sort((a, b) => {
    const po = { high: 0, medium: 1, low: 2 };
    if (wlSort === "priority") return (po[a.priority] ?? 1) - (po[b.priority] ?? 1);
    if (wlSort === "store") return (a.store || "").localeCompare(b.store || "");
    if (wlSort === "category") return (a.category || "").localeCompare(b.category || "");
    if (wlSort === "price") return (parseFloat((b.price||"").replace(/[^0-9.]/g,""))||0) - (parseFloat((a.price||"").replace(/[^0-9.]/g,""))||0);
    return 0;
  }).filter(i => wlSortCat === "All" || i.category === wlSortCat);

  const wlCategories = [...new Set(wishlistDb.rows.map(i => i.category).filter(Boolean))];

  return (
    <div className="fade-up">
      {/* Wishlists row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[{ id: null, name: "All Items" }, ...wishlistsDb].map(wl => (
          <button key={wl.id ?? "all"} onClick={() => setActiveWishlistId(wl.id)}
            style={{ padding: "7px 16px", borderRadius: 100, border: activeWishlistId === wl.id ? "none" : "1px solid #e0dbd2", background: activeWishlistId === wl.id ? "#1a1a1a" : "#fff", color: activeWishlistId === wl.id ? "#fff" : "#555", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            {wl.name}
            {wl.id && <span style={{ opacity: 0.5, fontSize: 10 }}>{wishlistDb.rows.filter(i => i.wishlistId === wl.id).length}</span>}
          </button>
        ))}
        <button onClick={() => setShowNewWl(v => !v)}
          style={{ padding: "7px 14px", borderRadius: 100, border: "1px dashed #c0b8b0", background: "transparent", color: "#aaa", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          + New List
        </button>
      </div>

      {/* New wishlist form */}
      {showNewWl && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ece8e0", padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>New Wishlist</div>
          <input value={newWlName} onChange={e => setNewWlName(e.target.value)} placeholder="Name (e.g. Summer Haul, Wedding)"
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #e0dbd2", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 8, outline: "none" }} />
          <textarea value={newWlNotes} onChange={e => setNewWlNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #e0dbd2", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, resize: "none", outline: "none", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => {
              if (!newWlName.trim()) return;
              const wl = { id: uid(), name: newWlName.trim(), notes: newWlNotes };
              saveWishlistsMeta([...wishlistsDb, wl]);
              setNewWlName(""); setNewWlNotes(""); setShowNewWl(false);
              setActiveWishlistId(wl.id);
            }} style={{ flex: 1, padding: "8px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Create</button>
            <button onClick={() => setShowNewWl(false)} style={{ padding: "8px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Active wishlist header */}
      {activeWishlistId && (() => {
        const wl = wishlistsDb.find(w => w.id === activeWishlistId);
        if (!wl) return null;
        if (editingWlId === wl.id) return (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ece8e0", padding: "14px 16px", marginBottom: 16 }}>
            <input value={wl.name} onChange={e => saveWishlistsMeta(wishlistsDb.map(w => w.id === wl.id ? { ...w, name: e.target.value } : w))}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 6, outline: "none", fontWeight: 700 }} />
            <textarea value={wl.notes || ""} onChange={e => saveWishlistsMeta(wishlistsDb.map(w => w.id === wl.id ? { ...w, notes: e.target.value } : w))} rows={2}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #e0dbd2", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, resize: "none", outline: "none", marginBottom: 8 }} />
            <button onClick={() => setEditingWlId(null)} style={{ padding: "6px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Done</button>
          </div>
        );
        return (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, padding: "12px 16px", background: "#fff", borderRadius: 14, border: "1px solid #ece8e0" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{wl.name}</div>
              {wl.notes && <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{wl.notes}</div>}
            </div>
            <button onClick={() => setEditingWlId(wl.id)} style={{ padding: "5px 10px", background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#666", fontFamily: "'DM Sans', sans-serif" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
            <button onClick={() => { if (window.confirm("Delete this list? Items stay in All Items.")) { saveWishlistsMeta(wishlistsDb.filter(w => w.id !== activeWishlistId)); setActiveWishlistId(null); }}} style={{ padding: "5px 10px", background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#e05555", fontFamily: "'DM Sans', sans-serif" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
          </div>
        );
      })()}

      {/* Sort + filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select value={wlSort} onChange={e => setWlSort(e.target.value)}
          style={{ padding: "7px 12px", border: "1px solid #e0dbd2", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: "#fff", color: "#555", fontWeight: 500, cursor: "pointer", paddingRight: 28 }}>
          <option value="priority">Priority</option>
          <option value="store">Store</option>
          <option value="category">Category</option>
          <option value="price">Price ↓</option>
        </select>
        {wlCategories.length > 1 && (
          <select value={wlSortCat} onChange={e => setWlSortCat(e.target.value)}
            style={{ padding: "7px 12px", border: "1px solid #e0dbd2", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 12, background: "#fff", color: "#555", fontWeight: 500, cursor: "pointer", paddingRight: 28 }}>
            <option value="All">All Categories</option>
            {wlCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#aaa", fontWeight: 500 }}>{sortedItems.length} item{sortedItems.length !== 1 ? "s" : ""}</div>
      </div>

      {sortedItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ marginBottom: 10 }}><SvgHeart size={36} color="#ddd" /></div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>{wishlistDb.rows.length === 0 ? "Your wishlist is empty" : "No items in this list"}</div>
          <div style={{ fontSize: 12, color: "#ddd", marginTop: 4 }}>{wishlistDb.rows.length === 0 ? "Tap + to save items you want" : "Add items with the + button"}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sortedItems.map((item, i) => {
            const pm = priorityMeta[item.priority] || null;
            const wl = wishlistsDb.find(w => w.id === item.wishlistId);
            return (
              <div key={item.id} className="card fade-up" style={{
                background: "#fff", borderRadius: 18, overflow: "hidden",
                border: `1px solid ${pm ? pm.border : "#ece8e0"}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: `${i * 0.04}s`, opacity: 0, display: "flex", height: 160, alignItems: "stretch"
              }}>
                <div style={{ width: 160, flexShrink: 0, alignSelf: "stretch", background: item.image ? `url(${item.image}) center/contain no-repeat #f7f5f2` : "#f7f5f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {!item.image && <SvgHeart size={26} color="#ccc" style={{ opacity: 0.15 }} />}
                </div>
                <div style={{ padding: "13px 15px", flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap", alignItems: "center" }}>
                        {item.brand && <span style={{ fontSize: 11, color: "#aaa" }}>{item.brand}</span>}
                        {item.store && <span style={{ fontSize: 11, color: "#7c6fe0", fontWeight: 600, background: "#f5f0ff", padding: "1px 7px", borderRadius: 100 }}>{item.store}</span>}
                        {item.category && <span style={{ fontSize: 11, color: "#888", background: "#f5f2ed", padding: "1px 7px", borderRadius: 100 }}>{item.category}</span>}
                        {wl && !activeWishlistId && <span style={{ fontSize: 10, color: "#b0a898", fontStyle: "italic" }}>{wl.name}</span>}
                      </div>
                    </div>
                    <select value={item.priority || ""} onChange={e => wishlistDb.update({ ...item, priority: e.target.value || undefined })}
                      style={{ padding: "5px 28px 5px 12px", border: `1px solid ${pm ? pm.border : "#e0dbd2"}`, borderRadius: 100, fontSize: 10, fontWeight: 700, color: pm ? pm.color : "#aaa", background: `${pm ? pm.bg : "#fafaf8"} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", flexShrink: 0, appearance: "none", WebkitAppearance: "none" }}>
                      <option value="">Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Med</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  {item.price && <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginTop: 6, marginBottom: 8 }}>
                    {/^\$/.test(item.price) ? item.price : `$${item.price}`}
                  </div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: item.price ? 0 : 8 }}>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer"
                        style={{ padding: "6px 14px", background: "#1a1a1a", color: "#fff", borderRadius: 100, fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        Purchase
                      </a>
                    )}
                    <button onClick={() => moveToCloset(item)} style={{ padding: "6px 12px", background: "#f0faf4", border: "none", borderRadius: 100, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#3aaa6e", fontFamily: "'DM Sans', sans-serif" }}><SvgCheck size={12} color="#3aaa6e" style={{marginRight:4}} />I bought it</button>
                    <button onClick={() => onEdit(item)} style={{ padding: "6px 10px", background: "#f5f2ed", border: "none", borderRadius: 100, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#666", fontFamily: "'DM Sans', sans-serif" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onClick={() => wishlistDb.remove(item.id)} style={{ padding: "6px 10px", background: "#fef2f2", border: "none", borderRadius: 100, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#e05555", fontFamily: "'DM Sans', sans-serif" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Seller Dashboard ──────────────────────────────────────────────────────────
const SALE_STATUSES = ["listed", "pending", "sold", "archived"];
const SALE_STATUS_META = {
  listed:   { label: "Listed",   bg: "#f0faf4", color: "#2d6a3f", border: "#b6e8c8" },
  pending:  { label: "Pending",  bg: "#fff8ee", color: "#a07000", border: "#f5c842" },
  sold:     { label: "Sold",     bg: "#f5f0ff", color: "#7c6fe0", border: "#c4b0f0" },
  archived: { label: "Archived", bg: "#f5f3ef", color: "#aaa",    border: "#e0dbd0" },
};

function SellerDashboard({ itemsDb, onViewItem }) {
  const forSaleItems = itemsDb.rows.filter(i => i.forSale);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const updateItem = (item, patch) => itemsDb.update({ ...item, ...patch });

  const moveBackToCloset = (item) => {
    itemsDb.update({ ...item, forSale: false, saleStatus: undefined, salePrice: undefined, salePlatform: undefined, saleNotes: undefined });
  };

  const markSold = (item) => updateItem(item, { saleStatus: "sold", soldDate: new Date().toISOString().slice(0, 10) });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditVals({ salePrice: item.salePrice || "", salePlatform: item.salePlatform || "", saleNotes: item.saleNotes || "", saleStatus: item.saleStatus || "listed" });
  };

  const saveEdit = (item) => {
    updateItem(item, editVals);
    setEditingId(null);
  };

  const filtered = forSaleItems.filter(i => {
    const matchStatus = statusFilter === "all" || i.saleStatus === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.brand || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const listed = forSaleItems.filter(i => i.saleStatus === "listed" || !i.saleStatus).length;
  const pending = forSaleItems.filter(i => i.saleStatus === "pending").length;
  const sold = forSaleItems.filter(i => i.saleStatus === "sold").length;
  const totalEarned = forSaleItems.filter(i => i.saleStatus === "sold")
    .reduce((s, i) => s + (parseFloat((i.salePrice || "").replace(/[^0-9.]/g, "")) || 0), 0);
  const potentialEarnings = forSaleItems.filter(i => i.saleStatus !== "sold")
    .reduce((s, i) => s + (parseFloat((i.salePrice || "").replace(/[^0-9.]/g, "")) || 0), 0);

  const PLATFORMS = ["Depop", "Poshmark", "eBay", "Mercari", "ThredUp", "Facebook", "Instagram", "Other"];

  if (forSaleItems.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 14 }}>
      <div><SvgTag size={40} color="#ddd" /></div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>No items listed for sale</div>
      <div style={{ fontSize: 13, color: "#aaa", textAlign: "center", maxWidth: 280 }}>Open any item in your closet and tap "List for Sale" to move it here</div>
    </div>
  );

  return (
    <div className="fade-up">
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Listed", value: listed, bg: "#f0faf4", color: "#2d6a3f" },
          { label: "Pending", value: pending, bg: "#fff8ee", color: "#a07000" },
          { label: "Sold", value: sold, bg: "#f5f0ff", color: "#7c6fe0" },
          { label: "Earned", value: totalEarned > 0 ? `$${totalEarned.toFixed(0)}` : "—", bg: "#f0faf4", color: "#2d6a3f" },
          { label: "Potential", value: potentialEarnings > 0 ? `$${potentialEarnings.toFixed(0)}` : "—", bg: "#fafaf8", color: "#888" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sold history chart */}
      {sold > 0 && (() => {
        const soldItems = forSaleItems.filter(i => i.saleStatus === "sold" && i.soldDate);
        const byMonth = {};
        soldItems.forEach(i => {
          const m = i.soldDate.slice(0, 7);
          if (!byMonth[m]) byMonth[m] = { count: 0, revenue: 0 };
          byMonth[m].count++;
          byMonth[m].revenue += parseFloat((i.salePrice||"").replace(/[^0-9.]/g,""))||0;
        });
        const months = Object.keys(byMonth).sort().slice(-6);
        const maxRev = Math.max(...months.map(m => byMonth[m].revenue), 1);
        return (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e8e4dc", padding: "16px 18px", marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", marginBottom: 14 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle"}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Sales History</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 70 }}>
              {months.map(m => {
                const d = new Date(m + "-01T00:00:00");
                const label = d.toLocaleDateString("en-US", { month: "short" });
                return (
                  <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ fontSize: 9, color: "#7c6fe0", fontWeight: 700 }}>${byMonth[m].revenue.toFixed(0)}</div>
                    <div style={{ width: "100%", background: "#7c6fe0", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (byMonth[m].revenue / maxRev) * 44)}px` }} />
                    <div style={{ fontSize: 9, color: "#aaa", fontWeight: 600 }}>{label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: "1px solid #e8e4dc" }}>
              <div><span style={{ fontSize: 16, fontWeight: 800, color: "#7c6fe0" }}>${totalEarned.toFixed(0)}</span><span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>total earned</span></div>
              <div><span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>{sold}</span><span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>items sold</span></div>
            </div>
          </div>
        );
      })()}
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…"
          style={{ flex: "1 1 160px", padding: "8px 14px", border: "1.5px solid #e8e4dc", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", background: "#faf9f6" }} />
        <div style={{ display: "flex", background: "#f5f2ed", borderRadius: 10, padding: 3, gap: 2 }}>
          {[["all", "All"], ...SALE_STATUSES.map(s => [s, SALE_STATUS_META[s].label])].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={{
              padding: "5px 12px", border: "none", borderRadius: 8, cursor: "pointer",
              background: statusFilter === val ? "#fff" : "transparent",
              color: statusFilter === val ? "#1a1a1a" : "#aaa",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              boxShadow: statusFilter === val ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc", fontSize: 13, fontWeight: 600 }}>No items match this filter</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(item => {
            const status = item.saleStatus || "listed";
            const meta = SALE_STATUS_META[status] || SALE_STATUS_META.listed;
            const origPrice = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
            const salePrice = parseFloat((item.salePrice || "").replace(/[^0-9.]/g, "")) || 0;
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e8e4dc", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", display: "flex" }}>
                {/* Image */}
                <div onClick={() => onViewItem(item)} style={{ width: 100, flexShrink: 0, background: item.image ? `url(${item.image}) center/contain no-repeat #f8f6f2` : "#f8f6f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {!item.image && <HangerIcon size={28} color="#ddd" />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      {item.brand && <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{item.brand}</div>}
                    </div>
                    {/* Status pill */}
                    <select value={status} onChange={e => updateItem(item, { saleStatus: e.target.value })}
                      style={{ padding: "4px 10px", background: meta.bg, border: `1.5px solid ${meta.border}`, borderRadius: 20, color: meta.color, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", flexShrink: 0 }}>
                      {SALE_STATUSES.map(s => <option key={s} value={s}>{SALE_STATUS_META[s].label}</option>)}
                    </select>
                  </div>

                  {/* Prices row */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    {origPrice > 0 && <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>${origPrice.toFixed(0)} orig</span>}
                    {salePrice > 0 && <span style={{ fontSize: 14, fontWeight: 800, color: "#2d6a3f" }}>${salePrice.toFixed(0)}</span>}
                    {item.salePlatform && <span style={{ fontSize: 11, background: "#f5f2ed", borderRadius: 8, padding: "2px 8px", color: "#666", fontWeight: 600 }}>{item.salePlatform}</span>}
                    {origPrice > 0 && salePrice > 0 && origPrice > salePrice && (
                      <span style={{ fontSize: 11, color: "#e05555", fontWeight: 700 }}>-{Math.round((1 - salePrice/origPrice)*100)}%</span>
                    )}
                  </div>

                  {/* Edit form */}
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input value={editVals.salePrice} onChange={e => setEditVals(v => ({ ...v, salePrice: e.target.value }))}
                          placeholder="Sale price (e.g. 25)"
                          style={{ flex: 1, padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
                        <select value={editVals.salePlatform} onChange={e => setEditVals(v => ({ ...v, salePlatform: e.target.value }))}
                          style={{ flex: 1, padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                          <option value="">Platform…</option>
                          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <input value={editVals.saleNotes} onChange={e => setEditVals(v => ({ ...v, saleNotes: e.target.value }))}
                        placeholder="Notes (e.g. listing URL, condition)"
                        style={{ padding: "7px 10px", border: "1.5px solid #e8e4dc", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => saveEdit(item)} style={{ flex: 1, padding: "7px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "7px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {item.saleNotes && <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>{item.saleNotes}</div>}
                      {item.soldDate && <div style={{ fontSize: 11, color: "#7c6fe0", fontWeight: 600 }}>Sold {new Date(item.soldDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                        <button onClick={() => startEdit(item)} style={{ padding: "5px 12px", background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Listing</button>
                        {status !== "sold" && <button onClick={() => markSold(item)} style={{ padding: "5px 12px", background: "#f5f0ff", border: "1.5px solid #c4b0f0", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#7c6fe0", fontFamily: "'DM Sans', sans-serif" }}><SvgCheck size={11} color="#7c6fe0" style={{marginRight:4}} />Mark Sold</button>}
                        <button onClick={() => moveBackToCloset(item)} style={{ padding: "5px 12px", background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif" }}>↩ Back to Closet</button>
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
  );
}

// ── Moodboard ─────────────────────────────────────────────────────────────────
// ── MoodboardInfoPanel — reads active board from Moodboard via localStorage ──
function MoodboardInfoPanel({ activeIdx, setActiveIdx }) {
  const STORAGE_KEY = "wardrobe_moodboards_v1";
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });

  // Poll localStorage for changes from Moodboard component
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setData(parsed);
      } catch {}
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const save = (updated) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    setData(updated);
  };

  const board = data[activeIdx] || null;
  if (!board) return null;

  return (
    <div className="right-card">
      <div className="right-card-title">Board Info</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.length > 1 && (
          <select value={activeIdx} onChange={e => setActiveIdx(Number(e.target.value))}
            className="pill-select" style={{ width: "100%", fontSize: 12 }}>
            {data.map((b, i) => <option key={b.id} value={i}>{b.name}</option>)}
          </select>
        )}
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Name</label>
          <input value={board.name || ""} onChange={e => save(data.map((b, i) => i === activeIdx ? { ...b, name: e.target.value } : b))}
            placeholder="Board name…"
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #e0dbd2", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, outline: "none", background: "#fafaf8", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Notes</label>
          <textarea value={board.notes || ""} onChange={e => save(data.map((b, i) => i === activeIdx ? { ...b, notes: e.target.value } : b))}
            placeholder="Mood, theme, inspiration…" rows={4}
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #e0dbd2", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none", background: "#fafaf8", resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
        </div>
        <div style={{ fontSize: 11, color: "#bbb", fontWeight: 500 }}>{(board.items || []).length} item{(board.items || []).length !== 1 ? "s" : ""} on board</div>
      </div>
    </div>
  );
}

function Moodboard({ closetItems = [], activeIdx, setActiveIdx }) {
  const closetItemsForMoodboard = closetItems;
  const STORAGE_KEY = "wardrobe_moodboards_v1";
  const [boards, setBoards] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [renamingIdx, setRenamingIdx] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [bgColor, setBgColor] = useState(null);
  const canvasRef = useRef(null);
  const dragging = useRef(null);
  const resizing = useRef(null);
  const fileRef = useRef(null);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [showClosetPicker, setShowClosetPicker] = useState(false);

  const board = boards[activeIdx] || null;
  const items = board?.items || [];

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(boards)); } catch(e) {}
  }, [boards]);

  const updateBoard = (updater) => {
    setBoards(bs => bs.map((b, i) => i === activeIdx ? { ...b, items: updater(b.items) } : b));
  };
  const updateBoardMeta = (patch) => {
    setBoards(bs => bs.map((b, i) => i === activeIdx ? { ...b, ...patch } : b));
  };

  const addBoard = () => {
    const name = `Board ${boards.length + 1}`;
    setBoards(bs => [...bs, { id: uid(), name, items: [], bg: "#ffffff" }]);
    setActiveIdx(boards.length);
    setSelectedId(null);
  };

  const deleteBoard = (i) => {
    setBoards(bs => bs.filter((_, idx) => idx !== i));
    setActiveIdx(prev => Math.max(0, prev >= i ? prev - 1 : prev));
    setSelectedId(null);
  };

  const renameBoard = (i, name) => {
    setBoards(bs => bs.map((b, idx) => idx === i ? { ...b, name } : b));
  };

  const setBoardBg = (color) => {
    setBoards(bs => bs.map((b, i) => i === activeIdx ? { ...b, bg: color } : b));
  };

  const importImages = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 260; const maxH = 220;
          let w = img.naturalWidth; let h = img.naturalHeight;
          if (w > maxW) { h = h * maxW / w; w = maxW; }
          if (h > maxH) { w = w * maxH / h; h = maxH; }
          const canvas = canvasRef.current;
          const cx = canvas ? canvas.offsetWidth / 2 - w / 2 + (Math.random() - 0.5) * 80 : 100;
          const cy = canvas ? canvas.offsetHeight / 2 - h / 2 + (Math.random() - 0.5) * 80 : 100;
          const newItem = {
            id: uid(), src: e.target.result,
            x: Math.max(0, cx), y: Math.max(0, cy),
            w: Math.round(w), h: Math.round(h),
            rotation: (Math.random() - 0.5) * 6, zIndex: Date.now(),
            opacity: 1, label: "", showLabel: false,
          };
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
      id: uid(), type: "text", text: "Double-click to edit",
      x: canvas ? canvas.offsetWidth / 2 - 80 : 120,
      y: canvas ? canvas.offsetHeight / 2 - 30 : 120,
      w: 180, h: 60, rotation: 0, zIndex: Date.now(),
      fontSize: 14, color: "#1a1a1a", bg: "#fff9e6", bold: false,
    };
    updateBoard(items => [...items, newItem]);
    setSelectedId(newItem.id);
  };

  const removeItem = (id) => {
    updateBoard(items => items.filter(i => i.id !== id));
    setSelectedId(null);
  };

  const bringForward = (id) => {
    const maxZ = Math.max(...items.map(i => i.zIndex || 0));
    updateBoard(items => items.map(i => i.id === id ? { ...i, zIndex: maxZ + 1 } : i));
  };

  const sendBackward = (id) => {
    const minZ = Math.min(...items.map(i => i.zIndex || 0));
    updateBoard(items => items.map(i => i.id === id ? { ...i, zIndex: minZ - 1 } : i));
  };

  const updateItem = (id, patch) => {
    updateBoard(items => items.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const duplicateItem = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const copy = { ...item, id: uid(), x: item.x + 20, y: item.y + 20, zIndex: Date.now() };
    updateBoard(items => [...items, copy]);
    setSelectedId(copy.id);
  };

  // Mouse down — start drag or resize
  const onMouseDown = (e, id, mode) => {
    e.stopPropagation();
    e.preventDefault();
    const item = items.find(i => i.id === id);
    if (!item) return;
    setSelectedId(id);
    bringForward(id);
    if (mode === "drag") {
      dragging.current = { id, startX: e.clientX - item.x, startY: e.clientY - item.y };
    } else if (mode === "resize") {
      resizing.current = { id, startX: e.clientX, startY: e.clientY, startW: item.w, startH: item.h };
    }
  };

  const onMouseMove = (e) => {
    if (dragging.current) {
      const { id, startX, startY } = dragging.current;
      updateBoard(items => items.map(i => i.id === id ? { ...i, x: e.clientX - startX, y: e.clientY - startY } : i));
    } else if (resizing.current) {
      const { id, startX, startY, startW, startH } = resizing.current;
      const dx = e.clientX - startX; const dy = e.clientY - startY;
      updateBoard(items => items.map(i => i.id === id ? { ...i, w: Math.max(60, startW + dx), h: Math.max(40, startH + dy) } : i));
    }
  };

  const onMouseUp = () => { dragging.current = null; resizing.current = null; };

  // Touch support
  const onTouchStart = (e, id, mode) => {
    const touch = e.touches[0];
    onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, stopPropagation: () => {}, preventDefault: () => {} }, id, mode);
  };
  const onTouchMove = (e) => { const t = e.touches[0]; onMouseMove({ clientX: t.clientX, clientY: t.clientY }); };
  const onTouchEnd = () => onMouseUp();

  const selectedItem = items.find(i => i.id === selectedId);

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script"); s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js").then(() => {
      const h2c = window.html2canvas;
      h2c(canvas, { useCORS: true, backgroundColor: board?.bg || "#fff" }).then(c => {
        const a = document.createElement("a");
        a.href = c.toDataURL("image/jpeg", 0.92);
        a.download = `${board?.name || "moodboard"}.jpg`;
        a.click();
      });
    }).catch(() => alert("Export failed — try right-clicking and saving the image manually."));
  };

  const importFromUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    try {
      // Try to use a CORS proxy for external images
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput.trim())}`;
      const res = await fetch(proxyUrl);
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Not an image");
      const reader = new FileReader();
      reader.onload = e => { importImages([new File([blob], "imported.jpg", { type: blob.type })]); };
      reader.readAsDataURL(blob);
      setUrlInput(""); setShowUrlImport(false);
    } catch(err) {
      // Fallback: just create an img element with the URL directly
      const canvas = canvasRef.current;
      const newItem = {
        id: uid(), src: urlInput.trim(),
        x: canvas ? canvas.offsetWidth / 2 - 130 : 80,
        y: canvas ? canvas.offsetHeight / 2 - 100 : 80,
        w: 260, h: 200, rotation: 0, zIndex: Date.now(), opacity: 1,
      };
      updateBoard(items => [...items, newItem]);
      setSelectedId(newItem.id);
      setUrlInput(""); setShowUrlImport(false);
    }
    setUrlLoading(false);
  };

  const BG_PRESETS = ["#ffffff", "#fafaf8", "#f5f3ef", "#f0f4f8", "#1a1a1a", "#2d2d2d", "#f9f0e8", "#e8f0e9", "#f0e8f5", "#fff9e6"];

  if (boards.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
      <div><SvgSparkle size={40} color="#ddd" /></div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>No moodboards yet</div>
      <div style={{ fontSize: 13, color: "#aaa" }}>Create a board and start arranging inspiration</div>
      <button onClick={addBoard} style={{ padding: "12px 28px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700 }}>+ Create Moodboard</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", userSelect: "none" }}>

      {/* Board tabs row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {boards.map((b, i) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 0, background: activeIdx === i ? "#1a1a1a" : "#f5f3ef", borderRadius: 10, overflow: "hidden" }}>
            {renamingIdx === i ? (
              <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                onBlur={() => { renameBoard(i, renameVal || b.name); setRenamingIdx(null); }}
                onKeyDown={e => { if (e.key === "Enter") { renameBoard(i, renameVal || b.name); setRenamingIdx(null); } }}
                style={{ padding: "6px 10px", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, background: "#f0faf4", minWidth: 80 }} />
            ) : (
              <button onClick={() => { setActiveIdx(i); setSelectedId(null); }}
                onDoubleClick={() => { setRenamingIdx(i); setRenameVal(b.name); }}
                style={{ padding: "7px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: activeIdx === i ? "#fff" : "#666" }}>
                {b.name}
              </button>
            )}
            <button onClick={() => deleteBoard(i)} style={{ padding: "7px 8px", background: "none", border: "none", cursor: "pointer", color: activeIdx === i ? "rgba(255,255,255,0.5)" : "#ccc", fontSize: 11 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        ))}
        <button onClick={addBoard} style={{ padding: "7px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#888" }}>+ New Board</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => { importImages(e.target.files); e.target.value = ""; }} />
        <button onClick={() => fileRef.current.click()} style={{ padding: "8px 16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700 }}><SvgCamera size={13} color="#fff" style={{marginRight:5}} />Import Images</button>
        <button onClick={addTextNote} style={{ padding: "8px 16px", background: "#fff9e6", border: "1.5px solid #f0e0a0", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#7a6000" }}><SvgEdit size={13} color="#7a6000" style={{marginRight:5}} />Add Text</button>
        <button onClick={() => setShowUrlImport(u => !u)} style={{ padding: "8px 14px", background: showUrlImport ? "#f0f4ff" : "#f5f3ef", border: showUrlImport ? "1.5px solid #a0b4f0" : "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: showUrlImport ? "#3a5fe0" : "#666" }}><SvgLink size={13} color="currentColor" style={{marginRight:5}} />URL</button>
        <button onClick={() => setShowClosetPicker(p => !p)} style={{ padding: "8px 14px", background: showClosetPicker ? "#f0faf4" : "#f5f3ef", border: showClosetPicker ? "1.5px solid #b6e8c8" : "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: showClosetPicker ? "#2d6a3f" : "#666" }}><SvgHanger size={13} color="currentColor" style={{marginRight:5}} />From Closet</button>
        {/* BG colors */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", marginLeft: 4 }}>
          <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>BG:</span>
          {BG_PRESETS.map(c => (
            <div key={c} onClick={() => setBoardBg(c)} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: (board?.bg || "#fff") === c ? "2px solid #2d6a3f" : "1.5px solid #ddd", cursor: "pointer", flexShrink: 0 }} />
          ))}
        </div>
        <button onClick={exportCanvas} style={{ padding: "8px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#666", marginLeft: "auto" }}><SvgDownload size={13} color="#666" style={{marginRight:5}} />Export JPG</button>
      </div>

      {/* URL import bar */}
      {showUrlImport && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input autoFocus value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Paste image URL or Instagram post URL…"
            onKeyDown={e => e.key === "Enter" && importFromUrl()}
            style={{ flex: 1, padding: "8px 14px", border: "1.5px solid #a0b4f0", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
          <button onClick={importFromUrl} disabled={urlLoading} style={{ padding: "8px 16px", background: "#3a5fe0", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{urlLoading ? "…" : "Import"}</button>
        </div>
      )}
      {/* Closet picker */}
      {showClosetPicker && (
        <div style={{ marginBottom: 8, padding: "10px 12px", background: "#f0faf4", borderRadius: 12, border: "1.5px solid #b6e8c8", maxHeight: 140, overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2d6a3f", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pin from Closet</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(closetItemsForMoodboard || []).filter(i => i.image).map(item => (
              <div key={item.id} onClick={() => {
                const canvas = canvasRef.current;
                const newItem = { id: uid(), src: item.image, x: canvas ? canvas.offsetWidth/2 - 80 + Math.random()*60-30 : 80, y: canvas ? canvas.offsetHeight/2 - 100 + Math.random()*60-30 : 80, w: 160, h: 200, rotation: (Math.random()-0.5)*4, zIndex: Date.now(), opacity: 1, label: item.name, transparent: true };
                updateBoard(items => [...items, newItem]);
                setSelectedId(newItem.id);
                setShowClosetPicker(false);
              }} title={item.name} style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "#f5f2ed", cursor: "pointer", flexShrink: 0, border: "1.5px solid #d0f0d8" }}>
                <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            ))}
            {(closetItemsForMoodboard || []).filter(i => i.image).length === 0 && <div style={{ fontSize: 12, color: "#aaa" }}>No items with images in your closet</div>}
          </div>
        </div>
      )}
      {/* Selected item toolbar */}
      {selectedItem && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap", padding: "8px 12px", background: "#faf9f6", borderRadius: 12, border: "1px solid #e8e4dc" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa" }}>SELECTED:</span>
          <button onClick={() => bringForward(selectedId)} style={{ padding: "5px 10px", fontSize: 11, background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif" }}><SvgArrowUp size={12} color="#555" style={{marginRight:4}} />Forward</button>
          <button onClick={() => sendBackward(selectedId)} style={{ padding: "5px 10px", fontSize: 11, background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif" }}><SvgArrowDn size={12} color="#555" style={{marginRight:4}} />Back</button>
          <button onClick={() => duplicateItem(selectedId)} style={{ padding: "5px 10px", fontSize: 11, background: "#f5f2ed", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, color: "#555", fontFamily: "'DM Sans', sans-serif" }}><SvgCopy size={12} color="#555" style={{marginRight:4}} />Duplicate</button>
          {selectedItem.type !== "text" && (
            <>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa" }}>Opacity</label>
              <input type="range" min="0.1" max="1" step="0.05" value={selectedItem.opacity ?? 1}
                onChange={e => updateItem(selectedId, { opacity: parseFloat(e.target.value) })}
                style={{ width: 80 }} />
              <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa" }}>Rotate</label>
              <input type="range" min="-180" max="180" step="1" value={selectedItem.rotation ?? 0}
                onChange={e => updateItem(selectedId, { rotation: parseFloat(e.target.value) })}
                style={{ width: 80 }} />
            </>
          )}
          {selectedItem.type === "text" && (
            <>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa" }}>Size</label>
              <input type="range" min="10" max="48" step="1" value={selectedItem.fontSize ?? 14}
                onChange={e => updateItem(selectedId, { fontSize: parseInt(e.target.value) })}
                style={{ width: 70 }} />
              <input type="color" value={selectedItem.color ?? "#1a1a1a"} onChange={e => updateItem(selectedId, { color: e.target.value })}
                style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} title="Text color" />
              <button onClick={() => updateItem(selectedId, { transparentBg: !selectedItem.transparentBg })}
                style={{ padding: "5px 10px", fontSize: 11, background: selectedItem.transparentBg ? "#1a1a1a" : "#f5f3ef", color: selectedItem.transparentBg ? "#fff" : "#555", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                {selectedItem.transparentBg ? "◻ No BG" : "◼ BG"}
              </button>
              {!selectedItem.transparentBg && (
                <input type="color" value={selectedItem.bg ?? "#fff9e6"} onChange={e => updateItem(selectedId, { bg: e.target.value })}
                  style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} title="Background color" />
              )}
              <button onClick={() => updateItem(selectedId, { bold: !selectedItem.bold })}
                style={{ padding: "5px 10px", fontSize: 12, background: selectedItem.bold ? "#1a1a1a" : "#f5f3ef", color: selectedItem.bold ? "#fff" : "#555", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>B</button>
            </>
          )}
          <button onClick={() => removeItem(selectedId)} style={{ padding: "5px 10px", fontSize: 11, background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif", marginLeft: "auto" }}><SvgTrash size={12} color="#e05555" style={{marginRight:4}} />Remove</button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseDown={e => { if (e.target === canvasRef.current) setSelectedId(null); }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); importImages(e.dataTransfer.files); }}
        style={{ flex: 1, position: "relative", background: board?.bg || "#ffffff", borderRadius: 20, border: "1.5px solid #e8e4dc", overflow: "hidden", cursor: "default", minHeight: 400 }}
      >
        {items.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 10 }}>
            <div style={{ opacity: 0.15 }}><SvgSparkle size={32} color="#888" /></div>
            <div style={{ fontSize: 13, color: "#bbb", fontWeight: 600 }}>Import images or drag & drop to start</div>
          </div>
        )}

        {[...items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map(item => {
          const isSelected = item.id === selectedId;
          if (item.type === "text") {
            return (
              <div key={item.id}
                onMouseDown={e => onMouseDown(e, item.id, "drag")}
                onTouchStart={e => onTouchStart(e, item.id, "drag")}
                onDoubleClick={e => {
                  e.stopPropagation();
                  const val = window.prompt("Edit text:", item.text);
                  if (val !== null) updateItem(item.id, { text: val });
                }}
                style={{
                  position: "absolute", left: item.x, top: item.y,
                  width: item.w, minHeight: item.h,
                  transform: `rotate(${item.rotation || 0}deg)`,
                  zIndex: item.zIndex || 1,
                  background: item.transparentBg ? "transparent" : (item.bg || "#fff9e6"),
                  borderRadius: 10, padding: "10px 14px",
                  cursor: "move",
                  outline: isSelected ? "2px solid #2d6a3f" : "2px solid transparent",
                  outlineOffset: 2,
                  boxShadow: item.transparentBg ? "none" : (isSelected ? "0 4px 20px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)"),
                  fontSize: item.fontSize || 14,
                  fontWeight: item.bold ? 800 : 500,
                  color: item.color || "#1a1a1a",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  userSelect: "none",
                }}
              >
                {item.text}
                {/* Resize handle */}
                {isSelected && (
                  <div onMouseDown={e => onMouseDown(e, item.id, "resize")} onTouchStart={e => onTouchStart(e, item.id, "resize")}
                    style={{ position: "absolute", bottom: 0, right: 0, width: 18, height: 18, cursor: "se-resize", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRight: "2px solid #2d6a3f", borderBottom: "2px solid #2d6a3f", borderRadius: 1 }} />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.id}
              onMouseDown={e => onMouseDown(e, item.id, "drag")}
              onTouchStart={e => onTouchStart(e, item.id, "drag")}
              style={{
                position: "absolute", left: item.x, top: item.y,
                width: item.w, height: item.h,
                transform: `rotate(${item.rotation || 0}deg)`,
                zIndex: item.zIndex || 1,
                cursor: "move",
                outline: isSelected ? "2px solid #2d6a3f" : "2px solid transparent",
                outlineOffset: 3,
                opacity: item.opacity ?? 1,
                boxShadow: isSelected ? "0 4px 24px rgba(0,0,0,0.18)" : "0 2px 10px rgba(0,0,0,0.08)",
                borderRadius: 4,
                overflow: item.transparent ? "visible" : "hidden",
              }}
            >
              <img src={item.src} alt="" draggable={false}
                style={{ width: "100%", height: "100%", objectFit: item.transparent ? "contain" : "cover", display: "block", pointerEvents: "none", background: item.transparent ? "transparent" : undefined }} />
              {/* Resize handle */}
              {isSelected && (
                <div onMouseDown={e => onMouseDown(e, item.id, "resize")} onTouchStart={e => onTouchStart(e, item.id, "resize")}
                  style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, cursor: "se-resize", background: "rgba(45,106,63,0.85)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px 0 4px 0" }}>
                  <div style={{ width: 8, height: 8, borderRight: "2px solid #fff", borderBottom: "2px solid #fff", borderRadius: 1 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Nav + App ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "closet", label: "Closet" },
  { id: "outfits", label: "Outfits" },
  { id: "lookbooks", label: "Lookbooks" },
  { id: "stats", label: "Story" },
  { id: "moodboard", label: "Moodboard" },
  { id: "seller", label: "Seller" },
  { id: "wishlist", label: "Wishlist" },
];

export default function App() {
  const itemsDb = useSupabaseTable("items");
  const wishlistDb = useSupabaseTable("wishlist");
  const outfitsDb = useSupabaseTable("outfits");
  const lookbooksDb = useSupabaseTable("lookbooks");

  const [tab, setTab] = useState("closet");
  const [modal, setModal] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [editItem, setEditItem] = useState(null);
  const [outfitBuilder, setOutfitBuilder] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [outfitSeedItem, setOutfitSeedItem] = useState(null);
  const [outfitTagFilter, setOutfitTagFilter] = useState("All");
  const [outfitSeasonFilter, setOutfitSeasonFilter] = useState("All");
  const [outfitSearch, setOutfitSearch] = useState("");
  const [outfitSort, setOutfitSort] = useState("default");
  const [outfitPopup, setOutfitPopup] = useState(null); // outfit object
  const [itemDetail, setItemDetail] = useState(null); // closet item detail popup
  const [closetSort, setClosetSort] = useState("default"); // default | az | price | worn | newest
  const [closetSeasonFilter, setClosetSeasonFilter] = useState("All");
  const [closetSearch, setClosetSearch] = useState("");
  const [activeLookbook, setActiveLookbook] = useState(null);
  const [moodboardActiveIdx, setMoodboardActiveIdx] = useState(0);
  const [lbSearch, setLbSearch] = useState("");
  const [lbSort, setLbSort] = useState("newest");
  const [bulkMode, setBulkMode] = useState(false);
  const [wishlistDest, setWishlistDest] = useState(false);
  const [wlSort, setWlSort] = useState("priority");
  const [wlSortCat, setWlSortCat] = useState("All");
  const [activeWishlistId, setActiveWishlistId] = useState(null); // null = "All"
  const [wishlistsDb, setWishlistsLocal] = useState(() => { try { return JSON.parse(localStorage.getItem("wardrobe_wishlists_v1") || "[]"); } catch { return []; } });
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [globalSearch, setGlobalSearch] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [lookbookModal, setLookbookModal] = useState(false);
  const [newLbName, setNewLbName] = useState("");
  const [newLbNotes, setNewLbNotes] = useState("");
  const [newLbCover, setNewLbCover] = useState(""); // base64 data URL
  const [newLbDateStart, setNewLbDateStart] = useState("");
  const [newLbDateEnd, setNewLbDateEnd] = useState("");
  const [newLbSelected, setNewLbSelected] = useState([]);

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
    else await wishlistDb.add({ ...form, id: uid() });
    closeModal();
  };

  const moveToCloset = async (wish) => { await itemsDb.add({ ...wish }); await wishlistDb.remove(wish.id); };

  const openNewOutfit = () => { setEditingOutfit(null); setOutfitSeedItem(null); setOutfitBuilder(true); };
  const duplicateOutfit = async (outfit) => {
    const copy = { ...outfit, id: uid(), name: outfit.name + " (copy)" };
    await outfitsDb.add(copy);
  };
  const openEditOutfit = (outfit) => { setEditingOutfit(outfit); setOutfitBuilder(true); };

  const saveOutfit = async (data) => {
    if (editingOutfit) await outfitsDb.update({ ...data, id: editingOutfit.id });
    else await outfitsDb.add({ ...data, id: uid() });
    setOutfitBuilder(false); setEditingOutfit(null);
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
      outfitIds: newLbSelected,
      lookMeta: {},
    };
    setLookbookModal(false);
    setNewLbName(""); setNewLbNotes(""); setNewLbCover("");
    setNewLbDateStart(""); setNewLbDateEnd(""); setNewLbSelected([]);
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
    await lookbooksDb.update(lb);
  };

  const markOutfitWorn = async (outfit) => {
    const ids = outfit.layers || outfit.itemIds || [];
    for (const id of ids) {
      const item = itemsDb.rows.find(i => i.id === id);
      if (item) await itemsDb.update({ ...item, wornCount: (item.wornCount || 0) + 1 });
    }
  };

  const markWorn = async (item) => {
    const updated = { ...item, wornCount: (item.wornCount || 0) + 1 };
    await itemsDb.update(updated);
    if (itemDetail?.id === item.id) setItemDetail(updated);
  };

  const filteredItems = (() => {
    const q = closetSearch.trim().toLowerCase();
    let rows = itemsDb.rows.filter(i => {
      if (i.forSale) return false; // moved to seller tab
      const matchCat = catFilter === "All" || i.category === catFilter;
      const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.brand||"").toLowerCase().includes(q) || (i.color||"").toLowerCase().includes(q) || (i.category||"").toLowerCase().includes(q);
      const matchSeason = closetSeasonFilter === "All" || (i.seasons || []).includes(closetSeasonFilter) || i.season === closetSeasonFilter;
      return matchCat && matchSearch && matchSeason;
    });
    if (closetSort === "az") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    else if (closetSort === "price") rows = [...rows].sort((a, b) => (parseFloat((b.price||"").replace(/[^0-9.]/g,""))||0) - (parseFloat((a.price||"").replace(/[^0-9.]/g,""))||0));
    else if (closetSort === "worn") rows = [...rows].sort((a, b) => (b.wornCount||0) - (a.wornCount||0));
    else if (closetSort === "newest") rows = [...rows].sort((a, b) => (b.purchaseDate||"").localeCompare(a.purchaseDate||""));
    return rows;
  })();
  const filteredOutfits = (() => {
    const q = outfitSearch.trim().toLowerCase();
    let rows = outfitsDb.rows.filter(o => {
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

  const NAV_ICON_MAP = {
    closet: (active) => <HangerIcon size={20} color={active ? "#fff" : "#888"} />,
    outfits: (active) => <SvgSparkle size={18} color={active ? "#fff" : "#888"} />,
    lookbooks: (active) => <SvgGrid size={18} color={active ? "#fff" : "#888"} />,
    stats: (active) => <SvgStar size={18} color={active ? "#fff" : "#888"} />,
    moodboard: (active) => <SvgPalette size={18} color={active ? "#fff" : "#888"} />,
    seller: (active) => <SvgTag size={18} color={active ? "#fff" : "#888"} />,
    wishlist: (active) => <SvgHeart size={18} color={active ? "#fff" : "#888"} />,
  };

  const PAGE_TITLES = {
    closet: ["My Closet", `${itemsDb.rows.filter(i=>!i.forSale).length} pieces`],
    outfits: ["My Outfits", `${outfitsDb.rows.length} looks`],
    lookbooks: ["Lookbooks", "Curated collections"],
    stats: ["My Story", "Your wardrobe in focus"],
    moodboard: ["Moodboard", "Inspire yourself"],
    seller: ["Seller Dashboard", "What's for sale"],
    wishlist: ["Wishlist", "Want it"],
  };

  return (
    <div style={{ background: "#f7f5f2", minHeight: "100vh" }}>
      <style>{globalStyles}</style>

      {/* ── Vertical nav sidebar ── */}
      <nav className="app-nav-sidebar">
        <div className="app-nav-logo">
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "#fff", lineHeight: 1 }}>W</span>
        </div>
        {NAV_ITEMS.map(n => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={"nav-icon-btn" + (active ? " active" : "")}
              title={n.label}
            >
              {NAV_ICON_MAP[n.id]?.(active)}
              <span className="nav-label">{n.label}</span>
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
            <div className="page-hero" style={{ marginBottom: 0 }}>
              <div className="page-hero-eyebrow">My Wardrobe</div>
              <div className="page-hero-title">{PAGE_TITLES[tab]?.[0]}</div>
              <div className="page-hero-sub">{PAGE_TITLES[tab]?.[1]}</div>
            </div>
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
              {/* Add button */}
              {tab !== "stats" && tab !== "moodboard" && (
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

          {/* Content — 2-column layout (left sidebar + main) */}
          <div className="app-layout">

        {/* ── LEFT SIDEBAR (closet + outfits) ── */}
        {(tab === "closet" || tab === "outfits") && (
          <div className="app-left-sidebar">
            <div className="closet-sidebar" style={{ position: "sticky", top: 80 }}>
              {tab === "closet" && (<>
                <div className="sidebar-section">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display:"flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="closet-search" value={closetSearch} onChange={e => setClosetSearch(e.target.value)} placeholder="Search…" />
                  </div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-label">Category</div>
                  {CATEGORIES.map(cat => (
                    <button key={cat} className={"sidebar-btn" + (catFilter === cat ? " active" : "")} onClick={() => setCatFilter(cat)}>{cat}</button>
                  ))}
                </div>
              </>)}
              {tab === "outfits" && (<>
                <div className="sidebar-section">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display:"flex" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                    <input className="closet-search" value={outfitSearch} onChange={e => setOutfitSearch(e.target.value)} placeholder="Search outfits…" />
                  </div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-label">Occasion</div>
                  {["All", ...OCCASIONS].map(tag => (
                    <button key={tag} className={"sidebar-btn" + (outfitTagFilter === tag ? " active" : "")} onClick={() => setOutfitTagFilter(tag)}>{tag}</button>
                  ))}
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-label">Season</div>
                  {["All", ...SEASONS].map(s => (
                    <button key={s} className={"sidebar-btn" + (outfitSeasonFilter === s ? " active" : "")} onClick={() => setOutfitSeasonFilter(s)}>{s}</button>
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
                      <option value="price">Sort: Price ↓</option>
                      <option value="worn">Sort: Most Worn</option>
                      <option value="newest">Sort: Newest</option>
                    </select>
                    <select value={closetSeasonFilter} onChange={e => setClosetSeasonFilter(e.target.value)} className="pill-select" style={{}}>
                      {["All", ...SEASONS].map(s => <option key={s} value={s}>{s === "All" ? "All Seasons" : s}</option>)}
                    </select>
                  </div>
                  {/* Bulk action bar */}
                  {bulkMode && bulkSelected.size > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 14, padding: "10px 14px", background: "#fff", borderRadius: 14, border: "1.5px solid #e8e4dc", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{bulkSelected.size} selected</span>
                      <button onClick={async () => { for (const id of bulkSelected) { const item = itemsDb.rows.find(i => i.id === id); if (item) await itemsDb.update({ ...item, forSale: true, saleStatus: "listed" }); } setBulkSelected(new Set()); setBulkMode(false); setTab("seller"); }} style={{ padding: "6px 14px", background: "#fff8ee", border: "1.5px solid #f5c842", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#a07000", fontFamily: "'DM Sans', sans-serif" }}><SvgTag size={12} color="currentColor" style={{marginRight:4}} />List for Sale</button>
                      <button onClick={async () => { if (window.confirm(`Delete ${bulkSelected.size} items?`)) { for (const id of bulkSelected) await itemsDb.remove(id); setBulkSelected(new Set()); setBulkMode(false); }}} style={{ padding: "6px 14px", background: "#fef2f2", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#e05555", fontFamily: "'DM Sans', sans-serif" }}><SvgTrash size={13} color="#e05555" style={{marginRight:4}} />Delete</button>
                      <button onClick={() => setBulkSelected(new Set(filteredItems.map(i => i.id)))} style={{ padding: "6px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Select All</button>
                      <button onClick={() => setBulkSelected(new Set())} style={{ padding: "6px 14px", background: "#f5f2ed", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Deselect All</button>
                    </div>
                  )}
                  {filteredItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <HangerIcon size={40} color="#ddd" />
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#ccc", marginTop: 12 }}>
                        {closetSearch ? `No results for "${closetSearch}"` : catFilter !== "All" ? `No ${catFilter} yet` : "Nothing here yet"}
                      </div>
                      {!closetSearch && catFilter === "All" && <div style={{ fontSize: 12, color: "#ddd", marginTop: 4 }}>Tap + to add your first piece</div>}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 12 }}>
                      {filteredItems.map((item, i) => (
                        <div key={item.id} className="fade-up" style={{ animationDelay: `${i * 0.02}s`, opacity: 0, position: "relative" }}
                          onClick={bulkMode ? () => setBulkSelected(s => { const n = new Set(s); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; }) : undefined}
                        >
                          {bulkMode && (
                            <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, width: 22, height: 22, borderRadius: "50%", background: bulkSelected.has(item.id) ? "#2d6a3f" : "rgba(255,255,255,0.9)", border: `2px solid ${bulkSelected.has(item.id) ? "#2d6a3f" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", pointerEvents: "none" }}>
                              {bulkSelected.has(item.id) && <SvgCheck size={12} color="#fff" />}
                            </div>
                          )}
                          <ItemCard item={item} onClick={bulkMode ? undefined : () => setItemDetail(item)} onEdit={bulkMode ? undefined : () => { setEditItem(item); setModal("item"); }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* OUTFITS */}
            {tab === "outfits" && (
              <div className="fade-up">
                {/* Outfits toolbar: sort dropdown */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <select value={outfitSort} onChange={e => setOutfitSort(e.target.value)}
                    style={{ padding: "8px 14px", border: "1px solid #e0dbd2", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, background: "#fff", color: "#444", cursor: "pointer", paddingRight: 28 }}>
                    <option value="default">Sort: Default</option>
                    <option value="az">Sort: A – Z</option>
                    <option value="newest">Sort: Newest</option>
                    <option value="pieces">Sort: Most Pieces</option>
                  </select>
                </div>

                {filteredOutfits.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ marginBottom: 12 }}><SvgSparkle size={36} color="#ddd" /></div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#ccc" }}>{outfitTagFilter === "All" && outfitSeasonFilter === "All" ? "No outfits yet" : "No outfits match these filters"}</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {filteredOutfits.map((outfit, i) => {
                      const outfitItems = (outfit.layers || outfit.itemIds || []).map(id => allItems.find(x => x.id === id)).filter(Boolean);
                      const tags = outfit.tags || [];
                      const outfitSeasons = outfit.seasons || [];
                      return (
                        <div key={outfit.id} className="card fade-up" onClick={() => setOutfitPopup(outfit)} style={{
                          background: "#fff", borderRadius: 20, border: "1.5px solid #e8e4dc", overflow: "hidden",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.04)", animationDelay: `${i * 0.05}s`, opacity: 0, cursor: "pointer", position: "relative"
                        }}>
                          {/* Lookbook badge */}
                          {(() => { const lbCount = lookbooksDb.rows.filter(lb => (lb.outfitIds || []).includes(outfit.id)).length; return lbCount > 0 ? <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2, background: "rgba(124,111,224,0.92)", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)" }}>▤ {lbCount}</div> : null; })()}
                          {/* Preview: use saved previewImage if available, else item collage */}
                          {outfit.previewImage ? (
                            <div style={{ aspectRatio: "4/5", background: `url(${outfit.previewImage}) center/contain no-repeat #f5f3ef`, position: "relative" }}>
                              <button onClick={e => { e.stopPropagation(); duplicateOutfit(outfit); }} title="Duplicate" style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>⧉</button>
            </div>
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
                          {/* Name overlay at bottom */}
                          <div style={{ padding: "10px 12px 12px" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outfit.name}</div>
                          </div>
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
                {/* Toolbar */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <input value={lbSearch} onChange={e => setLbSearch(e.target.value)} placeholder="Search lookbooks…"
                    style={{ flex: "1 1 180px", padding: "9px 14px", border: "1.5px solid #e8e4dc", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", background: "#faf9f6" }} />
                  <select value={lbSort} onChange={e => setLbSort(e.target.value)}
                    style={{ padding: "9px 12px", border: "1.5px solid #e8e4dc", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, background: "#faf9f6", color: "#555", fontWeight: 600 }}>
                    <option value="newest">Newest</option>
                    <option value="az">A – Z</option>
                    <option value="most">Most Outfits</option>
                  </select>
                  <button className="btn-primary" onClick={() => setLookbookModal(true)} style={{
                    padding: "9px 18px", background: "#1a1a1a", color: "#fff", border: "none",
                    borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap"
                  }}>+ New Lookbook</button>
                </div>

                {(() => {
                  const fmtDate = (d) => {
                    if (!d) return null;
                    const dt = new Date(d + "T00:00:00");
                    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  };
                  let filtered = lookbooksDb.rows.filter(lb =>
                    !lbSearch || lb.name.toLowerCase().includes(lbSearch.toLowerCase())
                  );
                  if (lbSort === "az") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                  else if (lbSort === "most") filtered = [...filtered].sort((a, b) => (b.outfitIds || []).length - (a.outfitIds || []).length);

                  if (filtered.length === 0) return (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <div style={{ marginBottom: 12 }}><SvgGrid size={36} color="#ddd" /></div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#ccc" }}>{lbSearch ? "No matches" : "No lookbooks yet"}</div>
                      <div style={{ fontSize: 13, color: "#ddd", marginTop: 4 }}>Group your outfits into a lookbook</div>
                    </div>
                  );

                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
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
                          <div key={lb.id} className="card fade-up" onClick={() => setActiveLookbook(lb)} style={{
                            background: "#fff", borderRadius: 20, border: "1.5px solid #e8e4dc", overflow: "hidden",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.04)", cursor: "pointer",
                            animationDelay: `${i * 0.06}s`, opacity: 0, position: "relative"
                          }}>
                            {/* Delete button */}
                            <button onClick={e => { e.stopPropagation(); lookbooksDb.remove(lb.id); }} title="Delete lookbook"
                              style={{ position: "absolute", top: 8, right: 8, zIndex: 2, width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", fontSize: 13, color: "#e05555", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
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
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lb.name}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{lbOutfits.length} outfit{lbOutfits.length !== 1 ? "s" : ""}</span>
                                {totalVal > 0 && <span style={{ fontSize: 11, color: "#aaa" }}>· ${totalVal.toFixed(0)} total</span>}
                              </div>
                              {dateStr && <div style={{ fontSize: 11, color: "#b0a898", marginTop: 4, fontWeight: 600 }}><SvgCalendar size={11} color="#b0a898" style={{marginRight:3, verticalAlign:"middle"}} />{dateStr}</div>}
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
            {tab === "stats" && <StatsTab itemsDb={itemsDb} outfitsDb={outfitsDb} lookbooksDb={lookbooksDb} onViewItem={item => setItemDetail(item)} />}

            {/* SELLER DASHBOARD */}
            {tab === "seller" && <SellerDashboard itemsDb={itemsDb} onViewItem={(item) => setItemDetail(item)} />}

            {/* MOODBOARD */}
            {tab === "moodboard" && <Moodboard closetItems={itemsDb.rows.filter(i => !i.forSale)} activeIdx={moodboardActiveIdx} setActiveIdx={setMoodboardActiveIdx} />}

            {/* WISHLIST */}
            {tab === "wishlist" && <WishlistTab
              wishlistDb={wishlistDb}
              wishlistsDb={wishlistsDb}
              saveWishlistsMeta={saveWishlistsMeta}
              activeWishlistId={activeWishlistId}
              setActiveWishlistId={setActiveWishlistId}
              wlSort={wlSort} setWlSort={setWlSort}
              wlSortCat={wlSortCat} setWlSortCat={setWlSortCat}
              moveToCloset={moveToCloset}
              onEdit={(item) => { setEditItem(item); setWishlistDest(true); setModal("item"); }}
            />}

            </>
          )}
        </div>

        {/* ── RIGHT PANEL (always visible) ── */}
        <div className="app-right-panel" style={{ top: 24 }}>

          {/* Sort moved to top toolbar for closet/outfits */}

          {/* Moodboard board info */}
          {tab === "moodboard" && <MoodboardInfoPanel activeIdx={moodboardActiveIdx} setActiveIdx={setMoodboardActiveIdx} />}

          {tab === "outfits" && outfitsDb.rows.length > 0 && (() => {
            const outfits = outfitsDb.rows;
            const allPieces = [...itemsDb.rows, ...wishlistDb.rows];
            const itemUsage = {};
            outfits.forEach(o => (o.layers || o.itemIds || []).forEach(id => { itemUsage[id] = (itemUsage[id] || 0) + 1; }));
            const mostUsedId = Object.entries(itemUsage).sort((a,b) => b[1]-a[1])[0]?.[0];
            const mostUsedItem = mostUsedId ? allPieces.find(i => i.id === mostUsedId) : null;
            const totalValue = outfits.reduce((sum, o) => sum + (o.layers || o.itemIds || []).reduce((s, id) => { const it = allPieces.find(i => i.id === id); return s + (parseFloat((it?.price || "").replace(/[^0-9.]/g,""))||0); }, 0), 0);
            return (
              <div className="right-card">
                <div className="right-card-title">Outfit Stats</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { lbl: "Total Outfits", val: outfits.length },
                    { lbl: "Total Value", val: `$${totalValue.toFixed(0)}` },
                  ].map(s => (
                    <div key={s.lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>{s.lbl}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{s.val}</span>
                    </div>
                  ))}
                  {mostUsedItem && (
                    <div style={{ borderTop: "1px solid #e8e4dc", paddingTop: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Most Featured</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: "#f5f2ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {mostUsedItem.image ? <img src={mostUsedItem.image} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="" /> : <HangerIcon size={14} color="#ccc" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mostUsedItem.name}</div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{itemUsage[mostUsedId]}× outfits</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Season filter moved to top toolbar for closet */}

          {/* Wardrobe stats card */}
          {tab !== "wishlist" && tab !== "lookbooks" && tab !== "moodboard" && itemsDb.rows.length > 0 && (() => {
            const items = itemsDb.rows;
            const totalValue = items.reduce((s, i) => s + (parseFloat((i.price || "").replace(/[^0-9.]/g, "")) || 0), 0);
            const avgValue = totalValue / items.length;
            const neverWorn = items.filter(i => !(i.wornCount || 0)).length;
            const mostWorn = [...items].filter(i => (i.wornCount||0) > 0).sort((a,b) => (b.wornCount||0)-(a.wornCount||0))[0];
            return (
              <div className="right-card">
                <div className="right-card-title">Wardrobe Stats</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { lbl: "Total Value", val: `$${totalValue.toFixed(0)}` },
                    { lbl: "Avg. Item Value", val: `$${avgValue.toFixed(0)}` },
                    { lbl: "Items Unworn", val: neverWorn, color: neverWorn > 0 ? "#e07e30" : "#3aaa6e" },
                  ].map(s => (
                    <div key={s.lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>{s.lbl}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: s.color || "#1a1a1a" }}>{s.val}</span>
                    </div>
                  ))}
                  {mostWorn && (
                    <div style={{ borderTop: "1px solid #e8e4dc", paddingTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Most Worn</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: mostWorn.image ? "transparent" : "#f5f3ef", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {mostWorn.image ? <img src={mostWorn.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <HangerIcon size={14} color="#ccc" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mostWorn.name}</div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{mostWorn.wornCount}x worn</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Category breakdown */}
          {tab !== "wishlist" && tab !== "lookbooks" && tab !== "moodboard" && itemsDb.rows.length > 0 && (() => {
            const byCat = CATEGORIES.slice(1).map(cat => ({ cat, count: itemsDb.rows.filter(i => i.category === cat).length })).filter(c => c.count > 0);
            const maxC = Math.max(...byCat.map(c => c.count), 1);
            return (
              <div className="right-card">
                <div className="right-card-title">By Category</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {byCat.map(({ cat, count }) => (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>{cat}</span>
                        <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 5, background: "#f0ece4", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(count / maxC) * 100}%`, background: CAT_COLORS[cat] || "#ccc", borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}



        </div>
          </div>{/* end app-layout */}
        </div>{/* end app-main-area */}
        {/* ── RIGHT RAIL (stats/sort/etc) ── */}
      </div>{/* end app-body */}

      {/* Modals */}
      <Modal open={modal === "item"} onClose={closeModal} title="">
        <AddItemModal
          initial={editItem || BLANK}
          editMode={editItem ? "manual" : null}
          initialDest={wishlistDest ? "wishlist" : undefined}
          onSave={saveItem}
          onSaveWish={(form) => saveWishItem({ ...form, wishlistId: activeWishlistId || undefined })}
          onCancel={closeModal}
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

      {/* Item Detail Popup */}
      {itemDetail && (
        <ItemDetailPopup
          item={itemDetail}
          onClose={() => setItemDetail(null)}
          onEdit={() => { setEditItem(itemDetail); setModal("item"); setItemDetail(null); }}
          onDelete={() => { itemsDb.remove(itemDetail.id); setItemDetail(null); }}
          onWorn={() => markWorn(itemDetail)}
          onCreateOutfit={() => { setEditingOutfit(null); setOutfitSeedItem(itemDetail); setOutfitBuilder(true); setItemDetail(null); }}
          onListForSale={() => { itemsDb.update({ ...itemDetail, forSale: true, saleStatus: "listed" }); setItemDetail(null); setTab("seller"); }}
          outfits={outfitsDb.rows}
          lookbooks={lookbooksDb.rows}
        />
      )}

      {/* Outfit Detail Popup */}
      {outfitPopup && (
        <OutfitDetailPopup
          outfit={outfitPopup}
          allItems={allItems}
          lookbooks={lookbooksDb.rows}
          onClose={() => setOutfitPopup(null)}
          onEdit={() => { openEditOutfit(outfitPopup); setOutfitPopup(null); }}
          onDelete={() => { outfitsDb.remove(outfitPopup.id); setOutfitPopup(null); }}
          onMarkWorn={() => markOutfitWorn(outfitPopup)}
          onDuplicate={() => { duplicateOutfit(outfitPopup); setOutfitPopup(null); }}
          onAddToLookbook={addOutfitToLookbook}
          onGoToLookbook={(lb) => { setOutfitPopup(null); setActiveLookbook(lb); }}
          onItemClick={(item) => { setOutfitPopup(null); setItemDetail(item); }}
        />
      )}

      {/* Outfit Builder */}
      {outfitBuilder && (
        <OutfitBuilder
          itemsDb={itemsDb}
          wishlistDb={wishlistDb}
          initial={editingOutfit}
          seedItem={outfitSeedItem}
          onSave={saveOutfit}
          onClose={() => { setOutfitBuilder(false); setEditingOutfit(null); setOutfitSeedItem(null); }}
        />
      )}

      {/* Lookbook Viewer */}
      {activeLookbook && (
        <LookbookViewer
          lookbook={activeLookbook}
          outfits={outfitsDb.rows}
          allItems={allItems}
          onClose={() => setActiveLookbook(null)}
          onUpdate={updateLookbook}
          onOpenOutfit={(outfit) => { setActiveLookbook(null); setOutfitPopup(outfit); }}
        />
      )}
    </div>
  );
}
