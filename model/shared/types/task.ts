import { z } from "zod";
import { FIELD_TARGETS } from "./form";

// yeah i think asking a question nullifies the existing task and requires new generation, cleaner that way.
export const FieldTask = z.object({
  instruction: z
    .string()
    .describe(
      "The large-font instruction defining the user's next task. e.g. 'Fill out username' or 'Select profile picture'"
    ),
  target: z
    .enum(FIELD_TARGETS as [string, ...string[]])
    .describe("The target receiving the event."),
  action: z
    .enum(["setFocus", "setValue"])
    .describe(
      "The action which would be triggered. By default should be setFocus, but if you know what value should be set based on past context, then choose setValue and provide the value in the value field."
    ),
  value: z.string().optional().describe("The value to be set on the target, if applicable."),
});
export type FieldTask = z.infer<typeof FieldTask>;

export const SubmitTask = z.object({
  // target: z.literal("form"),//.describe("The target receiving the event."),
  // action: z.literal("submit"),//.describe("The action which would be triggered."),
  instruction: z
    .string()
    .describe("The large-font instruction defining the user's next task. Probably 'Submit form'."),
});
export type SubmitTask = z.infer<typeof SubmitTask>;

export const ResponseSuggestion = z.object({
  // target: z.literal("chat"),//.describe("The target receiving the event."),
  // action: z.literal("message"),//.describe("The action which would be triggered."),
  response: z
    .string()
    .describe(
      "The user's response to the question, which they may select to indicate it's truth. e.g. 'I am a US citizen'."
    ),
  note: z
    .string()
    .optional()
    .describe(
      "A note to be displayed below this particular response, e.g. 'If you're not sure whether you are a citizen, you can check your passport.'."
    ),
});
export type ResponseSuggestion = z.infer<typeof ResponseSuggestion>;

export const QuestionTask = z.object({
  // target: z.literal("chat"),//.describe("The target receiving the event."),
  // action: z.literal("question"),//.describe("The action which would be triggered."),
  question: z
    .string()
    .describe("The question to be asked of the user, e.g. 'Are you a US citizen?'"),
  responses: z
    .array(ResponseSuggestion)
    .describe("The responses the user can select from, e.g. ['Yes', 'No']."),
});
export type QuestionTask = z.infer<typeof QuestionTask>;

export type TaskConfig = {
  name: string;
  semantics: {
    actionDescription: string;
    condition: string;
    extraContext: string | undefined;
  };
  parameters: z.ZodObject<any, any, any>;
};

export const TASK_CONFIGS: ReadonlyArray<TaskConfig> = [
  {
    name: "submit",
    semantics: {
      actionDescription: "produces a task in the UI instructing the user to submit the form",
      condition: "the user has completed the form",
      extraContext: undefined,
    },
    parameters: SubmitTask,
  },
  {
    name: "question",
    semantics: {
      actionDescription:
        "produces a question in the UI to be displayed to the user, along with a selection of responses that the user may choose from",
      condition:
        "there is ambiguity about the next field for the user to fill out, e.g. an upcoming field is optional or depends on user details",
      extraContext: undefined, // Once they answer you may ask another question, so your first question should always be as simple as possible, to avoid overwhelming the user. Our goal is to give them the most straightforward task possible, at all times.
    },
    parameters: QuestionTask,
  },
  {
    name: "field",
    semantics: {
      actionDescription:
        "produces a task in the UI instructing the user to fill out a particular field",
      condition:
        "the user has not completed the form and there is no ambiguity about the next field for the user to fill out",
      extraContext: undefined,
    },
    parameters: FieldTask,
  },
] as const;
