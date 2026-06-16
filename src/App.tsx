import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Tag, 
  Calendar, 
  Heart, 
  Layers, 
  Plus, 
  X,
  Compass,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  FolderOpen,
  Database,
  RefreshCw,
  Check
} from "lucide-react";

import { Message, Series, Bookmark } from "./types";
import { initialSeries, initialMessages } from "./data/initialData";
import Header from "./components/Header";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import MessageCard from "./components/MessageCard";
import MessageReader from "./components/MessageReader";
import pozoLogo from "./assets/images/pozo_clean_logo_1780936653610.png";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"home" | "series" | "search" | "bookmarks">("home");
  
  // Theme state: "oled" (high contrast pure black) vs "day" (Forest sage teal)
  const [theme, setTheme] = useState<"oled" | "day">(() => {
    const cached = localStorage.getItem("grupito_theme");
    return (cached === "day" || cached === "oled") ? cached : "oled";
  });

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "oled" ? "day" : "oled";
      localStorage.setItem("grupito_theme", next);
      return next;
    });
  };

  const isOled = theme === "oled";

  // Database state - immediately loaded with pre-established test messages or cached messages
  const [messages, setMessages] = useState<Message[]>(() => {
    const cachedMessages = localStorage.getItem("santibanez_messages");
    if (cachedMessages) {
      try {
        return JSON.parse(cachedMessages);
      } catch (e) {
        return initialMessages;
      }
    }
    return initialMessages;
  });
  const [seriesList] = useState<Series[]>(initialSeries);
  
  // Selected filtered series (for the "Series" tab view)
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  
  // Selected message for reader viewport
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSeriesFilter, setSearchSeriesFilter] = useState<string>("all");
  
  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Loading & syncing statuses - false by default so the app opens instantly "de una"
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // 1. Initial State Load
  useEffect(() => {
    // Load bookmarks
    const cachedBookmarks = localStorage.getItem("santibanez_bookmarks");
    if (cachedBookmarks) {
      try {
        setBookmarks(JSON.parse(cachedBookmarks));
      } catch (e) {
        setBookmarks([]);
      }
    }
  }, []);

  // Manual update/download action from Firestore database
  const handleSyncFromFirestore = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    const collectionPath = "mensajes";
    try {
      const querySnapshot = await getDocs(collection(db, collectionPath));
      const list: Message[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });

      if (list.length > 0) {
        setMessages(list);
        localStorage.setItem("santibanez_messages", JSON.stringify(list));
        setSyncSuccess(true);
        // Fade success status after 3 seconds
        setTimeout(() => setSyncSuccess(false), 3000);
      } else {
        // If Firestore collection has no items, keep local state
        setSyncError("La base de datos en la nube está vacía. Se conservan los mensajes preestablecidos.");
        // Hide error after 5 seconds
        setTimeout(() => setSyncError(null), 5000);
      }
    } catch (error) {
      console.error("Firebase fetch error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setSyncError(`Error de conexión: ${errMsg}`);
      setTimeout(() => setSyncError(null), 10000);
      try {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } catch (wrappedError) {
        // Exception caught and logged
      }
    } finally {
      setSyncing(false);
    }
  };

  // 1.5 Seed mock messages helper
  const handleSeedMessages = async () => {
    setSeeding(true);
    setSyncError(null);
    try {
      const seededList: Message[] = [...initialMessages];
      for (const msg of seededList) {
        await setDoc(doc(db, "mensajes", msg.id), {
          id: msg.id,
          codigo: msg.codigo,
          titulo: msg.titulo,
          fecha: msg.fecha,
          serie_id: msg.serie_id,
          contenido: msg.contenido
        });
      }
      setMessages(seededList);
    } catch (error) {
      console.error("Error seeding to Firestore:", error);
      setSyncError("Error al cargar los mensajes de prueba.");
      try {
        handleFirestoreError(error, OperationType.WRITE, "mensajes");
      } catch (wrappedError) {
        // Exception captured and logged
      }
    } finally {
      setSeeding(false);
    }
  };

  // 2. Persist state helper
  const handleAddNewMessage = async (newMsg: Message) => {
    // Optimistic local state update
    setMessages((prev) => [newMsg, ...prev]);
    
    // Remote Firestore persist
    const path = `mensajes/${newMsg.id}`;
    try {
      await setDoc(doc(db, "mensajes", newMsg.id), {
        id: newMsg.id,
        codigo: newMsg.codigo,
        titulo: newMsg.titulo,
        fecha: newMsg.fecha,
        serie_id: newMsg.serie_id,
        contenido: newMsg.contenido
      });
    } catch (error) {
      console.error("Error writing message to Firestore:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // 3. Bookmark handling
  const handleToggleBookmark = (messageId: string) => {
    setBookmarks((prev) => {
      let updated;
      if (prev.includes(messageId)) {
        updated = prev.filter((id) => id !== messageId);
      } else {
        updated = [...prev, messageId];
      }
      localStorage.setItem("santibanez_bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  // Memoized lists to speed up filtering
  const sortedRecentMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [messages]);

  const filteredSeriesMessages = useMemo(() => {
    if (!selectedSeriesId) return [];
    return sortedRecentMessages.filter((m) => m.serie_id === selectedSeriesId);
  }, [selectedSeriesId, sortedRecentMessages]);

  const searchedMessages = useMemo(() => {
    if (!searchQuery.trim() && searchSeriesFilter === "all") {
      return sortedRecentMessages;
    }
    
    return sortedRecentMessages.filter((m) => {
      const matchSeries = searchSeriesFilter === "all" || m.serie_id === searchSeriesFilter;
      
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchSeries;
      
      const matchTitle = m.titulo.toLowerCase().includes(query);
      const matchContent = m.contenido.toLowerCase().includes(query);
      const matchCode = m.codigo.toLowerCase().includes(query);
      
      return matchSeries && (matchTitle || matchContent || matchCode);
    });
  }, [searchQuery, searchSeriesFilter, sortedRecentMessages]);

  const bookmarkedMessages = useMemo(() => {
    return sortedRecentMessages.filter((m) => bookmarks.includes(m.id));
  }, [bookmarks, sortedRecentMessages]);

  const currentlyReadingMessage = useMemo(() => {
    if (!selectedMessageId) return null;
    return messages.find((m) => m.id === selectedMessageId) || null;
  }, [selectedMessageId, messages]);

  const currentlyReadingSeries = useMemo(() => {
    if (!currentlyReadingMessage) return undefined;
    return seriesList.find((s) => s.id === currentlyReadingMessage.serie_id);
  }, [currentlyReadingMessage, seriesList]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans antialiased ${
        isOled ? "bg-[#000000] text-white" : "bg-zinc-50 text-emerald-950"
      }`}>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className={`absolute -inset-1.5 rounded-full blur opacity-40 animate-pulse ${
              isOled ? "bg-[#FDE047]" : "bg-emerald-600"
            }`} />
            <div className={`relative p-2 rounded-full border shadow-2xl ${
              isOled ? "bg-black border-zinc-800" : "bg-white border-zinc-200"
            }`}>
              <img 
                src={pozoLogo} 
                alt="Logo El Grupito Pequeño" 
                className="h-24 w-24 rounded-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Spinning load track */}
            <div className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${
              isOled ? "border-[#FDE047]" : "border-emerald-600"
            }`} />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-serif text-xl font-bold tracking-tight">
              Conectando al Archivo...
            </h3>
            <p className="text-xs text-zinc-500 font-mono">
              Estableciendo conexión segura con Cloud Firestore...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-500 ${
      isOled 
        ? "bg-[#000000] text-[#E0E0E0] selection:bg-[#FDE047]/30 selection:text-[#FDE047]" 
        : "bg-white text-zinc-850 selection:bg-emerald-100 selection:text-emerald-900"
    }`} id="app-root">
      
      {/* Navigation header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedMessageId(null); // Clear reader on tab switch
        }} 
        bookmarksCount={bookmarks.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSync={handleSyncFromFirestore}
        syncing={syncing}
        syncSuccess={syncSuccess}
      />

      {/* Main layout viewport container */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* 1. READER VIEW - Rendered above standard lists if selected */}
          {currentlyReadingMessage ? (
            <motion.div
              key="reader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <MessageReader 
                message={currentlyReadingMessage}
                series={currentlyReadingSeries}
                onBack={() => setSelectedMessageId(null)}
                isBookmarked={bookmarks.includes(currentlyReadingMessage.id)}
                onToggleBookmark={() => handleToggleBookmark(currentlyReadingMessage.id)}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            </motion.div>
          ) : (
            
            // 2. STANDARD TAB MODULES
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB A: HOME / RECENT MESSAGES */}
              {activeTab === "home" && (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="home-view">
                  
                   {/* Hero banner section */}
                  <div className={`relative mb-12 overflow-hidden rounded-3xl border px-6 py-12 text-center shadow-2xl sm:px-12 sm:py-16 transition-all duration-300 ${
                    isOled 
                      ? "bg-gradient-to-br from-[#0A0A0C] to-[#121214] border-[#27272A]" 
                      : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
                  }`}>
                    {/* Visual pattern ornament placeholder */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]" />
                    
                    <div className="relative mx-auto max-w-2xl">
                      <div className="flex justify-center mb-6">
                        <div className={`p-1.5 rounded-full shadow-2xl transition-transform duration-500 hover:scale-105 border ${
                          isOled 
                            ? "bg-black/55 border-zinc-800 shadow-black/80" 
                            : "bg-white border-emerald-100 shadow-emerald-100/20"
                        }`}>
                          <img 
                            src={pozoLogo} 
                            alt="Logo El Grupito Pequeño" 
                            className="h-28 w-28 rounded-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold border mb-4 ${
                        isOled 
                          ? "bg-black/60 text-[#FDE047] border-[#FDE047]/20" 
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        <Compass className="h-3 w-3" />
                        Archivo Patrimonial Digital
                      </span>

                      
                      {/* Search quick button */}
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={() => setActiveTab("search")}
                          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold active:scale-95 transition-all shadow-lg cursor-pointer ${
                            isOled 
                              ? "bg-[#FDE047] text-[#121212] hover:bg-[#FDE047]/95 shadow-[#FDE047]/10" 
                              : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-100/40"
                          }`}
                        >
                          <Search className="h-4 w-4" />
                          Explorar Búsqueda Avanzada
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent messages grid */}
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className={`font-serif text-2xl font-bold ${
                          isOled ? "text-white" : "text-emerald-950"
                        }`}>
                          Mensajes Recientes
                        </h3>
                        <p className="text-zinc-500 text-xs">
                          Los últimos sermones catalogados cronológicamente.
                        </p>
                      </div>

                      <div className="flex items-center">
                        {/* Manual sync button */}
                        <button
                          onClick={handleSyncFromFirestore}
                          disabled={syncing}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-tight active:scale-95 disabled:opacity-75 transition-all cursor-pointer ${
                            isOled 
                              ? "bg-[#121214] border-[#27272A] text-zinc-300 hover:text-[#FDE047] hover:border-[#FDE047]/20" 
                              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          }`}
                          title="Sincronizar y descargar mensajes desde la base de datos remota"
                        >
                          <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                          {syncing ? "Actualizando..." : syncSuccess ? "¡Actualizado!" : "Actualizar desde la Nube"}
                        </button>
                      </div>
                    </div>

                    {/* Database status feedback banner */}
                    {(syncError || syncSuccess) && (
                      <div className={`mb-6 p-4 rounded-2xl border text-xs font-mono flex items-center justify-between transition-all ${
                        syncError 
                          ? isOled 
                            ? "bg-red-950/20 border-red-900/30 text-red-400" 
                            : "bg-red-50 border-red-100 text-red-700"
                          : isOled 
                            ? "bg-emerald-950/20 border-emerald-900/30 text-[#FDE047]" 
                            : "bg-emerald-50 border-emerald-100 text-emerald-800"
                      }`}>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 shrink-0" />
                          <span>{syncError || "¡Sincronización finalizada con éxito! El catálogo ha sido actualizado con los mensajes de la nube."}</span>
                        </div>
                        <button 
                          onClick={() => { setSyncError(null); setSyncSuccess(false); }}
                          className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {messages.length === 0 ? (
                      <div className={`rounded-3xl border border-dashed p-12 text-center max-w-lg mx-auto ${
                        isOled ? "border-[#27272A] bg-[#0A0A0C]/40" : "border-emerald-100 bg-emerald-50/20"
                      }`}>
                        <div className="flex justify-center mb-5">
                          <div className={`p-4 rounded-2xl ${
                            isOled ? "bg-zinc-900 border border-zinc-800" : "bg-emerald-50 border border-emerald-100"
                          }`}>
                            <Database className={`h-8 w-8 ${isOled ? "text-[#FDE047]" : "text-emerald-600"}`} />
                          </div>
                        </div>
                        <h4 className={`text-lg font-bold font-serif ${isOled ? "text-white" : "text-emerald-950"}`}>
                          Base de Datos Vacía
                        </h4>
                        <p className={`mt-2 text-sm leading-relaxed max-w-sm mx-auto ${
                          isOled ? "text-zinc-500" : "text-zinc-650"
                        }`}>
                          No se encontraron sermones en tu base de datos de Cloud Firestore. Puedes descargar el catálogo o subir el catálogo inicial con los mensajes de prueba.
                        </p>
                        
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <button
                            onClick={handleSeedMessages}
                            disabled={seeding}
                            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                              isOled 
                                ? "bg-[#FDE047] text-[#121212] hover:bg-[#FDE047]/95" 
                                : "bg-emerald-600 text-white hover:bg-emerald-500"
                            }`}
                          >
                            {seeding ? (
                              <>
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Creando catálogo...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4.5 w-4.5" />
                                Subir Mensajes de Prueba a Firestore
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedRecentMessages.map((msg) => (
                          <MessageCard 
                            key={msg.id}
                            message={msg}
                            series={seriesList.find((s) => s.id === msg.serie_id)}
                            onClick={() => setSelectedMessageId(msg.id)}
                            isBookmarked={bookmarks.includes(msg.id)}
                            onToggleBookmark={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(msg.id);
                            }}
                            theme={theme}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB B: SERIES / CATEGORIES */}
              {activeTab === "series" && (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="series-view">
                  <div className="mb-8">
                    <h2 className={`font-serif text-3xl font-bold tracking-tight ${
                      isOled ? "text-white" : "text-emerald-950"
                    }`}>
                      Series y Categorías
                    </h2>
                    <p className={`mt-2 sm:text-sm ${
                      isOled ? "text-zinc-400" : "text-zinc-650"
                    }`}>
                      Filtre las enseñanzas de la comunidad seleccionando una línea temática.
                    </p>
                  </div>

                  {/* Series cards selection bento grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                    {seriesList.map((serie) => {
                      const isSelected = selectedSeriesId === serie.id;
                      const msgCount = messages.filter((m) => m.serie_id === serie.id).length;

                      return (
                        <div
                          key={serie.id}
                          onClick={() => setSelectedSeriesId(isSelected ? null : serie.id)}
                          className={`relative rounded-2xl p-6 border cursor-pointer transition-all ${
                            isSelected 
                              ? isOled 
                                ? "bg-gradient-to-br from-[#121215] to-[#1C1C20] border-[#FDE047] text-white shadow-xl" 
                                : "bg-gradient-to-br from-emerald-650 to-teal-700 border-emerald-600 text-white shadow-lg"
                              : isOled 
                                ? "bg-[#0A0A0C] border-[#27272A] text-zinc-300 hover:border-zinc-700 hover:bg-[#121214]" 
                                : "bg-white border-zinc-200 text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/20"
                          }`}
                        >
                          <div className={`p-3 rounded-xl w-fit mb-4 ${
                            isSelected 
                              ? "bg-black/30 text-[#FDE047]" 
                              : isOled 
                                ? "bg-black/20 text-[#34D399]" 
                                : "bg-emerald-50 text-emerald-600"
                          }`}>
                            <FolderOpen className="h-5 w-5" />
                          </div>

                          <h3 className="font-serif text-lg font-bold leading-snug">
                            {serie.titulo}
                          </h3>
                          
                          <p className={`text-xs mt-2 leading-relaxed ${
                            isSelected 
                              ? isOled ? "text-zinc-300" : "text-emerald-100"
                              : isOled ? "text-zinc-500" : "text-zinc-500"
                          }`}>
                            {serie.descripcion}
                          </p>

                          <div className={`mt-6 flex items-center justify-between border-t pt-3 text-[10px] font-mono ${
                            isSelected
                              ? isOled ? "border-zinc-800/80" : "border-emerald-500/30"
                              : isOled ? "border-zinc-800/80" : "border-zinc-100"
                          }`}>
                            <span className={isSelected ? isOled ? "text-zinc-400" : "text-emerald-200" : "text-zinc-400"}>
                              Total:
                            </span>
                            <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                              isSelected 
                                ? isOled 
                                  ? "bg-[#27272A] text-[#FDE047] border border-[#FDE047]/20" 
                                  : "bg-emerald-800 text-white border border-emerald-500/20"
                                : isOled
                                  ? "bg-black/20 text-zinc-300"
                                  : "bg-zinc-50 text-zinc-600 border border-zinc-100"
                            }`}>
                              {msgCount} {msgCount === 1 ? "mensaje" : "mensajes"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Series selected filtered results */}
                  {selectedSeriesId ? (
                    <div>
                      <div className={`mb-6 flex items-center justify-between border-b pb-3 ${
                        isOled ? "border-[#27272A]" : "border-zinc-100"
                      }`}>
                        <h3 className={`font-serif text-xl font-bold flex items-center gap-2 ${
                          isOled ? "text-white" : "text-emerald-950"
                        }`}>
                          <Layers className={`h-5 w-5 ${isOled ? "text-[#FDE047]" : "text-emerald-600"}`} />
                          Listado de Serie: {seriesList.find((s) => s.id === selectedSeriesId)?.titulo}
                        </h3>
                        <button
                          onClick={() => setSelectedSeriesId(null)}
                          className={`text-xs font-semibold cursor-pointer ${
                            isOled ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-emerald-700"
                          }`}
                        >
                          Ver todas las series
                        </button>
                      </div>

                      {filteredSeriesMessages.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredSeriesMessages.map((msg) => (
                            <MessageCard 
                              key={msg.id}
                              message={msg}
                              series={seriesList.find((s) => s.id === msg.serie_id)}
                              onClick={() => setSelectedMessageId(msg.id)}
                              isBookmarked={bookmarks.includes(msg.id)}
                              onToggleBookmark={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(msg.id);
                              }}
                              theme={theme}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${
                          isOled 
                            ? "border-[#27272A] bg-[#0A0A0C]/50 text-zinc-500" 
                            : "border-zinc-200 bg-zinc-50 text-zinc-500"
                        }`}>
                          No hay sermones cargados bajo esta temática actualmente.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`rounded-2xl p-10 text-center border ${
                      isOled ? "bg-[#0A0A0C] border-[#27272A] text-zinc-500" : "bg-zinc-50 border-zinc-100 text-zinc-500"
                    }`}>
                      <p className="text-sm text-zinc-400">Selecciona una tarjeta superior para desplegar los sermones vinculados a esa serie cronológicamente.</p>
                    </div>
                  )}
                </div>
              )}
              {/* TAB C: ADVANCED SEARCH */}
              {activeTab === "search" && (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="search-view">
                  <div className="mb-8">
                    <h2 className={`font-serif text-3xl font-bold tracking-tight ${
                      isOled ? "text-white" : "text-emerald-950"
                    }`}>
                      Buscador Crítico Avanzado
                    </h2>
                    <p className={`mt-2 sm:text-sm ${
                      isOled ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Búsquedas de texto completo de alta velocidad con resaltador interactivo para la comunidad de EL GRUPITO PEQUEÑO.
                    </p>
                  </div>

                  {/* Search Engine Controllers Box */}
                  <div className={`mb-8 rounded-2xl border p-6 shadow-xl ${
                    isOled ? "border-[#27272A] bg-[#0A0A0C]" : "border-zinc-200 bg-zinc-50"
                  }`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      
                      {/* Text Input */}
                      <div className="relative flex-grow">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar por palabra clave (ej: 'oración', 'paciencia', 'EL GRUPITO PEQUEÑO', 'familia')..."
                          className={`w-full rounded-xl border pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-1 transition-all font-sans ${
                            isOled 
                              ? "bg-[#1E1E22] border-[#27272A] text-white placeholder-zinc-500 focus:border-[#FDE047] focus:ring-[#FDE047]" 
                              : "bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500"
                          }`}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                              isOled ? "text-zinc-400 hover:text-white" : "text-zinc-400 hover:text-zinc-700"
                            }`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown series filter */}
                      <div className="min-w-[200px]">
                        <select
                          value={searchSeriesFilter}
                          onChange={(e) => setSearchSeriesFilter(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-3 text-sm focus:outline-none focus:ring-1 transition-all font-sans ${
                            isOled 
                              ? "bg-[#1E1E22] border-[#27272A] text-zinc-300 focus:border-[#FDE047] focus:ring-[#FDE047]" 
                              : "bg-white border-zinc-200 text-zinc-700 focus:border-emerald-500 focus:ring-emerald-500"
                          }`}
                        >
                          <option value="all">Ver todas las Series</option>
                          {seriesList.map((s) => (
                            <option key={s.id} value={s.id}>{s.titulo}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Suggest tags clickables */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500 font-mono">Búsquedas rápidas:</span>
                      {["oración", "esperanza", "familia", "siembra", "unidad"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isOled 
                              ? "bg-[#27272A]/40 text-[#FDE047] border-[#27272A] hover:bg-[#27272A]" 
                              : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50"
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Count Line */}
                  <div className="mb-6 flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>
                      Encontrados: <strong className={`font-bold ${isOled ? "text-white" : "text-zinc-800"}`}>{searchedMessages.length}</strong> sermones
                    </span>
                    {searchQuery && (
                      <span>
                        Resaltando palabra clave: <strong className={`font-bold ${isOled ? "text-[#FDE047]" : "text-emerald-700"}`}>"{searchQuery}"</strong>
                      </span>
                    )}
                  </div>

                  {/* Grid or Empty container */}
                  {searchedMessages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {searchedMessages.map((msg) => (
                        <MessageCard 
                          key={msg.id}
                          message={msg}
                          series={seriesList.find((s) => s.id === msg.serie_id)}
                          searchTerm={searchQuery}
                          onClick={() => setSelectedMessageId(msg.id)}
                          isBookmarked={bookmarks.includes(msg.id)}
                          onToggleBookmark={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(msg.id);
                          }}
                          theme={theme}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`rounded-2xl border border-dashed p-12 text-center max-w-md mx-auto ${
                      isOled ? "border-[#27272A] bg-[#0A0A0C]/60" : "border-zinc-200 bg-zinc-50"
                    }`}>
                      <AlertCirclePlaceholder className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                      <h4 className={`text-sm font-semibold ${isOled ? "text-white" : "text-zinc-800"}`}>La consulta SQL FTS5 no arrojó coincidencias</h4>
                      <p className="mt-1 text-xs text-zinc-500 leading-normal">
                        No hemos encontrado sermones que contengan los términos de búsqueda introducidos en la serie temática activa. Intenta con palabras clave más simples como "fe" u "hogar".
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB D: MIS FAVORITOS / BOOKMARKS */}
              {activeTab === "bookmarks" && (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="bookmarks-view">
                  <div className="mb-8">
                    <h2 className={`font-serif text-3xl font-bold tracking-tight ${
                      isOled ? "text-white" : "text-emerald-950"
                    }`}>
                      Mis Favoritos Guardados
                    </h2>
                    <p className={`mt-2 sm:text-sm ${
                      isOled ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Sermones y reflexiones seleccionados especialmente para tus lecturas recurrentes offline.
                    </p>
                  </div>

                  {bookmarkedMessages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {bookmarkedMessages.map((msg) => (
                        <MessageCard 
                          key={msg.id}
                          message={msg}
                          series={seriesList.find((s) => s.id === msg.serie_id)}
                          onClick={() => setSelectedMessageId(msg.id)}
                          isBookmarked={bookmarks.includes(msg.id)}
                          onToggleBookmark={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(msg.id);
                          }}
                          theme={theme}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={`rounded-2xl border border-dashed p-12 text-center max-w-md mx-auto ${
                      isOled ? "border-[#27272A] bg-[#0A0A0C]/60" : "border-zinc-200 bg-zinc-50"
                    }`}>
                      <Heart className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                      <h4 className={`text-sm font-semibold ${isOled ? "text-white" : "text-zinc-800"}`}>Tu librero de favoritos está vacío</h4>
                      <p className="mt-1 text-xs text-zinc-500 leading-normal">
                        Agrega sermones tocando el ícono de corazón en cualquiera de las tarjetas de sermón en Inicio o en Series para conservarlos aquí.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Spacer to prevent fixed mobile footer from blocking bottom content view */}
      <div className="h-16 block md:hidden shrink-0" />

      {/* Primary Mobile Navigation Footer Rail - ONLY visible on smaller screens */}
      <footer className={`fixed bottom-0 left-0 right-0 z-50 block md:hidden border-t shadow-inner ${
        isOled ? "border-[#27272A] bg-[#0A0A0C]" : "border-emerald-100 bg-white"
      }`}>
        <div className="flex items-center justify-around h-16">
          <button 
            onClick={() => { setActiveTab("home"); setSelectedMessageId(null); }}
            className={`flex flex-col items-center justify-center space-y-0.5 text-xs font-semibold transition-colors ${
              activeTab === "home" 
                ? isOled ? "text-[#FDE047]" : "text-emerald-700 font-bold" 
                : "text-zinc-400 hover:text-zinc-650"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Inicio</span>
          </button>

          <button 
            onClick={() => { setActiveTab("series"); setSelectedMessageId(null); }}
            className={`flex flex-col items-center justify-center space-y-0.5 text-xs font-semibold transition-colors ${
              activeTab === "series" 
                ? isOled ? "text-[#FDE047]" : "text-emerald-700 font-bold" 
                : "text-zinc-400 hover:text-zinc-650"
            }`}
          >
            <FolderOpen className="h-5 w-5" />
            <span>Series</span>
          </button>

          <button 
            onClick={() => { setActiveTab("search"); setSelectedMessageId(null); }}
            className={`flex flex-col items-center justify-center space-y-0.5 text-xs font-semibold transition-colors ${
              activeTab === "search" 
                ? isOled ? "text-[#FDE047]" : "text-emerald-700 font-bold" 
                : "text-zinc-400 hover:text-zinc-650"
            }`}
          >
            <Search className="h-5 w-5" />
            <span>Buscar</span>
          </button>

          <button 
            onClick={() => { setActiveTab("bookmarks"); setSelectedMessageId(null); }}
            className={`flex flex-col items-center justify-center space-y-0.5 text-xs font-semibold relative transition-colors ${
              activeTab === "bookmarks" 
                ? isOled ? "text-rose-400" : "text-rose-700 font-bold" 
                : "text-zinc-400 hover:text-rose-50"
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Favoritos</span>
            {bookmarks.length > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

// Minimal auxiliary component for fallback SVGs to keep files clean and standard
function AlertCirclePlaceholder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}
