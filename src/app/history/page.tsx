'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/auth/user-state'
import { fetchHistory, type HistoryItem } from '@/history/list'
import { Calendar, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchHistory(user.id)
        .then(({ data }) => {
          if (data) setHistory(data)
        })
        .finally(() => setLoading(false))
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-inter">
        Loading history...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pt-12 pb-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-russo text-black">Analysis History</h1>
          <Link 
            href="/" 
            className="px-6 py-2 bg-[#2E7D32] text-white rounded-full font-bold text-sm hover:bg-[#1b5e20] transition-colors font-inter shadow-md hover:shadow-lg"
          >
            + New Analysis
          </Link>
        </div>

        {/* List */}
        {history.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[20px] shadow-sm border border-gray-100">
            <p className="mb-6 text-lg text-gray-500 font-inter">No analysis history found.</p>
            <Link 
              href="/"
              className="inline-block px-8 py-3 bg-[#2E7D32] text-white rounded-full hover:bg-[#1b5e20] transition-colors font-bold shadow-md hover:shadow-lg font-inter"
            >
              Analyze Your First Bill
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {history.map((item) => (
              <Link 
                key={item.id} 
                href={`/history/${item.id}`}
                className="block bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 hover:border-[#2E7D32] hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Green Accent Bar on Hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2E7D32] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-green-50 rounded-[16px] text-[#2E7D32]">
                      <span className="text-xs font-bold font-inter uppercase">
                        {new Date(item.created_at).toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-russo">
                        {new Date(item.created_at).getDate()}
                      </span>
                    </div>

                    {/* Bill Info */}
                  <div>
                      <p className="text-sm text-gray-500 font-inter mb-1 flex items-center gap-2">
                      <Calendar size={14} />
                        {new Date(item.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex items-baseline gap-3">
                         <h3 className="text-2xl font-bold text-black font-inter">
                          ${item.total_amount?.toFixed(2)}
                        </h3>
                        <span className="text-sm text-gray-400 font-light">Total Amount</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Info & Arrow */}
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 text-[#2E7D32] font-bold text-lg font-inter">
                        <Zap size={18} className="fill-[#2E7D32]" />
                        <span>{item.usage_kwh.toLocaleString()} kWh</span>
                      </div>
                      <span className="text-xs text-gray-400 font-light">Usage</span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#2E7D32] group-hover:text-white transition-colors">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
