export interface Message {
  id: string;
  codigo: string;
  titulo: string;
  fecha: string;
  serie_id: string;
  contenido: string;
  autor?: string;
}

export interface Series {
  id: string;
  titulo: string;
  descripcion: string;
  color: string;
  icon: string;
}

export interface Bookmark {
  messageId: string;
  savedAt: string;
}

export interface ETLResult {
  codigo: string;
  titulo: string;
  fecha: string;
  serie_id: string;
  contenido: string;
  explicacion?: string;
}
