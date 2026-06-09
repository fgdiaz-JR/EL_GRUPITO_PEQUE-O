import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Message, Series } from "../types";
import { 
  ArrowLeft, 
  Clock, 
  Tag, 
  Calendar, 
  Type, 
  Bookmark, 
  BookmarkCheck,
  Printer, 
  Sparkles,
  Share2,
  Copy,
  Check,
  Sun,
  Moon,
  Menu,
  Maximize2,
  Minimize2,
  Pencil,
  Settings,
  X,
  BookOpen,
  FileText
} from "lucide-react";

interface MessageReaderProps {
  message: Message;
  series?: Series;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  theme: "oled" | "day";
  onToggleTheme: () => void;
}

export default function MessageReader({ 
  message, 
  series, 
  onBack, 
  isBookmarked, 
  onToggleBookmark,
  theme,
  onToggleTheme
}: MessageReaderProps) {
  const isOled = theme === "oled";

  // Configuration States
  const [fontSize, setFontSize] = useState<number>(18); // Default 18px reading size
  const [copied, setCopied] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif"); // Defaults to elegant serif reading
  const [isWide, setIsWide] = useState<boolean>(false); // Narrow reading mode by default, wide on request
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTOC, setShowTOC] = useState<boolean>(false);
  
  // Interactive study notes for the sermon (stored in localStorage)
  const [showStudyNotes, setShowStudyNotes] = useState<boolean>(false);
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem(`studynotes_${message.id}`) || "";
  });
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // Parse markdown headers to populate Table of Contents
  const headings = React.useMemo(() => {
    const lines = message.contenido.split("\n");
    const found: { text: string; id: string; level: number }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`]/g, "").trim();
        // Generate valid anchor id
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        found.push({ text, id, level });
      }
    });
    return found;
  }, [message.contenido]);

  // Estimates reading time
  const wordCount = message.contenido.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 180); // Average 180 words per minute

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.contenido);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveNotes = (val: string) => {
    setPersonalNote(val);
    localStorage.setItem(`studynotes_${message.id}`, val);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 1500);
  };

  // Scroll to section helper
  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setShowTOC(false);
  };

  // Ensure view jumps to top on load for seamless reading
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [message.id]);

  // Custom typography style
  const getFamilyClass = () => {
    if (fontFamily === "serif") return "font-serif tracking-normal leading-relaxed";
    if (fontFamily === "mono") return "font-mono tracking-tight text-xs";
    return "font-sans tracking-tight text-sm";
  };

  return (
    <div className={`mx-auto px-4 py-8 sm:px-6 lg:py-12 transition-all duration-300 ${
      isWide ? "max-w-6xl" : "max-w-4xl"
    }`} id="message-reader">
      
      {/* 1. TOP BREADCRUMB AND UTILITIES */}
      <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 ${
        isOled ? "border-[#27272A]" : "border-[#253D38]"
      }`}>
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
            isOled ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-emerald-700"
          }`}
          id="btn-back-reader"
        >
          <ArrowLeft className={`h-4 w-4 ${isOled ? "text-[#FDE047]" : "text-emerald-600"}`} />
          Volver al catálogo
        </button>

        {/* Saved indicator and actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className={`inline-flex items-center justify-center rounded-xl border p-2.5 shadow-sm transition-all ${
              isOled 
                ? "border-[#27272A] bg-[#1E1E22] text-zinc-400 hover:text-white hover:bg-[#27272A]" 
                : "border-zinc-200 bg-white text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
            }`}
            title="Imprimir sermón"
          >
            <Printer className="h-4 w-4" />
          </button>

          {/* Bookmark Trigger */}
          <button
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border shadow-md transition-all ${
              isBookmarked 
                ? isOled
                  ? "bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60" 
                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                : isOled 
                  ? "bg-[#1E1E22] border-[#27272A] text-zinc-400 hover:bg-[#27272A] hover:text-white"
                  : "bg-white border-zinc-200 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            }`}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className={`h-3.5 w-3.5 fill-current ${isOled ? "text-rose-400" : "text-rose-600"}`} />
                Sermón Guardado
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                Marcar como Favorito
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. EMULATED SCREEN READER TOOLBAR (Matches Screenshots exactly) */}
      <div className={`mb-6 flex items-center justify-between rounded-2xl border px-5 py-3 shadow-xl transition-all ${
        isOled ? "bg-[#0A0A0C] border-[#1F1F22]" : "bg-zinc-50 border-zinc-200"
      }`}>
        {/* Left Side: Hamburguer Table of Contents Trigger */}
        <div className="relative">
          <button
            onClick={() => { setShowTOC(!showTOC); setShowSettings(false); }}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showTOC 
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white" 
                : isOled 
                  ? "border-[#27272A] bg-[#1E1E22] text-zinc-300 hover:text-[#FDE047]" 
                  : "border-zinc-200 bg-white text-zinc-650 hover:text-emerald-700 hover:bg-emerald-50/50"
            }`}
            title="Tabla de contenidos de sermón"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Índice</span>
          </button>

          {/* TOC Dropdown Portal Popover */}
          {showTOC && (
            <div className={`absolute left-0 mt-2.5 z-50 w-72 rounded-2xl border p-4 shadow-2xl transition-all ${
              isOled ? "bg-[#121215] border-[#27272A] text-zinc-100" : "bg-white border-zinc-200 text-zinc-800"
            }`}>
              <div className={`flex items-center justify-between border-b pb-2 mb-3 ${isOled ? "border-zinc-800" : "border-zinc-105"}`}>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">
                  Esquema de Lectura (Estudio)
                </span>
                <X className="h-3.5 w-3.5 cursor-pointer text-zinc-400 hover:text-zinc-700" onClick={() => setShowTOC(false)} />
              </div>
              
              {headings.length > 0 ? (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {headings.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToAnchor(h.id)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors cursor-pointer block ${
                        h.level === 3 
                          ? "pl-5 text-zinc-400 hover:text-emerald-750" 
                          : isOled 
                            ? "font-semibold text-zinc-200 hover:text-[#FDE047]" 
                            : "font-semibold text-zinc-700 hover:text-emerald-750"
                      } hover:bg-emerald-50/50`}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No se encontraron subtítulos específicos formateados en Markdown.</p>
              )}
            </div>
          )}
        </div>

        {/* Center/Right controls row mirroring: [☼/☾ Switch] [⛶ Full] [✎ Pencil Notebook] [⚙ Settings menu] [✕ Close] */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* 1. Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition ${
              isOled 
                ? "border-[#27272A] bg-[#1E1E22] text-[#FDE047] hover:bg-zinc-800" 
                : "border-zinc-200 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-250"
            }`}
            title={isOled ? "Cambiar a Modo Día (Sage)" : "Cambiar a Modo Noche (OLED)"}
          >
            {isOled ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>

          {/* 2. Fullscreen / Width Toggle */}
          <button
            onClick={() => setIsWide(!isWide)}
            className={`p-2.5 rounded-xl border transition ${
              isWide 
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white" 
                : isOled 
                  ? "border-[#27272A] bg-[#1E1E22] text-zinc-400 hover:text-white" 
                  : "border-zinc-200 bg-white text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50/50"
            }`}
            title={isWide ? "Pantalla compacta" : "Pantalla ancha extendida"}
          >
            {isWide ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
          </button>

          {/* 3. Study Notepad Toggle */}
          <button
            onClick={() => setShowStudyNotes(!showStudyNotes)}
            className={`p-2.5 rounded-xl border transition relative ${
              showStudyNotes 
                ? "bg-emerald-600 text-white border-transparent shadow shadow-emerald-500/10" 
                : isOled 
                  ? "border-[#27272A] bg-[#1E1E22] text-zinc-400 hover:text-[#FDE047]" 
                  : "border-zinc-200 bg-white text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50/50"
            }`}
            title="Anotador de Estudio Personal"
          >
            <Pencil className="h-4.5 w-4.5" />
            {personalNote.trim().length > 0 && !showStudyNotes && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 border border-white animate-pulse" />
            )}
          </button>

          {/* 4. Reading Settings (Font type and size) */}
          <div className="relative">
            <button
              onClick={() => { setShowSettings(!showSettings); setShowTOC(false); }}
              className={`p-2.5 rounded-xl border transition ${
                showSettings 
                  ? "bg-zinc-800 text-white" 
                  : isOled 
                    ? "border-[#27272A] bg-[#1E1E22] text-zinc-400 hover:text-white" 
                    : "border-zinc-200 bg-white text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50/50"
              }`}
              title="Ajuste de Lectora"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>

            {showSettings && (
              <div className={`absolute right-0 mt-2.5 z-50 w-64 rounded-2xl border p-4 shadow-2xl transition-all ${
                isOled ? "bg-[#121215] border-[#27272A] text-zinc-100" : "bg-white border-zinc-200 text-zinc-800"
              }`}>
                <div className={`flex items-center justify-between border-b pb-2 mb-3 ${isOled ? "border-zinc-700" : "border-zinc-100"}`}>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400">
                    Propiedades de Texto
                  </span>
                  <X className="h-3.5 w-3.5 cursor-pointer text-zinc-400 hover:text-zinc-650" onClick={() => setShowSettings(false)} />
                </div>

                {/* Font Selector */}
                <div className="mb-4">
                  <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold block mb-1.5">Tipografía:</label>
                  <div className={`grid grid-cols-3 gap-1 rounded-lg border p-1 text-xs ${isOled ? "border-zinc-800 bg-black/40" : "border-zinc-100 bg-zinc-55"}`}>
                    {(["serif", "sans", "mono"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFontFamily(type)}
                        className={`py-1 rounded text-center capitalize font-semibold transition ${
                          fontFamily === type 
                            ? isOled ? "bg-zinc-800 text-white shadow-sm" : "bg-emerald-600 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50"
                        }`}
                      >
                        {type === "serif" ? "Ebook" : type === "sans" ? "Sans" : "Fijo"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Selector */}
                <div>
                  <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold block mb-1.5">
                    Tamaño de letra: <strong className={isOled ? "text-[#FDE047]" : "text-emerald-700"}>{fontSize}px</strong>
                  </label>
                  <div className={`flex items-center space-x-1.5 rounded-lg border p-1 ${isOled ? "border-zinc-800 bg-black/40" : "border-zinc-100 bg-zinc-55"}`}>
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      className="flex-grow py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-100/50 rounded transition"
                    >
                      Aa-
                    </button>
                    <button
                      onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                      className="flex-grow py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-100/50 rounded transition"
                    >
                      Aa+
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="h-6 w-px bg-zinc-200 self-center mx-1" />

          {/* 5. Close Reader Button (✕) */}
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl border transition ${
              isOled 
                ? "border-red-950/40 bg-[#1E1E22] text-zinc-400 hover:text-red-400 hover:bg-red-950/20" 
                : "border-zinc-200 bg-white text-zinc-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            }`}
            title="Cerrar sermón actual"
            id="btn-close-reader"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Grid wrapper supporting personal study notes in column block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Core Sermon text sheet */}
        <div className={`transition-all duration-300 ${showStudyNotes ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <article className={`rounded-2xl border p-6 sm:p-10 shadow-2xl transition-colors duration-300 print:border-none print:bg-white print:p-0 ${
            isOled 
              ? "border-[#27272A] bg-[#0A0A0C] shadow-[#000000]/60 text-zinc-300" 
              : "border-zinc-250 bg-white shadow-zinc-100/30 text-zinc-800"
          }`}>
            
            {/* Metadata tags line */}
            <div className={`mb-8 flex flex-wrap items-center gap-3 text-xs font-mono border-b pb-5 ${
              isOled ? "border-zinc-800/40 text-[#CEEBE6]" : "border-zinc-100 text-zinc-500"
            }`}>
              <span className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-lg font-bold ${
                isOled ? "bg-black/80 text-[#FDE047] border-[#FDE047]/20" : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}>
                <Tag className="h-3.5 w-3.5" />
                {message.codigo}
              </span>

              <span className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-lg ${
                isOled ? "bg-[#1E1E22] border-[#27272A] text-zinc-350" : "bg-zinc-50 border-zinc-150 text-zinc-650"
              }`}>
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                {message.fecha}
              </span>

              <span className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-lg ${
                isOled ? "bg-[#1E1E22] border-[#27272A] text-zinc-350" : "bg-zinc-50 border-zinc-150 text-zinc-650"
              }`}>
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                Est. {readingTime} min lectura
              </span>

              {series && (
                <span className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-lg font-semibold ${
                  isOled ? "bg-[#1E1E22] border-[#27272A] text-zinc-350" : "bg-emerald-50/60 border-emerald-100 text-emerald-800"
                }`}>
                  <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                  {series.titulo}
                </span>
              )}
            </div>

            {/* Dynamic reading layout section */}
            <div 
              className={`markdown-body transition-all duration-150 py-2 leading-relaxed selection:bg-emerald-500/20 ${getFamilyClass()}`}
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.9" }}
            >
              {/* Process content to attach target ids dynamically to matching H2/H3 anchors */}
              <Markdown
                components={{
                  h2: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    return <h2 id={id} className={`mt-8 mb-4 font-serif text-2xl font-bold tracking-tight border-b pb-1.5 ${
                      isOled ? "text-white border-zinc-800" : "text-emerald-950 border-zinc-100"
                    }`} {...props}>{children}</h2>;
                  },
                  h3: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    return <h3 id={id} className={`mt-6 mb-3 font-serif text-lg font-semibold ${
                      isOled ? "text-zinc-100" : "text-emerald-900"
                    }`} {...props}>{children}</h3>;
                  }
                }}
              >
                {message.contenido}
              </Markdown>
            </div>

            {/* Footer paper attribution */}
            <div className={`mt-12 pt-6 border-t border-dashed text-center text-xs font-mono text-zinc-500 ${
              isOled ? "border-[#27272A]" : "border-zinc-100"
            }`}>
              Mensaje extraído del Archivo Digital de EL GRUPITO PEQUEÑO. © 2026 Todos los derechos reservados. El material cargado se almacena de manera virtual localmente.
            </div>
          </article>
        </div>

        {/* Dynamic Study Notes columns drawer */}
        {showStudyNotes && (
          <div className="lg:col-span-4 sticky top-24">
            <div className={`rounded-2xl border p-5 shadow-2xl transition-all ${
              isOled ? "border-[#27272A] bg-[#0A0A0C]" : "border-zinc-200 bg-zinc-50"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
                isOled ? "border-zinc-800" : "border-zinc-200"
              }`}>
                <div className="flex items-center gap-1.5">
                  <Pencil className="h-4 w-4 text-emerald-600" />
                  <h4 className={`font-serif font-bold text-sm ${isOled ? "text-white" : "text-zinc-800"}`}>Libreta de Estudio</h4>
                </div>
                <button 
                  onClick={() => setShowStudyNotes(false)}
                  className={`transition ${isOled ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-zinc-500 mb-3 font-sans">
                Tus notas escritas aquí se guardarán automáticamente de forma local para este sermón. Ideal para tus meditaciones de grupo pequeño.
              </p>

              {/* Note input sheet textarea */}
              <textarea
                value={personalNote}
                onChange={(e) => handleSaveNotes(e.target.value)}
                placeholder="Escribe tus apuntes personales, citas bíblicas adicionales, resoluciones familiares o versos clave..."
                className={`w-full h-80 rounded-xl border p-3.5 text-xs font-sans focus:outline-none focus:ring-1 transition-all leading-relaxed ${
                  isOled 
                    ? "bg-[#121215] border-[#27272A] text-white focus:border-[#FDE047] focus:ring-[#FDE047]" 
                    : "bg-white border-zinc-200 text-zinc-800 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
              />

              {/* Saved indicator log feedback banner */}
              <div className="mt-3 flex items-center justify-between min-h-[20px]">
                {noteSavedFeedback ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 animate-fadeIn">
                    <Check className="h-3 w-3" />
                    Notas auto-guardadas...
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-zinc-500 block">
                    {personalNote.trim().length === 0 ? "Sin anotaciones" : `${personalNote.trim().length} caracteres guardados`}
                  </span>
                )}
                {personalNote.trim().length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("¿Seguro que deseas eliminar tus notas escritas?")) {
                        handleSaveNotes("");
                      }
                    }}
                    className="text-[10px] font-mono text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating breadcrumb footer center prompt */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
            isOled 
              ? "bg-gradient-to-r from-[#FDE047] to-[#CA8A04] text-[#121212] shadow-[#FDE047]/5" 
              : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-100/30"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </button>
      </div>
    </div>
  );
}
