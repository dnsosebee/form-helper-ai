"use client";

import { FunctionCallHandler } from "ai";
import { Message, useChat } from "ai/react";

// get pdf from '/fw4.pdf'

export default function Chat() {
  const functionCallHandler: FunctionCallHandler = async (chatMessages, functionCall) => {
    console.log("\n\n\n");
    console.log("functionCall", functionCall);
    console.log("chatMessages", chatMessages);
    return;
  };

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    experimental_onFunctionCall: functionCallHandler,
  });
  

  // Generate a map of message role to text color
  const roleToColorMap: Record<Message["role"], string> = {
    system: "red",
    user: "black",
    function: "blue",
    assistant: "green",
  };

  console.log("\n\n\n");
  // console.log("data", data);
  console.log("messages", messages);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m: Message) => (
            <div
              key={m.id}
              className="whitespace-pre-wrap"
              style={{ color: roleToColorMap[m.role] }}
            >
              <strong>{`${m.role}: `}</strong>
              {m.content || JSON.stringify(m.function_call)}
              <br />
              <br />
            </div>
          ))
        : null}
      <div id="chart-goes-here"></div>
      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
