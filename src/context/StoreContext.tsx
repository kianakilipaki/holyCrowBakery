import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
  imageUrl: string
  ingredients: string[]
  maxQuantity: number
}

export type OrderItem = {
  productId: string
  productName: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  databaseId?: string
  customerName: string
  email: string
  phone: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
  createdAt: string
  notes: string
  isCustomOrder: boolean
  customDescription?: string
  paymentReceived: boolean
  emailStatus?: 'pending' | 'sent' | 'failed'
  preferredPickupDate?: string
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Black Velvet Cake',
    description: 'Rich dark chocolate cake with black cocoa, topped with crimson cream cheese frosting and edible roses.',
    price: 7.50,
    category: 'Cakes',
    available: true,
    ingredients: ['Gluten-free flour blend', 'Black cocoa', 'Sugar', 'Eggs', 'Butter', 'Cream cheese', 'Vanilla'],
    maxQuantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'Lavender Earl Grey Macarons',
    description: '4-pack. Delicate lavender-tinted shells with fragrant earl grey buttercream filling.',
    price: 13.00,
    category: 'Macarons',
    available: true,
    ingredients: ['Almond flour', 'Powdered sugar', 'Egg whites', 'Lavender', 'Earl Grey tea', 'Butter'],
    maxQuantity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '3',
    name: 'Rose Garden Cupcakes',
    description: '2-pack. Dark chocolate cupcakes with rosewater buttercream, topped with a dried rose petal.',
    price: 10.00,
    category: 'Cupcakes',
    available: true,
    ingredients: ['Gluten-free flour blend', 'Cocoa', 'Sugar', 'Eggs', 'Butter', 'Rosewater', 'Cream'],
    maxQuantity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '4',
    name: 'Sage & Lemon Shortbread',
    description: '6-pack. Buttery almond flour shortbread with fresh sage and lemon zest, dusted in gold.',
    price: 9.00,
    category: 'Cookies',
    available: true,
    ingredients: ['Almond flour', 'Butter', 'Sugar', 'Fresh sage', 'Lemon zest', 'Sea salt'],
    maxQuantity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '5',
    name: 'Matcha Crow-Swirl Brownies',
    description: '2-pack. Fudgy dark chocolate brownies swirled with ceremonial matcha cream.',
    price: 8.00,
    category: 'Bars',
    available: true,
    ingredients: ['Dark chocolate', 'Butter', 'Sugar', 'Eggs', 'Gluten-free flour', 'Matcha'],
    maxQuantity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '6',
    name: 'Blood Orange Tart',
    description: 'Crisp almond tart shell filled with blood orange curd and topped with candied citrus.',
    price: 8.50,
    category: 'Tarts',
    available: true,
    ingredients: ['Almond flour', 'Butter', 'Eggs', 'Blood orange', 'Sugar', 'Citrus peel'],
    maxQuantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '7',
    name: 'Spiced Pumpkin Loaf Slice',
    description: 'Moist pumpkin bread with warming spices, brown sugar crust, and maple glaze.',
    price: 5.50,
    category: 'Breads',
    available: true,
    ingredients: ['Pumpkin', 'Gluten-free flour', 'Brown sugar', 'Eggs', 'Cinnamon', 'Maple'],
    maxQuantity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '8',
    name: "Crow's Treasure Cookie Box",
    description: '6-pack assorted decorated sugar cookies — crows, feathers, berries, and flowers.',
    price: 15.00,
    category: 'Cookies',
    available: false,
    ingredients: ['Gluten-free flour blend', 'Butter', 'Sugar', 'Eggs', 'Vanilla', 'Royal icing'],
    maxQuantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format',
  },
]

const FRIENDLY_COPY_BY_LEGACY_NAME: Record<string, { name: string; description?: string }> = {
  'Midnight Rose Cupcakes': { name: 'Rose Garden Cupcakes' },
  'Matcha Obsidian Brownies': { name: 'Matcha Crow-Swirl Brownies' },
  'Celestial Cookie Box': {
    name: "Crow's Treasure Cookie Box",
    description: '6-pack assorted decorated sugar cookies — crows, feathers, berries, and flowers.',
  },
}

const normalizeProducts = (products: Product[]): Product[] => products.map(product => {
  const original = DEFAULT_PRODUCTS.find(defaultProduct => defaultProduct.id === product.id)
  const friendlyCopy = FRIENDLY_COPY_BY_LEGACY_NAME[product.name]
  return {
    ...product,
    name: friendlyCopy?.name ?? product.name,
    description: friendlyCopy?.description ?? product.description,
    ingredients: Array.isArray(product.ingredients) && product.ingredients.length ? product.ingredients : original?.ingredients ?? [],
    maxQuantity: Math.max(1, Number(product.maxQuantity) || original?.maxQuantity || 5),
  }
})

