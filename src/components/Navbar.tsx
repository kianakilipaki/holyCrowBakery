import { useState } from 'react'
import { ShoppingBag, Menu, X, MapPin } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import icon from '../assets/icon.png'
import banner from '../assets/banner.png'

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart()
  const { isBakeryClosed } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#menu' },
    { label: 'Order', href: '#contact' },
  ]

  return (
    <>
      {isBakeryClosed && (
        <div className="fixed left-0 right-0 top-0 z-[60] w-full border-b border-[#f0c2d8] bg-[#7a1f2d] px-4 py-3 text-center text-sm font-semibold tracking-[0.18em] uppercase text-[#fffaf5]"
          style={{ fontFamily: 'Cinzel, serif' }}>
          Bakery is closed until further notice.
        </div>
      )}
      <nav
      className={`fixed left-0 right-0 z-50 bg-transparent ${isBakeryClosed ? 'top-[44px]' : 'top-0'}`}
    >
      <div
        className="w-full"
      style={{
        backgroundColor: '#0e0c08',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(239,152,0,0.22)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:h-20 sm:px-6">
        {/* Logo */}
        <a href="#top" className="group flex min-w-0 cursor-pointer items-center gap-2 leading-none sm:gap-2.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff2a8] via-[#ef9800] to-[#8f5600] p-[3px] transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[#fcf6e8] p-[5px]">
              <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-contain" />
            </span>
          </span>
          <span className="flex flex-col">
          <span
            className="text-sm tracking-[0.08em] transition-colors group-hover:text-[#d094ad] sm:text-lg sm:tracking-widest"
            style={{ fontFamily: 'Cinzel Decorative, serif', color: '#fcf6e8' }}
          >
            Holy Crow Bakery
          </span>
          <span className="mt-0.5 hidden text-[10px] uppercase tracking-[0.3rem] text-[#d094ad] opacity-80 sm:block"
            style={{ fontFamily: 'Cinzel, serif' }}>
            ✦ gluten-free bakery ✦
          </span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="cursor-pointer text-sm tracking-widest uppercase text-[#fcf6e8]/85 transition-colors hover:text-[#d094ad]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Cart + mobile toggle */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-4">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Daybreak%2C%20South%20Jordan%2C%20UT"
            target="_blank"
            rel="noreferrer"
            className="group flex cursor-pointer items-center gap-1.5 text-[#fcf6e8]/70 transition-colors hover:text-[#d094ad]"
            aria-label="Pickup area: Daybreak, South Jordan, Utah"
            title="Pickup area: Daybreak, South Jordan, Utah"
          >
            <MapPin size={19} className="text-[#9da23d] transition-colors group-hover:text-[#d094ad]" />
            <span className="hidden text-[10px] uppercase tracking-wider lg:inline" style={{ fontFamily: 'Cinzel, serif' }}>Daybreak, UT</span>
          </a>
          <button
            onClick={() => !isBakeryClosed && setIsOpen(true)}
            disabled={isBakeryClosed}
            className="relative cursor-pointer rounded-full p-2 text-[#fcf6e8] transition-all hover:bg-[#d094ad]/15 hover:text-[#d094ad] active:scale-90 active:bg-[#d094ad]/30 active:text-[#d094ad] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#fcf6e8]"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: '#d094ad', color: '#fcf6e8' }}>
                {totalItems}
              </span>
            )}
          </button>
          <button
            className="cursor-pointer p-2 transition-colors hover:text-[#d094ad] md:hidden"
            style={{ color: '#fcf6e8' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      </div>

      <div
        className="relative w-full overflow-hidden bg-transparent"
        style={{ height: '5.13vw' }}
        aria-hidden="true"
      >
        <img
          src={banner}
          alt=""
          className="absolute h-auto max-w-none"
          style={{ left: '-0.4vw', top: '-0.2vw', width: '100.5vw' }}
        />
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ backgroundColor: 'rgba(14,12,8,0.97)', borderColor: 'rgba(208,148,173,0.2)' }}>
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="cursor-pointer text-sm tracking-widest uppercase text-[#fcf6e8] transition-colors hover:text-[#d094ad]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
    </>
  )
}
