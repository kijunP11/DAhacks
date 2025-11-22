import { supabase } from '@/lib/supabase'

export async function uploadBillFiles(files: File[]): Promise<{ urls: string[] | null, error: Error | null }> {
  try {
    const urls: string[] = []

    // Parallel upload processing
    const uploadPromises = files.map(async (file) => {
      // 1. File validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file format: ${file.name}`)
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error(`File size exceeded (10MB): ${file.name}`)
      }

      // 2. Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      // 3. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('bill-uploads')
        .upload(fileName, file)

      if (error) throw error

      // 4. Get Public URL
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
