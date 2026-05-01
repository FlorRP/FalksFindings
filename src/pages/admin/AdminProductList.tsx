import { useState } from 'react';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import ProductForm from './ProductForm';

type Props = {
  products: Product[];
  onRefresh: () => void;
};

export default function AdminProductList({ products, onRefresh }: Props) {
  const { t } = useLang();
  const at = t.admin.product;
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: Product['status']) => {
    const updatePayload: any = { status: newStatus };

    // Add sold_at timestamp when marking as sold
    if (newStatus === 'sold') {
      updatePayload.sold_at = new Date().toISOString();
    } else if (newStatus === 'available') {
      // Clear sold_at when marking back to available
      updatePayload.sold_at = null;
    }

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (!error) {
      onRefresh();
    } else {
      console.error('Error updating status:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setConfirmDelete(null);
    onRefresh();
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-body opacity-50">{t.products.empty}</div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {products.map(product => {
          const name = product.name_en;
          const statusClass =
            product.status === 'available' ? 'status-available' :
            product.status === 'reserved' ? 'status-reserved' : 'status-sold';

          return (
            <div key={product.id} className="product-card flex-row items-center gap-4 p-4">
              <img
                src={product.image_url}
                alt={name}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-title font-bold text-sm truncate">{name}</p>
                <p className="text-price font-bold text-sm">${product.price.toFixed(2)}</p>
                <span className={`status-badge ${statusClass} inline-block mt-1`}>
                  {at[`mark${product.status.charAt(0).toUpperCase() + product.status.slice(1)}` as 'markAvailable' | 'markReserved' | 'markSold']}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {product.status !== 'available' && (
                  <button
                    onClick={() => updateStatus(product.id, 'available')}
                    className="btn-primary text-xs px-3 py-1.5"
                    type="button"
                  >
                    <CheckCircle size={12} />{at.markAvailable}
                  </button>
                )}
                {product.status !== 'reserved' && (
                  <button
                    onClick={() => updateStatus(product.id, 'reserved')}
                    className="btn-gold text-xs px-3 py-1.5"
                    type="button"
                  >
                    {at.markReserved}
                  </button>
                )}
                {product.status !== 'sold' && (
                  <button
                    onClick={() => updateStatus(product.id, 'sold')}
                    className="text-xs px-3 py-1.5 rounded font-semibold transition-all"
                    style={{
                      background: '#8B4513',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                    type="button"
                  >
                    {at.markSold}
                  </button>
                )}
                <button
                  onClick={() => setEditingProduct(product)}
                  className="btn-outline text-xs px-3 py-1.5"
                  type="button"
                >
                  <Pencil size={12} />{at.edit}
                </button>
                <button
                  onClick={() => setConfirmDelete(product.id)}
                  className="btn-danger"
                  type="button"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={onRefresh}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box p-7 max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <Trash2 size={36} className="text-red-500 mx-auto mb-3" />
            <p className="text-body font-semibold mb-6">{at.deleteConfirm}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => deleteProduct(confirmDelete)} className="btn-danger px-6 py-2">
                {at.delete}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-2">
                {at.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
