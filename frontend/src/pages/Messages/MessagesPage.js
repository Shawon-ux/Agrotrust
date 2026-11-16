// src/pages/Messages/MessagesPage.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import { useLang } from "../../context/LanguageContext";

const MessagesPage = () => {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const active = params.get("to");
  const [convos, setConvos] = useState([]);
  const [thread, setThread] = useState({ user: null, messages: [] });
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const loadConvos = useCallback(async () => {
    try { setConvos((await api.get("/messages/conversations")).data.conversations); } catch (e) { /* ignore */ }
  }, []);

  const loadThread = useCallback(async () => {
    if (!active) return;
    try {
      const res = await api.get(`/messages/with/${active}`);
      setThread({ user: res.data.user, messages: res.data.messages });
    } catch (e) { setError(e.response?.data?.message || "Failed to load chat"); }
  }, [active]);

  useEffect(() => { loadConvos(); const i = setInterval(loadConvos, 15000); return () => clearInterval(i); }, [loadConvos]);
  useEffect(() => { loadThread(); const i = setInterval(loadThread, 6000); return () => clearInterval(i); }, [loadThread]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread.messages.length]);

  useEffect(() => {
    const h = setTimeout(async () => {
      try { setContacts((await api.get("/messages/contacts", { params: { q } })).data.users); } catch (e) { /* ignore */ }
    }, 250);
    return () => clearTimeout(h);
  }, [q]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      setError("");
      await api.post("/messages", { to: active, text });
      setText("");
      await loadThread();
      loadConvos();
    } catch (err) { setError(err.response?.data?.message || "Failed to send"); }
  };

  return (
    <div className="container" style={{ width: "min(1300px, 95vw)" }}>
      <h1 className="h1">{t("msgTitle")}</h1>
      {error && <div className="error">{error}</div>}
      <div className="chat-layout">
        <aside className="card chat-side">
          <input className="input" placeholder={t("msgSearch")} value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chat-list">
            {q ? (
              contacts.map((u) => (
                <button key={u._id} className="chat-item" onClick={() => { setParams({ to: u._id }); setQ(""); }}>
                  <span className="chat-av">{u.name[0].toUpperCase()}</span>
                  <span><b>{u.name}</b><small>{u.role}</small></span>
                </button>
              ))
            ) : convos.length === 0 ? (
              <p className="mini" style={{ padding: 10 }}>{t("msgEmpty")}</p>
            ) : (
              convos.map((c) => (
                <button key={c.user._id} className={`chat-item ${active === c.user._id ? "on" : ""}`} onClick={() => setParams({ to: c.user._id })}>
                  <span className="chat-av">{c.user.name[0].toUpperCase()}</span>
                  <span className="chat-meta"><b>{c.user.name}</b><small>{c.lastText}</small></span>
                  {c.unread > 0 && <span className="chat-badge">{c.unread}</span>}
                </button>
              ))
            )}
          </div>
          {!q && <p className="mini" style={{ padding: "8px 10px" }}>{t("msgNew")}: {t("msgSearch")}</p>}
        </aside>

        <section className="card chat-main">
          {!active ? (
            <div className="chat-empty">💬<p>{t("msgPick")}</p></div>
          ) : (
            <>
              <div className="chat-head"><span className="chat-av">{thread.user?.name?.[0]?.toUpperCase()}</span><b>{thread.user?.name}</b> <small className="mini">{thread.user?.role}</small></div>
              <div className="chat-msgs">
                {thread.messages.map((m) => (
                  <div key={m._id} className={`bubble ${m.to === active ? "me" : "them"}`}>
                    {m.text}
                    <small>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="chat-form" onSubmit={send}>
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("msgPlaceholder")} maxLength={2000} />
                <button className="btn btn-primary" type="submit">{t("send")}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
