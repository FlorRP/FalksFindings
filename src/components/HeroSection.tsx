import { Search, ChevronRight } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';

type Props = { onBrowse: () => void };

export default function HeroSection({ onBrowse }: Props) {
  const { t } = useLang();

  return (
    <section className="hero-gradient py-24 px-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: '#D4A017' }} />
      <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-10" style={{ background: '#D4A017' }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,160,23,0.2)', border: '2px solid rgba(212,160,23,0.5)' }}>
            <Search size={36} strokeWidth={2} style={{ color: '#D4A017' }} />
          </div>
        </div>

        <h1 className="text-white text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
          Falks Findings
        </h1>
        <p className="text-4xl sm:text-2xl font-semibold mb-6" style={{ color: '#D4A017' }}>
          {t.hero.tagline}
        </p>
        <p className="text-[rgba(245,240,232,0.75)] text-lg mb-10 max-w-xl mx-auto">
          {t.hero.subtext}
        </p>

        <button onClick={onBrowse} className="btn-gold text-base px-8 py-3 inline-flex items-center gap-2">
          {t.hero.cta}
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
