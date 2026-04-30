import { useState } from 'react';
import { Search, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';

type Section = 'home' | 'products' | 'contact';

type Props = {
  activeSection: Section;
  onNavigate: (section: Section) => void;
};

export default function Header({ activeSection, onNavigate }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { key: Section; label: string }[] = [
    { key: 'home',     label: t.nav.home },
    { key: 'products', label: t.nav.products },
    { key: 'contact',  label: t.nav.contact },
  ];

  const handleNav = (section: Section) => {
    onNavigate(section);
    setMenuOpen(false);
  };

  return (
    <header className="bg-header sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNav('home')} className="flex flex-col leading-tight group">
            <div className="flex items-center gap-2">
              <div className="text-accent">
                <Search size={24} strokeWidth={2.5} />
              </div>
              <span className="text-header font-extrabold text-xl tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Falks Findings
              </span>
            </div>
            <span className="text-accent text-xs font-medium ml-8 opacity-90">
              {t.hero.tagline}
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`nav-link ${activeSection === key ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="text-header font-bold text-sm px-3 py-1 rounded border border-[rgba(245,240,232,0.3)] hover:bg-[rgba(245,240,232,0.15)] transition-colors"
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              className="text-accent p-1.5 rounded hover:bg-[rgba(245,240,232,0.15)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-header p-1.5 rounded hover:bg-[rgba(245,240,232,0.15)] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-[rgba(245,240,232,0.2)] py-3 flex flex-col gap-1">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`nav-link text-left w-full px-3 py-2 ${activeSection === key ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
