import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import {
  CREATE_FIELD_TASK_RESPONSE_FUNCTION_NAME,
  CREATE_FIELD_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
  CREATE_QUESTION_TASK_RESPONSE_FUNCTION_NAME,
  CREATE_QUESTION_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
  CREATE_SUBMIT_TASK_RESPONSE_FUNCTION_NAME,
  CREATE_SUBMIT_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
  fieldEventResponseFunctions,
  messageEventResponseFunctions,
} from "../../../model/functions";
import {
  AgentEvent,
  AssistantMessageEventZodSchema,
  UserFieldEvent,
  UserMessageEvent,
  ValidationState,
  chatRequestParamsZodSchema,
} from "../../../model/interface";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
export const runtime = "edge";

const assistantFieldResponseEventToFunctionCallName = (
  event: AssistantMessageEventZodSchema
): string => {
  if (event.answer) {
    switch (event.task.type) {
      case "submit":
        return CREATE_SUBMIT_TASK_RESPONSE_FUNCTION_NAME;
      case "question":
        return CREATE_QUESTION_TASK_RESPONSE_FUNCTION_NAME;
      case "field":
        return CREATE_FIELD_TASK_RESPONSE_FUNCTION_NAME;
      default:
        throw new Error("Unknown task type");
    }
  }
  switch (event.task.type) {
    case "submit":
      return CREATE_SUBMIT_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME;
    case "question":
      return CREATE_QUESTION_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME;
    case "field":
      return CREATE_FIELD_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME;
    default:
      throw new Error("Unknown task type");
  }
};

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
    const e = event as AssistantMessageEventZodSchema;
    return {
      role: "assistant",
      content: null,
      functionCall: {
        name: assistantFieldResponseEventToFunctionCallName(e),
        arguments: {
          answer: e.answer || "",
          ...e.task,
        },
      },
    } as ChatCompletionMessageParam;
  });

  const systemMessage = {
    role: "system",
    content: `You must select a function in order to respond to the user, since the functions provided are the only way to communicate with the user (a plain response will not work). ${
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
  console.log({ received: json });
  const { agentEvents, validationState } = chatRequestParamsZodSchema.parse(json);
  const latestEvent = agentEvents[agentEvents.length - 1];
  const latestEventIsMessage = latestEvent.agent === "user" && latestEvent.target === "chat";

  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview", //"gpt-3.5-turbo-0613",
    stream: true,
    messages: getMessages(agentEvents, validationState),
   tools: latestEventIsMessage ? messageEventResponseFunctions.map(f => ({
    type: 'function',
    function: f,
   })) : fieldEventResponseFunctions.map(f => ({
    type: 'function',
    function: f,
    })),
    tool_choice: 'auto',
    // functions: latestEventIsMessage ? messageEventResponseFunctions : fieldEventResponseFunctions,
  });

  


  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
