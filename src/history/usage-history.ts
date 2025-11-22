import { supabase } from '@/lib/supabase'
import { MonthlyData } from '@/analysis/analyze'

// Supabase에서 분석 기록을 가져와서 그래프용 데이터로 변환
export async function fetchMonthlyUsageHistory(userId: string): Promise<MonthlyData[]> {

  // 1. 사용자의 모든 분석 기록 조회 (created_at 포함)
  const { data, error } = await supabase
    .from('bill_analyses')
    .select('id, created_at, usage_kwh')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // 2. 월별 그룹핑 (같은 달은 최신 데이터로 덮어쓰기)
  const monthlyMap = new Map<string, {
    id: string
    created_at: string
    usage: number
  }>()

  data.forEach(record => {
    const date = new Date(record.created_at)
    const key = `${date.getFullYear()}-${date.getMonth()}` // YYYY-M (월 구분 키)
    
    // 이미 있으면 날짜 비교해서 더 최신이면 교체
    if (monthlyMap.has(key)) {
      const existing = monthlyMap.get(key)!
      if (new Date(record.created_at) > new Date(existing.created_at)) {
        monthlyMap.set(key, { 
          id: record.id, 
          created_at: record.created_at, 
          usage: record.usage_kwh 
        })
      }
    } else {
      monthlyMap.set(key, { 
        id: record.id, 
        created_at: record.created_at, 
        usage: record.usage_kwh 
      })
    }
  })

  // 3. Map -> Array 변환 및 정렬
  const monthlyData: MonthlyData[] = Array.from(monthlyMap.values())
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(record => {
      const date = new Date(record.created_at)
      const monthName = date.toLocaleString('en-US', { month: 'short' }) // Jan, Feb...
      
      return {
        id: record.id, // 하이라이트 식별용 ID 추가
        month: monthName,
        usage: record.usage,
        temp: 0,
      }
    })

  // 최근 12개만 반환
  return monthlyData.slice(-12)
}
