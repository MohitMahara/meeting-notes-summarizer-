export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { Groq } from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


export async function POST(request: NextRequest) {
  try {
    const { transcript, customInstruction } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

    const prompt = `${customInstruction || 'Summarize the key points from this meeting'}: Meeting Transcript: ${transcript} Please provide a clear and organized summary.`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes meeting transcripts. Provide clear, concise, and well-organized summaries based on the user\'s instructions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]
    });

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}