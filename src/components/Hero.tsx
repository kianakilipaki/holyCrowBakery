import heroImage from '../assets/bakery-hero.png'
import logoImage from '../assets/logo.png'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#fcf6e8', paddingTop: 'calc(5.13vw + clamp(4rem, 8vw, 5rem))' }}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Freshly baked pastries at Holy Crow Bakery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/55" />
      </div>

      {/* Arched bakery-window frame */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-4 z-[5] border-[10px] border-[#fcf6e8]/90 shadow-[inset_0_0_30px_rgba(14,12,8,0.16),0_10px_30px_rgba(14,12,8,0.16)] sm:inset-x-8 sm:bottom-8"
        style={{ top: 'calc(5.13vw + clamp(4.5rem, 9vw, 5.75rem))', borderRadius: '45% 45% 24px 24px / 18% 18% 24px 24px' }}
        aria-hidden="true"
      >
        <div className="absolute inset-1 border-2 border-[#b06a8a]/55" style={{ borderRadius: 'inherit' }} />
      </div>

      {/* Floating decorative stars */}
      <div className="absolute top-1/4 left-8 text-[#d094ad] opacity-30 text-2xl animate-pulse">✦</div>
      <div className="absolute top-1/3 right-12 text-[#ef9800] opacity-25 text-lg animate-pulse" style={{ animationDelay: '1s' }}>⋆</div>
      <div className="absolute bottom-1/3 left-16 text-[#d094ad] opacity-20 text-3xl animate-pulse" style={{ animationDelay: '2s' }}>✦</div>
      <div className="absolute bottom-1/4 right-8 text-[#9da23d] opacity-25 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>⋆</div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Pre-badge */}
        <p className="mx-auto mb-4 inline-block max-w-[92vw] rounded-full bg-white/85 px-4 py-2 text-[9px] font-semibold uppercase leading-relaxed tracking-[0.14rem] text-[#0e0c08] shadow-sm sm:mb-6 sm:px-5 sm:text-xs sm:tracking-[0.32rem]"
          style={{ fontFamily: 'Cinzel, serif', backgroundColor: 'rgb(208, 148, 173)' }}>
          ⋆ thoughtfully made with celiac safety in mind ⋆
        </p>

        {/* Main logo */}
        <img
          src={logoImage}
          alt="Holy Crow Bakery"
          className="mx-auto mb-2 h-auto w-[min(92vw,680px)] drop-shadow-[0_8px_22px_rgba(255,255,255,0.9)]"
        />

        {/* Tagline */}
        <p
          className="mx-auto mb-6 max-w-lg px-2 text-sm italic leading-relaxed opacity-80 sm:mb-10 sm:text-base md:text-xl"
          style={{ fontFamily: 'Playfair Display, serif', color: '#0e0c08' }}
        >
          Wonderfully safe and worth crowing about — handcrafted bakes made to brighten your day.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <a
            href="#menu"
            className="w-full max-w-[17rem] rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:scale-105 hover:shadow-lg sm:w-auto sm:max-w-none sm:px-8 sm:text-sm"
            style={{ backgroundColor: '#0e0c08', color: '#fcf6e8', fontFamily: 'Cinzel, serif', boxShadow: '0 8px 24px rgba(14,12,8,0.22)' }}
          >
            Browse Menu
          </a>
          <a
            href="#contact"
            className="w-full max-w-[17rem] rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:scale-105 sm:w-auto sm:max-w-none sm:px-8 sm:text-sm"
            style={{ borderColor: '#0e0c08', color: '#0e0c08', backgroundColor: 'rgba(255,255,255,0.7)', fontFamily: 'Cinzel, serif' }}
          >
            Custom Order
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-40 sm:flex">
        <span className="text-[#0e0c08] text-xs tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>SCROLL</span>
        <div className="w-px h-10 bg-[#0e0c08] animate-pulse" />
      </div>
    </section>
  )
}
