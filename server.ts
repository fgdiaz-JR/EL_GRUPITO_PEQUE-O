import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY no está configurada en las variables de entorno.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "DUMMY_KEY_FOR_LOCAL_DEV",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// API Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Gemini ETL Sermon Processor Route
app.post("/api/gemini/etl", async (req: Request, res: Response): Promise<void> => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
    res.status(400).json({ error: "El texto crudo es requerido para el proceso." });
    return;
  }

  // Ensure secret is populated when executing API
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: "Llave de API de Gemini no encontrada. Por favor agrégala en la pestaña Secrets y reinicia."
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = `Eres un asistente experto en ingeniería de datos y catalogación teológica de la comunidad de EL GRUPITO PEQUEÑO. 
Tu tarea es recibir sermones rústicos, apuntes, manuscritos o transcripciones de voz desorganizadas, y realizar una fase de limpieza, estructuración y catalogación (ETL).

Debes generar un resultado JSON estructurado y válido con los siguientes campos:
1. codigo: Un código identificador único y formalizado. Si encuentras un año, úsalo en el patrón (ej: SANT-YYYY-XX), de lo contrario usa el año actual 2026 (ej: SANT-2026-XX, donde XX es un número secuencial inventado ingeniosamente).
2. titulo: Un título limpio, profesional, teológico o inspirador que sintetice la idea central.
3. fecha: En formato YYYY-MM-DD. Si no hay fecha en el texto, asume la fecha actual '2026-05-22' o una fecha aproximada coherente.
4. serie_id: Debe coincidir exactamente con uno de estos cuatro identificadores válidos en nuestra base de datos:
   - 'estudios-tematicos' (Para temas bíblicos profundos, doctrinas o estudios sistemáticos)
   - 'vida-comunitaria' (Para sermones sobre el amor fraternal, la comunidad de EL GRUPITO PEQUEÑO, unidad, ayuda vecinal, servicio)
   - 'familia-hogar' (Para matrimonios, crianza, respeto de hijos, abuelo-nieto, valores del hogar)
   - 'reflexiones-fe' (Para superación personal, esperanza en crisis, paciencia, fe, confianza o devocionales que animan el alma)
5. contenido: El cuerpo estructurado, ampliado y formateado con elegancia en Markdown. Introduce subtítulos con "##", listas, negritas donde sea pertinente, y citas destacadas con ">" para asegurar que la lectura en la aplicación sea un placer visual. No escatimes en formatearlo bien.
6. explicacion: Una explicación humana corta (1-2 oraciones) indicando por qué elegiste esa serie y ese código.`;

    const promptText = `Por favor, procesa las siguientes notas crudas del sermón para indexarlo en los archivos de EL GRUPITO PEQUEÑO:\n\n---\n${rawText}\n---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            codigo: { type: Type.STRING, description: "Código único de sermón, ej: SANT-2026-10" },
            titulo: { type: Type.STRING, description: "Título elocuente y limpio del sermón" },
            fecha: { type: Type.STRING, description: "Fecha en formato YYYY-MM-DD" },
            serie_id: { type: Type.STRING, description: "Identificador de la serie: estudios-tematicos o vida-comunitaria o familia-hogar o reflexiones-fe" },
            contenido: { type: Type.STRING, description: "Cuerpo completo formateado profesionalmente en Markdown limpio, con saltos de línea perfectos." },
            explicacion: { type: Type.STRING, description: "Breve justificación de la clasificación y código" },
          },
          required: ["codigo", "titulo", "fecha", "serie_id", "contenido", "explicacion"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No se recibió respuesta válida del modelo Gemini.");
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error running Gemini ETL:", error);
    res.status(500).json({ error: error.message || "Error al procesar el sermón con la inteligencia artificial." });
  }
});

// ----------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Import Vite dynamics in dev mode only
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("🚀 Vite middleware montado en Express (Modo Desarrollo).");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`📦 Sirviendo archivos estáticos desde ${distPath} (Modo Producción).`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌍 Servidor iniciado exitosamente en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Error al arrancar el servidor Express:", err);
});
