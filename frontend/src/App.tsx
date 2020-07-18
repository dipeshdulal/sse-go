import React, { useEffect } from "react";
import "./App.css";

import { useBufferedState } from "./useBufferedState";

let es: EventSource | null;

function App() {
  const [buffer, push] = useBufferedState(10);
  const url = "http://localhost:5000";

  const handleStreamStart = () => {
    if (!es) {
      es = new EventSource(`${url}/sse`);
      push("event source start");
      es.onmessage = (msg) => {
        push(msg.data);
      };
    }
  };

  const handleStreamStop = () => {
    if (es) {
      es.close();
      push("close event source");
      es = null;
    }
  };

  const sendRequest = async (method: string) => {
    await fetch(`${url}/log`, {
      body: method != "GET" ? Math.random().toString() : null,
      method
    })
  } 

  return (
    <div className="App">
      <h1>Event Streaming </h1>
      <button onClick={handleStreamStart}>Start Streaming</button>
      <button onClick={handleStreamStop}>Stop Streaming</button>
      <br />
      <br />
      <button onClick={() => sendRequest("POST")}>POST TO /log</button>
      <button onClick={() => sendRequest("GET")}>GET TO /log</button>
      <button onClick={() => sendRequest("DELETE")}>
        DELETE TO /log
      </button>
      <button onClick={() => sendRequest("PATCH")}>
        PATCH TO /log
      </button>
      <br />
      <div className="Streams">
        {buffer.map((d, i) => (
          <pre key={i + Math.random()}>{d}</pre>
        ))}
      </div>
    </div>
  );
}

export default App;
