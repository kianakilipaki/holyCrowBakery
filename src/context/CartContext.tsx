import { createContext, useContext, useState, type ReactNode } from 'react'

export type CartItem = {
  productId: string
  productName: string
  price: number
  quantity: number
  maxQuantity: number
}

type CartContextType = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>) => boolean
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const addItem = (item: Omit<CartItem, 'quantity'>): boolean => {
    const current = items.find(i => i.productId === item.productId)
    if (current && current.quantity >= item.maxQuantity) return false

    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        if (existing.quantity >= item.maxQuantity) return prev
        return prev.map(i =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    return true
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const item = items.find(i => i.productId === productId)
    if (!item || quantity > item.maxQuantity) return
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
