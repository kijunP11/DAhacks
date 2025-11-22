import { supabase } from '@/lib/supabase'
import type { AnalysisResult } from '@/analysis/analyze'

// DB에 저장된 데이터 타입 정의 (AnalysisResult + id, created_at)
export type HistoryDetail = AnalysisResult & {
  id: string
  file_url: string
  created_at: string
}

export async function fetchHistoryDetail(billId: string) {
  const { data, error } = await supabase
    .from('bill_analyses')
    .select('*')
    .eq('id', billId)
    .single()

  return { data: data as HistoryDetail | null, error }
}