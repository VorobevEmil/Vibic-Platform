import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#1e1f22] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-indigo-600/[0.10] blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-violet-600/[0.08] blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10 opacity-60">
          <img src="/vibic_logo.svg" alt="Vibic" className="h-6 w-6" />
          <span className="text-lg font-bold text-white">Vibic</span>
        </div>

        {/* 404 */}
        <div className="text-[8rem] sm:text-[10rem] font-black leading-none select-none"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-white">Страница не найдена</h2>
        <p className="mt-2 text-gray-400 max-w-sm mx-auto leading-relaxed">
          Похоже, эта страница исчезла или никогда не существовала. Давай вернёмся домой.
        </p>

        <Link
          to="/channels/@me"
          className="mt-8 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/30"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>
      </div>
    </div>
  );
}
