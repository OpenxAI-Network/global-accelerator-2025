import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    // Convert video to base64
    const bytes = await videoFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create the prompt for fitness form analysis
    const prompt = `You are a professional fitness trainer and movement analysis expert. Please analyze this workout video and provide detailed form feedback.

    Focus on:
    1. Exercise identification - What exercise(s) are being performed?
    2. Form analysis - Evaluate posture, alignment, range of motion, and technique
    3. Common mistakes - Point out any form errors or areas for improvement
    4. Safety concerns - Highlight any movements that could lead to injury
    5. Specific corrections - Provide actionable advice to improve form
    6. Positive reinforcement - Acknowledge what's being done well

    Please provide your analysis in a clear, constructive, and encouraging tone. Be specific about body positioning, movement patterns, and timing. Format your response with clear sections and bullet points where appropriate.`;

    // Analyze the video
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: videoFile.type,
          data: base64
        }
      }
    ]);

    const analysis = result.response.text();

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Error analyzing video:', error);
    
    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Google AI API configuration.' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('blocked')) {
        return NextResponse.json(
          { error: 'Content was blocked by safety filters. Please try with a different video.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze video. Please try again.' },
      { status: 500 }
    );
  }
}