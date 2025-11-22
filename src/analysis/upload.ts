import { supabase } from '@/lib/supabase'

export async function uploadBillFiles(files: File[]): Promise<{ urls: string[] | null, error: Error | null }> {
  try {
    const urls: string[] = []

    // 병렬 업로드 처리
    const uploadPromises = files.map(async (file) => {
      // 1. 파일 유효성 검사
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`지원하지 않는 파일 형식입니다: ${file.name}`)
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error(`파일 크기 초과 (10MB): ${file.name}`)
      }

      // 2. 고유한 파일명 생성
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      // 3. Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('bill-uploads')
        .upload(fileName, file)

      if (error) throw error

      // 4. Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('bill-uploads')
        .getPublicUrl(data.path)
      
      return publicUrl
    })

    const results = await Promise.all(uploadPromises)
    return { urls: results, error: null }

  } catch (error: any) {
    console.error('Upload failed:', error)
    return { urls: null, error: error }
  }
}
