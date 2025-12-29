
import { AppState, Manga, Chapter, LogEntry } from './types';

const STORAGE_KEY = 'banana_manga_server_db';
const READ_LATENCY = 200; 
const WRITE_LATENCY = 100;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback ID generator for compatibility
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getRawData = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        mangas: [],
        chapters: [],
        logs: [],
        isDarkMode: true,
        isAdmin: false
      };
    }
    const parsed = JSON.parse(data);
    return {
      mangas: parsed.mangas || [],
      chapters: parsed.chapters || [],
      logs: parsed.logs || [],
      isDarkMode: typeof parsed.isDarkMode === 'boolean' ? parsed.isDarkMode : true,
      isAdmin: false
    };
  } catch (e) {
    console.error("Corrupted database found, resetting...", e);
    return { mangas: [], chapters: [], logs: [], isDarkMode: true, isAdmin: false };
  }
};

const setRawData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, isAdmin: false }));
};

export const ServerAPI = {
  async getFullState(): Promise<AppState> {
    await sleep(READ_LATENCY);
    return getRawData();
  },

  async saveState(updates: Partial<AppState>): Promise<void> {
    await sleep(WRITE_LATENCY);
    const currentState = getRawData();
    const newState = { ...currentState, ...updates };
    setRawData(newState);
  },

  // Internal helper for atomic logging
  _createLog(state: AppState, action: string, details: string): LogEntry[] {
    const newLog: LogEntry = {
      id: generateId(),
      action,
      details,
      timestamp: Date.now()
    };
    return [newLog, ...state.logs].slice(0, 100);
  },

  async addLog(action: string, details: string): Promise<void> {
    const currentState = getRawData();
    const updatedLogs = this._createLog(currentState, action, details);
    setRawData({ ...currentState, logs: updatedLogs });
  },

  async addManga(title: string, coverUrl: string): Promise<Manga> {
    await sleep(WRITE_LATENCY);
    const state = getRawData();
    const newManga: Manga = {
      id: generateId(),
      title,
      coverUrl,
      createdAt: Date.now()
    };
    const newState = {
      ...state,
      mangas: [...state.mangas, newManga],
      logs: this._createLog(state, 'CREATE_MANGA', `Database: New Manga Created - ${title}`)
    };
    setRawData(newState);
    return newManga;
  },

  async deleteManga(id: string): Promise<void> {
    await sleep(WRITE_LATENCY);
    const state = getRawData();
    const manga = state.mangas.find(m => m.id === id);
    const updatedMangas = state.mangas.filter(m => m.id !== id);
    const updatedChapters = state.chapters.filter(c => c.mangaId !== id);
    
    const newState = {
      ...state,
      mangas: updatedMangas,
      chapters: updatedChapters,
      logs: this._createLog(state, 'DELETE_MANGA', `Database: Removed Manga - ${manga?.title || id}`)
    };
    setRawData(newState);
  },

  async addChapter(mangaId: string, chapterNumber: string, imageUrls: string): Promise<Chapter> {
    await sleep(WRITE_LATENCY);
    const state = getRawData();
    const manga = state.mangas.find(m => m.id === mangaId);
    const newChapter: Chapter = {
      id: generateId(),
      mangaId,
      chapterNumber,
      imageUrls,
      createdAt: Date.now()
    };
    const newState = {
      ...state,
      chapters: [...state.chapters, newChapter],
      logs: this._createLog(state, 'CREATE_CHAPTER', `Database: Added Chapter ${chapterNumber} to ${manga?.title || mangaId}`)
    };
    setRawData(newState);
    return newChapter;
  },

  async deleteChapter(id: string): Promise<void> {
    await sleep(WRITE_LATENCY);
    const state = getRawData();
    const chapter = state.chapters.find(c => c.id === id);
    const manga = state.mangas.find(m => m.id === chapter?.mangaId);
    const updatedChapters = state.chapters.filter(c => c.id !== id);
    
    const newState = {
      ...state,
      chapters: updatedChapters,
      logs: this._createLog(state, 'DELETE_CHAPTER', `Database: Removed Chapter ${chapter?.chapterNumber} from ${manga?.title || 'Unknown'}`)
    };
    setRawData(newState);
  }
};
