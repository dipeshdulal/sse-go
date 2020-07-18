import React, { useEffect } from "react";
import "./App.css";

import { useBufferedState } from "./useBufferedState";

let es: EventSource | null;

function App() {
  const [buffer, push] = useBufferedState(10);
  const url = "http://localhost:5000/sse";

  const handleStreamStart = () => {
    if (!es) {
      es = new EventSource(url);
      push("event source start")
      es.onmessage = (msg) => {
        push(msg.data);
      };
    }
  };

  const handleStreamStop = () => {
    if (es) {
      es.close();
      push("close event source")
      es = null;
    }
  };

  return (
    <div className="App">
      <h1>Event Streaming </h1>
      <button onClick={handleStreamStart}>Start Streaming</button>
      <button onClick={handleStreamStop}>Stop Streaming</button>
      <div className="Streams">
        {buffer.map((d, i) => (
          <pre key={i + Math.random()}>{d}</pre>
        ))}
      </div>
    </div>
  );
}

export default App;
