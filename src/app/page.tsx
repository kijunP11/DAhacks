'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UploadCard } from '@/components/upload-card'
import { SummaryCards } from '@/components/summary-cards'
import { UsageChart } from '@/components/usage-chart'
import { AIAnalysis, ActionPlan } from '@/components/ai-analysis'
import { LoadingSpinner } from '@/components/loading-spinner'
import { SplitBillModal } from '@/components/split-bill-modal'
import { uploadBillFiles } from '@/analysis/upload'
import { analyzeBill, type AnalysisResult, type MonthlyData } from '@/analysis/analyze'
import { useUser } from '@/auth/user-state'
import { LogOut } from 'lucide-react'
import { signOut } from '@/auth/logout'
import { saveAnalysis } from '@/history/save'
import { fetchMonthlyUsageHistory } from '@/history/usage-history'

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  
  const [state, setState] = useState<AnalysisState>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)

  // Action Plan Interactive State
  const [appliedActionIds, setAppliedActionIds] = useState<Set<string>>(new Set())
  const [totalSavings, setTotalSavings] = useState(0)
  
  // Split Bill Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)

  // History Data State
  const [historyData, setHistoryData] = useState<MonthlyData[]>([])

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // 결과가 나오면 초기 추천 액션 중 일부를 기본 적용된 상태로 할 수도 있음 (여기서는 빈 상태로 시작)
  useEffect(() => {
    if (result?.action_plan) {
      setAppliedActionIds(new Set())
      setTotalSavings(0)
    }
  }, [result])

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
    if (!result?.action_plan) return
    
    let total = 0
    result.action_plan.forEach(action => {
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

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) {
      setState('idle')
      return
    }

    setError(null)
    setState('uploading')
    setResetKey(prev => prev + 1)

    try {
      // 1. 파일 업로드 (배열)
      const { urls, error: uploadError } = await uploadBillFiles(files)
      
      if (uploadError || !urls || urls.length === 0) {
        throw new Error(uploadError?.message || 'Upload failed')
      }

      // 2. 분석 시작 (URL 배열 전달)
      setState('analyzing')
      const { data: analyzeData, error: analyzeError } = await analyzeBill(urls)

      if (analyzeError || !analyzeData) {
        throw new Error(analyzeError?.message || 'Analysis failed')
      }

      // 3. 분석 성공! 결과 보여주기
      console.log('Analysis Result:', analyzeData)
      setResult(analyzeData)
      setState('complete')

      // 4. DB 저장 및 히스토리 업데이트
      if (user) {
        try {
          // DB 저장 (첫 번째 URL만 저장)
          // Option A: DB 스키마 변경 없이 대표 이미지(첫 장)만 저장
          const mainFileUrl = urls[0]
          await saveAnalysis(user.id, mainFileUrl, analyzeData)
          console.log('Analysis saved to history')
          
          // 히스토리 데이터 새로고침 (그래프용)
          const history = await fetchMonthlyUsageHistory(user.id)
          setHistoryData(history)

        } catch (saveErr) {
          console.error('History save/fetch failed (non-fatal):', saveErr)
          // 에러나도 분석 결과는 보여줌
        }
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setState('error')
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleReset = () => {
    setResult(null)
    setState('idle')
    setError(null)
    setAppliedActionIds(new Set())
    setTotalSavings(0)
    setHistoryData([]) // 초기화
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F4F6F8] relative">
      {/* Header (Profile / Login) */}
      <div className="absolute top-4 right-8 flex items-center gap-4 z-10">
        {user ? (
          <div className="flex items-center gap-3">
             {/* Profile Avatar (Green Circle) */}
            <div className="w-[50px] h-[50px] rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xl shadow-md">
              {user.email?.[0].toUpperCase() || 'U'}
            </div>
            {/* Logout Button */}
             <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link href="/login">
            <div className="w-[63px] h-[46px] bg-white rounded-[12px] shadow-sm flex items-center justify-center">
               <span className="font-russo text-[16px] text-black">Login</span>
            </div>
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-col items-center justify-center min-h-screen ${state === 'complete' ? 'pt-24 pb-12' : 'pt-12 pb-12'}`}>
        
        {/* Initial State: Upload Card */}
        {state !== 'complete' && (
           <div className="w-full max-w-4xl flex flex-col items-center">
              
              {/* Upload Component */}
              {(state === 'idle' || state === 'uploading' || state === 'analyzing') && (
                <div className="relative">
                   <UploadCard 
                    onFileSelect={handleFileSelect} 
                    isUploading={state === 'uploading' || state === 'analyzing'} 
                  />
                  
                  {/* Loading Overlay */}
                  {(state === 'uploading' || state === 'analyzing') && (
                    <div className="absolute inset-0 bg-white/80 rounded-[20px] flex items-center justify-center z-20 backdrop-blur-sm">
                      <LoadingSpinner key={resetKey} />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {state === 'error' && error && (
                <div className="mt-6 bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100 shadow-sm w-[500px]">
                  <p className="font-bold text-lg mb-2">🚨 Error Occurred</p>
                  <p className="mb-4 text-sm">{error}</p>
                  <button 
                    onClick={handleReset}
                    className="text-sm font-semibold underline hover:text-red-800"
                  >
                    Try Again
                  </button>
                </div>
              )}
           </div>
        )}

        {/* Analysis Result State (Desktop-4 Design) */}
        {state === 'complete' && result && (
          <div className="w-full max-w-[1440px] px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Summary Cards Row */}
            <div className="mb-8">
              <SummaryCards 
                result={result} 
                savingsAmount={totalSavings} 
                onSplitBill={() => setIsSplitModalOpen(true)}
              />
            </div>

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-12 gap-8 mb-8">
              {/* Left Column: Monthly Usage Trend (Span 8) */}
              <div className="col-span-8 space-y-4">
                {/* 
                  UsageChart에 실제 히스토리 데이터를 전달.
                  만약 historyData가 비어있다면(첫 사용 등), AI가 준 monthly_usage(result.monthly_usage)를 fallback으로 사용.
                */}
                <UsageChart data={historyData.length > 0 ? historyData : (result.monthly_usage || [])} />
                
                {/* Recommended Action Plan (Bottom) */}
                <div className="mt-8">
                  {result.action_plan && (
                    <ActionPlan 
                      actions={result.action_plan} 
                      appliedIds={appliedActionIds}
                      onToggle={toggleAction}
                    />
                  )}
                </div>
              </div>

              {/* Right Column: AI Root-Cause Analysis (Span 4) */}
              <div className="col-span-4">
                {result.ai_analysis && <AIAnalysis items={result.ai_analysis} />}
              </div>
            </div>
            
            {/* Reset Button */}
            <div className="text-center pb-12">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-[#2E7D32] text-white rounded-full hover:bg-green-800 transition-all shadow-lg hover:shadow-xl font-medium hover:scale-105 transform font-russo"
              >
                Analyze Another Bill
              </button>
            </div>

            {/* Split Bill Modal */}
            <SplitBillModal 
              isOpen={isSplitModalOpen} 
              onClose={() => setIsSplitModalOpen(false)} 
              totalAmount={result.total_amount}
              currentUser={user ? { email: user.email || '' } : null}
            />
          </div>
        )}

      </div>
    </div>
  )
}
