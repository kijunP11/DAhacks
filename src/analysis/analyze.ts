import { supabase } from '@/lib/supabase'

export type MonthlyData = {
  id?: string // 그래프 하이라이트용 (선택 속성)
  month: string
  usage: number
  temp: number
}

export type AIAnalysisItem = {
  title: string
  description: string
  icon: 'zap' | 'clock' | 'dollar' | 'thermometer'
}

export type ActionPlanItem = {
  id: string
  title: string
  description?: string // 상세 설명을 위한 선택적 필드 추가
  savings: string
  icon: 'car' | 'thermometer' | 'shirt' | 'zap' | 'clock'
}

export type AnalysisResult = {
  id?: string // DB 저장 후 생성된 ID (선택 속성)
  total_amount: number
  usage_kwh: number
  previous_usage_kwh: number | null
  breakdown_json: Record<string, number>
  tips_json: string[]
  
  // New Fields for Desktop-4 Design
  monthly_usage: MonthlyData[]
  ai_analysis: AIAnalysisItem[]
  action_plan: ActionPlanItem[]
  next_month_forecast: number
}

export async function analyzeBill(fileUrls: string[]): Promise<{ data: AnalysisResult | null, error: Error | null }> {
  try {
    // 배열로 전송하도록 수정
    const { data, error } = await supabase.functions.invoke('analyze-bill', {
      body: { fileUrls }
    })

    if (error) {
      console.error('Edge Function Error:', error)
      return { data: null, error: new Error(error.message || '분석 중 오류가 발생했습니다.') }
    }

    if (data && data.error) {
      return { data: null, error: new Error(data.error) }
    }

    return { data: data as AnalysisResult, error: null }
  } catch (err: any) {
    console.error('Unexpected Error:', err)
    return { data: null, error: new Error(err.message || '알 수 없는 오류가 발생했습니다.') }
  }
}
