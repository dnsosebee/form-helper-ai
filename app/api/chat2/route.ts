import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
export const runtime = 'edge';
 
export async function POST(req: Request) {
  const { prompt } = await req.json();
  // Create a completion using OpenAI
  const response = await openai.completions.create({
    model: 'text-davinci-003',
    stream: true,
    prompt,
  });
 
  // Transform the response into a readable stream
  const stream = OpenAIStream(response);
 
  // Return a StreamingTextResponse, which can be consumed by the client
  return new StreamingTextResponse(stream);
}