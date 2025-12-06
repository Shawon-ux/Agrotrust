import React, { useEffect, useState } from "react";
import api from "../../api";

export default function LedgerPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      const res = await api.get("/ledger");
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load ledger (Admin/Gov only)");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">Blockchain Ledger</h1>
        <p className="subhead">Tamper-evident activity log (hash stored).</p>
      </div>

      {err && <div className="error">{err}</div>}

      {items.map((x) => (
        <div className="card" key={x._id} style={{ marginBottom: 10 }}>
          <b>{x.action}</b> • {x.refType} • {x.refId}
          <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>
            {x.dataHash}
          </div>
        </div>
      ))}
    </div>
  );
}
