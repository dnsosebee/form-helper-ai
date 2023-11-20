import { fieldTargets } from "@/app/profileForm";
import z from "zod";
import { fieldTaskZodSchema, questionTaskZodSchema, submitTaskZodSchema } from "./functions";

const userMessageEventZodSchema = z.object({
  agent: z.literal("user"),
  target: z.literal("chat"),
  action: z.literal("message"),
  message: z.string(),
  // id: z.string(),
  // timestamp: z.number(),
});

export type UserMessageEvent = z.infer<typeof userMessageEventZodSchema>;

const userFieldEventZodSchema = z.object({
  agent: z.literal("user"),
  target: z.enum(fieldTargets as [string, ...string[]]),
  error: z.string().optional(),
});

export type UserFieldEvent = z.infer<typeof userFieldEventZodSchema>;

const assistantFieldResponseEventZodSchema = z.object({
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

export type AssistantFieldResponseEvent = z.infer<typeof assistantFieldResponseEventZodSchema>;

const agentEventZodSchema = z.union([
  userMessageEventZodSchema,
  userFieldEventZodSchema,
  assistantFieldResponseEventZodSchema,
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
