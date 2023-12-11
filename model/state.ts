"use client"
import { parse } from 'best-effort-json-parser';
import { nanoid } from 'nanoid';
import { proxy } from "valtio";
import { z } from "zod";
import { baseAnswerZodSchema, fieldTaskZodSchema } from './functions';
import { ValidationState, agentEventZodSchema, assistantMessageEventZodSchema } from "./interface";

export const Response = z.object({
  referenceEventId: z.string(),
  event: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("loading"),
    }),
    z.object({
      status: z.literal("streaming"),
      event: assistantMessageEventZodSchema,
    }),
    z.object({
      status: z.literal("complete"),
      event: assistantMessageEventZodSchema,
    }),
    z.object({
      status: z.literal("error"),
      error: z.string(),
    }),
  ]),
});
export type Response = z.infer<typeof Response>;

export const State = z.object({
  agentEvents: z.array(agentEventZodSchema),
  responses: z.array(Response),
  input: z.string(),
});
export type State = z.infer<typeof State>;

export const state = proxy<State>({
  agentEvents: [],
  responses: [],
  input: "",
});

export const getResponse = async (validationState: ValidationState) => {
  const lastAgentEvent = state.agentEvents[state.agentEvents.length - 1];
  state.responses.push({
    referenceEventId: lastAgentEvent.id,
    event: {
      status: "loading",
    },
  });
  const res = state.responses[state.responses.length - 1];


  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "text/event-stream",
    },
    body: JSON.stringify({
      agentEvents: state.agentEvents,
      validationState: validationState,
    }),
  });

  if (!response.body) {
    throw new Error("No response body");
  }

  let rawText = "";
  const id = nanoid();
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  while (true) {
    console.debug({ rawText })
    const { value, done } = await reader.read();
    if (done) break;
    console.debug({ value })
    rawText += value;
    console.debug({ rawText })
    const json = parse(rawText);
    console.debug({ json })
    const functionCall = json.function_call;
    if (!functionCall) {
      continue;
    }
    const name = functionCall.name;
    if (!name) {
      continue;
    }
    if (name === 'create_field_task_response_with_answer') {
      const argsJson = parse(functionCall.arguments);
      console.log({ argsJson })
      const parsed = fieldTaskZodSchema.merge(baseAnswerZodSchema).safeParse(argsJson || {});
      if (!parsed.success) {
        continue;
      }
      res.event = {
        status: "streaming",
        event: {
          id,
          agent: "assistant",
          target: "chat",
          action: "generateUI",
          answer: parsed.data.answer,
          task: {
            type: "field",
            target: parsed.data.target,
            instruction: parsed.data.instruction,
            action: parsed.data.action,
            value: parsed.data.value,
          }
        }
      };
      console.debug({ res })
    }
  }
};



  // const eventSource = await fetchEventSource('/api/chat', {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     agentEvents: state.agentEvents,
  //     validationState: validationState,
  //   }),
  //   method: "POST",
  //   onmessage: (e: any) => {
  //     console.log(e);
  //   },
  // });

  // const fetchData = async () => {
  //     await fetchEventSource(`/api/chat2`, {
  //       method: "POST",
  //       headers: {
  //         Accept: "text/event-stream",
  //       },
  //       body: JSON.stringify({
  //         messages: [
  //           {
  //             role: "user",
  //             content: "Hello",
  //           },
  //         ],
  //       }),
  //       // body: JSON.stringify({
  //       //   agentEvents: state.agentEvents,
  //       //   validationState: validationState,
  //       // }),
  //       onopen: async (res) => {
  //         if (res.ok && res.status === 200) {
  //           console.log("Connection made ", res);
  //         } else if (
  //           res.status >= 400 &&
  //           res.status < 500 &&
  //           res.status !== 429
  //         ) {
  //           console.log("Client side error ", res);
  //         }
  //       },
  //       onmessage(event) {
  //         console.log(event.data);
  //       },
  //       onclose() {
  //         console.log("Connection closed by the server");
  //       },
  //       onerror(err) {
  //         console.log("There was an error from server", err);
  //       },
  //     });
  //   };
  //   fetchData();

  // const eventSource = new SSE("/api/chat", {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   payload: JSON.stringify({
  //     agentEvents: state.agentEvents,
  //     validationState: validationState,
  //   }),
  //   method: "POST",
  // });
  // function handleError<T>(err: T) {
  //   console.error(err);
  // }

  // eventSource.addEventListener("error", handleError);
  // eventSource.addEventListener("message", (e: any) => {
  //   console.log({ data: e.data });
  // });
  // eventSource.stream();