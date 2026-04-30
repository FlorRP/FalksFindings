import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useLang } from '../contexts/LanguageContext';
import emailjs from '@emailjs/browser';

type Props = {
  product: Product;
  onClose: () => void;
  onReserved: (productId: string) => void;
};

type FormState = {
  name: string;
  phone: string;
  whatsapp: boolean;
  message: string;
};

export default function ReserveModal({ product, onClose, onReserved }: Props) {
  const { lang, t } = useLang();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  const [form, setForm] = useState<FormState>({ name: '', phone: '', whatsapp: false, message: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const productName = lang === 'es' ? product.name_es || product.name_en : product.name_en;

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = t.reserve.validationName;
    if (!form.phone.trim()) e.phone = t.reserve.validationPhone;
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from('reservations').insert({
        product_id: product.id,
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp,
        message: form.message.trim(),
      });
      if (dbError) throw dbError;

      await supabase.from('products').update({ status: 'reserved' }).eq('id', product.id);

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_RESERVATION_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, {
          product_name: productName,
          customer_name: form.name,
          phone: form.phone,
          whatsapp: form.whatsapp ? 'Yes' : 'No',
          message: form.message || '—',
        }, publicKey);
      }

      onReserved(product.id);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box p-8 text-center" onClick={e => e.stopPropagation()}>
          <CheckCircle size={52} className="text-accent mx-auto mb-4" />
          <h3 className="text-title text-xl font-bold mb-2">{t.reserve.success}</h3>
          <button onClick={onClose} className="btn-primary mt-6 px-8">{t.modal.close}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-card">
          <div>
            <h2 className="text-title font-bold text-xl">{t.reserve.title}</h2>
            <p className="text-body text-sm opacity-70 mt-0.5">{productName}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-body opacity-60 hover:opacity-100 transition-opacity z-10"
            type="button"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="text-body text-sm opacity-70">{t.reserve.subtitle}</p>

          <div>
            <label className="block text-body text-sm font-semibold mb-1.5">{t.reserve.name} *</label>
            <input
              type="text"
              className="form-input"
              placeholder={t.reserve.namePlaceholder}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />{errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-body text-sm font-semibold mb-1.5">{t.reserve.phone} *</label>
            <input
              type="tel"
              className="form-input"
              placeholder={t.reserve.phonePlaceholder}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />{errors.phone}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-body text-sm font-semibold">{t.reserve.whatsapp}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="whatsapp"
                checked={form.whatsapp}
                onChange={() => setForm(f => ({ ...f, whatsapp: true }))}
                className="accent-[var(--accent)]"
              />
              <span className="text-body text-sm">{t.reserve.yes}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="whatsapp"
                checked={!form.whatsapp}
                onChange={() => setForm(f => ({ ...f, whatsapp: false }))}
                className="accent-[var(--accent)]"
              />
              <span className="text-body text-sm">{t.reserve.no}</span>
            </label>
          </div>

          <div>
            <label className="block text-body text-sm font-semibold mb-1.5">{t.reserve.message}</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder={t.reserve.messagePlaceholder}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-sm flex items-center gap-1.5">
              <AlertCircle size={15} />{t.reserve.error}
            </p>
          )}

          <button type="submit" className="btn-primary justify-center py-3 text-base mt-1" disabled={submitting}>
            {submitting ? t.reserve.submitting : t.reserve.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
