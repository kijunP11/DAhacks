import { supabase } from '@/lib/supabase'

export type MonthlyData = {
  id?: string // For graph highlighting (optional)
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
  description?: string // Optional field for detailed description
  savings: string
  icon: 'car' | 'thermometer' | 'shirt' | 'zap' | 'clock'
}

export type AnalysisResult = {
  id?: string // ID generated after DB save (optional)
  total_amount: number
  usage_kwh: number
  previous_usage_kwh: number | null
  breakdown_json: Record<string, number>
  tips_json: string[]
  
  // New Fields for Desktop-4 Design
  billing_date: string // YYYY-MM-DD format
  monthly_usage: MonthlyData[]
  ai_analysis: AIAnalysisItem[]
  action_plan: ActionPlanItem[]
  next_month_forecast: number
}

export async function analyzeBill(fileUrls: string[]): Promise<{ data: AnalysisResult | null, error: Error | null }> {
  try {
    // Modified to send as an array
    const { data, error } = await supabase.functions.invoke('analyze-bill', {
      body: { fileUrls }
    })

    if (error) {
      console.error('Edge Function Error:', error)
      return { data: null, error: new Error(error.message || 'An error occurred during analysis.') }
    }

    if (data && data.error) {
      return { data: null, error: new Error(data.error) }
    }

    return { data: data as AnalysisResult, error: null }
  } catch (err: any) {
    console.error('Unexpected Error:', err)
    return { data: null, error: new Error(err.message || 'An unknown error occurred.') }
  }
}
