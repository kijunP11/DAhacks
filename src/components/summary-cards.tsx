'use client'

import { AnalysisResult } from '@/analysis/analyze'
import { Users } from 'lucide-react'

interface SummaryCardsProps {
  result: AnalysisResult
  savingsAmount?: number
  onSplitBill?: () => void
}

export function SummaryCards({ result, savingsAmount = 0, onSplitBill }: SummaryCardsProps) {
  // 실제 데이터가 있으면 사용하고, 없으면 기본값(null) 처리
  const prevUsage = result.previous_usage_kwh || 0
  const dailyAvg = Math.round(result.usage_kwh / 30)
  
  // 기본 예상 금액 (할인 전)
  const baseForecast = result.next_month_forecast || result.total_amount * 1.12
  
  // 할인이 적용된 최종 예상 금액 (음수 방지)
  const finalForecast = Math.max(0, baseForecast - savingsAmount)

  // 전월 요금 추정 (단가 $0.28/kWh 가정)
  const estimatedPrevBill = prevUsage * 0.28
  const diffAmount = result.total_amount - estimatedPrevBill
  const isIncrease = diffAmount > 0

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Current Bill Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Bill (This Month)</p>
          <p className="text-3xl font-bold text-black font-inter mb-2">
            ${result.total_amount.toFixed(2)}
          </p>
          {prevUsage > 0 && (
            <p className={`text-xs font-light ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
              {isIncrease ? '▲' : '▼'} ${Math.abs(diffAmount).toFixed(0)} vs last month
            </p>
          )}
        </div>

        {/* Split Bill Button */}
        {onSplitBill && (
          <button 
            onClick={onSplitBill}
            className="bg-[#2E7D32] text-white px-4 py-2 rounded-xl font-russo shadow-sm hover:bg-green-800 transition-all flex items-center gap-2 text-sm h-fit"
          >
            <Users size={16} />
            Split Bill
          </button>
        )}
      </div>

      {/* Current Usage Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600 mb-1">Current Usage</p>
        <p className="text-3xl font-bold text-black font-inter mb-2">
          {result.usage_kwh.toLocaleString()} kWh
        </p>
        <p className="text-xs text-gray-400 font-light">
          Daily Avg. {dailyAvg} kWh
        </p>
      </div>

      {/* Next Month Forecast Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300">
        {/* Savings Indicator Overlay */}
        {savingsAmount > 0 && (
          <div className="absolute top-0 right-0 bg-[#2E7D32] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg animate-in fade-in slide-in-from-top-2">
            -${savingsAmount.toFixed(2)} APPLIED
          </div>
        )}

        <p className="text-sm text-gray-600 mb-1">Next Month Forecast</p>
        <div className="flex items-baseline gap-2 mb-2">
           <p className={`text-3xl font-bold font-inter transition-colors duration-300 ${savingsAmount > 0 ? 'text-[#2E7D32]' : 'text-[#F3440F]'}`}>
            ${finalForecast.toFixed(2)}
          </p>
          {savingsAmount > 0 && (
            <span className="text-sm text-gray-400 line-through font-light">
              ${baseForecast.toFixed(2)}
            </span>
          )}
        </div>
       
        <div className="flex items-center gap-1 text-xs text-black font-light">
          <span>{savingsAmount > 0 ? '✨ Optimized with Action Plan' : '⚠️ Based on current trend'}</span>
        </div>
      </div>
    </div>
  )
}
