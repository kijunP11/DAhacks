'use client'

import { Zap, Clock, DollarSign, Thermometer, Car, Shirt } from 'lucide-react'
import { AIAnalysisItem, ActionPlanItem } from '@/analysis/analyze'

interface AIAnalysisProps {
  items: AIAnalysisItem[]
}

export function AIAnalysis({ items }: AIAnalysisProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-5 h-5 text-black" />
      case 'clock': return <Clock className="w-5 h-5 text-black" />
      case 'dollar': return <DollarSign className="w-5 h-5 text-black" />
      case 'thermometer': return <Thermometer className="w-5 h-5 text-black" />
      default: return <Zap className="w-5 h-5 text-black" />
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-black font-inter mb-6">AI Root-Cause Analysis</h3>
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-1">
              {getIcon(item.icon)}
            </div>
            <div>
              <p className="text-[15px] font-bold text-black">{item.title}</p>
              <p className="text-[13px] text-[#DD0000]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ActionPlanProps {
  actions: ActionPlanItem[]
  appliedIds: Set<string>
  onToggle: (id: string) => void
}

export function ActionPlan({ actions, appliedIds, onToggle }: ActionPlanProps) {
  const getEmoji = (iconName: string) => {
    switch (iconName) {
      case 'car': return '🚗'
      case 'thermometer': return '🌡️'
      case 'shirt': return '🧺'
      case 'zap': return '⚡'
      case 'clock': return '⏰'
      default: return '💡'
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-black font-inter mb-4">Recommended Action Plan</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action) => {
          const isApplied = appliedIds.has(action.id)
          
          return (
            <div key={action.id} className="bg-white border border-[#2E7D32] rounded-[20px] p-5 relative min-h-[130px] flex flex-col">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getEmoji(action.icon)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-black leading-tight line-clamp-2 mb-1">
                    {action.title}
                  </p>
                  {action.description && (
                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-3 mb-1">
                      {action.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-auto flex justify-between items-end">
                <p className="text-[#2E7D32] text-[12px] font-medium pl-7">
                  Save {action.savings} / mo
                </p>

                {/* Apply Button */}
                <button
                  onClick={() => onToggle(action.id)}
                  className={`
                    px-4 py-1 rounded-[4px] text-[12px] font-bold transition-colors
                    ${isApplied 
                      ? 'bg-[#BDBDBD] text-white hover:bg-[#A0A0A0]' 
                      : 'bg-[#2E7D32] text-white hover:bg-green-700'}
                  `}
                >
                  {isApplied ? 'applied' : 'apply'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
