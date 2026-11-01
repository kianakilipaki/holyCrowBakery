import { createClient } from 'npm:@supabase/supabase-js@2'
import { customerEmail as renderCustomerEmail, ownerEmail as renderOwnerEmail, type EmailOrder } from './emails.ts'

type StandardItem = { productId: string; quantity: number }
type RequestBody = {
  idempotencyKey?: string
  kind?: 'standard' | 'custom'
  customer?: { name?: string; email?: string; phone?: string; notes?: string }
  items?: StandardItem[]
  customDescription?: string
  preferredPickupDate?: string
  website?: string
}

const json = (body: unknown, status: number, origin: string) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  },
})

const clean = (value: unknown, maximum: number) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : ''

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

Deno.serve(async request => {
  const requestOrigin = request.headers.get('origin') || ''
  const configuredOrigins = (Deno.env.get('ALLOWED_ORIGINS') || 'https://holycrowbakery.com,https://www.holycrowbakery.com,http://localhost:8443')
    .split(',')
    .map(value => value.trim())
  const responseOrigin = configuredOrigins.includes(requestOrigin) ? requestOrigin : configuredOrigins[0]

  if (request.method === 'OPTIONS') {
    if (!configuredOrigins.includes(requestOrigin)) return json({ error: 'Origin not allowed.' }, 403, responseOrigin)
    return json({}, 200, responseOrigin)
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, responseOrigin)
  if (requestOrigin && !configuredOrigins.includes(requestOrigin)) return json({ error: 'Origin not allowed.' }, 403, responseOrigin)

  try {
    const body = await request.json() as RequestBody
    if (body.website) return json({ ok: true }, 200, responseOrigin)

    const idempotencyKey = clean(body.idempotencyKey, 36)
    const kind = body.kind === 'custom' ? 'custom' : 'standard'
    const customerName = clean(body.customer?.name, 120)
    const customerEmail = clean(body.customer?.email, 320).toLowerCase()
    const customerPhone = clean(body.customer?.phone, 40)
    const notes = clean(body.customer?.notes, 1500)

    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) return json({ error: 'Invalid order request.' }, 400, responseOrigin)
    if (!customerName || !validEmail(customerEmail)) return json({ error: 'Please provide a valid name and email.' }, 400, responseOrigin)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('RESEND_KEY')
    const ownerEmailAddress = Deno.env.get('OWNER_EMAIL') || 'holycrowbakery@gmail.com'
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Holy Crow Bakery <orders@holycrowbakery.com>'
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'The order service is not fully configured.' }, 503, responseOrigin)
    }
    if (!resendKey) {
      return json({ error: 'The order email service is not configured yet.' }, 503, responseOrigin)
    }
    if (!resendKey.startsWith('re_') || /\s/.test(resendKey)) {
      return json({ error: 'The order email service key is configured incorrectly.' }, 503, responseOrigin)
    }

    const database = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

    const { data: existing } = await database
      .from('orders')
      .select('order_number,email_status')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    if (existing) return json({ orderId: existing.order_number, emailSent: existing.email_status === 'sent' }, 200, responseOrigin)

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await database
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_email', customerEmail)
      .gte('created_at', tenMinutesAgo)
    if ((count || 0) >= 3) return json({ error: 'Too many recent requests. Please wait a few minutes and try again.' }, 429, responseOrigin)

    let items: EmailOrder['items'] = []
    let totalCents = 0
    const requestedItems = Array.isArray(body.items) ? body.items.slice(0, 30) : []

    if (kind === 'standard') {
      if (!requestedItems.length) return json({ error: 'Your cart is empty.' }, 400, responseOrigin)
      const productIds = [...new Set(requestedItems.map(item => clean(item.productId, 100)).filter(Boolean))]
      const { data: products, error: productError } = await database
        .from('products')
        .select('id,name,price_cents,available,max_quantity')
        .in('id', productIds)
      if (productError) throw productError

      const productsById = new Map((products || []).map(product => [product.id, product]))
      items = requestedItems.map(requested => {
        const product = productsById.get(clean(requested.productId, 100))
        const quantity = Math.floor(Number(requested.quantity))
        if (!product?.available || !Number.isInteger(quantity) || quantity < 1 || quantity > product.max_quantity) {
          throw new Error('One or more products are unavailable or have an invalid quantity.')
        }
        return { name: product.name, unitPriceCents: product.price_cents, quantity, productId: product.id }
      })
      totalCents = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0)
    }

    const customDescription = kind === 'custom' ? clean(body.customDescription, 4000) : ''
    const preferredPickupDate = kind === 'custom' ? clean(body.preferredPickupDate, 10) : ''
    if (kind === 'custom' && !customDescription) return json({ error: 'Please describe your custom order.' }, 400, responseOrigin)

    const { data: order, error: orderError } = await database
      .from('orders')
      .insert({
        idempotency_key: idempotencyKey,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        notes,
        total_cents: totalCents,
        is_custom_order: kind === 'custom',
        custom_description: customDescription || null,
        preferred_pickup_date: preferredPickupDate || null,
      })
      .select('id,order_number,created_at')
      .single()
    if (orderError) throw orderError

    if (kind === 'standard') {
      const { error: itemsError } = await database.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: (item as typeof item & { productId: string }).productId,
          product_name: item.name,
          unit_price_cents: item.unitPriceCents,
          quantity: item.quantity,
        })),
      )
      if (itemsError) throw itemsError
    }

    const emailOrder: EmailOrder = {
      orderNumber: order.order_number,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      totalCents,
      items,
      isCustomOrder: kind === 'custom',
      customDescription,
      preferredPickupDate,
      createdAt: new Date(order.created_at).toLocaleString('en-US', {
        timeZone: 'America/Denver',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }

    const emailResponse = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-${idempotencyKey}`,
      },
      body: JSON.stringify([
        {
          from: fromEmail,
          to: [customerEmail],
          reply_to: ownerEmailAddress,
          subject: `We received your Holy Crow Bakery order ${order.order_number}`,
          html: renderCustomerEmail(emailOrder),
        },
        {
          from: fromEmail,
          to: [ownerEmailAddress],
          reply_to: customerEmail,
          subject: `New ${kind === 'custom' ? 'custom request' : 'order'} ${order.order_number} from ${customerName}`,
          html: renderOwnerEmail(emailOrder),
        },
      ]),
    })
    const emailSent = emailResponse.ok
    if (!emailSent) console.error('Resend error:', await emailResponse.text())

    await database.from('orders').update({ email_status: emailSent ? 'sent' : 'failed' }).eq('id', order.id)
    return json({ orderId: order.order_number, emailSent }, 201, responseOrigin)
  } catch (error) {
    console.error(error)
    const message = error instanceof Error && error.message.includes('unavailable')
      ? error.message
      : 'We could not place the order. Please try again.'
    return json({ error: message }, 500, responseOrigin)
  }
})
