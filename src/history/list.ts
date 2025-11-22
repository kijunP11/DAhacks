import { supabase } from '@/lib/supabase'

export type HistoryItem = {
  id: string
  total_amount: number
  usage_kwh: number
  created_at: string
}

export async function fetchHistory(userId: string) {
  const { data, error } = await supabase
    .from('bill_analyses')
    .select('id, total_amount, usage_kwh, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}