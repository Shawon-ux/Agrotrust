import React, { useEffect, useState } from "react";
import api from "../../api";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/notifications");
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Notifications</h1>
            <p className="subhead">Updates about your activity.</p>
          </div>
          <button className="btn" onClick={load}>Refresh</button>
        </div>
      </div>

      {err && <div className="error">{err}</div>}
      {loading ? (
        <div className="card">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card">No notifications</div>
      ) : (
        items.map((n) => (
          <div className="card" key={n._id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <h3 style={{ margin: 0 }}>{n.title}</h3>
                <p style={{ marginTop: 6, color: "var(--muted)" }}>{n.message}</p>
              </div>
              {!n.isRead && (
                <button className="btn" onClick={() => markRead(n._id)}>Mark read</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
