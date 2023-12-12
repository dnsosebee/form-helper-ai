import { AgentEvent } from "@/model/shared/types/agentEvent";
import { z } from "zod";
import { Response } from "./response";

export const State = z.object({
  agentEvents: z.array(AgentEvent),
  responses: z.array(Response),
  input: z.string(),
});
export type State = z.infer<typeof State>;
