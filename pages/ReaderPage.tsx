
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ChevronLeft, ChevronRight, LayoutList, Home, Settings } from 'lucide-react';

const ReaderPage: React.FC = () => {
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>();
  const { state } = useApp();
  const navigate = useNavigate();
  const [showHeader, setShowHeader] = useState(true);

  const manga = state.mangas.find(m => m.id === mangaId);
  const currentChapter = state.chapters.find(c => c.id === chapterId);
  
  const allChapters = state.chapters
    .filter(c => c.mangaId === mangaId)
    .sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber));

  const currentIdx = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = allChapters[currentIdx - 1];
  const nextChapter = allChapters[currentIdx + 1];

  const images = currentChapter ? currentChapter.imageUrls.split(',').map(url => url.trim()) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId]);

  if (!manga || !currentChapter) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Chapter not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-yellow-500 hover:underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className={`-mt-8 min-h-screen ${state.isDarkMode ? 'bg-black' : 'bg-zinc-100'}`}>
      {/* Floating Reader Controls */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className={`flex items-center justify-between px-4 py-3 shadow-xl backdrop-blur-md ${state.isDarkMode ? 'bg-zinc-950/90 border-b border-zinc-800' : 'bg-white/90 border-b border-zinc-200'}`}>
          <div className="flex items-center space-x-3">
            <Link to={`/manga/${mangaId}`} className="p-2 hover:bg-zinc-500/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-none">{manga.title}</h1>
              <p className="text-xs text-zinc-500 mt-1">Chapter {currentChapter.chapterNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <div className="flex items-center bg-zinc-500/10 rounded-lg p-1">
              <button 
                disabled={!prevChapter}
                onClick={() => navigate(`/reader/${mangaId}/${prevChapter.id}`)}
                className="p-1.5 disabled:opacity-30 hover:bg-zinc-500/20 rounded-md transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-3 text-sm font-bold">Ch. {currentChapter.chapterNumber}</span>
              <button 
                disabled={!nextChapter}
                onClick={() => navigate(`/reader/${mangaId}/${nextChapter.id}`)}
                className="p-1.5 disabled:opacity-30 hover:bg-zinc-500/20 rounded-md transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manga Pages Viewport */}
      <div className="max-w-3xl mx-auto pt-16 pb-32">
        <div className="space-y-0">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto block"
                loading={idx < 3 ? "eager" : "lazy"}
              />
              <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-[10px] rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                Page {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 px-4 space-y-6">
          <div className="flex items-center justify-center space-x-4">
            {prevChapter && (
              <button
                onClick={() => navigate(`/reader/${mangaId}/${prevChapter.id}`)}
                className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Previous
              </button>
            )}
            {nextChapter && (
              <button
                onClick={() => navigate(`/reader/${mangaId}/${nextChapter.id}`)}
                className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                Next Chapter <ChevronRight size={20} />
              </button>
            )}
          </div>
          <div className="flex justify-center">
            <Link 
              to={`/manga/${mangaId}`}
              className="flex items-center gap-2 text-zinc-500 hover:text-yellow-500 font-medium transition-colors"
            >
              <LayoutList size={18} /> Back to Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
