import {
  AgentEvent,
  AssistantMessageEvent,
  UserFieldEvent,
  UserMessageEvent,
} from "@/model/types/agentEvent";
import { ChatRequestParams, ValidationState } from "@/model/types/chatRequest";
import { functionName, getTools } from "@/model/types/function";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import {
  Transport,
  TransportChunk,
  TransportComplete,
  TransportError,
} from "../../../model/types/transport";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
export const runtime = "edge";

const getMessages = (
  agentEvents: AgentEvent[],
  validationState: ValidationState
): ChatCompletionMessageParam[] => {
  const messages = agentEvents.map((event) => {
    if (event.agent === "user" && event.target === "chat") {
      const e = event as UserMessageEvent;
      return {
        role: "user" as const,
        content: e.message,
      } as ChatCompletionMessageParam;
    } else if (event.agent === "user" && event.target.startsWith("field.")) {
      const e = event as UserFieldEvent;
      return {
        role: "system",
        content: JSON.stringify(e),
      } as ChatCompletionMessageParam;
    }
    const e = event as AssistantMessageEvent;
    return {
      role: "assistant",
      content: null,
      functionCall: {
        name: functionName(e.task.type, !!e.answer),
        arguments: {
          answer: e.answer || "",
          ...e.task,
        },
      },
    } as ChatCompletionMessageParam;
  });

  const systemMessage = {
    role: "system",
    content: `You must select a function in order to respond to the user, since the functions provided are the only way to communicate with the user (a plain response will crash the system). ${
      validationState.valid
        ? "The form is in a valid state."
        : `The form is not yet in a valid state, and the first invalid field is the field named "${validationState.target}", which has the error "${validationState.error}".`
    }`,
  } as ChatCompletionMessageParam;

  messages.push(systemMessage);

  return messages;
};

export async function POST(req: Request) {
  const json = await req.json();
  console.debug({ params: json });
  const parsed = ChatRequestParams.safeParse(json);
  if (!parsed.success) {
    return new NextResponse(json, {
      status: 400,
    });
  }
  const { agentEvents, validationState } = parsed.data;
  const latestEvent = agentEvents[agentEvents.length - 1];
  const latestEventIsMessage = latestEvent.agent === "user" && latestEvent.target === "chat";

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  const write = (message: Transport) => writer.write(encoder.encode(JSON.stringify(message)));

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", //"gpt-3.5-turbo-0613",
      stream: true,
      messages: getMessages(agentEvents, validationState),
      tools: getTools(latestEventIsMessage),
      tool_choice: "auto",
      // functions: latestEventIsMessage ? messageEventResponseFunctions : fieldEventResponseFunctions,
    });

    const readableStream = stream.toReadableStream();
    const reader = readableStream.getReader();
    const decoder = new TextDecoder("utf-8");
    reader.read().then(function processText({ done, value }) {
      if (done) {
        const complete = {
          type: "complete",
        } as TransportComplete;
        write(complete);
        writer.close();
        return;
      }
      const chunk = JSON.parse(decoder.decode(value));

      const choice = chunk.choices[0];
      if (choice.finish_reason) {
        const complete = {
          type: "complete",
        } as TransportComplete;
        write(complete);
        writer.close();
        return;
      }

      const f = choice.delta.tool_calls?.[0].function;
      if (f) {
        const transportChunk = {
          type: "chunk",
          name: f.name ?? "",
          arguments: f.arguments ?? "",
        } as TransportChunk;
        write(transportChunk);
      } else {
        const error = {
          type: "error",
          message: "No function call was returned by the API.",
        } as TransportError;
      }
      reader.read().then(processText);
    });
  } catch (e) {
    console.error("An error occurred during OpenAI request", e);
    const error = {
      type: "error",
      message: "An error occurred during OpenAI request",
    } as TransportError;
    write(error);
    writer.close();
  }

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
