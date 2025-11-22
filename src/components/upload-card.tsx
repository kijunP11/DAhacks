'use client'

import { useDropzone } from 'react-dropzone'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

interface UploadCardProps {
  onFileSelect: (files: File[]) => void
  isUploading: boolean
}

export function UploadCard({ onFileSelect, isUploading }: UploadCardProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previews])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 최대 5개까지만 허용 (기존 파일 + 새 파일)
    const newFiles = [...files, ...acceptedFiles].slice(0, 5)
    setFiles(newFiles)
    
    // 미리보기 URL 생성
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
    
    // onFileSelect 호출 제거 (자동 업로드 방지)
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 5, // 최대 5장
    disabled: isUploading,
    noClick: files.length > 0, // 파일이 있으면 클릭 방지 (버튼 눌러야 함)
    noKeyboard: files.length > 0
  })

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    const newFiles = files.filter((_, i) => i !== index)
    
    // 이전 URL 해제 (메모리 누수 방지)
    URL.revokeObjectURL(previews[index])
    const newPreviews = previews.filter((_, i) => i !== index)
    
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleAnalyze = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (files.length > 0) {
      onFileSelect(files)
    }
  }

  const handleAddMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) input.click()
  }

  return (
    <div 
      className="w-[800px] h-[500px] bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] flex items-center justify-center relative"
    >
    <div 
      {...getRootProps()} 
      className={`
          w-[708px] h-[403px] 
          border-2 border-dashed border-[#e0e0e0] 
          flex flex-col items-center justify-center
          transition-colors relative
          ${files.length === 0 ? 'cursor-pointer' : ''} 
          ${isDragActive ? 'bg-green-50 border-primary-green' : files.length === 0 ? 'hover:bg-gray-50' : ''}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {files.length > 0 ? (
          <>
            <div className="w-full h-full p-4 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pb-20">
              {files.map((file, index) => (
                <div key={index} className="relative group aspect-3/4 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  {file.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center text-gray-500">
                      <FileIcon size={48} className="mb-2" />
                      <span className="text-xs font-medium truncate max-w-[100px] px-2">{file.name}</span>
                    </div>
                  ) : (
                    <img src={previews[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                  
                  <button 
                    onClick={(e) => removeFile(e, index)}
                    className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    Page {index + 1}
                  </div>
                </div>
              ))}
              
              {/* Add Page Button */}
              {files.length < 5 && (
                <div 
                  onClick={handleAddMore}
                  className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-colors aspect-3/4 cursor-pointer"
                >
                  <PlusIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Add Page</span>
                </div>
              )}
            </div>

            {/* Analyze Button (Floating at bottom) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
               <button 
                 onClick={handleAnalyze}
                 className="pointer-events-auto px-8 py-3 bg-[#2E7D32] text-white rounded-full hover:bg-green-800 transition-all shadow-lg hover:shadow-xl font-russo text-lg transform hover:-translate-y-1 active:translate-y-0"
               >
                 Analyze Bill ({files.length})
               </button>
            </div>
          </>
      ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Icon (Green Upload Arrow) */}
            <div className="relative">
               <div className="w-16 h-16 bg-[#2E7D32] rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
               </div>
          </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <p className="font-russo text-[20px] text-black leading-normal">
                drag & drop your bill here
            </p>
              <p className="font-russo text-[16px] text-[#888888] leading-normal">
                or click to browse (multiple pages allowed)
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}
