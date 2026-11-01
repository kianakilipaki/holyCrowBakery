import { useState } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'

const VENMO_HANDLE = '@holycrowbakery'
const VENMO_URL = 'https://venmo.com/u/holycrowbakery'

type CheckoutForm = {
  name: string
  email: string
  phone: string
  notes: string
}

export default function CartDrawer() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart, isOpen, setIsOpen } = useCart()
  const { addOrder } = useStore()

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirm'>('cart')
  const [form, setForm] = useState<CheckoutForm>({ name: '', email: '', phone: '', notes: '' })
  const [orderId, setOrderId] = useState('')
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  if (!isOpen) return null

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setCheckoutError('')
    try {
      const orderTotal = totalPrice
      const result = await addOrder({
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        items: items.map(i => ({ productId: i.productId, productName: i.productName, price: i.price, quantity: i.quantity })),
        total: orderTotal,
        status: 'pending',
        notes: form.notes,
        isCustomOrder: false,
        paymentReceived: false,
      })
      setOrderId(result.id)
      setConfirmationEmailSent(result.emailSent)
      setConfirmedTotal(orderTotal)
      clearCart()
      setStep('confirm')
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'We could not place your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => { setIsOpen(false); setTimeout(() => setStep('cart'), 300) }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col overflow-hidden"
        style={{ backgroundColor: '#1a1e1f', borderLeft: '1px solid rgba(208,148,173,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(208,148,173,0.15)' }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: '#d094ad' }} />
            <h2 className="text-base font-semibold text-[#fcf6e8]" style={{ fontFamily: 'Cinzel, serif' }}>
              {step === 'cart' ? `Your Cart (${totalItems})` : step === 'checkout' ? 'Checkout' : 'Order Placed!'}
            </h2>
          </div>
          <button
            onClick={() => { setIsOpen(false); setTimeout(() => setStep('cart'), 300) }}
            className="p-1 rounded-full transition-colors hover:text-[#d094ad]"
            style={{ color: '#fcf6e8' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* --- CART STEP --- */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center pt-16">
                  <div className="text-5xl mb-4 opacity-30">☽</div>
                  <p className="text-[#fcf6e8] opacity-40" style={{ fontFamily: 'Playfair Display, serif' }}>Your cart is empty</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.productId} className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.1)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#fcf6e8] truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {item.productName}
                      </p>
                      <p className="text-xs text-[#ef9800] mt-0.5" style={{ fontFamily: 'Cinzel, serif' }}>
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[#d094ad]/20"
                        style={{ color: '#d094ad' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-[#fcf6e8] w-4 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[#d094ad]/20 disabled:opacity-30"
                        style={{ color: '#d094ad' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="w-6 h-6 rounded-full flex items-center justify-center ml-1 transition-colors hover:bg-red-500/20"
                        style={{ color: 'rgba(252,246,232,0.3)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 shrink-0 space-y-4"
                style={{ borderTop: '1px solid rgba(208,148,173,0.15)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#fcf6e8] opacity-60" style={{ fontFamily: 'Nunito, sans-serif' }}>Subtotal</span>
                  <span className="text-lg font-bold text-[#ef9800]" style={{ fontFamily: 'Cinzel, serif' }}>${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#fcf6e8] opacity-40 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Pay ahead via Venmo <a href={VENMO_URL} target="_blank" rel="noreferrer" className="text-[#d094ad] underline-offset-2 hover:underline">{VENMO_HANDLE}</a> or pay in person at Saturday pickup
                </p>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 rounded-full font-semibold text-sm tracking-widest uppercase transition-all hover:scale-105"
                  style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
                >
                  Place Pre-Order →
                </button>
              </div>
            )}
          </>
        )}

        {/* --- CHECKOUT STEP --- */}
        {step === 'checkout' && (
          <form onSubmit={handleCheckout} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-4 space-y-4">
              <div className="p-4 rounded-xl text-sm space-y-1"
                style={{ backgroundColor: 'rgba(208,148,173,0.1)', border: '1px solid rgba(208,148,173,0.2)' }}>
                <p className="text-[#d094ad] font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Order Summary</p>
                {items.map(i => (
                  <p key={i.productId} className="text-[#fcf6e8] opacity-70 text-xs" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {i.productName} × {i.quantity} — ${(i.price * i.quantity).toFixed(2)}
                  </p>
                ))}
                <p className="text-[#ef9800] font-bold pt-1 border-t border-[#d094ad]/20 mt-2"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>

              {[
                { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
                { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
                { key: 'phone', label: 'Phone (optional)', type: 'tel', required: false, placeholder: '(555) 000-0000' },
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
                    value={form[field.key as keyof CheckoutForm]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#d094ad]/50"
                    style={{
                      backgroundColor: '#0e0c08',
                      border: '1px solid rgba(208,148,173,0.2)',
                      color: '#fcf6e8',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Allergies, special requests, etc."
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-[#d094ad]/50"
                  style={{
                    backgroundColor: '#0e0c08',
                    border: '1px solid rgba(208,148,173,0.2)',
                    color: '#fcf6e8',
                    fontFamily: 'Nunito, sans-serif',
                  }}
                />
              </div>

              <div className="p-3 rounded-xl text-xs leading-relaxed"
                style={{ backgroundColor: 'rgba(239,152,0,0.08)', border: '1px solid rgba(239,152,0,0.2)', color: '#ef9800', fontFamily: 'Nunito, sans-serif' }}>
                ✦ Choose whichever works best: pay ahead via Venmo to <a href={VENMO_URL} target="_blank" rel="noreferrer" className="font-bold underline-offset-2 hover:underline">{VENMO_HANDLE}</a>, or pay in person at Saturday pickup. For Venmo, include your name or order # in the memo.
              </div>
            </div>

            <div className="px-6 py-5 flex gap-3 shrink-0"
              style={{ borderTop: '1px solid rgba(208,148,173,0.15)' }}>
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="flex-1 py-3 rounded-full text-sm font-semibold tracking-widest uppercase border transition-all"
                style={{ borderColor: 'rgba(208,148,173,0.3)', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
              >
                {submitting ? 'Placing order…' : 'Confirm →'}
              </button>
            </div>
            {checkoutError && (
              <p className="px-6 pb-4 text-center text-xs text-red-300" style={{ fontFamily: 'Nunito, sans-serif' }} role="alert">
                {checkoutError}
              </p>
            )}
          </form>
        )}

        {/* --- CONFIRM STEP --- */}
        {step === 'confirm' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-5xl mb-4">✦</div>
            <h3 className="text-2xl mb-3 text-[#fcf6e8]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Order Received!
            </h3>
            <p className="text-[#d094ad] text-sm mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
              Order #{orderId}
            </p>
            <div className="space-y-4 text-sm text-left w-full">
              <div className="p-4 rounded-xl space-y-2"
                style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)' }}>
                <p className="text-[#fcf6e8] opacity-70" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {confirmationEmailSent
                    ? '✓ Confirmation emails were sent to you and the bakery.'
                    : '✓ Your order was saved. The bakery will follow up if email delivery was delayed.'}
                </p>
                <p className="text-[#fcf6e8] opacity-70" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  ☽ Your order total is <strong className="text-[#ef9800]">${confirmedTotal.toFixed(2)}</strong>. Pay ahead via Venmo, or pay in person at Saturday pickup.
                </p>
                <a href={VENMO_URL} target="_blank" rel="noreferrer" className="block py-2 text-center text-xl font-bold underline-offset-4 hover:underline" style={{ fontFamily: 'Cinzel, serif', color: '#d094ad' }}>
                  {VENMO_HANDLE}
                </a>
                <p className="text-[#fcf6e8] opacity-50 text-xs text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  If paying via Venmo, include your name or order number in the memo. Otherwise, simply pay when you pick up your order.
                </p>
              </div>
              <p className="text-[#fcf6e8] opacity-50 text-xs text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Pickup is Saturday. You'll receive a reminder closer to the date!
              </p>
            </div>
            <button
              onClick={() => { setIsOpen(false); setStep('cart') }}
              className="mt-8 px-8 py-3 rounded-full font-semibold text-sm tracking-widest uppercase transition-all hover:scale-105"
              style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
            >
              Done ✦
            </button>
          </div>
        )}
      </div>
    </>
  )
}
