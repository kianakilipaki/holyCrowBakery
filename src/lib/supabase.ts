import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hruycrixlivulzohhaoq.supabase.co'
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_CzXiLfXDHts7mNZcL_aRmw_ybFW7VVI'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const uploadProductImage = async (image: Blob, fileName: string) => {
  const safeName = fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '')
  const path = `${crypto.randomUUID()}-${safeName || 'product.webp'}`
  const { error } = await supabase.storage.from('product-images').upload(path, image, {
    contentType: image.type || 'image/webp',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}
