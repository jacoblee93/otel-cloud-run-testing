"use client";

import { ToolInvocation } from "ai";
import { Message, useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,
      api: "http://localhost:3004/chat",
      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === "getLocation") {
          const cities = [
            "New York",
            "Los Angeles",
            "Chicago",
            "San Francisco",
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages?.map((m: Message) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.content}
          {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            const toolCallId = toolInvocation.toolCallId;
            const addResult = (result: string) =>
              addToolResult({ toolCallId, result });

            // render confirmation tool (client-side tool with user interaction)
            if (toolInvocation.toolName === "askForConfirmation") {
              return (
                <div key={toolCallId}>
                  {toolInvocation.args.message}
                  <div>
                    {"result" in toolInvocation ? (
                      <b>{toolInvocation.result}</b>
                    ) : (
                      <>
                        <button onClick={() => addResult("Yes")}>Yes</button>
                        <button onClick={() => addResult("No")}>No</button>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            // other tools:
            return "result" in toolInvocation ? (
              <div key={toolCallId}>
                Tool call {`${toolInvocation.toolName}: `}
                {toolInvocation.result}
              </div>
            ) : (
              <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
            );
          })}
          <br />
        </div>
      ))}

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
