import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, X, Check, Package, ShoppingBag, LogOut, ImageUp } from 'lucide-react'
import { useStore, type Product } from '../context/StoreContext'
import { supabase, uploadProductImage } from '../lib/supabase'

type FormData = Omit<Product, 'id'>

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  available: true,
  imageUrl: '',
  ingredients: [],
  maxQuantity: 1,
}

export default function AdminProducts() {
  const navigate = useNavigate()
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory: saveCategory, deleteCategory } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [showCategoryEditor, setShowCategoryEditor] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setImageError(''); setShowCategoryEditor(false); setShowForm(true) }
  const openEdit = (p: Product) => { setEditingId(p.id); setForm({ ...p, ingredients: p.ingredients ?? [], maxQuantity: p.maxQuantity ?? 5 }); setImageError(''); setShowCategoryEditor(false); setShowForm(true) }

  const handleImageUpload = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image must be 10 MB or smaller.')
      return
    }
    setImageError('Preparing image...')
    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Unable to read image.'))
        reader.readAsDataURL(file)
      })
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const preview = new Image()
        preview.onload = () => resolve(preview)
        preview.onerror = () => reject(new Error('Unable to process image.'))
        preview.src = source
      })
      const scale = Math.min(1, 1200 / image.naturalWidth, 1200 / image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Unable to process image.')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const optimizedImage = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Unable to process image.')), 'image/webp', 0.76)
      })
      setImageError('Uploading image...')
      const imageUrl = await uploadProductImage(optimizedImage, `${file.name.replace(/\.[^.]+$/, '')}.webp`)
      setForm(previous => ({ ...previous, imageUrl }))
      setImageError('')
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Unable to process image.')
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.category || form.price <= 0) return
    const cleanForm = { ...form, ingredients: form.ingredients.map(ingredient => ingredient.trim()).filter(Boolean) }
    if (editingId) {
      await updateProduct({ ...cleanForm, id: editingId })
    } else {
      await addProduct(cleanForm)
    }
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = async (id: string) => {
    await deleteProduct(id)
    setDeleteConfirm(null)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const addCategory = async () => {
    const category = newCategory.trim()
    if (!category) return
    if (categories.some(existing => existing.toLowerCase() === category.toLowerCase())) {
      setCategoryError('That category already exists.')
      return
    }
    await saveCategory(category)
    setForm(previous => ({ ...previous, category }))
    setNewCategory('')
    setCategoryError('')
  }

  const removeCategory = async (category: string) => {
    if (products.some(product => product.category === category)) {
      setCategoryError(`Move products out of ${category} before removing it.`)
      return
    }
    await deleteCategory(category)
    setCategoryError('')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1e1f' }}>
      {/* Admin Nav */}
      <nav className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#0e0c08', borderBottom: '1px solid rgba(208,148,173,0.15)' }}>
        <div className="flex items-center gap-6">
          <span className="text-base text-[#fcf6e8]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
            Holy Crow Bakery
          </span>
          <span className="text-xs text-[#d094ad] opacity-60 hidden sm:block" style={{ fontFamily: 'Cinzel, serif' }}>
            Owner Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:bg-[#d094ad]/10"
            style={{ color: 'rgba(252,246,232,0.6)', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
          >
            <ShoppingBag size={14} />
            Orders
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
          >
            <Package size={14} />
            Products
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-full transition-colors hover:text-[#d094ad]"
            style={{ color: 'rgba(252,246,232,0.4)' }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-[#fcf6e8]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Products
            </h1>
            <p className="text-sm text-[#fcf6e8] opacity-40 mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {products.length} items · {products.filter(p => p.available).length} available
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm tracking-widest uppercase transition-all hover:scale-105"
            style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Products table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(208,148,173,0.15)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#0e0c08', borderBottom: '1px solid rgba(208,148,173,0.1)' }}>
                  {['Product', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs tracking-widest uppercase text-[#d094ad] opacity-70"
                      style={{ fontFamily: 'Cinzel, serif' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr
                    key={product.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(14,12,8,0.48)',
                      borderBottom: '1px solid rgba(208,148,173,0.06)',
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#0e0c08]">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#fcf6e8]" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {product.name}
                          </p>
                          <p className="text-xs text-[#fcf6e8] opacity-40 truncate max-w-[180px]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(208,148,173,0.1)', color: '#d094ad', fontFamily: 'Cinzel, serif' }}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#ef9800] font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => updateProduct({ ...product, available: !product.available })}
                        className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all"
                        style={{
                          backgroundColor: product.available ? 'rgba(157,162,61,0.15)' : 'rgba(239,68,68,0.1)',
                          color: product.available ? '#9da23d' : '#ef4444',
                          border: `1px solid ${product.available ? 'rgba(157,162,61,0.3)' : 'rgba(239,68,68,0.2)'}`,
                          fontFamily: 'Nunito, sans-serif',
                        }}
                      >
                        {product.available ? <><Check size={11} /> Available</> : <><X size={11} /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[#d094ad]/15"
                          style={{ color: '#d094ad' }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', fontFamily: 'Nunito, sans-serif' }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1 rounded opacity-40 hover:opacity-70"
                              style={{ color: '#fcf6e8' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'rgba(252,246,232,0.3)' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg rounded-2xl p-8 overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: '#1a1e1f', border: '1px solid rgba(208,148,173,0.25)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-[#fcf6e8]" style={{ fontFamily: 'Cinzel, serif' }}>
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'rgba(252,246,232,0.4)' }}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Black Velvet Cake' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]"
                      style={{ fontFamily: 'Cinzel, serif' }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key as keyof FormData] as string}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d094ad]/50"
                      style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>Product Image</label>
                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#d094ad]/40 bg-[#0e0c08] p-4 transition-colors hover:border-[#d094ad]">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="Product preview" className="h-20 w-20 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#1a1e1f] text-[#d094ad]"><ImageUp size={24} /></span>
                    )}
                    <span>
                      <span className="block text-sm font-semibold text-[#fcf6e8]">{form.imageUrl ? 'Replace image' : 'Upload an image'}</span>
                      <span className="mt-1 block text-xs text-[#fcf6e8]/40">PNG, JPG or WEBP · max 10 MB</span>
                    </span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={event => handleImageUpload(event.target.files?.[0])} />
                  </label>
                  {imageError && <p className="mt-2 text-xs text-red-400">{imageError}</p>}
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]"
                    style={{ fontFamily: 'Cinzel, serif' }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Product description..."
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-[#d094ad]/50"
                    style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>Ingredients</label>
                  <textarea
                    rows={4}
                    placeholder="One ingredient per line..."
                    value={form.ingredients.join('\n')}
                    onChange={event => setForm(previous => ({ ...previous, ingredients: event.target.value.split('\n') }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-[#d094ad]/50"
                    style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
                  />
                  <p className="mt-1.5 text-xs text-[#fcf6e8]/35">Enter one ingredient per line.</p>
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>Maximum per order</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={form.maxQuantity}
                    onChange={event => setForm(previous => ({ ...previous, maxQuantity: Math.max(1, Number(event.target.value) || 1) }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d094ad]/50"
                    style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5 text-[#d094ad]"
                      style={{ fontFamily: 'Cinzel, serif' }}>Price ($)</label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={form.price}
                      onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d094ad]/50"
                      style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label className="text-xs tracking-widest uppercase text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>Category</label>
                      <button
                        type="button"
                        onClick={() => { setShowCategoryEditor(previous => !previous); setCategoryError('') }}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#fcf6e8]/45 transition-colors hover:text-[#d094ad]"
                        style={{ fontFamily: 'Cinzel, serif' }}
                      >
                        <Edit2 size={10} /> Edit
                      </button>
                    </div>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d094ad]/50"
                      style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.2)', color: form.category ? '#fcf6e8' : 'rgba(252,246,232,0.3)', fontFamily: 'Nunito, sans-serif' }}
                    >
                      <option value="" disabled>Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {showCategoryEditor && (
                  <div className="rounded-xl border border-[#d094ad]/20 bg-[#0e0c08] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>Edit categories</p>
                      <button type="button" onClick={() => setShowCategoryEditor(false)} className="text-[#fcf6e8]/40 hover:text-[#fcf6e8]" aria-label="Close category editor"><X size={15} /></button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={event => { setNewCategory(event.target.value); setCategoryError('') }}
                        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addCategory() } }}
                        placeholder="New category"
                        className="min-w-0 flex-1 rounded-lg border border-[#d094ad]/20 bg-[#1a1e1f] px-3 py-2 text-sm text-[#fcf6e8] outline-none focus:ring-2 focus:ring-[#d094ad]/50"
                      />
                      <button type="button" onClick={addCategory} className="rounded-lg bg-[#d094ad] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#fcf6e8]">Add</button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map(category => {
                        const inUse = products.some(product => product.category === category)
                        return (
                          <span key={category} className="flex items-center gap-1.5 rounded-full border border-[#d094ad]/20 bg-[#1a1e1f] py-1 pl-3 pr-1.5 text-xs text-[#fcf6e8]/70">
                            {category}
                            <button
                              type="button"
                              onClick={() => removeCategory(category)}
                              className={`rounded-full p-1 ${inUse ? 'cursor-not-allowed text-[#fcf6e8]/20' : 'text-[#fcf6e8]/40 hover:bg-red-500/15 hover:text-red-400'}`}
                              title={inUse ? 'This category is assigned to a product' : `Remove ${category}`}
                              aria-label={`Remove ${category}`}
                            >
                              <X size={11} />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                    {categoryError && <p className="mt-3 text-xs text-[#ef9800]">{categoryError}</p>}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, available: !p.available }))}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{ backgroundColor: form.available ? '#d094ad' : 'rgba(252,246,232,0.15)' }}
                  >
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{ transform: form.available ? 'translateX(20px)' : 'translateX(0)' }} />
                  </button>
                  <span className="text-sm text-[#fcf6e8] opacity-70" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {form.available ? 'Available for ordering' : 'Hidden from menu'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-full text-sm font-semibold tracking-widest uppercase border transition-all"
                  style={{ borderColor: 'rgba(208,148,173,0.3)', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.category || form.price <= 0 || !form.imageUrl}
                  className="flex-1 py-3 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
                >
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
