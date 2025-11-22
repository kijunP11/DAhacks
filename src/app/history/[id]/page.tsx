'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { fetchHistoryDetail, type HistoryDetail } from '@/history/detail'
import { useUser } from '@/auth/user-state'
import { SummaryCards } from '@/components/summary-cards'
import { UsageChart } from '@/components/usage-chart'
import { AIAnalysis, ActionPlan } from '@/components/ai-analysis'
import { SplitBillModal } from '@/components/split-bill-modal'
import { fetchMonthlyUsageHistory } from '@/history/usage-history'
import { MonthlyData } from '@/analysis/analyze'

export default function HistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  
  const [detail, setDetail] = useState<HistoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action Plan Interactive State
  const [appliedActionIds, setAppliedActionIds] = useState<Set<string>>(new Set())
  const [totalSavings, setTotalSavings] = useState(0)

  // Split Bill Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)

  // History Data State
  const [historyData, setHistoryData] = useState<MonthlyData[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && params.id) {
      const loadData = async () => {
        try {
          // 1. 현재 상세 정보 로드
          const { data: detailData, error: detailError } = await fetchHistoryDetail(params.id as string)
          
          if (detailError) {
            throw new Error('Failed to load analysis data.')
          }
          setDetail(detailData)

          // 2. 전체 히스토리 그래프 데이터 로드
          const history = await fetchMonthlyUsageHistory(user.id)
          setHistoryData(history)

        } catch (err: any) {
          console.error(err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      loadData()
    }
  }, [user, authLoading, params.id, router])

  // 초기 로드 시 상태 초기화
  useEffect(() => {
    if (detail?.action_plan) {
      setAppliedActionIds(new Set())
      setTotalSavings(0)
    }
  }, [detail])

  // 액션 토글 핸들러
  const toggleAction = (id: string) => {
    const newSet = new Set(appliedActionIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setAppliedActionIds(newSet)
    calculateSavings(newSet)
  }

  // 저축액 계산 로직
  const calculateSavings = (appliedIds: Set<string>) => {
    if (!detail?.action_plan) return
    
    let total = 0
    detail.action_plan.forEach(action => {
      if (appliedIds.has(action.id)) {
        // "$21.50" -> 21.50 변환
        const amount = parseFloat(action.savings.replace(/[^0-9.]/g, ''))
        if (!isNaN(amount)) {
          total += amount
        }
      }
    })
    setTotalSavings(total)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-inter">
        Loading analysis...
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 font-inter">
        <p className="text-red-500">{error || 'Analysis not found.'}</p>
        <Link href="/history" className="text-[#2E7D32] hover:underline font-bold">
          Back to History
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pt-12 pb-12 px-8">
      <div className="max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/history" 
              className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-russo text-black">Analysis Details</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-inter">
                <Calendar size={14} />
                <span>{new Date(detail.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={detail.file_url} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#2E7D32] rounded-full text-sm font-bold border border-[#2E7D32] hover:bg-green-50 transition-colors font-inter"
            >
              <FileText size={16} />
              View Original Bill
            </a>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <div className="mb-8">
          <SummaryCards 
            result={detail} 
            savingsAmount={totalSavings} 
            onSplitBill={() => setIsSplitModalOpen(true)}
          />
        </div>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-12 gap-8 mb-8">
          {/* Left Column: Monthly Usage Trend (Span 8) */}
          <div className="col-span-8 space-y-4">
            {/* 실제 히스토리 데이터 사용, highlightId 전달 */}
            <UsageChart 
              data={historyData.length > 0 ? historyData : (detail.monthly_usage || [])} 
              highlightId={detail.id}
            />
            
            {/* Recommended Action Plan */}
            <div className="mt-8">
              {detail.action_plan && (
                <ActionPlan 
                  actions={detail.action_plan} 
                  appliedIds={appliedActionIds}
                  onToggle={toggleAction}
                />
              )}
            </div>
          </div>

          {/* Right Column: AI Root-Cause Analysis (Span 4) */}
          <div className="col-span-4">
            {detail.ai_analysis && <AIAnalysis items={detail.ai_analysis} />}
          </div>
        </div>
        
        {/* Split Bill Modal */}
        <SplitBillModal 
           isOpen={isSplitModalOpen} 
           onClose={() => setIsSplitModalOpen(false)} 
           totalAmount={detail.total_amount}
           currentUser={user ? { email: user.email || '' } : null}
        />

      </div>
    </div>
  )
}
