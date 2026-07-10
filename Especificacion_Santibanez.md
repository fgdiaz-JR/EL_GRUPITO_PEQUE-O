# Especificación Técnica y Blueprint de la App - El Grupito Pequeño

Este documento detalla exhaustivamente cómo está construida la aplicación de archivo de sermones y mensajes de la comunidad "El Grupito Pequeño", explicando su diseño, código, paleta de colores, estructura de datos y el motor de agrupamiento y búsqueda avanzado que organiza los sermones por año y por autor.

---

## 1. Descripción General del Sistema
La aplicación es un **archivo digital offline-first y lector avanzado de sermones**, diseñado en React con TypeScript. Permite leer y catalogar sermones escritos en formato Markdown, y guardarlos en favoritos.
El sistema prioriza la resiliencia offline: funciona 100% de manera autónoma guardando datos localmente con `localStorage` y permite una sincronización bidireccional opcional con Firebase Firestore (`sermones` / `mensajes`).

---

## 2. Paleta de Colores, Tipografías e Identidad Visual

La interfaz de usuario implementa un diseño de alta costura minimalista, priorizando el descanso visual y la lectura inmersiva de textos prolongados. Cuenta con dos modos de visualización principales:

### A. Modo Noche (OLED Dark Mode)
Un tema de alto contraste nocturno con negros absolutos, ideal para pantallas móviles de bajo consumo de batería y lectura en entornos con poca luz.
*   **Fondo Principal:** `#0A0A0C` (Negro absoluto)
*   **Contenedores de Tarjetas/Inputs:** `#1E1E22` (Gris oscuro)
*   **Bordes:** `#27272A` (Borde zinc oscuro)
*   **Texto Principal:** `#FFFFFF` (Blanco)
*   **Títulos Secundarios / Acentos:** `#FDE047` (Amarillo brillante o dorado cálido)

### B. Modo Día (Day/Sage Green Mode)
Un tema luminoso inspirado en colores naturales, salvia, menta y tonalidades tierra suaves que transmiten paz y pulcritud.
*   **Fondo Principal:** `#FFFFFF` (Blanco puro)
*   **Contenedores de Tarjetas/Filtros:** `#F0FDF4` (Verde esmeralda suave 50)
*   **Bordes:** `#A7F3D0` (Verde esmeralda brillante 200)
*   **Texto Principal:** `#1F2937` (Gris carbón oscuro)
*   **Títulos / Acentos:** `#047857` (Verde esmeralda profundo)

### Tipografía
*   **UI General y Controles:** `Inter` (Sans-serif) para controles de filtrado, inputs, botones, badges y metadatos.
*   **Títulos de Sermones y Encabezados:** `Playfair Display` (Serif elegante) con un aspecto literario, tradicional y sofisticado.
*   **Estructura Técnica e Identificadores:** `JetBrains Mono` (Monospace) para códigos de sermones, badges de estado y métricas del sistema.

---

## 3. Estructura de Datos y Modelos (TypeScript)

Los datos se modelan de manera formal mediante interfaces TypeScript rígidas. A diferencia de las versiones temáticas clásicas, **las Series se configuran y agrupan estrictamente por AÑO y por AUTOR/EXPOSITOR** para facilitar el archivo histórico cronológico de las enseñanzas.

```typescript
export interface Message {
  id: string;        // Identificador único (UUID o slug)
  codigo: string;    // Código único de sermón (ej: 'SANT-2026-01')
  titulo: string;    // Título principal del sermón
  fecha: string;     // Fecha de exposición en formato YYYY-MM-DD
  serie_id: string;  // ID de la serie de agrupación (Asociado a un año o autor)
  contenido: string; // Cuerpo del sermón en formato Markdown completo
  autor?: string;    // Expositor del mensaje (ej: 'Pastor Santibáñez', 'Misionera Elena')
}

export interface Series {
  id: string;          // Slug identificador (ej: 'serie-2026')
  titulo: string;      // Título visible (ej: 'Sermones del Año 2026')
  descripcion: string; // Resumen histórico del período o del expositor
  color: string;       // Color hexadecimal de personalización
  icon: string;        // Nombre de icono Lucide (ej: 'Calendar', 'User')
}
```

