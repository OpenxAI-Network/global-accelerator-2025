import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY || 'placeholder_key'
const isPlaceholder = apiKey.includes('placeholder')

export const openai = isPlaceholder ? null : new OpenAI({ apiKey })
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4'

export async function generateAIResponse(prompt: string, context?: string) {
  if (isPlaceholder || !openai) {
    return 'AI service is currently unavailable. Please configure your OpenAI API key in the environment variables to enable AI features.'
  }

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: context || 'You are an AI tutor helping students learn. Be encouraging, clear, and educational.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Sorry, there was an error processing your request. Please try again later.'
  }
}