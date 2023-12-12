import OpenAI from "openai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { TASK_CONFIGS } from "../../shared/types/task";

// export const hypotheticalEventZodSchema = z.object({
//   target: z.enum(allTargets as [string, ...string[]]).describe("The target which would receive the event."),
//   value: z.string().optional().describe("The value to be set on the target, if applicable."),
// })

// export const eventSuggestionZodSchema = hypotheticalEventZodSchema.merge(z.object({
//   suggestionName: z.enum(["fill", "set", "submit", "message"]).describe("The event which would be triggered. A change event also focuses the input, and every event scrolls the target into view."),
//   description: z.string().describe("A description of the event, for the user to understand what will happen if they select it."),
// }))

// export const liveEventSuggestionZodSchema = eventSuggestionZodSchema.merge(z.object({
//   id: z.string().describe("A unique identifier for the event, so that you can track it in your database."),
//   complete: z.boolean().describe("Whether the event has been completed by the user."),
// }))

// export const liveEventSchema = hypotheticalEventZodSchema.merge(z.object({
//   eventName: z.enum(["focus", "change", ""])

// }))

// This is a rich problem!
// we have the user focus context. We have the formstate. We have the active suggestion. We have the conversation history, interleaved with relevant events.
// User focus doesn't live in the event stream, it lives next to the input.

export const BaseAnswer = z.object({
  answer: z.string().describe("Your detailed answer to the user's question."),
});
export type BaseAnswer = z.infer<typeof BaseAnswer>;

export const functionName = (taskType: string, includeAnswer: boolean): string => {
  return `create_${taskType}_task_response${includeAnswer ? "_with_answer" : ""}`;
};

export const getTools = (includeAnswer: boolean): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  return TASK_CONFIGS.map((taskType) => {
    const name = functionName(taskType.name, includeAnswer);
    const schema = includeAnswer
      ? taskType.parameters.extend({
          answer: z.string().describe("The user's answer to the question, if applicable."),
        })
      : taskType.parameters;

    const description =
      `This function ${taskType.semantics.actionDescription}. Only select this function if ${taskType.semantics.condition}.` +
      (taskType.semantics.extraContext ? ` ${taskType.semantics.extraContext}` : "");
    return {
      type: "function",
      function: {
        name,
        description,
        parameters: zodToJsonSchema(schema),
      },
    };
  });
};
