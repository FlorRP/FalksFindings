import { useState, useEffect } from 'react';
import { LogOut, Plus, Loader2 } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LanguageContext';
import ProductForm from './ProductForm';
import AdminProductList from './AdminProductList';
import AdminReservations from './AdminReservations';

type Tab = 'products' | 'reservations' | 'add';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const { t } = useLang();
  const at = t.admin;
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel('admin-products', { config: { broadcast: { self: true } } })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-theme">
      <header className="bg-header sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-header font-bold text-2xl">{at.dashboard.title}</h1>
          <button onClick={handleLogout} className="btn-outline text-accent border-accent">
            <LogOut size={16} />
            {at.dashboard.logout}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-8 border-b border-card pb-4">
          {[
            { key: 'products' as const, label: at.dashboard.tabs.products },
            { key: 'reservations' as const, label: at.dashboard.tabs.reservations },
            { key: 'add' as const, label: at.dashboard.tabs.addProduct },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 font-semibold text-sm rounded transition-colors ${
                tab === key
                  ? 'bg-btn text-btn'
                  : 'text-body hover:bg-card'
              }`}
            >
              {key === 'add' ? <Plus size={16} className="inline mr-1" /> : null}
              {label}
            </button>
          ))}
        </div>

        {loading && tab === 'products' ? (
          <div className="flex justify-center py-16">
            <Loader2 size={36} className="text-accent animate-spin" />
          </div>
        ) : tab === 'products' ? (
          <AdminProductList products={products} onRefresh={loadProducts} />
        ) : tab === 'reservations' ? (
          <AdminReservations />
        ) : (
          <>
            {showForm ? (
              <ProductForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadProducts(); }} />
            ) : (
              <div className="text-center py-16">
                <button onClick={() => setShowForm(true)} className="btn-primary px-8 py-3">
                  <Plus size={18} /> {at.dashboard.tabs.addProduct}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
