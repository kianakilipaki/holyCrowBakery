import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Package, ShoppingBag, LogOut, ChevronDown, ChevronUp, Search, DollarSign } from 'lucide-react'
import { useStore, type Order } from '../context/StoreContext'
import { supabase } from '../lib/supabase'

const STATUS_COLORS: Record<Order['status'], { bg: string; text: string; border: string }> = {
  pending: { bg: 'rgba(239,152,0,0.22)', text: '#ffc04d', border: 'rgba(239,152,0,0.55)' },
  confirmed: { bg: 'rgba(157,162,61,0.24)', text: '#d3dc65', border: 'rgba(157,162,61,0.55)' },
  ready: { bg: 'rgba(208,148,173,0.24)', text: '#f0b5cc', border: 'rgba(208,148,173,0.58)' },
  completed: { bg: 'rgba(252,246,232,0.13)', text: '#fcf6e8', border: 'rgba(252,246,232,0.32)' },
  cancelled: { bg: 'rgba(239,68,68,0.20)', text: '#ff9999', border: 'rgba(239,68,68,0.52)' },
}

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: '⏳ Pending',
  confirmed: '✓ Confirmed',
  ready: '✦ Ready',
  completed: '☽ Completed',
  cancelled: '× Cancelled',
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const { orders, updateOrderStatus, updatePaymentReceived } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all')
  const [search, setSearch] = useState('')

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o =>
      !search || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.paymentReceived)
    .reduce((sum, order) => sum + order.total, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

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
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
          >
            <ShoppingBag size={14} />
            Orders
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ef9800] text-[#0e0c08] text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:bg-[#d094ad]/10"
            style={{ color: 'rgba(252,246,232,0.6)', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: orders.length, color: '#d094ad', icon: ShoppingBag },
            { label: 'Pending', value: pendingCount, color: '#ef9800', icon: Package },
            { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: '#9da23d', icon: Package },
            { label: 'Total Received', value: `$${totalRevenue.toFixed(2)}`, color: '#ef9800', icon: DollarSign },
          ].map(stat => (
            <div key={stat.label} className="p-5 rounded-2xl"
              style={{ backgroundColor: '#1a1e1f', border: '1px solid rgba(208,148,173,0.12)' }}>
              <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Cinzel, serif', color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs opacity-50 text-[#fcf6e8]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: '#fcf6e8' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d094ad]/50"
              style={{ backgroundColor: '#1a1e1f', border: '1px solid rgba(208,148,173,0.2)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-4 py-2 rounded-full text-xs tracking-widest uppercase transition-all"
                style={{
                  fontFamily: 'Cinzel, serif',
                  backgroundColor: filter === s ? '#d094ad' : 'rgba(252,246,232,0.05)',
                  color: filter === s ? '#fcf6e8' : 'rgba(252,246,232,0.5)',
                  border: `1px solid ${filter === s ? '#d094ad' : 'rgba(208,148,173,0.15)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#fcf6e8] opacity-30" style={{ fontFamily: 'Playfair Display, serif' }}>
              No orders found
            </div>
          ) : filtered.map(order => (
            <div
              key={order.id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#1a1e1f', border: '1px solid rgba(208,148,173,0.12)' }}
            >
              {/* Order header */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#fcf6e8]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {order.customerName}
                      </p>
                      {order.isCustomOrder && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(208,148,173,0.15)', color: '#d094ad', fontFamily: 'Cinzel, serif' }}>
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#fcf6e8] opacity-40" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      #{order.id} · {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {order.total > 0 && (
                    <span className="text-[#ef9800] font-bold text-sm" style={{ fontFamily: 'Cinzel, serif' }}>
                      ${order.total.toFixed(2)}
                    </span>
                  )}
                  <span
                    className="rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide"
                    style={{ ...STATUS_COLORS[order.status], fontFamily: 'Nunito, sans-serif', border: `1px solid ${STATUS_COLORS[order.status].border}` }}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  {expanded === order.id ? <ChevronUp size={16} style={{ color: 'rgba(252,246,232,0.3)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(252,246,232,0.3)' }} />}
                </div>
              </div>

              {/* Order details */}
              {expanded === order.id && (
                <div className="px-6 pb-6 space-y-4" style={{ borderTop: '1px solid rgba(208,148,173,0.08)' }}>
                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1.5 text-xs" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      <p><span className="text-[#d094ad]">Email:</span> <span className="text-[#fcf6e8] opacity-70">{order.email}</span></p>
                      {order.phone && <p><span className="text-[#d094ad]">Phone:</span> <span className="text-[#fcf6e8] opacity-70">{order.phone}</span></p>}
                      {order.notes && <p><span className="text-[#d094ad]">Notes:</span> <span className="text-[#fcf6e8] opacity-70">{order.notes}</span></p>}
                      {order.customDescription && (
                        <p><span className="text-[#d094ad]">Custom Request:</span> <span className="text-[#fcf6e8] opacity-70">{order.customDescription}</span></p>
                      )}
                    </div>

                    {order.items.length > 0 && (
                      <div>
                        <p className="text-xs text-[#d094ad] mb-2" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Items Ordered</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-[#fcf6e8] opacity-60" style={{ fontFamily: 'Nunito, sans-serif' }}>
                              <span>{item.productName} × {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs pt-1 border-t border-[#d094ad]/10 font-bold"
                            style={{ color: '#ef9800', fontFamily: 'Cinzel, serif' }}>
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {/* Status update */}
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#d094ad]/60"
                      style={{ backgroundColor: '#0e0c08', border: '1px solid rgba(208,148,173,0.55)', color: '#fcf6e8', fontFamily: 'Nunito, sans-serif' }}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="confirmed">✓ Confirmed</option>
                      <option value="ready">✦ Ready for Pickup</option>
                      <option value="completed">☽ Completed</option>
                      <option value="cancelled">× Cancelled</option>
                    </select>

                    {/* Payment received toggle */}
                    {order.total > 0 && (
                      <button
                        onClick={() => void updatePaymentReceived(order.id, !order.paymentReceived)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: order.paymentReceived ? 'rgba(157,162,61,0.15)' : 'rgba(239,152,0,0.1)',
                          color: order.paymentReceived ? '#9da23d' : '#ef9800',
                          border: `1px solid ${order.paymentReceived ? 'rgba(157,162,61,0.3)' : 'rgba(239,152,0,0.25)'}`,
                          fontFamily: 'Nunito, sans-serif',
                        }}
                      >
                        <DollarSign size={12} />
                        {order.paymentReceived ? 'Paid Total ✓' : 'Paid Total'}
                      </button>
                    )}

                    {/* Email reply */}
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(order.email)}&su=${encodeURIComponent(`Your Holy Crow Bakery Order #${order.id}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgba(208,148,173,0.1)', color: '#d094ad', border: '1px solid rgba(208,148,173,0.2)', fontFamily: 'Nunito, sans-serif' }}
                    >
                      <Mail size={13} />
                      Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
