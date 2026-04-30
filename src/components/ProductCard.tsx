import { Tag } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useLang } from '../contexts/LanguageContext';

type Props = {
  product: Product;
  onReserve: (product: Product) => void;
  onViewDetails: (product: Product) => void;
};

export default function ProductCard({ product, onReserve, onViewDetails }: Props) {
  const { lang, t } = useLang();

  const name = lang === 'es' ? product.name_es || product.name_en : product.name_en;
  const conditionLabel = product.condition === 'new' ? t.products.condition.new : t.products.condition.used;

  return (
    <article className="product-card">
      <div className="relative cursor-pointer overflow-hidden" style={{ paddingBottom: '66.6%' }} onClick={() => onViewDetails(product)}>
        <img
          src={product.image_url}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-400"
          loading="lazy"
        />
        <span className="absolute top-2.5 left-2.5 text-xs font-bold px-2 py-0.5 rounded" style={{ background: product.condition === 'new' ? '#2C4A2E' : '#8B4513', color: '#fff' }}>
          {conditionLabel}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-title font-bold text-base leading-snug mb-1 line-clamp-2 cursor-pointer hover:underline" onClick={() => onViewDetails(product)}>
          {name}
        </h3>

        <div className="flex items-center gap-1.5 mb-4 mt-auto pt-3">
          <Tag size={15} className="text-accent flex-shrink-0" />
          <span className="text-price font-extrabold text-lg">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <div>
          {product.status === 'reserved' ? (
            <span className="badge-reserved block text-center py-1.5">
              {t.products.reserved}
            </span>
          ) : (
            <button onClick={() => onReserve(product)} className="btn-primary w-full justify-center">
              {t.products.reserve}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
