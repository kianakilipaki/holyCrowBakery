import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export default function Contact() {
  const { addOrder } = useStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '', date: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      await addOrder({
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        items: [],
        total: 0,
        status: 'pending',
        notes: '',
        isCustomOrder: true,
        customDescription: form.description,
        preferredPickupDate: form.date || undefined,
        paymentReceived: false,
      })
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not send your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden py-16 sm:py-24" style={{ backgroundColor: '#fcf6e8' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Info side */}
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.22rem] text-[#d094ad] sm:mb-4 sm:text-xs sm:tracking-[0.4rem]" style={{ fontFamily: 'Cinzel, serif' }}>
              ⋆ Custom Creations ⋆
            </p>
            <h2 className="mb-5 text-3xl leading-tight text-[#0e0c08] sm:mb-6 sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Special <span style={{ color: '#d094ad' }}>Orders</span>
            </h2>
            <p className="text-[#3d4547] leading-relaxed mb-8" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}>
              Have something specific in mind? I love bringing unique visions to life — custom cakes, themed cookie boxes,
              or anything your imagination can dream up. Custom orders are made without gluten-containing ingredients and with careful,
              celiac-conscious practices, though cross-contact cannot be guaranteed.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: '☽',
                  title: 'Custom Cakes & Tiers',
                  desc: 'Birthdays, anniversaries, woodland weddings — let\'s design your dream cake together.',
                },
                {
                  icon: '✦',
                  title: 'Themed Cookie Sets',
                  desc: 'Event-specific decorated cookies with custom designs and colors.',
                },
                {
                  icon: '◈',
                  title: 'Allergen-Aware Bakes',
                  desc: 'Share any dietary needs and I’ll confirm what I can carefully accommodate.',
                },
              ].map(item => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(208,148,173,0.08)', border: '1px solid rgba(208,148,173,0.2)' }}>
                  <span className="text-2xl text-[#d094ad] shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-[#0e0c08] mb-1" style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#3d4547]" style={{ fontFamily: 'Nunito, sans-serif' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pickup info */}
            <div className="mt-8 p-5 rounded-2xl"
              style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)' }}>
              <p className="text-[#d094ad] font-semibold text-sm mb-3" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
                ✦ Ordering Info
              </p>
              <ul className="space-y-2 text-sm text-[#fcf6e8] opacity-70" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <li>→ All orders are pre-orders only</li>
                <li>→ Standard orders: pickup Saturday</li>
                <li>→ Custom orders: discuss timeline via email</li>
                <li>→ Pay via Venmo <a href="https://venmo.com/u/holycrowbakery" target="_blank" rel="noreferrer" className="text-[#d094ad] underline-offset-2 hover:underline">@holycrowbakery</a> or in person at pickup</li>
                <li>→ Made without gluten-containing ingredients · Cross-contact cannot be guaranteed</li>
              </ul>
            </div>
          </div>

          {/* Form side */}
          <div>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 rounded-2xl"
                style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)' }}>
                <CheckCircle size={48} style={{ color: '#9da23d' }} className="mb-4" />
                <h3 className="text-2xl text-[#fcf6e8] mb-3" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                  Request Sent!
                </h3>
                <p className="text-[#fcf6e8] opacity-60 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Your custom order request has been submitted. I'll be in touch soon!
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', description: '', date: '' }) }}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105"
                  style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
                >
                  New Request
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 rounded-2xl space-y-5"
                style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)' }}
              >
                <h3 className="text-xl text-[#fcf6e8] mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  Custom Order Form
                </h3>
                <p className="text-xs text-[#fcf6e8] opacity-40 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  All fields marked * are required
                </p>

                {[
                  { key: 'name', label: 'Full Name *', type: 'text', required: true, placeholder: 'Your name' },
                  { key: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'your@email.com' },
                  { key: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: '(555) 000-0000' },
                  { key: 'date', label: 'Preferred Pickup Date', type: 'date', required: false, placeholder: '' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]"
                      style={{ fontFamily: 'Cinzel, serif' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#d094ad]/50"
                      style={{
                        backgroundColor: '#1a1e1f',
                        border: '1px solid rgba(208,148,173,0.2)',
                        color: '#fcf6e8',
                        fontFamily: 'Nunito, sans-serif',
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]"
                    style={{ fontFamily: 'Cinzel, serif' }}>
                    Order Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell me about your custom order — flavors, themes, quantity, occasion, and any dietary sensitivities..."
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-[#d094ad]/50"
                    style={{
                      backgroundColor: '#1a1e1f',
                      border: '1px solid rgba(208,148,173,0.2)',
                      color: '#fcf6e8',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
                >
                  <Send size={15} />
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
                {submitError && <p className="text-center text-xs text-red-300" role="alert">{submitError}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
