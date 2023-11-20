import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources/chat";
import {
  CREATE_FIELD_TASK_RESPONSE_FUNCTION_NAME,
  CREATE_FIELD_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
  CREATE_QUESTION_TASK_RESPONSE_FUNCTION_NAME,
  CREATE_QUESTION_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
  CREATE_SUBMIT_TASK_RESPONSE_FUNCTION_NAME,
  CREATE_SUBMIT_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
  fieldEventResponseFunctions,
  messageEventResponseFunctions,
} from "./functions";
import {
  AgentEvent,
  AssistantFieldResponseEvent,
  UserFieldEvent,
  UserMessageEvent,
  ValidationState,
  chatRequestParamsZodSchema,
} from "./interface";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
// import {z} from "zod";
// import {zodToJsonSchema} from "zod-to-json-schema";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const assistantFieldResponseEventToFunctionCallName = (
  event: AssistantFieldResponseEvent
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

const getMessages = (agentEvents: AgentEvent[], validationState: ValidationState): ChatCompletionMessage[] => {
  const messages = agentEvents.map((event) => {
    if (event.agent === "user" && event.target === "chat") {
      const e = event as UserMessageEvent;
      return {
        role: "user",
        content: e.message,
      } as ChatCompletionMessage;
    } else if (event.agent === "user" && event.target.startsWith("field.")) {
      const e = event as UserFieldEvent;
      return {
        role: "user",
        content: e.error || "",
      } as ChatCompletionMessage;
    }
    const e = event as AssistantFieldResponseEvent;
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
    } as ChatCompletionMessage;
  });

  const systemMessage = {
    role: "system",
    content: `You must select a function in order to respond to the user, since the functions provided are the only way to communicate with the user (a plain response will not work). ${validationState.valid ? "The form is in a valid state." : `The form is not yet in a valid state, and the first invalid field is the field named "${validationState.target}", which has the error "${validationState.error}".`}`,
  } as ChatCompletionMessage;

  messages.push(systemMessage);

  return messages;
};

export async function POST(req: Request) {
  const json = await req.json();
  const { agentEvents, validationState } = chatRequestParamsZodSchema.parse(json);
  const latestEvent = agentEvents[agentEvents.length - 1];
  const latestEventIsMessage = latestEvent.agent === "user" && latestEvent.target === "chat";

  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview", //"gpt-3.5-turbo-0613",
    stream: true,
    messages: getMessages(agentEvents, validationState),
    functions: latestEventIsMessage ? messageEventResponseFunctions : fieldEventResponseFunctions,
  });

  // const data = new experimental_StreamData();
  const stream = OpenAIStream(response, {
    // experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages) => {
    //   if (args.intent === "recipes") {
    //     const recipes = [
    //       {
    //         title: "Sweet potato and coconut soup",
    //         link: "https://www.bbcgoodfood.com/recipes/speedy-sweet-potato-soup-coconut",
    //       },
    //       {
    //         title: "Vegan leek & potato soup",
    //         link: "https://www.bbcgoodfood.com/recipes/vegan-leek-potato-soup",
    //       },
    //     ];

    //     // data.append(recipes);

    //     const newMessages = createFunctionCallMessages(recipes);
    //     return openai.chat.completions.create({
    //       messages: [...messages, ...newMessages],
    //       stream: true,
    //       model: "gpt-3.5-turbo-0613",
    //       functions: recipe_response_functions,
    //       function_call: {
    //         name: "create_recipes_response",
    //       },
    //     });
    //   } else if (args.intent === "general_info") {
    //     return openai.chat.completions.create({
    //       messages: [...messages],
    //       stream: true,
    //       model: "gpt-3.5-turbo-0613",
    //     });
    //   }
    // },
    onCompletion(completion) {
      console.log("completion", completion);
    },
    onFinal(completion) {
      // data.close();
    },
    // experimental_streamData: true,
  });

  // data.append({
  //   text: "Hello, how are you?",
  // });

  return new StreamingTextResponse(stream, {});
}
