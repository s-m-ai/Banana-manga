
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';

const MangaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const navigate = useNavigate();

  const manga = state.mangas.find(m => m.id === id);
  const chapters = state.chapters
    .filter(c => c.mangaId === id)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!manga) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Manga not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-yellow-500 hover:underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate('/')}
        className={`flex items-center space-x-2 text-sm font-medium transition-colors ${state.isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
      >
        <ArrowLeft size={16} />
        <span>Back to library</span>
      </button>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="sticky top-24 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-yellow-400/20">
            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">{manga.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-yellow-400/10 text-yellow-500 text-xs font-bold uppercase rounded-full tracking-wider border border-yellow-400/20">
                Action
              </span>
              <span className="px-3 py-1 bg-yellow-400/10 text-yellow-500 text-xs font-bold uppercase rounded-full tracking-wider border border-yellow-400/20">
                Adventure
              </span>
              <span className="px-3 py-1 bg-zinc-500/10 text-zinc-500 text-xs font-bold uppercase rounded-full tracking-wider border border-zinc-500/20">
                Ongoing
              </span>
            </div>
            <p className={`text-lg leading-relaxed ${state.isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Immerse yourself in the epic world of {manga.title}. A journey of mystery, power, and unexpected turns awaits. Start reading the latest chapters below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-yellow-400" />
                Chapters ({chapters.length})
              </h2>
            </div>

            {chapters.length === 0 ? (
              <div className={`p-8 rounded-xl border-2 border-dashed ${state.isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'} text-center`}>
                No chapters added yet. Check back later!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/reader/${manga.id}/${chapter.id}`}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all group ${
                      state.isDarkMode 
                        ? 'bg-zinc-900 border border-zinc-800 hover:border-yellow-400/50 hover:bg-zinc-800' 
                        : 'bg-white border border-zinc-200 hover:border-yellow-400 hover:bg-yellow-50/30'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">Chapter {chapter.chapterNumber}</span>
                      <span className={`text-xs mt-1 flex items-center gap-1 ${state.isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        <Clock size={12} />
                        {new Date(chapter.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                      <ArrowLeft size={16} className="rotate-180" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetailPage;
