import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
// import {z} from "zod";
// import {zodToJsonSchema} from "zod-to-json-schema";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const intent_classification_functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "classify_intent",
    description:
      "Determine if user wants a list of recipes, or if they want general information about RecipeBot.",
    parameters: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: ["recipes", "general_info"],
          description: "The user intent classification.",
        },
      },
      required: ["intent"],
    },
  },
];

const recipe_response_functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "create_recipes_response",
    description: "Create a response to the user based on the recipes they want.",
    parameters: {
      type: "object",
      properties: {
        introduction: {
          type: "string",
          description:
            "The introduction to the response. Can be something like 'Here are some recipes for you:', but more creative to fit the user's question.",
        },
        recipes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              context: {
                type: "string",
                description:
                  'Context to be provided above the link to this particular recipe. For example, "A delicious vegan soup".',
              },
              link: {
                type: "string",
                description: "A link to the recipe.",
              },
            },
            required: ["context", "link"],
          },
        },
        followUp1: {
          type: "string",
          description:
            "A follow up question that the user may want to ask you. For example, 'Would you like to see more recipes?'",
        },
        followUp2: {
          type: "string",
          description:
            "A follow up question that the user may want to ask you. For example, 'Would you like to see more recipes?'. Must differ from followUp1.",
        },
      },
      required: ["introduction", "recipes", "followUp1", "followUp2"],
    },
  },
];

export async function POST(req: Request) {
  const json = await req.json();
  console.log("json", json);
  const { messages } = json;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    stream: true,
    messages,
    functions: intent_classification_functions,
    function_call: {
      name: "classify_intent",
    },
  });

  // const data = new experimental_StreamData();
  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages) => {
      if (args.intent === "recipes") {
        const recipes = [
          {
            title: "Sweet potato and coconut soup",
            link: "https://www.bbcgoodfood.com/recipes/speedy-sweet-potato-soup-coconut",
          },
          {
            title: "Vegan leek & potato soup",
            link: "https://www.bbcgoodfood.com/recipes/vegan-leek-potato-soup",
          },
        ];

        // data.append(recipes);

        const newMessages = createFunctionCallMessages(recipes);
        return openai.chat.completions.create({
          messages: [...messages, ...newMessages],
          stream: true,
          model: "gpt-3.5-turbo-0613",
          functions: recipe_response_functions,
          function_call: {
            name: "create_recipes_response",
          },
        });
      } else if (args.intent === "general_info") {
        return openai.chat.completions.create({
          messages: [...messages],
          stream: true,
          model: "gpt-3.5-turbo-0613",
        });
      }
    },
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
