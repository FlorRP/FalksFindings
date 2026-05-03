import { useEffect, useState } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import { CheckCircle, Loader2, Trash2 } from 'lucide-react';

export default function AdminSoldItems() {
  const { lang, t } = useLang();
  const at = t.admin.product;
  const [soldProducts, setSoldProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSoldProducts();

    const channel = supabase
      .channel('admin-sold-items', { config: { broadcast: { self: true } } })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        loadSoldProducts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadSoldProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'sold')
      .order('sold_at', { ascending: false });
    setSoldProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  const restoreToAvailable = async (product: Product) => {
    await supabase
      .from('products')
      .update({ status: 'available', sold_at: null })
      .eq('id', product.id);
    loadSoldProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setConfirmDelete(null);
    loadSoldProducts();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={36} className="text-accent animate-spin" />
      </div>
    );
  }

  if (soldProducts.length === 0) {
    return (
      <div className="text-center py-16 text-body opacity-50">
        No sold items yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {soldProducts.map(product => {
          const name = lang === 'es' ? product.name_es || product.name_en : product.name_en;
          const soldDate = product.sold_at ? new Date(product.sold_at) : null;

          return (
            <div key={product.id} className="product-card flex-row items-center gap-4 p-4" style={{ borderColor: '#C0392B' }}>
              <img
                src={product.image_url}
                alt={name}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
                style={{ opacity: 0.6, filter: 'grayscale(100%)' }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-title font-bold text-sm truncate opacity-70">{name}</p>
                <p className="text-price font-bold text-sm">${product.price.toFixed(2)}</p>
                {soldDate && (
                  <p className="text-body text-xs opacity-60 mt-0.5">
                    Sold: {soldDate.toLocaleDateString()} at {soldDate.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => restoreToAvailable(product)}
                  className="btn-primary text-xs px-3 py-1.5"
                  type="button"
                >
                  <CheckCircle size={12} />
                  Restore
                </button>
                <button
                  onClick={() => setConfirmDelete(product.id)}
                  className="btn-danger text-xs"
                  type="button"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box p-7 max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <Trash2 size={36} className="text-red-500 mx-auto mb-3" />
            <p className="text-body font-semibold mb-6">Permanently delete this sold item?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => deleteProduct(confirmDelete)} className="btn-danger px-6 py-2">
                Delete
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
