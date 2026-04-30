import { useEffect } from 'react';
import { X, Tag, Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useLang } from '../contexts/LanguageContext';

type Props = {
  product: Product;
  onClose: () => void;
  onReserve: (product: Product) => void;
};

export default function ProductModal({ product, onClose, onReserve }: Props) {
  const { lang, t } = useLang();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const name = lang === 'es' ? product.name_es || product.name_en : product.name_en;
  const description = lang === 'es'
    ? product.description_es || product.description_en
    : product.description_en;
  const conditionLabel = product.condition === 'new' ? t.products.condition.new : t.products.condition.used;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <img
            src={product.image_url}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover rounded-t-2xl"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 rounded-full p-1.5 hover:opacity-90 transition-opacity z-10"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
            type="button"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          {product.status === 'reserved' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-t-2xl" style={{ background: 'rgba(0,0,0,0.45)' }}>
              <span className="badge-reserved text-lg px-6 py-2">{t.products.reserved}</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-title font-extrabold text-2xl mb-3 leading-tight">{name}</h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Tag size={16} className="text-accent" />
              <span className="text-price font-extrabold text-2xl">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={15} style={{ color: product.condition === 'new' ? '#2C4A2E' : '#8B4513' }} />
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: product.condition === 'new' ? '#2C4A2E' : '#8B4513', color: '#fff' }}>
                {conditionLabel}
              </span>
            </div>
          </div>

          {description && (
            <p className="text-body text-sm leading-relaxed mb-6 opacity-85">{description}</p>
          )}

          <div className="flex gap-3">
            {product.status === 'available' ? (
              <button onClick={() => onReserve(product)} className="btn-primary flex-1 justify-center py-3 text-base">
                {t.modal.reserve}
              </button>
            ) : (
              <span className="badge-reserved px-6 py-2 text-sm">{t.products.reserved}</span>
            )}
            <button onClick={onClose} className="btn-outline px-5 py-3">
              {t.modal.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
