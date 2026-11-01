import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy, Mail, MapPin, WalletCards } from 'lucide-react'
import { StarDivider } from './GothicDecor'

const bakeryEmail = 'holycrowbakery@gmail.com'
const bakeryEmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(bakeryEmail)}&su=${encodeURIComponent('Holy Crow Bakery Question')}`

export default function Footer() {
  const navigate = useNavigate()
  const [emailCopied, setEmailCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText(bakeryEmail)
    setEmailCopied(true)
    window.setTimeout(() => setEmailCopied(false), 2000)
  }

  return (
    <footer className="relative overflow-hidden py-12 text-center sm:py-16" style={{ backgroundColor: '#1a1e1f', borderTop: '1px solid rgba(208,148,173,0.15)' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Logo */}
        <div className="mb-6">
          <p className="text-xl tracking-wider text-[#fcf6e8] sm:text-2xl sm:tracking-widest" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
            Holy Crow Bakery
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2rem] text-[#d094ad] opacity-70 sm:text-xs sm:tracking-[0.4rem]" style={{ fontFamily: 'Cinzel, serif' }}>
            ✦ baked with celiac safety in mind ✦
          </p>
        </div>

        <StarDivider />

        <div className="mt-6 space-y-2 text-sm text-[#fcf6e8] opacity-50" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <p>All orders are pre-orders · Pickup Saturday only</p>
          <p>Made without gluten-containing ingredients · Cross-contact cannot be guaranteed</p>
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <div className="flex items-start gap-2 rounded-xl border border-[#d094ad]/15 bg-[#0e0c08]/45 p-4 transition-colors hover:border-[#d094ad]/40">
            <a
              href={bakeryEmailLink}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 flex-1 items-start gap-3"
              title="Compose an email in Gmail"
            >
              <Mail size={16} className="mt-0.5 shrink-0 text-[#d094ad]" />
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-widest text-[#fcf6e8]/35">Email</span>
                <span className="mt-1 block break-all text-xs text-[#fcf6e8]/70">{bakeryEmail}</span>
              </span>
            </a>
            <button
              type="button"
              onClick={() => void copyEmail()}
              className="rounded-md p-1.5 text-[#fcf6e8]/45 transition-colors hover:bg-[#d094ad]/15 hover:text-[#d094ad]"
              aria-label={emailCopied ? 'Email address copied' : 'Copy email address'}
              title={emailCopied ? 'Copied!' : 'Copy email address'}
            >
              {emailCopied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <a href="https://venmo.com/u/holycrowbakery" target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-xl border border-[#d094ad]/15 bg-[#0e0c08]/45 p-4 transition-colors hover:border-[#ef9800]/50">
            <WalletCards size={16} className="mt-0.5 shrink-0 text-[#ef9800]" />
            <span>
              <span className="block text-[10px] uppercase tracking-widest text-[#fcf6e8]/35">Venmo · optional prepayment</span>
              <span className="mt-1 block text-xs text-[#fcf6e8]/70">@holycrowbakery</span>
            </span>
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=Daybreak%2C%20South%20Jordan%2C%20UT" target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-xl border border-[#d094ad]/15 bg-[#0e0c08]/45 p-4 transition-colors hover:border-[#9da23d]/50">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#9da23d]" />
            <span>
              <span className="block text-[10px] uppercase tracking-widest text-[#fcf6e8]/35">Pickup area</span>
              <span className="mt-1 block text-xs text-[#fcf6e8]/70">Daybreak · South Jordan, UT</span>
              <span className="mt-1 block text-[10px] leading-snug text-[#fcf6e8]/35">Full address in pickup confirmation</span>
            </span>
          </a>
        </div>

        <div className="flex justify-center gap-8 mt-8 text-xs tracking-widest uppercase text-[#fcf6e8] opacity-40"
          style={{ fontFamily: 'Cinzel, serif' }}>
          <a href="#about" className="hover:text-[#d094ad] hover:opacity-100 transition-colors">About</a>
          <a href="#menu" className="hover:text-[#d094ad] hover:opacity-100 transition-colors">Menu</a>
          <a href="#contact" className="hover:text-[#d094ad] hover:opacity-100 transition-colors">Order</a>
        </div>

        <div className="mt-12 pt-6 border-t border-[#fcf6e8]/5 flex items-center justify-between text-xs text-[#fcf6e8] opacity-20"
          style={{ fontFamily: 'Nunito, sans-serif' }}>
          <span>© 2026 Holy Crow Bakery. All rights reserved.</span>
          <button
            onClick={() => navigate('/admin')}
            className="hover:opacity-60 transition-opacity"
            aria-label="Owner login"
          >
            ✦
          </button>
        </div>
      </div>
    </footer>
  )
}
