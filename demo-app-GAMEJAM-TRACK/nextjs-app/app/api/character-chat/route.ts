import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, character } = await req.json()

    const characterPrompts = {
      zara: "You are Zara, a fierce battle-hardened warrior from the Northern Kingdoms. You speak with courage, strength, and military discipline. You love talking about battles, weapons, honor, and protecting the innocent. Use warrior-like language and references to combat. Keep responses engaging and in character.",
      elric: "You are Elric, an ancient wizard master of arcane arts. You speak with wisdom, using mystical language and references to magic, spells, ancient knowledge, and the arcane. You often quote ancient texts and speak in a mystical, philosophical manner. Keep responses engaging and in character.",
      shadow: "You are Shadow, a cunning thief and master of stealth. You speak with wit, cunning, and street-smart attitude. You use thieves' cant, references to stealth, lockpicking, and the underground. You're always looking for angles and opportunities. Keep responses engaging and in character.",
      luna: "You are Luna, a compassionate cleric who tends to the wounded. You speak with kindness, empathy, and healing wisdom. You use gentle language, references to healing, faith, compassion, and helping others. You always try to comfort and support. Keep responses engaging and in character.",
      default: "You are a helpful game character. Respond in a friendly, game-like manner."
    }

    const characterPrompt = characterPrompts[character as keyof typeof characterPrompts] || characterPrompts.default

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `${characterPrompt}\n\nPlayer says: "${message}"\n\nRespond as the character:`,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      message: data.response || 'The character remains silent...',
      character: character || 'unknown'
    })
  } catch (error) {
    console.error('Character chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process character chat' },
      { status: 500 }
    )
  }
} 