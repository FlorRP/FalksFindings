import { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';

type Props = {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProductForm({ product, onClose, onSaved }: Props) {
  const { t } = useLang();
  const at = t.admin.product;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name_en: product?.name_en ?? '',
    name_es: product?.name_es ?? '',
    description_en: product?.description_en ?? '',
    description_es: product?.description_es ?? '',
    price: product?.price?.toString() ?? '',
    condition: product?.condition ?? 'used',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    let imageUrl = product?.image_url ?? '';

    if (imageFile) {
      setUploading(true);
      const ext = imageFile.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        setError(at.errorUpload);
        setUploading(false);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
      setUploading(false);
    }

    if (!imageUrl) {
      setError(at.errorUpload);
      setSaving(false);
      return;
    }

    const payload = {
      name_en: form.name_en.trim(),
      name_es: form.name_es.trim(),
      description_en: form.description_en.trim(),
      description_es: form.description_es.trim(),
      price: parseFloat(form.price) || 0,
      condition: form.condition,
      image_url: imageUrl,
    };

    const { error: dbError } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert({ ...payload, status: 'available' });

    if (dbError) {
      setError(at.errorSave);
      setSaving(false);
      return;
    }

    setSuccess(product ? at.successEdit : at.successAdd);
    setSaving(false);
    setTimeout(() => { onSaved(); onClose(); }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-card">
          <h2 className="text-title font-bold text-xl">{product ? at.editTitle : at.addTitle}</h2>
          <button onClick={onClose} className="text-body opacity-60 hover:opacity-100 transition-opacity">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-body text-sm font-semibold mb-2">{at.image}</label>
            <div
              className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:bg-card transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-36 mx-auto object-contain rounded" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload size={28} className="text-accent opacity-60" />
                  <p className="text-body text-sm opacity-60">Click to upload image</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body text-sm font-semibold mb-1.5">{at.nameEn} *</label>
              <input
                type="text" required className="form-input"
                value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-body text-sm font-semibold mb-1.5">{at.nameEs} *</label>
              <input
                type="text" required className="form-input"
                value={form.name_es}
                onChange={e => setForm(f => ({ ...f, name_es: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-body text-sm font-semibold mb-1.5">{at.descEn}</label>
            <textarea
              className="form-input resize-none" rows={3}
              value={form.description_en}
              onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-body text-sm font-semibold mb-1.5">{at.descEs}</label>
            <textarea
              className="form-input resize-none" rows={3}
              value={form.description_es}
              onChange={e => setForm(f => ({ ...f, description_es: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body text-sm font-semibold mb-1.5">{at.price} *</label>
              <input
                type="number" required min="0" step="0.01" className="form-input"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-body text-sm font-semibold mb-1.5">{at.condition}</label>
              <select
                className="form-input"
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value as 'new' | 'used' }))}
              >
                <option value="new">{at.new}</option>
                <option value="used">{at.used}</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm flex items-center gap-1.5">
              <CheckCircle size={15} />{success}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1 justify-center py-3" disabled={saving || uploading}>
              {(saving || uploading) && <Loader2 size={16} className="animate-spin" />}
              {uploading ? at.uploading : saving ? at.saving : at.save}
            </button>
            <button type="button" onClick={onClose} className="btn-outline px-5">
              {at.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
