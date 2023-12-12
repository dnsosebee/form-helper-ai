import { proxy } from "valtio";
import { ValidationState } from "../shared/types/chatRequest";
import { State } from "./types/state";

import { FormValues } from "../shared/types/form";
import { Transport } from "../shared/types/transport";

// This can come from your database or API.
export const DEFAULT_FORM_VALUES: Partial<FormValues> = {
  bio: "I own a computer.",
  // urls: [{ value: "https://shadcn.com" }, { value: "http://twitter.com/shadcn" }],
};

const DEFAULT_STATE_VALUES: State = {
  agentEvents: [],
  responses: [],
  input: "",
};
export const state = proxy<State>(DEFAULT_STATE_VALUES);

const decoder = new TextDecoder();

export const loadResponse = async (validationState: ValidationState) => {
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentEvents: state.agentEvents,
      validationState: validationState,
    }),
  });

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  let name = "";
  let argumentsJson = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.debug("done");
      break;
    }

    const transport = Transport.parse(JSON.parse(decoder.decode(value)));
    if json.
    console.log(result);
  }

  // let rawText = "";
  // const id = nanoid();
  // const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  // while (true) {
  //   console.debug({ rawText })
  //   const { value, done } = await reader.read();
  //   if (done) break;
  //   console.debug({ value })
  //   rawText += value;
  //   console.debug({ rawText })
  //   const json = parse(rawText);
  //   console.debug({ json })
  //   const functionCall = json.function_call;
  //   if (!functionCall) {
  //     continue;
  //   }
  //   const name = functionCall.name;
  //   if (!name) {
  //     continue;
  //   }
  //   if (name === 'create_field_task_response_with_answer') {
  //     const argsJson = parse(functionCall.arguments);
  //     console.log({ argsJson })
  //     const parsed = fieldTaskZodSchema.merge(baseAnswerZodSchema).safeParse(argsJson || {});
  //     if (!parsed.success) {
  //       continue;
  //     }
  //     res.event = {
  //       status: "streaming",
  //       event: {
  //         id,
  //         agent: "assistant",
  //         target: "chat",
  //         action: "generateUI",
  //         answer: parsed.data.answer,
  //         task: {
  //           type: "field",
  //           target: parsed.data.target,
  //           instruction: parsed.data.instruction,
  //           action: parsed.data.action,
  //           value: parsed.data.value,
  //         }
  //       }
  //     };
  //     console.debug({ res })
  //   }
  // }
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
