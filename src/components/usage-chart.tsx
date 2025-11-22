'use client'

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { MonthlyData } from '@/analysis/analyze'

interface UsageChartProps {
  data: MonthlyData[]
  highlightId?: string // 특정 ID를 강조하기 위한 prop
}

export function UsageChart({ data, highlightId }: UsageChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-black font-inter">Monthly Usage Trend</h3>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid stroke="#f5f5f5" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12, fontFamily: 'var(--font-outfit)' }}
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#999', fontSize: 12 }}
              tickFormatter={(value) => `${value} kWh`}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #eee',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            
            {/* Usage Bar Chart */}
            <Bar yAxisId="left" dataKey="usage" barSize={20} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                // 1. highlightId가 제공되면 해당 ID를 가진 항목 강조
                // 2. highlightId가 없으면(대시보드 등) 마지막 항목(최신) 강조
                const isHighlighted = highlightId 
                  ? entry.id === highlightId
                  : index === data.length - 1
                
                let fillColor = '#FFEDD8'
                
                if (isHighlighted) {
                    fillColor = '#2E7D32' // Highlight Color
                } else if (entry.usage > 300) {
                    fillColor = '#FF2E2E' // High Usage Warning
                }

                return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={fillColor} 
                    />
                )
              })}
            </Bar>

            {/* 꺾은선 그래프는 주석 처리됨 */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
