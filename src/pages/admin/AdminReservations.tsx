import { useEffect, useState } from 'react';
import { supabase, Reservation, formatPhoneDisplay } from '../../lib/supabase';
import { translations } from '../../lib/translations';
import { CheckCircle, Loader2, Trash2, DollarSign } from 'lucide-react';

const t = translations.en;
const at = t.admin.reservations;

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    setActionLoading(reservation.id);
    await supabase.from('products').update({ status: 'available' }).eq('id', reservation.product_id);
    await supabase.from('reservations').delete().eq('id', reservation.id);
    await loadReservations();
    setActionLoading(null);
  };

  const markSold = async (reservation: Reservation) => {
    setActionLoading(reservation.id);
    await supabase.from('products').update({ status: 'sold', sold_at: new Date().toISOString() }).eq('id', reservation.product_id);
    await supabase.from('reservations').delete().eq('id', reservation.id);
    await loadReservations();
    setActionLoading(null);
  };

  const deleteReservation = async (reservation: Reservation) => {
    if (!confirm('Delete this reservation?')) return;
    setActionLoading(reservation.id);
    await supabase.from('products').update({ status: 'available' }).eq('id', reservation.product_id);
    await supabase.from('reservations').delete().eq('id', reservation.id);
    await loadReservations();
    setActionLoading(null);
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
        const productName = product ? product.name_en : '—';

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
                    <p className="text-body text-sm">{formatPhoneDisplay(r.phone_number)}</p>
                  </div>
                  <div>
                    <span className="text-body text-xs opacity-60 uppercase tracking-wider font-semibold">{at.whatsapp}</span>
                    <p className="text-body text-sm">{r.uses_whatsapp ? at.yes : at.no}</p>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAvailable(r)}
                      disabled={actionLoading === r.id}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <CheckCircle size={12} />{at.markAvailable}
                    </button>
                    <button
                      onClick={() => markSold(r)}
                      disabled={actionLoading === r.id}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <DollarSign size={12} />{at.markSold}
                    </button>
                    <button
                      onClick={() => deleteReservation(r)}
                      disabled={actionLoading === r.id}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />{at.delete}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
