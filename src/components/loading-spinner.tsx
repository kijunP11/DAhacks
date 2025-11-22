'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const messages = [
  '청구서를 업로드하고 있어요...',
  '글자를 읽고 있어요...',
  '요금을 분석하고 있어요...',
  '절약 팁을 생각하고 있어요...',
  '거의 다 됐어요!'
]

export function LoadingSpinner({ resetKey = 0 }: { resetKey?: number }) {
  const [messageIndex, setMessageIndex] = useState(0)

  // resetKey가 변경되면 메시지 초기화
  useEffect(() => {
    setMessageIndex(0)
  }, [resetKey])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev === messages.length - 1) return prev // 마지막에서 멈춤
        return prev + 1
      })
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-lg text-gray-600 font-medium animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  )
}
