import { fieldTargets } from "@/model/profileForm";
import { ChatCompletionCreateParams } from "openai/resources/chat";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";


export const baseFieldEventZodSchema = z.object({
  target: z.enum(fieldTargets as [string, ...string[]]).describe("The target receiving the event."),
})
// yeah i think asking a question nullifies the existing task and requires new generation, cleaner that way.
export const fieldTaskZodSchema = baseFieldEventZodSchema.merge(z.object({
  instruction: z.string().describe("The large-font instruction defining the user's next task. e.g. 'Fill out username' or 'Select profile picture'"),
  action: z.enum(["setFocus", "setValue"]).describe("The action which would be triggered. By default should be setFocus, but if you know what value should be set based on past context, then choose setValue and provide the value in the value field."),
  value: z.string().optional().describe("The value to be set on the target, if applicable."),
}))

export const submitTaskZodSchema = z.object({
  // target: z.literal("form"),//.describe("The target receiving the event."),
  // action: z.literal("submit"),//.describe("The action which would be triggered."),
  instruction: z.string().describe("The large-font instruction defining the user's next task. Probably 'Submit form'."),
})

const responseSuggestionZodSchema = z.object({
  // target: z.literal("chat"),//.describe("The target receiving the event."),
  // action: z.literal("message"),//.describe("The action which would be triggered."),
  response: z.string().describe("The user's response to the question, which they may select to indicate it's truth. e.g. 'I am a US citizen'."),
  note: z.string().optional().describe("A note to be displayed below this particular response, e.g. 'If you're not sure whether you are a citizen, you can check your passport.'."),
})

export const questionTaskZodSchema = z.object({
  // target: z.literal("chat"),//.describe("The target receiving the event."),
  // action: z.literal("question"),//.describe("The action which would be triggered."),
  question: z.string().describe("The question to be asked of the user, e.g. 'Are you a US citizen?'"),
  responses: z.array(responseSuggestionZodSchema).describe("The responses the user can select from, e.g. 'Yes' or 'No'."),
})

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

export const baseAnswerZodSchema = z.object({
  answer: z.string().describe("Your detailed answer to the user's question."),
});

export const CREATE_SUBMIT_TASK_RESPONSE_FUNCTION_NAME = "create_submit_task_response";
export const CREATE_QUESTION_TASK_RESPONSE_FUNCTION_NAME = "create_question_task_response";
export const CREATE_FIELD_TASK_RESPONSE_FUNCTION_NAME = "create_field_task_response";
export const CREATE_SUBMIT_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME = "create_submit_task_response_with_answer";
export const CREATE_QUESTION_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME = "create_question_task_response_with_answer";
export const CREATE_FIELD_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME = "create_field_task_response_with_answer";

export const fieldEventResponseFunctions: ChatCompletionCreateParams.Function[] = [
  {
    name: CREATE_SUBMIT_TASK_RESPONSE_FUNCTION_NAME,
    description: "This function produces a task in the UI instructing the user to submit the form. Only select this function if the user has completed the form.",
    parameters: zodToJsonSchema(submitTaskZodSchema),
  },
  {
    name: CREATE_QUESTION_TASK_RESPONSE_FUNCTION_NAME,
    description: "This function produces a question in the UI to be displayed to the user, along with a selection of responses that the user may choose from. Use this function if there is any ambiguity about the next field for the user to fill out, for example if an upcoming field is optional or depends on user details, you must ask them a question. Once they answer you may ask another question, so your first question should always be as simple as possible, to avoid overwhelming the user. Our goal is to give them the most straightforward task possible, at all times.",
    parameters: zodToJsonSchema(questionTaskZodSchema),
  },
  {
    name: CREATE_FIELD_TASK_RESPONSE_FUNCTION_NAME,
    description: "This function produces a task in the UI instructing the user to fill out a particular field.",
    parameters: zodToJsonSchema(fieldTaskZodSchema),
  },
];

export const messageEventResponseFunctions: ChatCompletionCreateParams.Function[] = [
  {
    name: CREATE_SUBMIT_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
    description: "This function provides the user with a response to their question or statement, and produces a task in the UI instructing the user to submit the form. Only select this function if the user has completed the form.",
    parameters: zodToJsonSchema(baseAnswerZodSchema.merge(submitTaskZodSchema)),
  },
  {
    name: CREATE_QUESTION_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
    description: "This function provides the user with a response to their question or statement, and produces a follow-up question in the UI to be presented to the user, along with a selection of responses that the user may choose from. Use this function if there is any ambiguity about the next field for the user to fill out, for example if an upcoming field is optional or depends on user details, you must ask them a question. Once they answer you may ask another question, so your first question should always be as simple as possible, to avoid overwhelming the user. Our goal is to give them the most straightforward task possible, at all times.",
    parameters: zodToJsonSchema(baseAnswerZodSchema.merge(questionTaskZodSchema)),
  },
  {
    name: CREATE_FIELD_TASK_RESPONSE_WITH_ANSWER_FUNCTION_NAME,
    description: "This function provides the user with a response to their question or statement, and produces a task in the UI instructing the user to fill out a particular field.",
    parameters: zodToJsonSchema(baseAnswerZodSchema.merge(fieldTaskZodSchema)),
  },
];
