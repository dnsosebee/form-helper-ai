"use client";
import { z } from "zod";
import { AssistantMessageEvent } from "../../shared/types/agentEvent";

export const Response = z.object({
  referenceEventId: z.string(),
  event: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("loading"),
    }),
    z.object({
      status: z.literal("streaming"),
      event: AssistantMessageEvent,
    }),
    z.object({
      status: z.literal("complete"),
      event: AssistantMessageEvent,
    }),
    z.object({
      status: z.literal("error"),
      error: z.string(),
    }),
  ]),
});
export type Response = z.infer<typeof Response>;