type StoreContextType = {
  products: Product[]
  orders: Order[]
  categories: string[]
  isBakeryClosed: boolean
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (p: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
  deleteCategory: (name: string) => Promise<void>
  setBakeryClosed: (closed: boolean) => void
  addOrder: (o: Omit<Order, 'id' | 'createdAt'>) => Promise<{ id: string; emailSent: boolean }>
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>
  updatePaymentReceived: (id: string, paid: boolean) => Promise<void>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('bakery_products')
      return stored ? normalizeProducts(JSON.parse(stored)) : DEFAULT_PRODUCTS
    } catch {
      return DEFAULT_PRODUCTS
    }
  })

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('bakery_orders')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [categories, setCategories] = useState<string[]>(['Cakes', 'Cupcakes', 'Cookies', 'Macarons', 'Bars', 'Tarts', 'Breads', 'Seasonal'])
  const [isBakeryClosed, setIsBakeryClosed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('bakery_closed')
      return stored ? stored === 'true' : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    localStorage.setItem('bakery_closed', String(isBakeryClosed))
  }, [isBakeryClosed])

  useEffect(() => {
    const loadPublicStore = async () => {
      const [{ data: productRows, error: productError }, { data: categoryRows, error: categoryError }] = await Promise.all([
        supabase.from('products').select('*').order('created_at'),
        supabase.from('categories').select('name').order('name'),
      ])
      if (!productError && productRows) {
        setProducts(productRows.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price_cents / 100,
          category: row.category,
          available: row.available,
          imageUrl: row.image_url,
          ingredients: row.ingredients || [],
          maxQuantity: row.max_quantity,
        })))
      }
      if (!categoryError && categoryRows) setCategories(categoryRows.map(row => row.name))
    }

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
      if (error) {
        setOrders([])
        return
      }
      setOrders((data || []).map(row => ({
        id: row.order_number,
        databaseId: row.id,
        customerName: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone || '',
        items: (row.order_items || []).map((item: Record<string, unknown>) => ({
          productId: String(item.product_id || ''),
          productName: String(item.product_name || ''),
          price: Number(item.unit_price_cents || 0) / 100,
          quantity: Number(item.quantity || 0),
        })),
        total: row.total_cents / 100,
        status: row.status,
        createdAt: row.created_at,
        notes: row.notes || '',
        isCustomOrder: row.is_custom_order,
        customDescription: row.custom_description || undefined,
        preferredPickupDate: row.preferred_pickup_date || undefined,
        paymentReceived: row.payment_received ?? Boolean(row.venmo_paid || row.cash_paid),
        emailStatus: row.email_status,
      })))
    }

    void loadPublicStore()
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void loadOrders()
      else setOrders([])
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void loadOrders()
      else setOrders([])
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  const productRow = (p: Omit<Product, 'id'> | Product) => ({
    name: p.name,
    description: p.description,
    price_cents: Math.round(p.price * 100),
    category: p.category,
    available: p.available,
    image_url: p.imageUrl,
    ingredients: p.ingredients,
    max_quantity: p.maxQuantity,
    updated_at: new Date().toISOString(),
  })

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert(productRow(p)).select('id').single()
    if (error) throw error
    setProducts(previous => [...previous, { ...p, id: data.id }])
  }

  const updateProduct = async (p: Product) => {
    const { error } = await supabase.from('products').update(productRow(p)).eq('id', p.id)
    if (error) throw error
    setProducts(previous => previous.map(product => product.id === p.id ? p : product))
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    setProducts(previous => previous.filter(product => product.id !== id))
  }

  const addCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert({ name })
    if (error) throw error
    setCategories(previous => [...previous, name].sort())
  }

  const deleteCategory = async (name: string) => {
    const { error } = await supabase.from('categories').delete().eq('name', name)
    if (error) throw error
    setCategories(previous => previous.filter(category => category !== name))
  }

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.functions.invoke('place-order', {
      body: {
        idempotencyKey: crypto.randomUUID(),
        kind: order.isCustomOrder ? 'custom' : 'standard',
        customer: {
          name: order.customerName,
          email: order.email,
          phone: order.phone,
          notes: order.notes,
        },
        items: order.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
        customDescription: order.customDescription,
        preferredPickupDate: order.preferredPickupDate,
      },
    })
    if (error) {
      let message = error.message
      const response = (error as { context?: Response }).context
      if (response) {
        try {
          const payload = await response.clone().json() as { error?: string; message?: string }
          message = payload.error || payload.message || message
        } catch {
          // Keep the SDK message when the function did not return JSON.
        }
      }
      throw new Error(message)
    }
    if (!data?.orderId) throw new Error(data?.error || 'The order could not be placed.')
    return { id: String(data.orderId), emailSent: Boolean(data.emailSent) }
  }

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const order = orders.find(candidate => candidate.id === id)
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', order?.databaseId || id)
    if (error) throw error
    setOrders(previous => previous.map(candidate => candidate.id === id ? { ...candidate, status } : candidate))
  }

  const updatePaymentReceived = async (id: string, paid: boolean) => {
    const order = orders.find(candidate => candidate.id === id)
    const { error } = await supabase
      .from('orders')
      .update({ payment_received: paid, updated_at: new Date().toISOString() })
      .eq('id', order?.databaseId || id)
    if (error) throw error
    setOrders(previous => previous.map(candidate => candidate.id === id ? { ...candidate, paymentReceived: paid } : candidate))
  }

  const setBakeryClosed = (closed: boolean) => setIsBakeryClosed(closed)

  return (
    <StoreContext.Provider value={{ products, orders, categories, isBakeryClosed, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, setBakeryClosed, addOrder, updateOrderStatus, updatePaymentReceived }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
