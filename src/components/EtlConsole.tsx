import React, { useState } from "react";
import { 
  Terminal, 
  Copy, 
  Check, 
  HelpCircle, 
  Database, 
  Sparkles, 
  ArrowRight, 
  FileText,
  AlertTriangle,
  FileCode,
  Download,
  X
} from "lucide-react";
import { Message, ETLResult, Series } from "../types";

interface EtlConsoleProps {
  seriesList: Series[];
  onAddAnalyzedMessage: (message: Message) => void;
  theme?: string;
}

export default function EtlConsole({ seriesList, onAddAnalyzedMessage, theme = "oled" }: EtlConsoleProps) {
  const isOled = theme === "oled";
  const [activeSubTab, setActiveSubTab] = useState<"ai-etl" | "python-etl" | "schema">("ai-etl");
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [etlResult, setEtlResult] = useState<ETLResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [codeCopied, setCodeCopied] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-made templates for testing
  const templates = [
    {
      title: "Apuntes de Paciencia",
      text: `EL GRUPITO PEQUEÑO, 15 de Mayo de 2026.
Charla del domingo por la mañana. Tema: Saber esperar y tener perseverancia en el campo de cultivo.
Apuntes del orador: 
- Hablar de la paciencia, que hoy todo el mundo quiere respuestas inmediatas en internet, pero la vida real no es así. El agricultor sabe esto perfectamente.
- Usar una metáfora de las semillas de centeno en primavera: si intentas desenterrarlas para ver si crecen, las matas. Necesitan tiempo bajo la tierra, sol, lluvia y sobre todo paciencia activa.
- Citar Romanos 5 para inspirar fe.
- Código sugerido: SANT-2026-11`
    },
    {
      title: "Notas sobre Vecindario",
      text: `04/12/2025. 
Tema de comunidad para reconstruir la cerca del cementerio viejo.
- La unión hace la fuerza. EL GRUPITO PEQUEÑO unido nunca será vencido.
- Se está carcomiendo la paz vecinal por pequeñas rencillas y chismes. Debemos cortar eso.
- Proponer un día de faena vecinal el sábado entrante para reparar el muro exterior de piedras.
- Un refrigerio compartido por las familias ayuda a restablecer la armonía familiar y vecinal.
- Frase clave: 'Nadie es una isla, nos salvamos en racimo'.`
    },
    {
      title: "Hogar y Gratitud",
      text: `20 de Marzo de 2026.
Notas sobre hogar, respeto y los abuelitos.
- Valores familiares. Los niños ya no escuchan a los mayores, están pegados a los teléfonos todo el día.
- Debemos enseñar a los nietos a dar gracias y escuchar historias de la posguerra.
- El respeto de los hijos empieza por cómo ven a sus padres tratar a los abuelos cansados.
- Hacer una dinámica familiar para anotar tres cosas buenas del día antes de dormir para cultivar gratitud profunda.`
    }
  ];

  const handleApplyTemplate = (text: string) => {
    setRawText(text);
    setError(null);
    setEtlResult(null);
  };

  const handleRunAiEtl = async () => {
    if (!rawText.trim()) {
      setError("Por favor, introduce apuntes o selecciona un ejemplo.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setEtlResult(null);
    setSaveSuccess(false);
    setStatusLogs([]);

    const addLog = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setStatusLogs((prev) => [...prev, `[ETL] ${msg}`]);
          resolve();
        }, delay);
      });
    };

    try {
      // Simulate real ETL logs
      await addLog("Iniciando Fase Extraction: Capturando texto de entrada...", 100);
      await addLog("Aplicando Filtros de Limpieza: Removiendo caracteres extraños y espaciados...", 650);
      await addLog("Invocando Transformación AI: Analizando patrones teológicos y estructura en EL GRUPITO PEQUEÑO...", 800);
      await addLog("Fase Indexing FTS5: Evaluando palabras clave para optimización de búsqueda...", 800);
      await addLog("Cargando correspondencia de Series de Base de Datos...", 500);

      const response = await fetch("/api/gemini/etl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocurrió un error en el servidor al ejecutar ETL.");
      }

      const data: ETLResult = await response.json();
      setEtlResult(data);
      await addLog("¡PROCESO COMPLETADO! Mensaje catalogado y listo para cargarse.", 200);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API de procesamiento de sermones.");
      setStatusLogs((prev) => [...prev, "❌ PROCESO DE ETL FALLIDO."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveResultLocally = () => {
    if (!etlResult) return;
    
    const newMessage: Message = {
      id: `custom-${Date.now()}`,
      codigo: etlResult.codigo,
      titulo: etlResult.titulo,
      fecha: etlResult.fecha,
      serie_id: etlResult.serie_id,
      contenido: etlResult.contenido
    };

    onAddAnalyzedMessage(newMessage);
    setSaveSuccess(true);
    setEtlResult(null);
    setRawText("");
    setStatusLogs([]);
  };

  // Python ETL Script source raw string
  const pythonScriptCode = `import pdfplumber
import sqlite3
import re
import os

def clean_text(text):
    """Limpia caracteres extraños y repara saltos redundantes."""
    if not text:
        return ""
    # Arreglo de guiones divisores de palabras
    text = re.sub(r'(\\w+)-\\n(\\w+)', r'\\1\\2', text)
    # Reemplazo de espacios redundantes
    text = " ".join(text.split())
    return text

def parse_pdf_and_build_sqlite(pdf_path, db_path):
    print(f"[*] Abriendo PDF: {pdf_path}")
    
    # Abrir conexión a SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Crear esquema offline
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE,
        titulo TEXT,
        fecha TEXT,
        serie_id TEXT,
        contenido TEXT
    )
    """)
    
    # Crear tabla virtual para búsqueda rápida (FTS5)
    # Permite al móvil jalar resultados instantáneos con resaltado
    cursor.execute("DROP TABLE IF EXISTS messages_fts")
    cursor.execute("""
    CREATE VIRTUAL TABLE messages_fts USING fts5(
        titulo, 
        contenido, 
        content='messages', 
        content_rowid='id'
    )
    """)
    
    # Triggers para sincronización automática en SQLite
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS t_ai AFTER INSERT ON messages BEGIN
        INSERT INTO messages_fts(rowid, titulo, contenido) 
        VALUES (new.id, new.titulo, new.contenido);
    END
    """)
    
    messages_count = 0
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"[+] Total de páginas encontradas: {len(pdf.pages)}")
        
        for index, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text:
                continue
                
            # Regex básica para extraer metadatos de las cabeceras
            # Busca patrones como: "SANT-2025-01" o "Sermón del 15/05/2026"
            codigo_match = re.search(r'(SANT-\\d{4}-\\d{2,3})', text)
            fecha_match = re.search(r'(\\d{2}/\\d{2}/\\d{4}|\\d{4}-\\d{2}-\\d{2})', text)
            
            codigo = codigo_match.group(1) if codigo_match else f"SANT-PAGE-{index+1}"
            fecha = fecha_match.group(1) if fecha_match else "2026-05-22"
            
            # Obtener primera línea como título
            lines = [l.strip() for l in text.split('\\n') if l.strip()]
            titulo = lines[0] if lines else f"Sermón Página {index+1}"
            
            # Determinar serie (ejemplo inductivo elemental)
            serie_id = "reflexiones-fe"
            lower_text = text.lower()
            if "familia" in lower_text or "hogar" in lower_text:
                serie_id = "familia-hogar"
            elif "comunidad" in lower_text or "vecino" in lower_text or "unid" in lower_text:
                serie_id = "vida-comunitaria"
            elif "estudio" in lower_text or "profundo" in lower_text or "doctrina" in lower_text:
                serie_id = "estudios-tematicos"
                
            contenido_markdown = f"# {titulo}\\n\\n" + "\\n\\n".join(lines[1:])
            
            # Guardamos
            try:
                cursor.execute(
                    "INSERT OR REPLACE INTO messages (codigo, titulo, fecha, serie_id, contenido) VALUES (?, ?, ?, ?, ?)",
                    (codigo, clean_text(titulo), fecha, serie_id, contenido_markdown)
                )
                messages_count += 1
            except Exception as e:
                print(f"[!] Error insertando página {index+1}: {e}")
                
    conn.commit()
    conn.close()
    print(f"[+] Proceso completado con éxito. {messages_count} insertados en {db_path}.")
    print("[+] Archivo listo para ser empaquetado en los 'assets' de Flutter.")

if __name__ == "__main__":
    parse_pdf_and_build_sqlite("archivo_original.pdf", "el_grupito_pequeno_archive.db")
`;

  const sqliteSchemaText = `-- Crear Tabla Principal de Mensajes
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL, -- Formato YYYY-MM-DD
    serie_id TEXT NOT NULL,
    contenido TEXT NOT NULL -- Soporta sintaxis Markdown
);

-- Crear Tabla Virtual FTS5 para búsquedas instantáneas
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    titulo, 
    contenido, 
    content='messages', 
    content_rowid='id'
);

-- Triggers para mantener sincronizadas ambas tablas ante cambios
CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, titulo, contenido) 
    VALUES (new.id, new.titulo, new.contenido);
END;

CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, titulo, contenido) 
    VALUES('delete', old.id, old.titulo, old.contenido);
END;

CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, titulo, contenido) 
    VALUES('delete', old.id, old.titulo, old.contenido);
    INSERT INTO messages_fts(rowid, titulo, contenido) 
    VALUES (new.id, new.titulo, new.contenido);
END;
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonScriptCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sqliteSchemaText);
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id="etl-console-page">
      
      {/* Title section */}
      <div className={`mb-8 border-b pb-5 ${isOled ? "border-[#27272A]" : "border-zinc-200"}`}>
        <h2 className={`font-serif text-3xl font-bold tracking-tight sm:text-4xl ${isOled ? "text-white" : "text-emerald-950"}`}>
          Consola e Ingeniería de Datos (ETL)
        </h2>
        <p className={`mt-2 text-sm ${isOled ? "text-zinc-400" : "text-zinc-650"}`}>
          Herramientas y guías diseñadas para preparar el flujo offline de EL GRUPITO PEQUEÑO, parsear sermones con inteligencia artificial e indexarlos en SQLite.
        </p>
      </div>

      {/* Segment switcher */}
      <div className={`mb-8 flex border-b ${isOled ? "border-[#27272A]" : "border-zinc-200"}`}>
        <button
          onClick={() => setActiveSubTab("ai-etl")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
            activeSubTab === "ai-etl"
              ? isOled ? "border-[#FDE047] text-[#FDE047]" : "border-emerald-600 text-emerald-800 font-bold"
              : isOled ? "border-transparent text-zinc-400 hover:text-white hover:border-zinc-700" : "border-transparent text-zinc-500 hover:text-emerald-800 hover:border-zinc-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Asistente AI Ingesta
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("python-etl")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
            activeSubTab === "python-etl"
              ? isOled ? "border-[#FDE047] text-[#FDE047]" : "border-emerald-600 text-emerald-800 font-bold"
              : isOled ? "border-transparent text-zinc-400 hover:text-white hover:border-zinc-700" : "border-transparent text-zinc-500 hover:text-emerald-800 hover:border-zinc-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileCode className="h-4 w-4" />
            Script ETL Python
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("schema")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
            activeSubTab === "schema"
              ? isOled ? "border-[#FDE047] text-[#FDE047]" : "border-emerald-600 text-emerald-800 font-bold"
              : isOled ? "border-transparent text-zinc-400 hover:text-white hover:border-zinc-700" : "border-transparent text-zinc-500 hover:text-emerald-800 hover:border-zinc-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            Esquema SQLite Offline
          </span>
        </button>
      </div>

      {/* SUB-TABS INTERFACES */}
      {activeSubTab === "ai-etl" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12" id="ai-etl-workspace">
          
          {/* Input column */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className={`rounded-xl border p-5 shadow-xl ${
              isOled ? "border-[#27272A] bg-[#141418]" : "border-zinc-200 bg-white"
            }`}>
              <h3 className={`font-serif text-lg font-bold mb-2 flex items-center gap-2 ${isOled ? "text-white" : "text-emerald-950"}`}>
                <FileText className={`h-4 w-4 ${isOled ? "text-[#FDE047]" : "text-emerald-650"}`} />
                Inyección de Notas Crudas
              </h3>
              <p className={`text-xs mb-4 leading-normal ${isOled ? "text-zinc-500" : "text-zinc-650"}`}>
                Pega manuscritos, diarios rústicos o ideas rápidas de sermon. La inteligencia artificial normalizará el formato, creará código, asignará fecha, clasificará la categoría y escribirá el cuerpo formateado en Markdown.
              </p>

              {/* Templates helpers */}
              <div className="mb-4">
                <span className={`text-[10px] font-mono tracking-wider uppercase font-bold block mb-2 ${isOled ? "text-zinc-500" : "text-zinc-400"}`}>
                  Cargar ejemplos de prueba:
                </span>
                <div className="flex flex-wrap gap-2 animate-fadeIn">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyTemplate(tpl.text)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isOled 
                          ? "bg-[#1E1E22] hover:bg-[#27272A] text-zinc-300 hover:text-[#FDE047] border-[#27272A]" 
                          : "bg-zinc-50 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-800 border-zinc-200 hover:border-emerald-250"
                      }`}
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Block */}
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Pega apuntes del sermón aquí, ej: 'Sábado en EL GRUPITO PEQUEÑO platicamos sobre la importancia de perdonar en el matrimonio, fue a las 9 am del 25 de abril. Poner que el perdón no se compra...'"
                className={`w-full h-64 rounded-lg p-3 text-sm transition-all font-sans leading-relaxed border focus:outline-none focus:ring-1 ${
                  isOled 
                    ? "border-[#27272A] bg-[#1E1E22] text-white focus:border-[#FDE047] focus:ring-[#FDE047] placeholder-zinc-650" 
                    : "border-zinc-200 bg-zinc-50 text-zinc-805 focus:border-emerald-600 focus:ring-emerald-600 placeholder-zinc-400"
                }`}
              />

              {/* Error messages */}
              {error && (
                <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  isOled 
                    ? "bg-rose-950/40 text-rose-300 border-rose-800/40" 
                    : "bg-rose-50 text-rose-800 border-rose-100"
                }`}>
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Run ETL Action */}
              <button
                onClick={handleRunAiEtl}
                disabled={isProcessing}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer ${
                  isProcessing 
                    ? "bg-[#27272A] text-zinc-500 cursor-not-allowed border border-zinc-800" 
                    : isOled
                      ? "bg-gradient-to-r from-[#FDE047] to-[#CA8A04] text-[#121212] hover:scale-[1.01] shadow-[#FDE047]/5"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.01] shadow-emerald-500/10"
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                    Ejecutando Fase ETL...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Procesar con Inteligencia Artificial
                  </>
                )}
              </button>
            </div>

            {/* ETL Progress Logs */}
            {statusLogs.length > 0 && (
              <div className={`rounded-xl border p-4 text-xs font-mono shadow-xl ${
                isOled ? "border-[#27272A] bg-black/60 text-zinc-300" : "border-zinc-200 bg-zinc-50/80 text-zinc-700"
              }`}>
                <span className={`font-bold block mb-2 border-b pb-1.5 flex items-center gap-2 ${
                  isOled ? "text-[#FDE047] border-[#27272A]" : "text-emerald-700 border-zinc-200"
                }`}>
                  <Terminal className="h-4 w-4" />
                  Consola de Trazabilidad ETL:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {statusLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className={`animate-pulse ${isOled ? "text-[#FDE047]/80" : "text-emerald-650/80"}`}>
                      [ETL] Esperando confirmación remota del pipeline...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Output/Acceptance column */}
          <div className="lg:col-span-7">
            {saveSuccess && (
              <div className={`mb-6 rounded-xl border p-5 text-sm shadow flex items-start gap-3 ${
                isOled 
                  ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300" 
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}>
                <Check className="h-5 w-5 bg-emerald-600 text-white p-0.5 rounded-full mt-0.5 flex-shrink-0 font-bold" />
                <div>
                  <h4 className="font-bold mb-1">¡Sermón Inyectado Correctamente!</h4>
                  <p className="leading-relaxed opacity-90">Las fases de extracción, limpieza e indexación han concluido con éxito. El sermón ahora forma parte de su base de datos local y puede buscarse y leerse en la pestaña principal de <strong>Inicio</strong> o por su <strong>Serie</strong> sugerida.</p>
                </div>
              </div>
            )}

            {etlResult ? (
              <div className={`rounded-xl border p-6 shadow-xl flex flex-col space-y-5 animate-slideUp ${
                isOled ? "border-[#27272A] bg-[#141418]" : "border-zinc-200 bg-white"
              }`}>
                <div className={`flex items-center justify-between border-b pb-4 ${isOled ? "border-[#27272A]" : "border-zinc-100"}`}>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">
                      Resultado de Transformación AI
                    </span>
                    <h3 className={`font-serif text-xl font-bold mt-1 ${isOled ? "text-white" : "text-emerald-950"}`}>
                      {etlResult.titulo}
                    </h3>
                  </div>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold border ${
                    isOled 
                      ? "bg-black/60 text-[#FDE047] border-[#FDE047]/20" 
                      : "bg-emerald-50 text-emerald-800 border-emerald-100"
                  }`}>
                    {etlResult.codigo}
                  </span>
                </div>

                {/* Meta details predicted */}
                <div className={`grid grid-cols-2 gap-4 border p-4 rounded-xl text-xs font-mono ${
                  isOled ? "bg-black/40 border-[#27272A]" : "bg-zinc-50 border-zinc-100 text-zinc-700"
                }`}>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Fecha Generada:</span>
                    <span className={`font-semibold ${isOled ? "text-[#FDE047]" : "text-emerald-800 font-bold"}`}>{etlResult.fecha}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">ID de Serie Propuesto:</span>
                    <span className={`font-semibold uppercase ${isOled ? "text-white" : "text-zinc-800"}`}>
                      {seriesList.find((s) => s.id === etlResult.serie_id)?.titulo || etlResult.serie_id}
                    </span>
                  </div>
                  <div className={`col-span-2 border-t pt-3 mt-1 ${isOled ? "border-[#27272A]" : "border-zinc-100"}`}>
                    <span className="text-zinc-400 block mb-0.5">Justificación de Clasificación:</span>
                    <span className={`font-sans italic block leading-relaxed ${isOled ? "text-zinc-300" : "text-zinc-650"}`}>
                      "{etlResult.explicacion}"
                    </span>
                  </div>
                </div>

                {/* Quick Markdown Excerpt Preview */}
                <div className={`border rounded-xl p-4 max-h-56 overflow-y-auto ${
                  isOled ? "border-[#27272A] bg-black/40" : "border-zinc-100 bg-zinc-50"
                }`}>
                  <span className={`text-[10px] font-semibold tracking-wider uppercase font-mono block mb-2 border-b pb-1 ${
                    isOled ? "text-zinc-500 border-[#27272A]" : "text-zinc-400 border-zinc-100"
                  }`}>
                    Vista Previa del Cuerpo Markdown Generado
                  </span>
                  <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed ${isOled ? "text-zinc-300" : "text-zinc-750"}`}>
                    {etlResult.contenido}
                  </pre>
                </div>

                {/* Final step action */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveResultLocally}
                    className="flex-grow flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/10 cursor-pointer transition"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Inyectar e Indexar en Catálogo Offline
                  </button>
                  <button
                    onClick={() => setEtlResult(null)}
                    className={`px-4 py-3 border rounded-xl text-sm font-semibold transition ${
                      isOled 
                        ? "border-[#27272A] text-zinc-400 hover:bg-zinc-800 hover:text-white" 
                        : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-850"
                    }`}
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-xl border border-dashed p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] ${
                isOled ? "border-[#27272A] bg-[#141418]/50" : "border-zinc-200 bg-zinc-50/50"
              }`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border mb-4 ${
                  isOled ? "bg-[#1E1E22] border-[#27272A] text-[#FDE047]" : "bg-white border-zinc-200 text-emerald-600 shadow"
                }`}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className={`text-base font-serif font-semibold ${isOled ? "text-white" : "text-zinc-800"}`}>
                  Esperando el Proceso de Ingesta AI
                </h3>
                <p className="mt-2 text-zinc-500 max-w-sm mx-auto text-xs leading-normal">
                  Introduce apuntes de sermón en la sección izquierda del panel de control para activar la simulación del procesador e ingresarlo en la base de datos de EL GRUPITO PEQUEÑO.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "python-etl" && (
        <div className="space-y-6" id="python-etl-section">
          <div className={`rounded-xl border p-5 text-sm shadow ${
            isOled 
              ? "border-[#FDE047]/30 bg-[#1E1E22] text-zinc-300" 
              : "border-emerald-250 bg-emerald-50 text-emerald-805"
          }`}>
            <h4 className={`font-serif font-bold mb-2 flex items-center gap-2 text-base ${
              isOled ? "text-[#FDE047]" : "text-emerald-950 font-extrabold"
            }`}>
              <HelpCircle className="h-4 w-4" />
              ¿Por qué Fase A prepara los datos en Python?
            </h4>
            <p className={`leading-relaxed ${isOled ? "text-zinc-400" : "text-emerald-900"}`}>
              El cliente entrega sermones en archivos PDF redundantes y desordenados. Buscar texto crudo en la memoria flotante en JavaScript o Dart colgaría el teléfono al superar los miles de sermones. Al correr este script de Python con antelación, limpiamos el contenido, extraemos metadatos y construimos una base de datos <strong className={isOled ? "font-bold text-white" : "font-extrabold text-emerald-950"}>SQLite (.db) pre-indexada con FTS5</strong>. Se coloca directo en los <strong className="font-mono">assets/</strong> de Flutter antes de compilar la APK, garantizando un funcionamiento instantáneo e independiente del internet.
            </p>
          </div>

          <div className={`rounded-xl border overflow-hidden shadow ${
            isOled ? "border-[#27272A] bg-black/60 text-stone-100" : "border-zinc-200 bg-zinc-50 text-zinc-800"
          }`}>
            
            {/* Header bar and copy button */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isOled ? "bg-zinc-900/60 border-[#27272A]" : "bg-zinc-100 border-zinc-200"
            }`}>
              <span className={`text-xs font-mono font-medium flex items-center gap-1.5 ${isOled ? "text-zinc-400" : "text-zinc-650"}`}>
                <Terminal className={`h-4 w-4 ${isOled ? "text-[#FDE047]" : "text-emerald-650"}`} />
                etl_index_el_grupito_pequeno.py
              </span>
              <button
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all cursor-pointer ${
                  isOled 
                    ? "text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700" 
                    : "text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {codeCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar Código
                  </>
                )}
              </button>
            </div>

            {/* Code frame */}
            <div className={`p-4 overflow-x-auto font-mono text-xs leading-relaxed max-h-110 ${
              isOled ? "text-zinc-300" : "text-zinc-700"
            }`}>
              <pre className="whitespace-pre">{pythonScriptCode}</pre>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "schema" && (
        <div className="space-y-6" id="db-schema-section">
          <div className={`rounded-xl border p-6 shadow-sm ${
            isOled ? "border-[#27272A] bg-[#141418]" : "border-zinc-200 bg-white"
          }`}>
            <h3 className={`font-serif text-lg font-bold mb-2 flex items-center gap-1.5 ${isOled ? "text-white" : "text-emerald-950"}`}>
              <Database className={`h-5 w-5 ${isOled ? "text-[#FDE047]" : "text-emerald-650"}`} />
              Estructura SQL Oficial con FTS5
            </h3>
            <p className={`text-sm mb-5 leading-relaxed ${isOled ? "text-zinc-400" : "text-zinc-650"}`}>
              FTS5 (Full-Text Search v5) es una característica nativa de SQLite que permite realizar búsquedas de texto avanzadas aproximadas o exactas con una velocidad increíble. Permite mapear coincidencias complejas y ordenar los sermones relevantes de forma óptima en el dispositivo móvil o web.
            </p>

            <div className={`rounded-xl border overflow-hidden shadow ${
              isOled ? "border-[#27272A] bg-black/60 text-stone-100" : "border-zinc-200 bg-zinc-50 text-zinc-800"
            }`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${
                isOled ? "bg-zinc-900/60 border-[#27272A]" : "bg-zinc-100 border-zinc-200"
              }`}>
                <span className={`text-xs font-mono font-medium ${isOled ? "text-zinc-400" : "text-zinc-650"}`}>
                  grupito_pequeno_sqlite_fts5_schema.sql
                </span>
                <button
                  onClick={handleCopySchema}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all cursor-pointer ${
                    isOled 
                      ? "text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700" 
                      : "text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {schemaCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Esquema SQL
                    </>
                  )}
                </button>
              </div>

              {/* Code render */}
              <div className={`p-4 overflow-x-auto font-mono text-xs leading-relaxed ${
                isOled ? "text-zinc-350" : "text-zinc-705"
              }`}>
                <pre>{sqliteSchemaText}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
