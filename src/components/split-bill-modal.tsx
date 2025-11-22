'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, User, Calculator, ArrowLeft, Check, Share2, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toPng } from 'html-to-image'

interface SplitBillModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  currentUser?: { email: string } | null
}

// TagType을 string으로 확장하여 커스텀 태그 허용
type TagType = string

interface Roommate {
  id: string
  name: string
  color: string
  tags: Set<TagType>
  share: number
  adjustment: number
}

const DEFAULT_TAG_WEIGHTS: Record<string, number> = {
  'Gaming PC': 0.3,      
  'Electric Heater': 0.5,
  'Work from Home': 0.2, 
  'Always Home': 0.2,    
  'Dual Monitors': 0.1,  
  'Night Owl': 0.1,      
  'Office Job': -0.1,    
  'Frequently Out': -0.3 
}

const DEFAULT_AVAILABLE_TAGS: string[] = [
  'Gaming PC', 'Office Job', 'Work from Home', 'Night Owl', 
  'Dual Monitors', 'Electric Heater', 'Always Home', 'Frequently Out'
]

export function SplitBillModal({ isOpen, onClose, totalAmount, currentUser }: SplitBillModalProps) {
  const [step, setStep] = useState<'input' | 'result'>('input')
  
  const [roommates, setRoommates] = useState<Roommate[]>([
    { 
      id: '1', 
      name: currentUser?.email?.split('@')[0] || 'Me', 
      color: 'bg-[#E3F2FD] text-[#1565C0]', 
      tags: new Set(),
      share: 0,
      adjustment: 0
    },
    { 
      id: '2', 
      name: 'Roommate 1', 
      color: 'bg-[#F3E5F5] text-[#7B1FA2]', 
      tags: new Set(),
      share: 0,
      adjustment: 0
    },
  ])
  
  const [selectedUserId, setSelectedUserId] = useState<string>('1')

  // 룸메이트 추가 입력 상태
  const [isAdding, setIsAdding] = useState(false)
  const [newRoommateName, setNewRoommateName] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  // 태그 추가 관련 상태
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const newTagInputRef = useRef<HTMLInputElement>(null)
  
  // 사용자가 추가한 커스텀 태그 목록 관리
  const [customTags, setCustomTags] = useState<string[]>([])
  
  // Calculation Details Toggle State
  const [showDetails, setShowDetails] = useState(false)
  
  // Ref for capturing the modal content
  const modalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus()
    }
  }, [isAdding])

  useEffect(() => {
    if (isAddingTag && newTagInputRef.current) {
      newTagInputRef.current.focus()
    }
  }, [isAddingTag])

  useEffect(() => {
    if (isOpen && currentUser?.email) {
      const userName = currentUser.email.split('@')[0]
      
      setRoommates(prev => prev.map(user => 
        user.id === '1' ? { ...user, name: userName } : user
      ))
    }
  }, [currentUser, isOpen])

  if (!isOpen) return null

  const selectedUser = roommates.find(r => r.id === selectedUserId)

  const handleAddRoommate = () => {
    if (!newRoommateName.trim()) {
      setIsAdding(false)
      return
    }

    const newId = (Date.now()).toString()
    const colors = [
      'bg-[#E3F2FD] text-[#1565C0]', 
      'bg-[#F3E5F5] text-[#7B1FA2]', 
      'bg-[#E8F5E9] text-[#2E7D32]',
      'bg-[#FFF3E0] text-[#E65100]',
      'bg-[#FFEBEE] text-[#C62828]'
    ]
    const color = colors[roommates.length % colors.length]
    
    const newUser: Roommate = { 
      id: newId, 
      name: newRoommateName.trim(), 
      color,
      tags: new Set(),
      share: 0,
      adjustment: 0
    }
    setRoommates([...roommates, newUser])
    setSelectedUserId(newId)
    setNewRoommateName('')
    setIsAdding(false)
  }

  const handleRoommateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRoommate()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewRoommateName('')
    }
  }

  const toggleTag = (tag: TagType) => {
    if (!selectedUserId) return

    setRoommates(prev => prev.map(user => {
      if (user.id !== selectedUserId) return user
      const newTags = new Set(user.tags)
      if (newTags.has(tag)) {
        newTags.delete(tag)
      } else {
        newTags.add(tag)
      }
      return { ...user, tags: newTags }
    }))
  }

  const handleAddNewTag = () => {
    if (!newTagName.trim() || !selectedUserId) {
      setIsAddingTag(false)
      return
    }
    
    const tag = newTagName.trim()
    
    // 이미 존재하는 태그인지 확인 (대소문자 구분 없이 체크하려면 로직 추가 필요)
    if (!DEFAULT_AVAILABLE_TAGS.includes(tag) && !customTags.includes(tag)) {
        setCustomTags(prev => [...prev, tag])
    }

    setRoommates(prev => prev.map(user => {
      if (user.id !== selectedUserId) return user
      const newTags = new Set(user.tags)
      newTags.add(tag)
      return { ...user, tags: newTags }
    }))
    
    setNewTagName('')
    setIsAddingTag(false)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNewTag()
    } else if (e.key === 'Escape') {
      setIsAddingTag(false)
      setNewTagName('')
    }
  }

  const calculateSplit = () => {
    const baseShare = totalAmount / roommates.length

    const weights = roommates.map(user => {
      let points = 0
      user.tags.forEach(tag => {
        // 커스텀 태그는 기본 가중치 0.1 적용
        points += (DEFAULT_TAG_WEIGHTS[tag] || 0.1)
      })
      return { id: user.id, points }
    })

    let totalRatio = 0
    const userRatios = roommates.map(user => {
      let ratio = 1.0
      user.tags.forEach(tag => {
        ratio += (DEFAULT_TAG_WEIGHTS[tag] || 0.1)
      })
      if (ratio < 0.2) ratio = 0.2
      totalRatio += ratio
      return { id: user.id, ratio }
    })

    setRoommates(prev => prev.map(user => {
      const ratioData = userRatios.find(r => r.id === user.id)
      const ratio = ratioData?.ratio || 1.0
      const finalShare = (ratio / totalRatio) * totalAmount
      
      return { 
        ...user, 
        share: finalShare,
        adjustment: finalShare - baseShare
      }
    }))
    
    setStep('result')
  }

  const handleReset = () => {
    setStep('input')
    setShowDetails(false) // 리셋 시 상세 설명도 닫기
  }

  const handleSaveImage = async () => {
    if (!modalContentRef.current) return
    
    try {
      // html-to-image로 변경
      const dataUrl = await toPng(modalContentRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true, // 캐시 문제 방지
      })
      
      // 다운로드 링크 생성 및 클릭 트리거
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `wattguard-split-bill-${Date.now()}.png`
      link.click()
    } catch (err) {
      console.error('Failed to save image:', err)
      alert('Failed to save image. Please try again.')
    }
  }

  const handleShare = async () => {
    const shareText = `WattGuard Fair Split Result\nTotal Bill: $${totalAmount.toFixed(2)}\n\n` + 
      roommates.map(u => `${u.name}: $${u.share.toFixed(2)} (${((u.share / totalAmount) * 100).toFixed(1)}%)`).join('\n') +
      `\n\nCalculated with WattGuard AI`

    const shareData = {
      title: 'WattGuard Split Bill',
      text: shareText,
      // url: window.location.href // 필요 시 링크 추가
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share canceled')
      }
    } else {
      // PC 등 미지원 환경: 클립보드 복사
      try {
        await navigator.clipboard.writeText(shareText)
        alert('Result copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
        alert('Failed to copy to clipboard.')
      }
    }
  }

  // 화면에 표시할 전체 태그 목록 (기본 + 커스텀)
  const displayTags = [...DEFAULT_AVAILABLE_TAGS, ...customTags]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalContentRef}
        className="w-[900px] bg-white rounded-[20px] shadow-2xl overflow-hidden border border-[#2E7D32]/20 transform transition-all scale-100 flex flex-col max-h-[85vh]"
      >
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'result' && (
              <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={24} />
              </button>
            )}
            <div>
              <h2 className="font-russo text-2xl text-black">
                {step === 'input' ? 'AI Fair Bill Splitter' : 'Fair Split Result'}
              </h2>
              <p className="text-sm text-gray-500 font-inter mt-1">
                {step === 'input' 
                  ? 'based on usage patterns & room size analysis' 
                  : `Total Bill Amount: $${totalAmount.toFixed(2)}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex">
          
          {step === 'input' ? (
            /* === Input View === */
            <>
              {/* Left Column: Roommate List */}
              <div className="w-[320px] border-r border-gray-100 p-6 overflow-y-auto bg-white flex flex-col">
                <div className="space-y-3 flex-1">
                  {roommates.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-[16px] transition-all border-2 relative",
                        selectedUserId === user.id 
                          ? "border-[#2E7D32] bg-green-50 shadow-sm" 
                          : "border-transparent hover:bg-gray-50"
                      )}
                    >
                      <div className={cn("w-[45px] h-[45px] rounded-full flex items-center justify-center font-bold text-lg shrink-0", user.color)}>
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-inter font-bold text-black text-[16px] truncate max-w-[180px]">{user.name}</span>
                        {user.tags.size > 0 && (
                          <span className="text-xs text-gray-500">{user.tags.size} tags</span>
                        )}
                      </div>
                      
                      {roommates.length > 1 && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation()
                            setRoommates(roommates.filter(r => r.id !== user.id))
                            if (selectedUserId === user.id) {
                                const next = roommates.find(r => r.id !== user.id)
                                if (next) setSelectedUserId(next.id)
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {isAdding ? (
                  <div className="mt-4 w-full p-3 bg-gray-50 rounded-[16px] border border-gray-200 flex flex-col gap-2">
                    <p className="text-xs text-gray-500 font-bold ml-1">Enter Name:</p>
                    <input 
                        ref={addInputRef}
                        type="text" 
                        value={newRoommateName}
                        onChange={(e) => setNewRoommateName(e.target.value)}
                        onKeyDown={handleRoommateKeyDown}
                        placeholder="e.g. John"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#2E7D32] focus:ring-2 focus:ring-green-100 outline-none text-sm"
                    />
                    <div className="flex gap-2 mt-1">
                        <button 
                            onClick={() => setIsAdding(false)}
                            className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAddRoommate}
                            disabled={!newRoommateName.trim()}
                            className="flex-1 py-2 bg-[#2E7D32] text-white rounded-lg text-xs font-bold hover:bg-green-800 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="mt-4 w-full py-3 bg-[#A6A6A6] hover:bg-gray-400 text-white rounded-[10px] font-inter font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add New Roommate
                  </button>
                )}
              </div>

              {/* Right Column: Tag Library */}
              <div className="flex-1 p-8 bg-[#F8FAFC] overflow-y-auto">
                {selectedUser ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="font-inter font-bold text-lg text-black">
                        Select Tags for <span className="text-[#2E7D32]">{selectedUser.name}</span>
                      </h3>
                      <div className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-medium text-gray-500">
                        {selectedUser.tags.size} selected
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 content-start">
                      {displayTags.map(tag => {
                        const isSelected = selectedUser.tags.has(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "px-5 py-3 rounded-full text-sm font-bold font-inter transition-all flex items-center justify-between group",
                              isSelected 
                                ? "bg-white border-2 border-[#2E7D32] text-black shadow-md" 
                                : "bg-[#F5F5F5] text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <span>{tag}</span>
                            {isSelected && <div className="w-5 h-5 rounded-full bg-[#2E7D32] flex items-center justify-center text-white"><Check size={12}/></div>}
                          </button>
                        )
                      })}
                      
                      {isAddingTag ? (
                        <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-[#2E7D32] shadow-sm">
                          <input
                            ref={newTagInputRef}
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={() => {
                               // 입력값이 있으면 추가, 없으면 닫기
                               if (newTagName.trim()) {
                                   handleAddNewTag()
                               } else {
                                   setIsAddingTag(false)
                               }
                            }}
                            placeholder="Tag name..."
                            className="w-24 text-sm font-bold font-inter outline-none text-black placeholder:font-normal bg-transparent"
                          />
                          <button 
                            onMouseDown={(e) => e.preventDefault()} // onBlur보다 먼저 실행되도록
                            onClick={handleAddNewTag} 
                            className="text-[#2E7D32] hover:text-green-700"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAddingTag(true)}
                          className="px-5 py-3 rounded-full text-sm font-bold font-inter bg-white border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> add new tags
                        </button>
                      )}
                    </div>

                    <div className="mt-auto pt-8">
                      <div className="bg-[#E8F5E9] rounded-xl p-4 border border-[#2E7D32]/20">
                          <p className="text-sm text-[#2E7D32] font-medium flex items-center gap-2">
                            <Calculator size={16} />
                            Selecting tags adjusts the calculated share automatically.
                          </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Select a roommate to manage tags
                  </div>
                )}
              </div>
            </>
          ) : (
            /* === Result View === */
            <div className="w-full p-8 bg-[#F8FAFC] flex flex-col items-center overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="w-full max-w-2xl space-y-6">
                 
                 {/* Summary Cards */}
                 <div className="grid grid-cols-1 gap-4">
                    {roommates.map((user) => (
                      <div key={user.id} className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-[50px] h-[50px] rounded-full flex items-center justify-center font-bold text-xl", user.color)}>
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-russo text-lg text-black">{user.name}</span>
                              {(user.id === '1' || user.name === 'Me') && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-bold">YOU</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {Array.from(user.tags).slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                                  {tag}
                                </span>
                              ))}
                              {user.tags.size > 3 && <span className="text-[10px] text-gray-400">+{user.tags.size - 3}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-russo text-2xl text-[#2E7D32]">
                            ${user.share.toFixed(2)}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {((user.share / totalAmount) * 100).toFixed(1)}% of Total
                          </p>
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Calculation Details Toggle */}
                 <div className="w-full">
                    <button 
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <Calculator size={16} />
                            Why this calculation?
                        </span>
                        {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showDetails && (
                        <div className="mt-2 bg-gray-50 p-5 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs text-gray-500 mb-4 font-inter">
                                Base Split (1/{roommates.length}): ${(totalAmount / roommates.length).toFixed(2)}
                            </p>
                            <div className="space-y-4">
                                {roommates.map(user => (
                                    <div key={user.id} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm text-black">{user.name}</span>
                                            <span className="font-bold text-sm text-[#2E7D32]">${user.share.toFixed(2)}</span>
                                        </div>
                                        <div className="space-y-1 pl-2">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Base Split</span>
                                                <span>{(100/roommates.length).toFixed(0)}%</span>
                                            </div>
                                            {Array.from(user.tags).map(tag => {
                                                const weight = DEFAULT_TAG_WEIGHTS[tag] || 0.1
                                                return (
                                                    <div key={tag} className="flex justify-between text-xs text-gray-600">
                                                        <span>{tag}</span>
                                                        <span className={weight > 0 ? "text-red-500" : "text-blue-500"}>
                                                            {weight > 0 ? '+' : ''}{(weight * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="flex gap-4 mt-4">
                   <button 
                    onClick={handleSaveImage}
                    className="flex-1 py-4 bg-white border border-[#2E7D32] text-[#2E7D32] rounded-[15px] font-inter font-bold text-lg shadow-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                   >
                     <Download size={20} /> Save Image
                   </button>
                   <button 
                    onClick={handleShare}
                    className="flex-1 py-4 bg-[#2E7D32] hover:bg-green-800 text-white rounded-[15px] font-inter font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                   >
                     <Share2 size={20} /> Share Result
                   </button>
                 </div>
                 
               </div>
            </div>
          )}

        </div>

        {/* Footer CTA (Only for Input Step) */}
        {step === 'input' && (
          <div className="p-6 bg-white border-t border-gray-100">
            <button 
              onClick={calculateSplit}
              className="w-full py-4 bg-[#2E7D32] hover:bg-green-800 text-white rounded-[15px] font-inter font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              ✨ Next : Calculate Fair Split with AI
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
