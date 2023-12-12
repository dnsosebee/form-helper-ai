import { z } from "zod";
import { FIELD_TARGETS } from "./form";
import { TASK_CONFIGS } from "./task";

export const UserMessageEvent = z.object({
  id: z.string(),
  agent: z.literal("user"),
  target: z.literal("chat"),
  action: z.literal("message"),
  message: z.string(),
  // id: z.string(),
  // timestamp: z.number(),
});
export type UserMessageEvent = z.infer<typeof UserMessageEvent>;

// We expect this to mean that the user has made a change to the field.
export const UserFieldEvent = z.object({
  id: z.string(),
  agent: z.literal("user"),
  target: z.enum(FIELD_TARGETS as [string, ...string[]]),
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
export type UserFieldEvent = z.infer<typeof UserFieldEvent>;

export const AssistantMessageEvent = z.object({
  id: z.string(),
  agent: z.literal("assistant"),
  target: z.literal("chat"),
  action: z.literal("generateUI"),
  answer: z.string().optional(),
  task: z.union(
    TASK_CONFIGS.map((taskType) =>
      taskType.parameters.extend({
        action: z.literal(taskType.name),
      })
    ) as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
  ),
});
export type AssistantMessageEvent = z.infer<typeof AssistantMessageEvent>;

export const AgentEvent = z.union([UserMessageEvent, UserFieldEvent, AssistantMessageEvent]);
export type AgentEvent = z.infer<typeof AgentEvent>;
