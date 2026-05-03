import { useEffect, useState } from 'react';
import { supabase, Product } from '../lib/supabase';
import { useLang } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import ReserveModal from './ReserveModal';
import { Loader2 } from 'lucide-react';

export default function ProductGrid() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reservingProduct, setReservingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel('products-consumer', { config: { broadcast: { self: true } } })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        } else {
          loadProducts();
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Helper to check if a sold product should be shown (sold today only)
  const isSoldToday = (soldAt: string | null): boolean => {
    if (!soldAt) return false;
    const estNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const estToday = new Date(estNow.getFullYear(), estNow.getMonth(), estNow.getDate());
    const soldDate = new Date(new Date(soldAt).toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const soldDay = new Date(soldDate.getFullYear(), soldDate.getMonth(), soldDate.getDate());
    return estToday.getTime() === soldDay.getTime();
  };

  // Filter products: show available/reserved + sold items from today
  const visibleProducts = products.filter(p => {
    if (p.status !== 'sold') return true;
    return isSoldToday(p.sold_at);
  });

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .neq('status', 'sold')
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  const handleReserved = (productId: string) => {
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, status: 'reserved' } : p)
    );
  };

  return (
    <>
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h2 className="section-title">{t.products.title}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="text-accent animate-spin" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-body opacity-60 text-lg">{t.products.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onReserve={p => setReservingProduct(p)}
                onViewDetails={p => product.status !== 'sold' ? setSelectedProduct(p) : null}
              />
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReserve={p => {
            setSelectedProduct(null);
            setReservingProduct(p);
          }}
        />
      )}

      {reservingProduct && (
        <ReserveModal
          product={reservingProduct}
          onClose={() => setReservingProduct(null)}
          onReserved={handleReserved}
        />
      )}
    </>
  );
}
