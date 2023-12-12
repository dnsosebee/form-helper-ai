import { z } from "zod";
import { AgentEvent } from "./agentEvent";
import { FIELD_TARGETS } from "./form";

export const ValidationState = z.discriminatedUnion("valid", [
  z.object({
    valid: z.literal(true),
  }),
  z.object({
    valid: z.literal(false),
    target: z.enum(FIELD_TARGETS as [string, ...string[]]),
    error: z.string(),
  }),
]);
export type ValidationState = z.infer<typeof ValidationState>;

export const ChatRequestParams = z.object({
  agentEvents: z.array(AgentEvent),
  validationState: ValidationState,
  // TODO: focus events
});
export type ChatRequestParams = z.infer<typeof ChatRequestParams>;
