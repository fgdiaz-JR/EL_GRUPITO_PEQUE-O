import React from "react";
import { Message, Series } from "../types";
import { Calendar, Tag, BookOpen, ChevronRight, Heart } from "lucide-react";

interface MessageCardProps {
  message: Message;
  series?: Series;
  searchTerm?: string;
  onClick: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  theme?: "oled" | "day";
}

export default function MessageCard({ 
  message, 
  series, 
  searchTerm = "", 
  onClick,
  isBookmarked,
  onToggleBookmark,
  theme = "oled"
}: MessageCardProps) {
  const isOled = theme === "oled";
  
  // Highlighting filter
  const highlight = (text: string, search: string) => {
    if (!search || !search.trim()) return text;
    
    // Split on search terms while keeping case
    const safeSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safeSearch})`, 'gi'));
    
    return parts.map((part, i) => {
      const match = part.toLowerCase() === search.toLowerCase();
      return match ? (
        <mark 
          key={i} 
          className={`px-0.5 rounded font-medium border-b transition-all ${
            isOled 
              ? "bg-[#FDE047]/20 text-[#FDE047] border-[#FDE047]/40" 
              : "bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40"
          }`}
        >
          {part}
        </mark>
      ) : part;
    });
  };

  // Extract a nice clean excerpt from the markdown content
  const getExcerpt = (md: string) => {
    // Remove headers and code markers
    let clean = md
      .replace(/#+\s+/g, "") // remove markdown titles
      .replace(/>\s+/g, "")  // remove blockquotes
      .replace(/\*\*/g, "")  // remove strong
      .replace(/\n+/g, " ")  // remove raw linebreaks
      .trim();
    
    // Shorten
    if (clean.length > 180) {
      return clean.substring(0, 175) + "...";
    }
    return clean;
  };

  const excerpt = getExcerpt(message.contenido);

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${
        isOled 
          ? "border-[#27272A] bg-[#0A0A0C] hover:border-[#FDE047]/40 hover:bg-[#121214] hover:shadow-black/70" 
          : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/10 hover:shadow-emerald-100/30"
      }`}
      id={`msg-card-${message.id}`}
    >
      <div>
        {/* Header line with date and series badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${
            isOled ? "text-zinc-500" : "text-zinc-500"
          }`}>
            <Calendar className={`h-3.5 w-3.5 ${isOled ? "text-zinc-600" : "text-zinc-400"}`} />
            {message.fecha}
          </span>

          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
            isOled 
              ? "bg-[#1E1E22] border-[#27272A] text-zinc-400" 
              : "bg-emerald-50 border-emerald-100 text-emerald-800"
          }`}>
            {series?.titulo || "Temático"}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-serif text-lg font-bold transition-colors leading-snug mb-2.5 ${
          isOled 
            ? "text-white group-hover:text-[#FDE047]" 
            : "text-zinc-900 group-hover:text-emerald-700"
        }`}>
          {highlight(message.titulo, searchTerm)}
        </h3>

        {/* Excerpt with potential highlight too! */}
        <p className={`text-sm leading-relaxed mb-4 transition-colors ${
          isOled 
            ? "text-zinc-400 group-hover:text-zinc-300" 
            : "text-zinc-600 group-hover:text-zinc-700"
        }`}>
          {highlight(excerpt, searchTerm)}
        </p>
      </div>

      {/* Footer controls: Code metadata and action buttons */}
      <div className={`mt-2 flex items-center justify-between border-t pt-3 ${
        isOled ? "border-zinc-800/80 text-zinc-500" : "border-zinc-100 text-zinc-500"
      }`}>
        <span className={`inline-flex items-center gap-1.5 text-xs font-mono border px-2 py-1 rounded ${
          isOled 
            ? "bg-black/40 text-emerald-400 border-zinc-800/80" 
            : "bg-emerald-50 text-emerald-700 border-emerald-100"
        }`}>
          <Tag className={`h-3 w-3 ${isOled ? "text-[#FDE047]" : "text-emerald-500"}`} />
          {message.codigo}
        </span>

        <div className="flex items-center space-x-1.5">
          {/* Bookmark Button */}
          <button 
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-lg transition-all ${
              isBookmarked 
                ? "text-rose-500 hover:bg-rose-50" 
                : isOled 
                  ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40" 
                  : "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={isBookmarked ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>

          <span className={`flex items-center text-xs font-medium group-hover:translate-x-1 transition-all pl-1 ${
            isOled ? "text-[#FDE047]" : "text-emerald-600"
          }`}>
            Leer
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </span>
         </div>
       </div>
    </div>
  );
}
