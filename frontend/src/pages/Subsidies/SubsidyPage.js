import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function SubsidyPage() {
  const { user } = useAuth();
  const isFarmer = user?.role === "FARMER";
  const isAdminOrGov = ["ADMIN", "GOV_OFFICIAL"].includes(user?.role);

  const [subsidies, setSubsidies] = useState([]);
  const [mine, setMine] = useState([]);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      const s = await api.get("/subsidies");
      setSubsidies(s.data || []);
      if (isFarmer) {
        const m = await api.get("/subsidies/mine");
        setMine(m.data || []);
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load subsidies");
    }
  };

  const apply = async () => {
    if (!selected) return setErr("Select a subsidy first");
    await api.post("/subsidies/apply", { subsidyId: selected, note });
    setNote("");
    setSelected("");
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">Subsidies</h1>
        <p className="subhead">Apply and track subsidy applications.</p>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Active Subsidies</h3>
        {subsidies.length === 0 ? (
          <p>No subsidies available.</p>
        ) : (
          <ul>
            {subsidies.map((s) => (
              <li key={s._id}>
                <b>{s.title}</b> — ৳{s.amount} — {s.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isFarmer && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Apply</h3>
          <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select subsidy</option>
            {subsidies.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
          </select>

          <textarea className="input" style={{ height: 90, marginTop: 10 }}
            placeholder="Note (optional)"
            value={note} onChange={(e) => setNote(e.target.value)} />

          <button className="btn btn-primary" onClick={apply} style={{ marginTop: 10 }}>
            Apply
          </button>
        </div>
      )}

      {isFarmer && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>My Applications</h3>
          {mine.length === 0 ? (
            <p>No applications.</p>
          ) : (
            mine.map((a) => (
              <div key={a._id} style={{ padding: 10, borderBottom: "1px solid var(--border)" }}>
                <b>{a.subsidy?.title}</b> — <span>{a.status}</span>
                {a.adminReply ? <div style={{ marginTop: 6 }}>Reply: {a.adminReply}</div> : null}
              </div>
            ))
          )}
        </div>
      )}

      {isAdminOrGov && (
        <div className="card">
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Admin/Gov review UI can be added next (endpoint already ready: PATCH /api/subsidies/applications/:id).
          </p>
        </div>
      )}
    </div>
  );
}
