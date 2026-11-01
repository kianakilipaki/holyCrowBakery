type EmailOrderItem = {
  name: string
  unitPriceCents: number
  quantity: number
}

export type EmailOrder = {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
  totalCents: number
  createdAt: string
  items: EmailOrderItem[]
  isCustomOrder: boolean
  customDescription?: string
  preferredPickupDate?: string
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]!)

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`

const lineItems = (order: EmailOrder) => {
  if (order.isCustomOrder) {
    return `
      <tr>
        <td style="padding:14px 0;color:#38332e;font:14px/1.6 Arial,sans-serif;">
          <strong>Custom order request</strong><br>
          ${escapeHtml(order.customDescription || '')}
        </td>
      </tr>`
  }

  return order.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #ead8df;color:#38332e;font:14px/1.5 Arial,sans-serif;">
        ${escapeHtml(item.name)} × ${item.quantity}
      </td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid #ead8df;color:#38332e;font:bold 14px/1.5 Arial,sans-serif;">
        ${money(item.unitPriceCents * item.quantity)}
      </td>
    </tr>`).join('')
}

const shell = (preheader: string, content: string) => `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f8edf2;color:#0e0c08;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8edf2;width:100%;">
      <tr><td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background:#fffaf0;border:1px solid #e9c8d6;border-radius:22px;box-shadow:0 10px 30px rgba(14,12,8,.1);max-width:600px;overflow:hidden;width:100%;">
          <tr><td align="center" style="background:#0e0c08;border-bottom:5px solid #d094ad;padding:30px 24px;">
            <div style="color:#ef9800;font:11px Arial,sans-serif;letter-spacing:4px;margin-bottom:9px;text-transform:uppercase;">Fresh from the nest</div>
            <div style="color:#fcf6e8;font:28px Georgia,serif;">Holy Crow Bakery</div>
            <div style="color:#d094ad;font:11px Arial,sans-serif;letter-spacing:2px;margin-top:9px;">A GLUTEN-FRIENDLY BAKERY</div>
          </td></tr>
          ${content}
          <tr><td align="center" style="background:#0e0c08;padding:24px;">
            <div style="color:#fcf6e8;font:14px Georgia,serif;margin-bottom:8px;">Questions about this order?</div>
            <a href="mailto:holycrowbakery@gmail.com?subject=Holy%20Crow%20Bakery%20Order%20Question" style="color:#d094ad;font:13px Arial,sans-serif;">holycrowbakery@gmail.com</a>
            <div style="color:#948d84;font:11px Arial,sans-serif;margin-top:12px;">Daybreak • South Jordan, Utah</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

export const customerEmail = (order: EmailOrder) => {
  const customPickup = order.preferredPickupDate
    ? `<p style="color:#514b43;font:13px/1.6 Arial,sans-serif;margin:7px 0 0;">Preferred pickup: ${escapeHtml(order.preferredPickupDate)}</p>`
    : ''
  const totalRow = order.totalCents > 0 ? `
    <tr>
      <td style="padding-top:15px;color:#514b43;font:bold 14px Arial,sans-serif;">Order total</td>
      <td align="right" style="padding-top:15px;color:#0e0c08;font:bold 20px Georgia,serif;">${money(order.totalCents)}</td>
    </tr>` : ''
  const payment = order.totalCents > 0 ? `
    <tr><td style="padding:8px 34px 24px;">
      <div style="background:#fff6df;border-left:4px solid #ef9800;border-radius:10px;padding:18px 20px;">
        <div style="color:#0e0c08;font:bold 16px Georgia,serif;margin-bottom:7px;">Choose the payment option that works for you</div>
        <div style="color:#514b43;font:14px/1.6 Arial,sans-serif;">
          Pay <strong>${money(order.totalCents)}</strong> ahead through Venmo, or pay in person at Saturday pickup.
          If using Venmo, send it to <strong>@holycrowbakery</strong> with your name or order number in the memo.
        </div>
        <a href="https://venmo.com/u/holycrowbakery" style="background:#0e0c08;border:2px solid #ef9800;border-radius:999px;color:#fcf6e8;display:inline-block;font:bold 12px Arial,sans-serif;letter-spacing:1px;margin-top:15px;padding:11px 20px;text-decoration:none;text-transform:uppercase;">Pay with Venmo</a>
        <div style="color:#756d64;font:12px/1.5 Arial,sans-serif;margin-top:11px;">Prefer to pay at pickup? No action is needed now.</div>
      </div>
    </td></tr>` : ''

  return shell(
    `We received your Holy Crow Bakery order ${order.orderNumber}.`,
    `<tr><td style="padding:36px 34px 14px;">
      <div style="color:#0e0c08;font:25px Georgia,serif;margin-bottom:12px;">Thank you, ${escapeHtml(order.customerName)}!</div>
      <div style="color:#514b43;font:15px/1.7 Arial,sans-serif;">Your ${order.isCustomOrder ? 'request' : 'order'} has flown safely into our nest. We’ll review the details and keep you posted. Our treats are made without gluten-containing ingredients using careful practices, but cross-contact cannot be guaranteed.</div>
    </td></tr>
    <tr><td style="padding:18px 34px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7dfe9;border:1px solid #e2b8ca;border-radius:16px;width:100%;">
        <tr><td colspan="2" style="color:#9c5675;font:16px Georgia,serif;letter-spacing:1px;padding:20px 22px 8px;text-transform:uppercase;">Order ${escapeHtml(order.orderNumber)}</td></tr>
        <tr><td colspan="2" style="padding:0 22px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${lineItems(order)}${totalRow}</table></td></tr>
        <tr><td colspan="2" style="padding:12px 22px 20px;">${customPickup}</td></tr>
      </table>
    </td></tr>
    ${payment}
    <tr><td style="padding:0 34px 30px;">
      <div style="border-top:1px solid #ead8df;color:#514b43;font:13px/1.6 Arial,sans-serif;padding-top:18px;">
        <strong style="color:#9c5675;">Pickup:</strong> Saturday at
        <a href="https://www.google.com/maps/search/?api=1&amp;query=4273%20W%20Clarks%20Hill%20Dr%2C%20South%20Jordan%2C%20UT%2084009" style="color:#9c5675;font-weight:bold;text-decoration:underline;">4273 W Clarks Hill Dr, South Jordan, UT 84009</a>.
      </div>
      ${order.notes ? `<div style="background:#fffdf8;border:1px solid #ead8df;border-radius:10px;color:#514b43;font:13px/1.6 Arial,sans-serif;margin-top:16px;padding:13px 15px;"><strong style="color:#9c5675;">Your notes:</strong><br>${escapeHtml(order.notes)}</div>` : ''}
    </td></tr>`,
  )
}

export const ownerEmail = (order: EmailOrder) => shell(
  `New order ${order.orderNumber} from ${order.customerName}.`,
  `<tr><td style="padding:32px 34px 14px;">
    <div style="color:#9c5675;font:bold 11px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">New website ${order.isCustomOrder ? 'request' : 'order'}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;width:100%;">
      <tr>
        <td style="color:#0e0c08;font:bold 25px Georgia,serif;">${escapeHtml(order.orderNumber)}</td>
        <td align="right" style="color:#0e0c08;font:bold 25px Georgia,serif;">${order.totalCents ? money(order.totalCents) : 'Quote needed'}</td>
      </tr>
    </table>
    <div style="color:#756d64;font:12px Arial,sans-serif;margin-top:6px;">${escapeHtml(order.createdAt)}</div>
  </td></tr>
  <tr><td style="padding:16px 34px;">
    <div style="background:#f7dfe9;border:1px solid #e2b8ca;border-radius:14px;padding:18px 20px;">
      <div style="color:#0e0c08;font:bold 17px Georgia,serif;margin-bottom:12px;">Customer details</div>
      <div style="color:#38332e;font:14px/1.8 Arial,sans-serif;">
        <strong>${escapeHtml(order.customerName)}</strong><br>
        <a href="mailto:${encodeURIComponent(order.customerEmail)}?subject=${encodeURIComponent(`Your Holy Crow Bakery Order ${order.orderNumber}`)}" style="color:#0e0c08;">${escapeHtml(order.customerEmail)}</a><br>
        ${order.customerPhone ? `<a href="tel:${escapeHtml(order.customerPhone)}" style="color:#0e0c08;">${escapeHtml(order.customerPhone)}</a>` : 'No phone provided'}
      </div>
    </div>
  </td></tr>
  <tr><td style="padding:10px 34px;">
    <div style="color:#0e0c08;font:bold 18px Georgia,serif;margin-bottom:10px;">Order details</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${lineItems(order)}</table>
  </td></tr>
  <tr><td style="padding:12px 34px 30px;">
    <div style="background:#fff6df;border-left:4px solid #ef9800;border-radius:10px;color:#514b43;font:14px/1.6 Arial,sans-serif;padding:16px 18px;">
      <strong style="color:#9b6500;">Customer notes / allergy information</strong><br>
      ${escapeHtml(order.notes || 'No notes provided.')}
      ${order.preferredPickupDate ? `<br><strong>Preferred pickup:</strong> ${escapeHtml(order.preferredPickupDate)}` : ''}
    </div>
    <a href="mailto:${encodeURIComponent(order.customerEmail)}?subject=${encodeURIComponent(`Your Holy Crow Bakery Order ${order.orderNumber}`)}" style="background:#0e0c08;border:2px solid #d094ad;border-radius:999px;color:#fcf6e8;display:inline-block;font:bold 12px Arial,sans-serif;letter-spacing:1px;margin-top:18px;padding:12px 22px;text-decoration:none;text-transform:uppercase;">Reply to customer</a>
    <a href="https://holycrowbakery.com/admin/orders" style="background:#d094ad;border:2px solid #d094ad;border-radius:999px;color:#0e0c08;display:inline-block;font:bold 12px Arial,sans-serif;letter-spacing:1px;margin:18px 0 0 8px;padding:12px 22px;text-decoration:none;text-transform:uppercase;">Open Admin Orders</a>
  </td></tr>`,
)
