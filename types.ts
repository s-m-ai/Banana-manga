
export interface Manga {
  id: string;
  title: string;
  coverUrl: string;
  createdAt: number;
}

export interface Chapter {
  id: string;
  mangaId: string;
  chapterNumber: string;
  imageUrls: string; // Comma-separated string
  createdAt: number;
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface AppState {
  mangas: Manga[];
  chapters: Chapter[];
  logs: LogEntry[];
  isDarkMode: boolean;
  isAdmin: boolean;
}
