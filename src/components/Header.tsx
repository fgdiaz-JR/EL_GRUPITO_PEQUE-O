import React from "react";
import { BookOpen, Search, Users, Database, Sparkles, Heart, Sun, Moon } from "lucide-react";
import pozoLogo from "../assets/images/pozo_clean_logo_1780936653610.png";

interface HeaderProps {
  activeTab: "home" | "series" | "search" | "bookmarks" | "etl";
  setActiveTab: (tab: "home" | "series" | "search" | "bookmarks" | "etl") => void;
  bookmarksCount: number;
  theme: "oled" | "day";
  onToggleTheme: () => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  bookmarksCount, 
  theme, 
  onToggleTheme 
}: HeaderProps) {
  const isOled = theme === "oled";

  return (
    <header className={`relative z-40 w-full border-b transition-all duration-300 ${
      isOled ? "border-[#27272A] bg-[#0A0A0C]/90" : "border-emerald-100 bg-white"
    }`}>
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand logo */}
        <div 
          onClick={() => setActiveTab("home")} 
          className="flex cursor-pointer items-center space-x-2.5"
          id="brand-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden shadow-lg border border-zinc-800 transition-transform hover:scale-105 bg-black/40">
            <img 
              src={pozoLogo} 
              alt="Logo El Grupito Pequeño" 
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className={`font-serif text-sm font-bold tracking-tight leading-none uppercase ${
              isOled ? "text-white" : "text-[#1C2D2A]"
            }`}>
              EL GRUPITO PEQUEÑO
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-[#708E86] uppercase mt-0.5 font-bold">
              Archivo de Mensajes
            </p>
          </div>
        </div>

        {/* Global Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === "home" 
                ? isOled ? "bg-[#27272A] text-[#FDE047]" : "bg-emerald-50 text-emerald-800 border border-emerald-200/80" 
                : isOled ? "text-zinc-400 hover:bg-[#1E1E22] hover:text-white" : "text-zinc-650 hover:bg-emerald-50/40 hover:text-emerald-800"
            }`}
            id="nav-home"
          >
            <BookOpen className="h-4 w-4" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab("series")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === "series" 
                ? isOled ? "bg-[#27272A] text-[#FDE047]" : "bg-emerald-50 text-emerald-800 border border-emerald-200/80" 
                : isOled ? "text-zinc-400 hover:bg-[#1E1E22] hover:text-white" : "text-zinc-650 hover:bg-emerald-50/40 hover:text-emerald-800"
            }`}
            id="nav-series"
          >
            <Users className="h-4 w-4" />
            <span>Series</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === "search" 
                ? isOled ? "bg-[#27272A] text-[#FDE047]" : "bg-emerald-50 text-emerald-800 border border-emerald-200/80" 
                : isOled ? "text-zinc-400 hover:bg-[#1E1E22] hover:text-white" : "text-zinc-650 hover:bg-emerald-50/40 hover:text-emerald-800"
            }`}
            id="nav-search"
          >
            <Search className="h-4 w-4" />
            <span>Búsqueda</span>
          </button>

          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              activeTab === "bookmarks" 
                ? isOled ? "bg-[#27272A] text-rose-400 border border-rose-950/40" : "bg-rose-50 text-rose-700 border border-rose-200" 
                : isOled ? "text-zinc-400 hover:bg-[#1E1E22] hover:text-white" : "text-zinc-650 hover:bg-rose-50/40 hover:text-rose-800"
            }`}
            id="nav-bookmarks"
          >
            <Heart className="h-4 w-4" />
            <span>Mis Favoritos</span>
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                {bookmarksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("etl")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === "etl" 
                ? isOled 
                  ? "bg-gradient-to-r from-[#FDE047] to-[#CA8A04] text-[#121212] font-semibold" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-sm"
                : isOled 
                  ? "text-zinc-400 border border-[#27272A] hover:bg-[#1E1E22] hover:text-white" 
                  : "text-zinc-650 border border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-750"
            }`}
            id="nav-etl"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Catalogar (ETL)</span>
          </button>
        </nav>

        {/* Action Widgets & Theme Toggler */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggler Switcher Button */}
          <button
            onClick={onToggleTheme}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
              isOled 
                ? "bg-[#1E1E22] border-[#27272A] text-[#FDE047] hover:bg-zinc-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
            }`}
            title={isOled ? "Cambiar a Modo Día (Sage)" : "Cambiar a Modo Noche (OLED)"}
            id="btn-theme-toggle"
          >
            {isOled ? (
              <Sun className="h-4.5 w-4.5 animate-spin-slow" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>

          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-medium transition-all duration-300 ${
            isOled 
              ? "bg-[#1E1E22] border-[#27272A] text-emerald-400"
              : "bg-emerald-50/60 border-emerald-200 text-emerald-700 font-semibold"
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </span>
            <span className="hidden sm:inline">SQLITE OFFLINE (FTS5)</span>
            <span className="sm:hidden">SQLITE</span>
          </span>
        </div>
      </div>
    </header>
  );
}