---

## 4. Diseño y Visualización de Mensajes

La visualización de mensajes se divide en dos componentes de experiencia sumamente cuidados:

### A. Tarjeta de Mensaje (MessageCard)
Aparece en la grilla principal o en los resultados de búsqueda. Cada tarjeta contiene:
*   **Fila Superior:** Fecha formateada con icono de calendario y el código único del sermón (con fuente mono) alineados.
*   **Título:** Fuente serif, tamaño mediano, con realce dinámico de palabras clave si el usuario está realizando una búsqueda.
*   **Expositor:** Badge con icono de usuario que muestra claramente quién impartió el sermón (ej: `Expositor: Pastor Santibáñez`).
*   **Extracto (Excerpt):** Primeros 150 caracteres del contenido Markdown limpios de símbolos, finalizando en puntos suspensivos, para dar un abreboca del mensaje.
*   **Botones de Acción:** Botón de "Lectura Completa" y el botón de marcar como Favorito (corazón interactivo).

### B. Lector de Pantalla Completa (MessageReader)
Un lector inmersivo que se desliza como overlay o vista principal para leer el contenido del sermón:
*   **Cabecera del Lector:** Muestra el título en tipografía serif grande, fecha, código del sermón, la serie asociada y un badge distintivo del Expositor.
*   **Barra de Herramientas de Accesibilidad:** Controles integrados para ajustar el tamaño de fuente (Pequeña, Mediana, Grande, Extra Grande) y el ancho del contenedor de lectura.
*   **Visualizador de Markdown:** Renderiza el contenido usando `react-markdown` aplicando estilos refinados para títulos (H1, H2), citas en bloque (blockquotes con barras de acento doradas), listas, y negritas.

---

## 5. Agrupación y Búsqueda por Año y Autor

Las "Series" ya no representan temas genéricos conceptuales (ej: 'Fe', 'Familia'); ahora están estructuradas por **Año de Exposición** y **Autor/Expositor**.

El motor de búsqueda avanzado ha sido configurado para permitir tres filtros combinables de manera simultánea de forma instantánea:
1.  **Búsqueda por Texto Libre:** Filtra dinámicamente comparando el término ingresado contra el título, código del sermón, autor y contenido completo del Markdown.
2.  **Filtrado por Serie:** Filtra mensajes que correspondan a una colección específica de año o autor.
3.  **Filtrado por Año de Exposición:** Extrae automáticamente el año del campo `fecha` (ej: "2025", "2026") y presenta un dropdown dinámico con los años únicos detectados en la colección de mensajes.
4.  **Filtrado por Expositor:** Extrae dinámicamente los expositores únicos de los mensajes (ej: "Pastor Santibáñez", "Misionera Elena") y ofrece un menú de selección instantáneo.

---

## 6. Arquitectura de Sincronización Offline (Firebase)

La aplicación garantiza la continuidad operativa incluso si no hay conexión a internet. El flujo de datos sigue las siguientes directrices:
*   **Carga Inicial:** Al cargar por primera vez, el sistema busca datos en el `localStorage`. Si está vacío, recurre a un archivo de datos preestablecidos integrados (`initialData.ts`) que actúa como base local por defecto.
*   **Sincronización Inteligente:** Se expone un botón "Actualizar" en la cabecera. Al presionarlo, el cliente intenta conectarse directamente a Firebase Firestore mediante lecturas forzadas del servidor (`getDocsFromServer`) para saltarse cachés obsoletas del navegador.
*   **Colecciones Consultadas:** Consulta las colecciones `sermones`, `mensajes` y `series` de Firestore de manera paralela.
*   **Validación y Diagnóstico:** Si la base de datos remota está vacía o el usuario no tiene conexión, el sistema conserva de manera segura la base de datos preestablecida en su memoria, informando al usuario a través de banners interactivos con diagnósticos detallados, evitando la pérdida de información en pantalla.
