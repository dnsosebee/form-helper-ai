import { fieldTargets } from "@/model/profileForm";
import z from "zod";
import { fieldTaskZodSchema, questionTaskZodSchema, submitTaskZodSchema } from "./functions";

const userMessageEventZodSchema = z.object({
  id: z.string(),
  agent: z.literal("user"),
  target: z.literal("chat"),
  action: z.literal("message"),
  message: z.string(),
  // id: z.string(),
  // timestamp: z.number(),
});

export type UserMessageEvent = z.infer<typeof userMessageEventZodSchema>;

// We expect this to mean that the user has made a change to the field.
const userFieldEventZodSchema = z.object({
  id: z.string(),
  agent: z.literal("user"),
  target: z.enum(fieldTargets as [string, ...string[]]),
  validation: z.discriminatedUnion("valid", [
    z.object({
      valid: z.literal(true),
    }),
    z.object({
      valid: z.literal(false),
      error: z.string(),
    }),
  ]),
});

export type UserFieldEvent = z.infer<typeof userFieldEventZodSchema>;

export const assistantMessageEventZodSchema = z.object({
  id: z.string(),
  agent: z.literal("assistant"),
  target: z.literal("chat"),
  action: z.literal("generateUI"),
  answer: z.string().optional(),
  task: z.discriminatedUnion("type", [
    z
      .object({
        type: z.literal("submit"),
        // instruction: z.string(),
      })
      .merge(submitTaskZodSchema),
    z
      .object({
        type: z.literal("question"),
        // question: z.string(),
        // responses: z.array(
        //   z.object({
        //     response: z.string(),
        //     note: z.string().optional(),
        //   })
        // ),
      })
      .merge(questionTaskZodSchema),
    z
      .object({
        type: z.literal("field"),
        // target: z.enum(fieldTargets as [string, ...string[]]),
        // instruction: z.string(),
        // action: z.enum(["setFocus", "setValue"]),
        // value: z.string().optional(),
      })
      .merge(fieldTaskZodSchema),
  ]),
});

export type AssistantMessageEventZodSchema = z.infer<typeof assistantMessageEventZodSchema>;

export const agentEventZodSchema = z.union([
  userMessageEventZodSchema,
  userFieldEventZodSchema,
  assistantMessageEventZodSchema,
]);

export type AgentEvent = z.infer<typeof agentEventZodSchema>;

const validationStateZodSchema = z.discriminatedUnion("valid", [
  z.object({
    valid: z.literal(true),
  }),
  z.object({
    valid: z.literal(false),
    target: z.enum(fieldTargets as [string, ...string[]]),
    error: z.string(),
  }),
]);

export type ValidationState = z.infer<typeof validationStateZodSchema>;

export const chatRequestParamsZodSchema = z.object({
  agentEvents: z.array(agentEventZodSchema),
  validationState: validationStateZodSchema,
  // TODO focus events
});

export type ChatRequestParams = z.infer<typeof chatRequestParamsZodSchema>;
