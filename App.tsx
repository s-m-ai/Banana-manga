
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Sun, Moon, LogIn, LayoutDashboard, CloudSync, RefreshCw } from 'lucide-react';
import { AppState, Manga, Chapter, LogEntry } from './types';
import { ServerAPI } from './api';
import HomePage from './pages/HomePage';
import MangaDetailPage from './pages/MangaDetailPage';
import ReaderPage from './pages/ReaderPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

interface AppContextType {
  state: AppState;
  isSyncing: boolean;
  toggleDarkMode: () => void;
  setAdminStatus: (status: boolean) => void;
  addManga: (title: string, coverUrl: string) => Promise<void>;
  deleteManga: (id: string) => Promise<void>;
  addChapter: (mangaId: string, chapterNumber: string, imageUrls: string) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  importDatabase: (data: string) => Promise<boolean>;
  clearLogs: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    mangas: [],
    chapters: [],
    logs: [],
    isDarkMode: true,
    isAdmin: false
  });
  const [isSyncing, setIsSyncing] = useState(true);

  // Initialize from "Server"
  useEffect(() => {
    refreshFromServer();
  }, []);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  const refreshFromServer = async () => {
    setIsSyncing(true);
    try {
      const data = await ServerAPI.getFullState();
      setState(prev => ({ ...data, isAdmin: prev.isAdmin, isDarkMode: data.isDarkMode ?? prev.isDarkMode }));
    } catch (error) {
      console.error("Failed to sync with server storage:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !state.isDarkMode;
    setState(prev => ({ ...prev, isDarkMode: newMode }));
    await ServerAPI.saveState({ isDarkMode: newMode });
  };

  const setAdminStatus = (status: boolean) => setState(prev => ({ ...prev, isAdmin: status }));
  
  const addManga = async (title: string, coverUrl: string) => {
    setIsSyncing(true);
    await ServerAPI.addManga(title, coverUrl);
    await refreshFromServer();
  };

  const deleteManga = async (id: string) => {
    setIsSyncing(true);
    await ServerAPI.deleteManga(id);
    await refreshFromServer();
  };

  const addChapter = async (mangaId: string, chapterNumber: string, imageUrls: string) => {
    setIsSyncing(true);
    await ServerAPI.addChapter(mangaId, chapterNumber, imageUrls);
    await refreshFromServer();
  };

  const deleteChapter = async (id: string) => {
    setIsSyncing(true);
    await ServerAPI.deleteChapter(id);
    await refreshFromServer();
  };

  const importDatabase = async (data: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed.mangas) && Array.isArray(parsed.chapters)) {
        await ServerAPI.saveState(parsed);
        await ServerAPI.addLog('DB_RESTORE', 'Full database restore from backup file');
        await refreshFromServer();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const clearLogs = async () => {
    setIsSyncing(true);
    await ServerAPI.saveState({ logs: [] });
    await refreshFromServer();
  };

  return (
    <AppContext.Provider value={{ 
      state, isSyncing, toggleDarkMode, setAdminStatus, addManga, deleteManga, 
      addChapter, deleteChapter, importDatabase, clearLogs, refreshFromServer 
    }}>
      <HashRouter>
        <div className={`min-h-screen flex flex-col transition-opacity duration-300 ${isSyncing && state.mangas.length === 0 ? 'opacity-50' : 'opacity-100'} ${state.isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
          <nav className={`sticky top-0 z-50 border-b ${state.isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'} backdrop-blur-md`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-black text-xl">B</span>
                </div>
                <span className="text-xl font-bold tracking-tight">Banana <span className="text-yellow-500">Manga</span></span>
              </Link>
              
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${isSyncing ? 'text-yellow-500 animate-pulse' : 'text-zinc-500'}`}>
                   {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <CloudSync size={12} />}
                   <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Online'}</span>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full transition-colors ${state.isDarkMode ? 'hover:bg-zinc-800 text-yellow-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                >
                  {state.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {state.isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/admin/login"
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${state.isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'}`}
                  >
                    <LogIn size={18} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
            {isSyncing && state.mangas.length === 0 ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-zinc-500 animate-pulse">CONNECTING TO STORAGE SERVER...</p>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/manga/:id" element={<MangaDetailPage />} />
                <Route path="/reader/:mangaId/:chapterId" element={<ReaderPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            )}
          </main>

          <footer className={`py-8 border-t ${state.isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'} text-center text-sm`}>
            <p className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              Banana Server Status: Active
            </p>
            <p className="mt-1">&copy; 2024 Banana Manga. Verified Server Storage Enabled.</p>
          </footer>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
