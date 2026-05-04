import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Loader2, LogOut as LogOutIcon } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LanguageContext';
import ProductForm from './ProductForm';
import AdminProductList from './AdminProductList';
import AdminReservations from './AdminReservations';
import AdminSoldItems from './AdminSoldItems';

type Tab = 'products' | 'reservations' | 'sold' | 'add';

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const at = t.admin;
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, navigate]);

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
    const { data } = await supabase.from('products').select(`*, product_images(id, product_id, image_url, display_order, created_at)`).order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-theme">
      <header className="bg-header sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-header font-bold text-2xl">{at.dashboard.title}</h1>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm transition-all"
            style={{
              background: '#8B4513',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            <LogOut size={16} />
            {at.dashboard.logout}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-8 border-b border-card pb-4 flex-wrap">
          {[
            { key: 'products' as const, label: at.dashboard.tabs.products },
            { key: 'reservations' as const, label: at.dashboard.tabs.reservations },
            { key: 'sold' as const, label: 'Sold Items' },
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
              type="button"
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
          <AdminProductList products={products.filter(p => p.status !== 'sold')} onRefresh={loadProducts} />
        ) : tab === 'reservations' ? (
          <AdminReservations />
        ) : tab === 'sold' ? (
          <AdminSoldItems />
        ) : (
          <>
            {showForm ? (
              <ProductForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadProducts(); }} />
            ) : (
              <div className="text-center py-16">
                <button onClick={() => setShowForm(true)} className="btn-primary px-8 py-3" type="button">
                  <Plus size={18} /> {at.dashboard.tabs.addProduct}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-box p-7 max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <LogOut size={44} className="mx-auto mb-4" style={{ color: '#8B4513' }} />
            <h3 className="text-title font-bold text-lg mb-2">Log Out?</h3>
            <p className="text-body text-sm opacity-80 mb-6">
              Are you sure you want to log out? Your session will be ended.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded font-semibold text-sm text-white transition-all"
                style={{
                  background: '#8B4513',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
              >
                Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-outline px-6 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
