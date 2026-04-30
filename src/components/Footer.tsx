import { Search, Instagram, Facebook, Twitter } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLang();

  return (
    <>
      <footer className="bg-footer py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent"><Search size={20} strokeWidth={2.5} /></span>
                <span className="text-header font-extrabold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                  Falks Findings
                </span>
              </div>
              <p className="text-accent text-sm font-medium">{t.footer.tagline}</p>
              <p className="text-[rgba(245,240,232,0.6)] text-xs mt-3">
                &copy; {new Date().getFullYear()} Falks Findings. {t.footer.rights}
              </p>
            </div>

            <div>
              <p className="text-header font-semibold text-sm mb-3 uppercase tracking-wider opacity-80">
                {t.nav.home}
              </p>
              <ul className="space-y-1.5 text-[rgba(245,240,232,0.7)] text-sm">
                <li><span className="hover:text-accent cursor-pointer transition-colors">{t.nav.home}</span></li>
                <li><span className="hover:text-accent cursor-pointer transition-colors">{t.nav.products}</span></li>
                <li><span className="hover:text-accent cursor-pointer transition-colors">{t.nav.contact}</span></li>
              </ul>
            </div>

            <div>
              <p className="text-header font-semibold text-sm mb-3 uppercase tracking-wider opacity-80">
                {t.footer.followUs}
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-[rgba(245,240,232,0.7)] hover:text-accent transition-colors" aria-label="Instagram">
                  <Instagram size={22} />
                </a>
                <a href="#" className="text-[rgba(245,240,232,0.7)] hover:text-accent transition-colors" aria-label="Facebook">
                  <Facebook size={22} />
                </a>
                <a href="#" className="text-[rgba(245,240,232,0.7)] hover:text-accent transition-colors" aria-label="Twitter">
                  <Twitter size={22} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(245,240,232,0.15)] pt-5 text-center">
            <p className="text-[rgba(245,240,232,0.4)] text-xs">
              Made with care — Falks Findings
            </p>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.533 5.856L.057 23.25a.75.75 0 0 0 .918.918l5.394-1.476A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.651-.514-5.163-1.41l-.37-.22-3.826 1.047 1.047-3.826-.22-.37A9.946 9.946 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </>
  );
}
