import { supabase } from './supabase'

export async function trackClick(data: {
  product_id: string
  product_naam?: string
  categorie?: string
  pagina?: string
}) {
  try {
    await supabase.from('affiliate_clicks').insert(data)
  } catch (e) {
    console.error('[trackClick] failed', e)
  }
}
