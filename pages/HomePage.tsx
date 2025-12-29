
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { Clock } from 'lucide-react';

const HomePage: React.FC = () => {
  const { state, isSyncing } = useApp();

  const latestChapters = [...state.chapters]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  if (!isSyncing && state.mangas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-600">
          <span className="text-4xl font-bold">?</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">No Manga Found</h2>
        <p className="text-zinc-500 max-w-md">The storage server is currently empty. Login as admin to initialize the database!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Latest Updates Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-yellow-500" size={20} />
            Latest Releases
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isSyncing && state.chapters.length === 0 
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className={`h-24 rounded-xl animate-pulse ${state.isDarkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              ))
            : latestChapters.map(chapter => {
                const manga = state.mangas.find(m => m.id === chapter.mangaId);
                if (!manga) return null;
                return (
                  <Link
                    key={chapter.id}
                    to={`/reader/${manga.id}/${chapter.id}`}
                    className={`flex items-center p-3 rounded-xl border transition-all ${
                      state.isDarkMode 
                        ? 'bg-zinc-900 border-zinc-800 hover:border-yellow-400/50 hover:bg-zinc-800' 
                        : 'bg-white border-zinc-200 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    <img src={manga.coverUrl} className="w-12 h-16 object-cover rounded shadow" alt={manga.title} />
                    <div className="ml-4 overflow-hidden">
                      <p className="font-bold truncate text-sm">{manga.title}</p>
                      <p className="text-yellow-500 font-bold text-xs mt-1">Chapter {chapter.chapterNumber}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{new Date(chapter.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Browse Library</h1>
          <div className="h-0.5 flex-1 mx-4 bg-zinc-800 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {isSyncing && state.mangas.length === 0
            ? Array(12).fill(0).map((_, i) => (
                <div key={i} className={`aspect-[2/3] rounded-xl animate-pulse ${state.isDarkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              ))
            : state.mangas.map((manga) => (
                <Link
                  key={manga.id}
                  to={`/manga/${manga.id}`}
                  className="group relative flex flex-col space-y-3 transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800 shadow-lg ring-1 ring-zinc-100/10">
                    <img
                      src={manga.coverUrl}
                      alt={manga.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <button className="w-full py-2 bg-yellow-400 text-black font-bold rounded-lg text-xs">
                        View Details
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm line-clamp-2 group-hover:text-yellow-500 transition-colors">
                    {manga.title}
                  </h3>
                </Link>
              ))
          }
        </div>
      </section>
    </div>
  );
};

export default HomePage;
