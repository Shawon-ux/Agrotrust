import React, { useState } from "react";
import api from "../../api";

export default function ChatbotPage() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [err, setErr] = useState("");

  const send = async () => {
    if (!msg.trim()) return;
    setErr("");

    const userText = msg.trim();
    setChat((c) => [...c, { from: "me", text: userText }]);
    setMsg("");

    try {
      const res = await api.post("/chatbot/ask", { message: userText });
      setChat((c) => [...c, { from: "bot", text: res.data.reply }]);
    } catch (e) {
      setErr(e.response?.data?.message || "Chatbot failed");
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">Chatbot</h1>
        <p className="subhead">Ask about crops, subsidies, and complaints.</p>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="card" style={{ minHeight: 320 }}>
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <b>{m.from === "me" ? "You" : "Bot"}:</b> {m.text}
          </div>
        ))}
      </div>

      <div className="card" style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input className="input" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type..." />
        <button className="btn btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}
