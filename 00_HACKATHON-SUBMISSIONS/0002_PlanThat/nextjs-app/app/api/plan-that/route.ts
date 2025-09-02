import { NextRequest, NextResponse } from 'next/server'
import { optimizePrompt } from '../../../utils/promptOptimizer'
import { aiCache, generateCacheKey } from '../../../utils/cache'
import { generateFallbackPlans } from '../../../utils/fallbackGenerator'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let body: any
  try {
    body = await req.json()
    const {
      location,
      meetingType,
      numberOfPeople,
      date,
      startTime,
      endTime,
      food,
      drinks,
      desserts,
      otherActivities,
      priceRange,
      additionalPreferences
    } = body

    //if meeting_type is not provided, use 'meeting'
    let prompt = body.prompt || ''
    
    // Add explicit JSON format instructions for Llama3.2:3b
    const jsonInstructions = `
IMPORTANT: You must respond with ONLY a valid JSON array containing exactly 5 venue recommendations. 
Do not include any code, explanations, or other text. Only return the JSON array.

The JSON array should contain objects with these exact fields:
- name: venue name
- address: venue address
- coordinates: "lat,lon" format (e.g., "-33.8688,151.2093")
- summary: brief description
- image: empty string
- link: empty string  
- price_range: price indicator (e.g., "$", "$$", "$$$")
- opening_hours: hours (e.g., "9:00 AM - 6:00 PM")

Example format:
[
  {
    "name": "Venue Name",
    "address": "123 Main St, City",
    "coordinates": "-33.8688,151.2093",
    "summary": "Description here",
    "image": "",
    "link": "",
    "price_range": "$$",
    "opening_hours": "9:00 AM - 6:00 PM"
  }
]

Now provide your recommendations:`
    
    // Combine the original prompt with JSON instructions
    const enhancedPrompt = prompt + jsonInstructions
    
    // Optimize the prompt for faster processing
    //prompt = optimizePrompt(prompt)
    console.log('Original prompt length:', body.prompt?.length || 0)
    console.log('Enhanced prompt length:', enhancedPrompt.length)
    console.log('Enhanced prompt:', enhancedPrompt)

    // Check cache first
    const requestData = {
      model: 'llama3.2:3b',
      prompt: enhancedPrompt,
      options: {
        temperature: 0.1, // Very low temperature for consistent JSON output
        top_p: 0.9,
        top_k: 40,
        num_predict: 800, // Slightly longer for better JSON completion
        num_ctx: 2048,
        num_thread: 4,
        num_gpu: 1,
        repeat_penalty: 1.1,
        seed: 42,
      }
    }
    
    const cacheKey = generateCacheKey(requestData)
    const cachedResult = aiCache.get(cacheKey)
    
    if (cachedResult) {
      console.log('Cache hit! Returning cached result')
      return NextResponse.json({
        result: cachedResult.response || 'Unable to generate response',
        processingTime: 0,
        cached: true
      })
    }

    // Add timeout and optimized parameters for faster inference
    const controller = new AbortController()
    //const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for Gemma 2:9b

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: enhancedPrompt,
        stream: false,
      }),
    })

    //clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama responded with status: ${response.status}`)
    }

    // Handle the response more carefully - read as text first
    const rawText = await response.text()
    console.log('Raw text response:', rawText)
    
    let data
    try {
      data = JSON.parse(rawText)
      console.log('Successfully parsed JSON response:', data)
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError)
      
      // Try to extract JSON from the raw text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[0])
          console.log('Extracted JSON from text:', data)
        } catch (extractError) {
          console.error('Failed to extract JSON from text:', extractError)
          throw new Error('Invalid JSON response from Ollama')
        }
      } else {
        throw new Error('No valid JSON found in Ollama response')
      }
    }
    
    // Validate the response
    if (!data || !data.response) {
      throw new Error('Invalid response from Ollama')
    }
    
    // Clean up the response - remove any extra content after JSON
    let cleanedResponse = data.response.trim()
    
    // Try to extract JSON array if the response contains extra text
    const jsonArrayMatch = cleanedResponse.match(/\[[\s\S]*\]/)
    if (jsonArrayMatch) {
      cleanedResponse = jsonArrayMatch[0]
      console.log('Extracted JSON array from response:', cleanedResponse)
    } else {
      console.log('No JSON array found, using full response:', cleanedResponse)
    }
    
    // Validate that we have valid JSON
    try {
      const parsedJson = JSON.parse(cleanedResponse)
      // Ensure it's an array with 5 items
      if (!Array.isArray(parsedJson) || parsedJson.length !== 5) {
        throw new Error('Response is not a valid array with 5 items')
      }
      console.log('Response is valid JSON array with 5 items')
    } catch (jsonError) {
      console.error('Response is not valid JSON, using fallback')
      throw new Error('Invalid JSON in response content')
    }
    
    // Cache the result for future requests
    aiCache.set(cacheKey, data, 300000) // Cache for 5 minutes
    
    return NextResponse.json({ 
      result: cleanedResponse || 'Unable to generate response',
      processingTime: Date.now() - startTime
    })
  } catch (error) {
    console.error('Plan That API error:', error)
    

    
    // Handle JSON parsing errors
    if (error instanceof Error && error.message.includes('JSON')) {
      console.log('JSON parsing error, generating fallback plans...')
      
      // Generate fallback plans when JSON parsing fails
      const fallbackPlans = generateFallbackPlans(body)
      const fallbackResponse = JSON.stringify(fallbackPlans, null, 2)
      
      return NextResponse.json({
        result: fallbackResponse,
        processingTime: Date.now() - startTime,
        fallback: true,
        message: 'AI response format was invalid, showing suggested plans instead.'
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to generate plan. Please try again.' },
      { status: 500 }
    )
  }
} 