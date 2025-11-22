'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, Zap, TrendingUp, TrendingDown } from 'lucide-react'

interface AnalysisResult {
  total_amount: number
  usage_kwh: number
  previous_usage_kwh: number | null
  breakdown_json: Record<string, number>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function ResultCards({ result }: { result: AnalysisResult }) {
  const data = Object.entries(result.breakdown_json).map(([name, value]) => ({ name, value }))
  
  const usageDiff = result.previous_usage_kwh 
    ? result.usage_kwh - result.previous_usage_kwh 
    : 0

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign size={24} />
            </div>
            <h3 className="text-gray-500 font-medium">이번 달 요금</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {result.total_amount.toLocaleString()}원
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Zap size={24} />
            </div>
            <h3 className="text-gray-500 font-medium">전력 사용량</h3>
          </div>
          <div className="flex items-end space-x-2">
            <p className="text-3xl font-bold text-gray-900">{result.usage_kwh} kWh</p>
            {result.previous_usage_kwh && (
              <span className={`flex items-center text-sm mb-1 ${usageDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {usageDiff > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1">{Math.abs(usageDiff)} kWh {usageDiff > 0 ? '증가' : '감소'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 상세 내역 차트 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">요금 상세 내역</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}