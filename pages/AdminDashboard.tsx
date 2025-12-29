
import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../App';
import { Plus, Trash2, BookPlus, ListPlus, Database, History, Download, Upload, Trash, Loader2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalState {
  isOpen: boolean;
  type: 'manga' | 'chapter' | null;
  id: string;
  title: string;
}

const AdminDashboard: React.FC = () => {
  const { state, isSyncing, addManga, deleteManga, addChapter, deleteChapter, importDatabase, clearLogs } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Forms state
  const [mangaTitle, setMangaTitle] = useState('');
  const [mangaCover, setMangaCover] = useState('');
  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [chapterImages, setChapterImages] = useState('');

  const [activeTab, setActiveTab] = useState<'manga' | 'chapter' | 'database'>('manga');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: null,
    id: '',
    title: ''
  });

  if (!state.isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  const handleAddManga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mangaTitle && mangaCover) {
      await addManga(mangaTitle, mangaCover);
      setMangaTitle('');
      setMangaCover('');
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMangaId && chapterNum && chapterImages) {
      await addChapter(selectedMangaId, chapterNum, chapterImages);
      setChapterNum('');
      setChapterImages('');
    }
  };

  const openDeleteConfirmation = (type: 'manga' | 'chapter', id: string, title: string) => {
    setConfirmModal({ isOpen: true, type, id, title });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, id: '', title: '' });
  };

  const executeDelete = async () => {
    const { type, id } = confirmModal;
    if (!type || !id) return;

    setDeletingId(id);
    closeConfirmModal();
    
    try {
      if (type === 'manga') {
        await deleteManga(id);
      } else {
        await deleteChapter(id);
      }
    } catch (err) {
      alert(`Failed to delete ${type}. Please check your connection.`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `banana_manga_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const content = ev.target?.result as string;
        if (await importDatabase(content)) {
          alert('Database restored successfully!');
        } else {
          alert('Failed to import database. Invalid JSON format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeConfirmModal}></div>
          <div className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border p-8 animate-in zoom-in-95 duration-200 ${state.isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-black mb-2">Confirm Deletion</h3>
              <p className={`text-sm mb-8 leading-relaxed ${state.isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Are you sure you want to permanently remove <span className="font-bold text-yellow-500">"{confirmModal.title}"</span>? This action cannot be undone.
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={closeConfirmModal}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${state.isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete Now
                </button>
              </div>
            </div>
            <button 
              onClick={closeConfirmModal}
              className="absolute top-4 right-4 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Database Management</h1>
          <p className={`mt-2 ${state.isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>System control and record management center.</p>
        </div>
        
        <div className={`flex p-1 rounded-xl ${state.isDarkMode ? 'bg-zinc-900' : 'bg-zinc-200'} overflow-x-auto`}>
          <button
            onClick={() => setActiveTab('manga')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'manga' ? 'bg-yellow-400 text-black shadow-lg' : 'text-zinc-500'}`}
          >
            Manga
          </button>
          <button
            onClick={() => setActiveTab('chapter')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'chapter' ? 'bg-yellow-400 text-black shadow-lg' : 'text-zinc-500'}`}
          >
            Chapters
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'database' ? 'bg-yellow-400 text-black shadow-lg' : 'text-zinc-500'}`}
          >
            Data & Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {activeTab === 'manga' && (
            <div className={`p-6 rounded-2xl shadow-xl ${state.isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
              <form onSubmit={handleAddManga} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookPlus className="text-yellow-500" />
                  <h2 className="text-xl font-bold">New Manga</h2>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-50">Manga Title</label>
                  <input
                    type="text" required value={mangaTitle}
                    onChange={(e) => setMangaTitle(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${state.isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                    placeholder="e.g. One Piece"
                    disabled={isSyncing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-50">Cover URL</label>
                  <input
                    type="url" required value={mangaCover}
                    onChange={(e) => setMangaCover(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${state.isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                    placeholder="https://..."
                    disabled={isSyncing}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSyncing}
                  className="w-full py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Add Manga
                </button>
              </form>
            </div>
          )}

          {activeTab === 'chapter' && (
            <div className={`p-6 rounded-2xl shadow-xl ${state.isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
              <form onSubmit={handleAddChapter} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ListPlus className="text-yellow-500" />
                  <h2 className="text-xl font-bold">New Chapter</h2>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-50">Select Manga</label>
                  <select
                    required value={selectedMangaId}
                    onChange={(e) => setSelectedMangaId(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none appearance-none ${state.isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                    disabled={isSyncing}
                  >
                    <option value="">-- Choose Manga --</option>
                    {state.mangas.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-50">Chapter Number</label>
                  <input
                    type="number" step="0.1" required value={chapterNum}
                    onChange={(e) => setChapterNum(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${state.isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                    placeholder="e.g. 1"
                    disabled={isSyncing}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 opacity-50">Image URLs (comma separated)</label>
                  <textarea
                    required rows={4} value={chapterImages}
                    onChange={(e) => setChapterImages(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none resize-none ${state.isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                    placeholder="url1, url2, url3..."
                    disabled={isSyncing}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSyncing}
                  className="w-full py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Add Chapter
                </button>
              </form>
            </div>
          )}

          {activeTab === 'database' && (
            <div className={`p-6 rounded-2xl shadow-xl ${state.isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
              <div className="flex items-center gap-2 mb-6">
                <Database className="text-yellow-500" />
                <h2 className="text-xl font-bold">Data Maintenance</h2>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handleExport}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${state.isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200'}`}
                >
                  <span className="font-bold flex items-center gap-2 text-sm"><Download size={16} /> Export DB</span>
                  <span className="text-[10px] opacity-50">JSON</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${state.isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200'}`}
                >
                  <span className="font-bold flex items-center gap-2 text-sm"><Upload size={16} /> Import DB</span>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                  <span className="text-[10px] opacity-50">FILE</span>
                </button>
                <button 
                  onClick={() => { if(window.confirm('Clear all logs?')) clearLogs() }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <span className="font-bold flex items-center gap-2 text-sm"><Trash size={16} /> Clear Logs</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className={`p-6 rounded-2xl shadow-xl min-h-[400px] ${state.isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            {activeTab === 'database' ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <History size={20} className="text-yellow-500" />
                  System Activity Logs
                </h2>
                <div className="space-y-3">
                  {state.logs.length === 0 ? (
                    <p className="text-center py-12 text-zinc-500 italic">No activity recorded in the database logs yet.</p>
                  ) : (
                    state.logs.map(log => (
                      <div key={log.id} className={`p-3 rounded-xl text-sm border ${state.isDarkMode ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-black text-[10px] px-1.5 py-0.5 rounded ${
                            log.action.includes('CREATE') ? 'bg-green-500/20 text-green-500' : 
                            log.action.includes('DELETE') ? 'bg-red-500/20 text-red-500' : 
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="opacity-80 leading-relaxed">{log.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  {activeTab === 'manga' ? 'Manga Registry' : 'Chapter Registry'}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-xs font-normal">
                    {activeTab === 'manga' ? state.mangas.length : state.chapters.length} total
                  </span>
                </h2>

                <div className="space-y-4">
                  {activeTab === 'manga' ? (
                    state.mangas.length === 0 ? (
                      <p className="text-center py-12 text-zinc-500">No manga in database.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {state.mangas.map(m => (
                          <div key={m.id} className={`flex items-center p-3 rounded-xl border transition-all ${state.isDarkMode ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${deletingId === m.id ? 'opacity-50 scale-95' : 'opacity-100'}`}>
                            <img src={m.coverUrl} className="w-12 h-16 object-cover rounded shadow-md" alt="" />
                            <div className="ml-4 flex-1 overflow-hidden">
                              <h3 className="font-bold truncate text-sm">{m.title}</h3>
                              <p className="text-[10px] text-zinc-500 mt-1 uppercase">Added: {new Date(m.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                              disabled={deletingId !== null}
                              onClick={() => openDeleteConfirmation('manga', m.id, m.title)}
                              className="p-2 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-30"
                            >
                              {deletingId === m.id ? <Loader2 size={18} className="animate-spin text-yellow-500" /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    state.chapters.length === 0 ? (
                      <p className="text-center py-12 text-zinc-500">No chapters in database.</p>
                    ) : (
                      <div className="space-y-2">
                        {[...state.chapters].sort((a,b) => b.createdAt - a.createdAt).map(c => {
                          const manga = state.mangas.find(m => m.id === c.mangaId);
                          return (
                            <div key={c.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${state.isDarkMode ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${deletingId === c.id ? 'opacity-50 translate-x-2' : 'opacity-100'}`}>
                              <div className="flex-1 overflow-hidden mr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">Chapter {c.chapterNumber}</span>
                                  <span className="text-[10px] opacity-40 uppercase">of</span>
                                  <span className="text-xs text-yellow-500 font-bold truncate">{manga?.title || '??'}</span>
                                </div>
                                <p className="text-[9px] text-zinc-500 mt-0.5 uppercase">Timestamp: {new Date(c.createdAt).toLocaleString()}</p>
                              </div>
                              <button
                                disabled={deletingId !== null}
                                onClick={() => openDeleteConfirmation('chapter', c.id, `Ch. ${c.chapterNumber} from ${manga?.title || 'Unknown'}`)}
                                className="p-2 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-30"
                              >
                                {deletingId === c.id ? <Loader2 size={18} className="animate-spin text-yellow-500" /> : <Trash2 size={18} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
