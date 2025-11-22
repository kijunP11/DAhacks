import { supabase } from '@/lib/supabase'
import { AnalysisResult } from '@/analysis/analyze'

// 반환 타입 정의 (성공 시 데이터 포함)
type SaveResult = 
  | { data: { id: string }; error: null }
  | { data: null; error: Error }

export async function saveAnalysis(
  userId: string,
  fileUrl: string,
  analysis: AnalysisResult
): Promise<SaveResult> {
  
  const { data, error } = await supabase
    .from('bill_analyses')
    .insert({
      user_id: userId,
      file_url: fileUrl,
      total_amount: analysis.total_amount,
      usage_kwh: analysis.usage_kwh,
      previous_usage_kwh: analysis.previous_usage_kwh,
      breakdown_json: analysis.breakdown_json, 
      tips_json: analysis.tips_json,
      // New fields for enhanced analysis
      monthly_usage: analysis.monthly_usage,
      ai_analysis: analysis.ai_analysis,
      action_plan: analysis.action_plan,
      next_month_forecast: analysis.next_month_forecast
    })
    .select('id') // 중요: 저장 후 생성된 ID를 반환받음
    .single()

  if (error) {
    console.error('Error saving analysis:', error)
    return { data: null, error: new Error(error.message) }
  }

  // 성공 시 ID 반환
  return { data, error: null }
}
