import { useEffect, useState } from 'react';
import { supabase, Reservation } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function AdminReservations() {
  const { lang, t } = useLang();
  const at = t.admin.reservations;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();

    const channel = supabase
      .channel('reservations-admin', { config: { broadcast: { self: true } } })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations'
      }, () => {
        loadReservations();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadReservations() {
    const { data } = await supabase
      .from('reservations')
      .select('*, products(*)')
      .order('created_at', { ascending: false });
    setReservations((data as Reservation[]) ?? []);
    setLoading(false);
  }

  const markAvailable = async (reservation: Reservation) => {
    await supabase.from('products').update({ status: 'available' }).eq('id', reservation.product_id);
    await loadReservations();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={36} className="text-accent animate-spin" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return <div className="text-center py-16 text-body opacity-50">{at.empty}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reservations.map(r => {
        const product = r.products;
        const productName = product
          ? (lang === 'es' ? product.name_es || product.name_en : product.name_en)
          : '—';

        return (
          <div key={r.id} className="product-card p-5">
            <div className="flex items-start gap-4">
              {product?.image_url && (
                <img
                  src={product.image_url}
                  alt={productName}
                  className="w-14 h-14 rounded object-cover flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-3">
                  <div>
                    <span className="text-body text-xs opacity-60 uppercase tracking-wider font-semibold">{at.customer}</span>
                    <p className="text-title font-bold text-sm">{r.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-body text-xs opacity-60 uppercase tracking-wider font-semibold">{at.phone}</span>
                    <p className="text-body text-sm">{r.phone}</p>
                  </div>
                  <div>
                    <span className="text-body text-xs opacity-60 uppercase tracking-wider font-semibold">{at.whatsapp}</span>
                    <p className="text-body text-sm">{r.whatsapp ? at.yes : at.no}</p>
                  </div>
                  <div>
                    <span className="text-body text-xs opacity-60 uppercase tracking-wider font-semibold">{at.product}</span>
                    <p className="text-body text-sm truncate">{productName}</p>
                  </div>
                </div>

                {r.message && (
                  <div className="mb-3">
                    <span className="text-body text-xs opacity-60 uppercase tracking-wider font-semibold">{at.message}</span>
                    <p className="text-body text-sm opacity-80">{r.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-body text-xs opacity-50">
                    {at.date}: {new Date(r.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => markAvailable(r)}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    <CheckCircle size={12} />{at.markAvailable}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
