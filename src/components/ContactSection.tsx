import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { validatePhone } from '../lib/supabase';
import emailjs from '@emailjs/browser';

type FormState = { name: string; phone: string; message: string };

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`;
  return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function ContactSection() {
  const { lang, t } = useLang();
  const [form, setForm] = useState<FormState>({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!form.name.trim() || !form.message.trim()) return;
    if (!validatePhone(form.phone)) {
      setPhoneError(lang === 'es' ? 'Ingrese un número de teléfono válido de 10 dígitos' : 'Enter a valid 10-digit phone number');
      return;
    }
    setSending(true);

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;

      if (serviceId && templateId) {
        await emailjs.send(serviceId, templateId, {
          sender_name: form.name,
          sender_phone: form.phone,
          sender_message: form.message,
        });
      }

      setStatus('success');
      setForm({ name: '', phone: '', message: '' });
    } catch (err) {
      console.error('Email sending failed:', err);
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
              <p className="text-title font-semibold text-lg">{lang === 'es' ? '¡Mensaje enviado exitosamente!' : 'Message sent successfully!'}</p>
              <p className="text-body text-sm mt-2 opacity-75">{lang === 'es' ? 'Pronto nos contactaremos con usted.' : 'We will get back to you soon.'}</p>
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
                  placeholder="(xxx)xxx-xxxx"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: formatPhoneInput(e.target.value) }))}
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />{phoneError}
                  </p>
                )}
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
