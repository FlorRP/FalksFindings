import { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle, Trash2, GripVertical } from 'lucide-react';
import { supabase, Product, ProductImage } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';

type Props = {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
};

type ImageWithPreview = ProductImage & { isNew?: boolean };

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

  const [images, setImages] = useState<ImageWithPreview[]>(
    product?.product_images
      ? [...product.product_images].sort((a, b) => a.display_order - b.display_order)
      : []
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const totalImages = images.length + newImageFiles.length + files.length;

    if (totalImages > 5) {
      setError('Maximum 5 images per product');
      return;
    }

    setNewImageFiles(prev => [...prev, ...files]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (index: number) => {
    if (index < images.length) {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewImageFiles(prev => prev.filter((_, i) => i !== (index - images.length)));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...images, ...newImageFiles.map((f, i) => ({
      id: `new-${i}`,
      product_id: product?.id ?? '',
      image_url: URL.createObjectURL(f),
      display_order: 0,
      created_at: new Date().toISOString(),
      isNew: true,
    }))];

    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, movedItem);

    if (index < images.length) {
      setImages(newOrder.filter(img => !img.isNew) as ImageWithPreview[]);
      setNewImageFiles(newOrder.filter(img => img.isNew).map((_, i) => newImageFiles[i]));
    }

    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const allImages = [...images, ...newImageFiles.map((f, i) => ({
      id: `new-${i}`,
      product_id: product?.id ?? '',
      image_url: URL.createObjectURL(f),
      display_order: 0,
      created_at: new Date().toISOString(),
      isNew: true,
    }))];

    if (allImages.length === 0) {
      setError('At least one image is required');
      setSaving(false);
      return;
    }

    let productId = product?.id;

    // Upload new images
    if (newImageFiles.length > 0) {
      setUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of newImageFiles) {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}-${Math.random()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file);

        if (uploadError) {
          setError(at.errorUpload);
          setUploading(false);
          setSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      // Create or update product
      const payload = {
        name_en: form.name_en.trim(),
        name_es: form.name_es.trim(),
        description_en: form.description_en.trim(),
        description_es: form.description_es.trim(),
        price: parseFloat(form.price) || 0,
        condition: form.condition,
        image_url: uploadedUrls[0],
      };

      if (!productId) {
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({ ...payload, status: 'available' })
          .select()
          .maybeSingle();

        if (createError || !newProduct) {
          setError(at.errorSave);
          setUploading(false);
          setSaving(false);
          return;
        }

        productId = newProduct.id;
      } else {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productId);

        if (updateError) {
          setError(at.errorSave);
          setUploading(false);
          setSaving(false);
          return;
        }
      }

      // Delete existing images and add new ones
      if (product?.id) {
        await supabase.from('product_images').delete().eq('product_id', product.id);
      }

      // Insert all images with correct order
      const imagesToInsert = [
        ...images,
        ...uploadedUrls.map((url, i) => ({
          image_url: url,
          product_id: productId,
          display_order: images.length + i,
        })),
      ].map((img, i) => ({
        image_url: 'image_url' in img ? img.image_url : img,
        product_id: productId,
        display_order: i,
      }));

      const { error: insertError } = await supabase
        .from('product_images')
        .insert(imagesToInsert);

      if (insertError) {
        setError('Error saving images');
        setUploading(false);
        setSaving(false);
        return;
      }

      setUploading(false);
    } else if (!product?.id) {
      // New product without images - needs at least one
      setError('At least one image is required');
      setSaving(false);
      return;
    }

    setSuccess(product ? at.successEdit : at.successAdd);
    setSaving(false);
    setTimeout(() => { onSaved(); onClose(); }, 800);
  };

  const displayImages = [...images, ...newImageFiles.map((f, i) => ({
    id: `new-${i}`,
    product_id: product?.id ?? '',
    image_url: URL.createObjectURL(f),
    display_order: images.length + i,
    created_at: new Date().toISOString(),
    isNew: true,
  }))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-card sticky top-0 bg-theme">
          <h2 className="text-title font-bold text-xl">{product ? at.editTitle : at.addTitle}</h2>
          <button onClick={onClose} className="text-body opacity-60 hover:opacity-100 transition-opacity" type="button">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-body text-sm font-semibold">Images ({displayImages.length}/5)</label>
              {displayImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs px-3 py-1 rounded font-semibold transition-all"
                  style={{ background: '#D4A017', color: '#fff' }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  Add Image
                </button>
              )}
            </div>

            {displayImages.length === 0 ? (
              <div
                className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:bg-card transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload size={28} className="text-accent opacity-60" />
                  <p className="text-body text-sm opacity-60">Click to upload images</p>
                  <p className="text-body text-xs opacity-40">Max 5 images, drag to reorder</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {displayImages.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className="relative group cursor-move"
                  >
                    <img
                      src={img.image_url}
                      alt={`Image ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded border-2 border-input"
                      style={{ opacity: draggedIndex === idx ? 0.5 : 1 }}
                    />
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 text-xs font-bold px-2 py-1 rounded" style={{ background: '#2C4A2E', color: '#fff' }}>
                        MAIN
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                      <Trash2 size={14} style={{ color: '#C0392B' }} />
                    </button>
                    {idx > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded">
                        <GripVertical size={20} style={{ color: '#D4A017' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
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
