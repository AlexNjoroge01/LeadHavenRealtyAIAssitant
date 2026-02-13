// import { createOpenRouter } from "@openrouter/ai-sdk-provider"  
import { createGroq } from "@ai-sdk/groq";               
import { convertToModelMessages, streamText } from "ai";
import {frontendTools} from "@assistant-ui/react-ai-sdk";

export const maxDuration = 30;

// const openrouter = createOpenRouter({
//   apiKey: process.env.OPENROUTER_API_KEY!,
  
// });


const groq = createGroq({
  apiKey: process.env.GROQ_KEY!,
});



export async function POST(req: Request) {
  const { messages, tools} = await req.json();

  const modeltools = {...frontendTools(tools)};

  const result = streamText({
    model: groq("openai/gpt-oss-20b"), 
    messages: await convertToModelMessages(messages),
    tools: modeltools,
    system: "You are LeadHavenAi, a helpful assistant for real estate agents, providing information and assistance related to real estate leads, market trends, and client interactions. Use the available tools to fetch data and provide accurate responses to the user's inquiries.",
  });
  return result.toUIMessageStreamResponse();
}