import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import emailjs from '@emailjs/browser';

type FormState = { name: string; phone: string; message: string };

export default function ContactSection() {
  const { t } = useLang();
  const [form, setForm] = useState<FormState>({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return;
    setSending(true);

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, {
          from_name: form.name,
          phone: form.phone,
          message: form.message,
        }, publicKey);
      }

      setStatus('success');
      setForm({ name: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="bg-theme py-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,160,23,0.15)', border: '2px solid rgba(212,160,23,0.4)' }}>
              <Mail size={26} className="text-accent" />
            </div>
          </div>
          <h2 className="section-title mx-auto block text-center">{t.contact.title}</h2>
          <p className="text-body opacity-60 mt-3 text-sm">{t.contact.subtitle}</p>
        </div>

        <div className="product-card p-7">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle size={44} className="text-accent mx-auto mb-3" />
              <p className="text-title font-semibold text-lg">{t.contact.success}</p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-primary mt-6 px-8"
              >
                OK
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-body text-sm font-semibold mb-1.5">{t.contact.name}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={t.contact.namePlaceholder}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-body text-sm font-semibold mb-1.5">{t.contact.phone}</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder={t.contact.phonePlaceholder}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-body text-sm font-semibold mb-1.5">{t.contact.message}</label>
                <textarea
                  required
                  className="form-input resize-none"
                  rows={5}
                  placeholder={t.contact.messagePlaceholder}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm flex items-center gap-1.5">
                  <AlertCircle size={15} />{t.contact.error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary justify-center py-3 text-base mt-1"
                disabled={sending}
              >
                <Send size={16} />
                {sending ? t.contact.sending : t.contact.send}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
