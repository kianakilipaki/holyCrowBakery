import { useState } from 'react'
import { ShoppingBag, Plus, Check, AlertCircle, X } from 'lucide-react'
import { useStore, type Product } from '../context/StoreContext'
import { useCart } from '../context/CartContext'

function FancyMenuBorder({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-20 flex h-7 items-center px-3 sm:px-8 ${position === 'top' ? 'top-0' : 'bottom-0'}`} aria-hidden="true">
      <div className="relative h-full flex-1">
        <div className="absolute inset-x-0 top-[9px] h-px bg-gradient-to-r from-transparent via-[#b06a8a] to-[#b06a8a]" />
        <div className="absolute inset-x-0 bottom-[9px] h-px bg-gradient-to-r from-transparent via-[#d094ad] to-[#d094ad]" />
      </div>
      <div className="mx-3 flex items-center gap-2 text-[#b06a8a] drop-shadow-sm sm:mx-5 sm:gap-3">
        <span className="text-[9px]">◆</span>
        <span className="text-base text-[#ef9800]">✦</span>
        <span className="h-3 w-3 rotate-45 border border-[#b06a8a] bg-[#fcf6e8]" />
        <span className="text-base text-[#ef9800]">✦</span>
        <span className="text-[9px]">◆</span>
      </div>
      <div className="relative h-full flex-1">
        <div className="absolute inset-x-0 top-[9px] h-px bg-gradient-to-l from-transparent via-[#b06a8a] to-[#b06a8a]" />
        <div className="absolute inset-x-0 bottom-[9px] h-px bg-gradient-to-l from-transparent via-[#d094ad] to-[#d094ad]" />
      </div>
    </div>
  )
}

export default function Menu() {
  const { products, isBakeryClosed } = useStore()
  const { addItem, totalItems, setIsOpen } = useCart()
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [maxMessage, setMaxMessage] = useState<string | null>(null)
  const [openIngredients, setOpenIngredients] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const [activeCategory, setActiveCategory] = useState('All')

  const visible = products.filter(p => p.available && (activeCategory === 'All' || p.category === activeCategory))
  const totalPages = Math.ceil(visible.length / 12)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const pageItems = visible.slice((currentPage - 1) * 12, currentPage * 12)

  const selectPage = (nextPage: number) => {
    setPage(nextPage)
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleAdd = (product: Product) => {
    if (isBakeryClosed) {
      setMaxMessage('The bakery is currently closed until further notice.')
      setTimeout(() => setMaxMessage(null), 3000)
      return
    }
    const success = addItem({ productId: product.id, productName: product.name, price: product.price, maxQuantity: product.maxQuantity })
    if (!success) {
      setMaxMessage(`Limit reached — maximum ${product.maxQuantity} of ${product.name}`)
      setTimeout(() => setMaxMessage(null), 3000)
      return
    }
    setJustAdded(product.id)
    setTimeout(() => setJustAdded(null), 1500)
    setIsOpen(true)
  }

  return (
    <section
      id="menu"
      className="relative overflow-hidden py-16 sm:py-24"
      style={{ background: 'repeating-linear-gradient(90deg, #f8dce7 0, #f8dce7 44px, #fdf0f5 44px, #fdf0f5 88px)' }}
    >
      <FancyMenuBorder position="top" />
      <FancyMenuBorder position="bottom" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22rem] text-[#d094ad] sm:mb-4 sm:text-xs sm:tracking-[0.4rem]" style={{ fontFamily: 'Cinzel, serif' }}>
            ⋆ Weekly Pre-Orders ⋆
          </p>
          <h2 className="mb-4 text-3xl sm:mb-6 sm:text-4xl md:text-6xl" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#0e0c08' }}>
            The <span style={{ color: 'rgb(176, 106, 138)' }}>Menu</span>
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#0e0c08] opacity-70 sm:text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
            Made without gluten-containing ingredients using careful practices; however, we cannot guarantee against cross-contact. Orders close Thursday · Pickup Saturday.
          </p>

        </div>

        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1) }}
              className="rounded-full px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-200 sm:px-5 sm:text-xs"
              style={{
                fontFamily: 'Cinzel, serif',
                backgroundColor: activeCategory === cat ? '#d094ad' : 'rgba(255,255,255,0.72)',
                color: activeCategory === cat ? '#fcf6e8' : '#0e0c08',
                border: `1px solid ${activeCategory === cat ? '#d094ad' : 'rgba(14,12,8,0.18)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Max items toast */}
        {maxMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#ef9800', color: '#0e0c08', fontFamily: 'Nunito, sans-serif' }}>
            <AlertCircle size={16} />
            {maxMessage}
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pageItems.map(product => (
            <div
              key={product.id}
              className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundColor: '#fffaf5',
                border: '1px solid rgba(208,148,173,0.38)',
                boxShadow: '0 8px 24px rgba(92,54,71,0.12)',
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-48 bg-[#f2d7e1]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(26,30,31,0.7) 0%, transparent 60%)' }} />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-semibold mb-1 text-[#0e0c08]"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  {product.name}
                </h3>
                <p className="text-xs text-[#3d4547] opacity-70 leading-relaxed mb-4"
                  style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {product.description}
                </p>

                {/* Price + Add */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#b06a8a' }}>
                    ${product.price.toFixed(2)}
                    <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-[#0e0c08]/45">Max {product.maxQuantity}</span>
                  </span>
                  <button
                    onClick={() => handleAdd(product)}
                    disabled={isBakeryClosed}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      backgroundColor: justAdded === product.id ? '#9da23d' : '#d094ad',
                      color: '#fcf6e8',
                    }}
                  >
                    {isBakeryClosed ? (
                      'Closed'
                    ) : justAdded === product.id ? (
                      <><Check size={13} /> Added</>
                    ) : (
                      <><Plus size={13} /> Add</>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setOpenIngredients(product.id)}
                  className="mt-4 w-full border-t border-[#0e0c08]/10 pt-3 text-[10px] uppercase tracking-[0.18em] text-[#b06a8a] transition-colors hover:text-[#0e0c08]"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  View ingredients
                </button>
              </div>

              <div
                className={`absolute inset-0 z-20 flex flex-col bg-[#fcf6e8] p-6 transition-transform duration-500 ease-out ${openIngredients === product.id ? 'visible translate-y-0' : 'invisible translate-y-full'}`}
                aria-hidden={openIngredients !== product.id}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>What's inside</p>
                    <h3 className="mt-1 text-xl text-[#0e0c08]" style={{ fontFamily: 'Playfair Display, serif' }}>{product.name}</h3>
                  </div>
                  <button onClick={() => setOpenIngredients(null)} className="rounded-full border border-[#0e0c08]/15 p-2 text-[#0e0c08] hover:bg-[#d094ad]/15" aria-label="Close ingredients">
                    <X size={15} />
                  </button>
                </div>
                <ul className="flex-1 space-y-2 overflow-y-auto text-sm text-[#3d4547]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {(product.ingredients.length ? product.ingredients : ['Ingredients coming soon']).map(ingredient => (
                    <li key={ingredient} className="flex gap-2"><span className="text-[#d094ad]">✦</span><span>{ingredient}</span></li>
                  ))}
                </ul>
                <button onClick={() => setOpenIngredients(null)} className="mt-5 rounded-full bg-[#0e0c08] px-5 py-2.5 text-xs uppercase tracking-widest text-[#fcf6e8]" style={{ fontFamily: 'Cinzel, serif' }}>
                  Back to item
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Menu pages">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => selectPage(pageNumber)}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  fontFamily: 'Cinzel, serif',
                  backgroundColor: currentPage === pageNumber ? '#0e0c08' : 'rgba(255,255,255,0.78)',
                  color: currentPage === pageNumber ? '#fcf6e8' : '#0e0c08',
                  border: `1px solid ${currentPage === pageNumber ? '#0e0c08' : 'rgba(176,106,138,0.35)'}`,
                }}
              >
                {pageNumber}
              </button>
            ))}
          </nav>
        )}

        {visible.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">☽</div>
            <p className="text-[#0e0c08] opacity-60" style={{ fontFamily: 'Playfair Display, serif' }}>
              No items available in this category right now.
            </p>
          </div>
        )}

        {/* Cart CTA */}
        {totalItems > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-widest uppercase transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif', boxShadow: '0 0 30px rgba(208,148,173,0.4)' }}
            >
              <ShoppingBag size={18} />
              View Cart ({totalItems} items)
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
