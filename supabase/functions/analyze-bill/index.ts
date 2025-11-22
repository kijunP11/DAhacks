import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { encodeBase64 } from "jsr:@std/encoding/base64";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing in environment variables')
    }

    // fileUrl(단일) 또는 fileUrls(배열) 받기
    const body = await req.json()
    const fileUrls = body.fileUrls || (body.fileUrl ? [body.fileUrl] : [])

    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('No fileUrls provided')
    }

    // 모든 이미지 다운로드 및 Base64 변환 (병렬 처리)
    const imageContents = await Promise.all(fileUrls.map(async (url: string) => {
      const imageResponse = await fetch(url)
      if (!imageResponse.ok) throw new Error(`Failed to download image: ${url}`)
      const imageBlob = await imageResponse.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()
      const base64 = encodeBase64(arrayBuffer)
      
      return {
        type: 'image_url',
        image_url: {
          url: `data:${imageBlob.type};base64,${base64}`
        }
      }
    }))

    // OpenAI GPT-4o 호출
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert energy auditor. Analyze these electricity bill images and extract/generate the following JSON data.

CRITICAL RULE: You must base your analysis ONLY on the visible data in the bill.
- If specific rates (Time-of-Use, Tiered) are NOT visible, do NOT invent them. Use "N/A" or estimate based on visible total amounts only.
- Any "ai_analysis" or "action_plan" item MUST cite specific numbers (e.g., "$120", "450kWh", "45%") from the bill. Generic advice without numbers is INVALID.

Return ONLY valid JSON, no markdown code blocks.

Required Fields:
1. total_amount: Total bill amount (number).
2. usage_kwh: Current month usage in kWh (number).
3. previous_usage_kwh: Previous month usage (number, or null).
4. breakdown_json: Key charges breakdown (object, e.g., {"Delivery": 50, "Generation": 100}).
5. tips_json: 3-5 general saving tips (string array).
6. next_month_forecast: Estimate next month's bill based on trend (number).
7. monthly_usage: Array of EXACTLY 12 objects for all months (Jan to Dec). EVERY month MUST have all 3 fields.
   Format: [{ "month": "Jan", "usage": 320, "temp": -5 }, ...]
   - usage: kWh (positive number, 100-800).
   - temp: Average temp in °C (estimate if unknown).
8. ai_analysis: Array of 4 root-cause analysis items.
   - Identify the TOP cost drivers from 'breakdown_json'.
   - Analyze usage trends (spikes, seasonality).
   - BAD Example (Generic - DO NOT USE): { "title": "High Usage", "description": "Your usage is high, try to lower it." }
   - GOOD Example (Specific): { "icon": "dollar", "title": "High Delivery Charge", "description": "Your delivery charge is $85 (40% of total), which is unusually high compared to usage." }
   - Format: [{ "icon": "zap" | "clock" | "dollar" | "thermometer", "title": "Short Title", "description": "Specific explanation with numbers" }]
9. action_plan: Array of 3 SPECIFIC recommended actions.
   - Logic: Identify a high-cost category -> Propose a specific action -> Estimate savings based on bill data.
   - Savings Calculation:
     - If rates are visible: (Estimated kWh saved) * (Rate).
     - If rates are NOT visible: Estimate as % of the relevant charge category (e.g., "Save 10% of your $120 AC cooling cost").
   - BAD Example: { "title": "Turn off lights", "savings": "$5.00" } (Too generic, low impact)
   - GOOD Example: { "icon": "thermometer", "title": "Adjust AC during peak", "description": "Cooling accounts for ~40% of your usage. Raising temp by 2°C can save 10% of your $150 generation charge.", "savings": "$15.00" }
   - Format: [{
     "id": "action-1",
     "icon": "car" | "thermometer" | "shirt" | "zap" | "clock",
     "title": "Specific Action Title",
     "description": "Detailed explanation referencing actual bill numbers",
     "savings": "$XX.XX"
   }]`
              },
              ...imageContents // 변환된 모든 이미지 추가
            ]
          }
        ],
        max_completion_tokens: 2048,
      }),
    })

    const openAiData = await openAiResponse.json()

    if (openAiData.error) {
      console.error('OpenAI API Error:', openAiData.error)
      throw new Error(`OpenAI API Error: ${openAiData.error.message}`)
    }

    const content = openAiData.choices[0].message.content
    const jsonStr = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const analysisResult = JSON.parse(jsonStr)

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
