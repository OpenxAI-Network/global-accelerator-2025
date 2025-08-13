import { NextRequest, NextResponse } from 'next/server'

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizResponse {
  success: boolean;
  quiz?: QuizQuestion[];
  error?: string;
  source: 'ollama' | 'fallback';
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || text.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Text must be at least 10 characters long'
      } as QuizResponse, { status: 400 })
    }

    const prompt = `Create a quiz from the following text. Generate 4-6 multiple choice questions in VALID JSON format only. Return only the JSON, no additional text:

{
  "quiz": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "give the breif explanation for the correct answer"
    }
  ]
}

Text: ${text}`

    // Try Ollama first
    try {
      // const controller = new AbortController();
      // const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: prompt,
          stream: false,
        }),
        // signal: controller.signal
      });

      // clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        try {
          // More robust JSON extraction
          let jsonText = data.response.trim();
          
          // Remove markdown code blocks if present
          jsonText = jsonText.replace(/``````/g, '');
          
          // Find JSON object boundaries
          const startIdx = jsonText.indexOf('{');
          const lastIdx = jsonText.lastIndexOf('}');
          
          if (startIdx !== -1 && lastIdx !== -1 && lastIdx > startIdx) {
            jsonText = jsonText.substring(startIdx, lastIdx + 1);
            
            const parsed = JSON.parse(jsonText);
            
            if (parsed.quiz && Array.isArray(parsed.quiz) && parsed.quiz.length > 0) {
              // Validate quiz structure
              const validQuiz = parsed.quiz.filter((q: any) => 
                q.question && 
                Array.isArray(q.options) && 
                q.options.length >= 2 &&
                typeof q.correct === 'number' &&
                q.correct >= 0 &&
                q.correct < q.options.length
              );

              if (validQuiz.length > 0) {
                return NextResponse.json({
                  success: true,
                  quiz: validQuiz,
                  source: 'ollama'
                } as QuizResponse);
              }
            }
          }
        } catch (parseError) {
          console.log('JSON parsing failed:', parseError);
        }
      }
    } catch (ollamaError) {
      console.log('Ollama error:', ollamaError);
    }

    // Enhanced fallback based on topic
    const fallbackQuiz = generateContextualFallback(text);

    return NextResponse.json({
      success: true,
      quiz: fallbackQuiz,
      source: 'fallback'
    } as QuizResponse);

  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate quiz'
    } as QuizResponse, { status: 500 });
  }
}

function generateContextualFallback(topic: string): QuizQuestion[] {
  const topicLower = topic.toLowerCase();
  
  // Blockchain/Web3 focused fallback for your domain
  if (topicLower.includes('blockchain') || topicLower.includes('web3') || topicLower.includes('crypto')) {
    return [
      {
        question: "What is the primary benefit of blockchain technology?",
        options: [
          "Faster transactions than traditional databases",
          "Decentralization and immutability", 
          "Lower energy consumption",
          "Easier to program than SQL"
        ],
        correct: 1,
        explanation: "Blockchain's core value comes from its decentralized nature and immutable record-keeping."
      },
      {
        question: "In Ethereum, what determines transaction fees?",
        options: [
          "Transaction amount only",
          "Gas price and gas limit",
          "Block number",
          "Wallet provider"
        ],
        correct: 1,
        explanation: "Ethereum fees are calculated as gas price × gas limit, representing computational cost."
      },
      {
        question: "What is a smart contract?",
        options: [
          "A legal document stored on blockchain",
          "Self-executing code with terms directly written into code",
          "A contract between two smart people",
          "A faster version of traditional contracts"
        ],
        correct: 1,
        explanation: "Smart contracts are programs that automatically execute when predetermined conditions are met."
      }
    ];
  }

  // Generic fallback
  return [
    {
      question: `What is a key concept related to "${topic}"?`,
      options: [
        "Understanding fundamentals",
        "Ignoring best practices",
        "Avoiding documentation",
        "Working in isolation"
      ],
      correct: 0,
      explanation: "Understanding fundamentals is crucial for mastering any topic."
    }
  ];
}
