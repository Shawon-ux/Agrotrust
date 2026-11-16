// src/pages/Analytics/AnalyticsPage.js
import React, { useEffect, useState } from "react";
import api from "../../api";

const COLORS = ["#22c55e", "#14b8a6", "#f59e0b", "#6366f1", "#ef4444", "#94a3b8"];

const Donut = ({ data }) => {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="an-donut">
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Distribution chart">
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--soft)" strokeWidth="22" />
        {total > 0 && entries.map(([k, v], i) => {
          const len = (v / total) * c;
          const el = (
            <circle key={k} cx="75" cy="75" r={r} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="22"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 75 75)" />
          );
          offset += len;
          return el;
        })}
        <text x="75" y="72" textAnchor="middle" fontSize="26" fontWeight="900" fill="var(--text)">{total}</text>
        <text x="75" y="92" textAnchor="middle" fontSize="11" fill="var(--muted)">total</text>
      </svg>
      <ul className="an-legend">
        {entries.length === 0 && <li className="mini">No data yet</li>}
        {entries.map(([k, v], i) => (
          <li key={k}><i style={{ background: COLORS[i % COLORS.length] }} />{k.replace(/_/g, " ")} <b>{v}</b></li>
        ))}
      </ul>
    </div>
  );
};

const Bars = ({ rows, valueKey, format = (v) => v }) => {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <div className="an-bars">
      {rows.map((r) => (
        <div className="an-bar" key={r.label}>
          <span className="an-bar-val">{format(r[valueKey])}</span>
          <div className="an-bar-track"><div className="an-bar-fill" style={{ height: `${(r[valueKey] / max) * 100}%` }} /></div>
          <span className="an-bar-label">{r.label}</span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/analytics/summary").then((r) => setD(r.data)).catch((e) => setErr(e.response?.data?.message || "Failed to load analytics"));
  }, []);

  if (err) return <div className="container"><div className="error">{err}</div></div>;
  if (!d) return <div className="container"><div className="card">Loading analytics…</div></div>;

  const kpis = [
    ["👥", "Total users", d.users],
    ["🌾", "Farmers", d.farmers],
    ["🛒", "Buyers", d.buyers],
    ["🥬", "Crop listings", d.crops],
    ["📦", "Orders", d.orders.total],
    ["💰", "Revenue", `৳${Math.round(d.orders.revenue).toLocaleString()}`],
    ["📣", "Complaints", d.complaints],
    ["✅", "Verified users", d.verification.VERIFIED || 0],
  ];
  const days = d.last7.map((x) => ({ ...x, label: new Date(x.date).toLocaleDateString(undefined, { weekday: "short" }) }));
  const maxTop = Math.max(1, ...d.topCrops.map((c) => c.orders));

  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">📊 Analytics</h1>
        <p className="subhead" style={{ marginBottom: 0 }}>Platform insights across users, trading, subsidies and complaints.</p>
      </div>

      <div className="an-kpis">
        {kpis.map(([i, l, v]) => (
          <div className="card an-kpi" key={l}><span className="an-ico">{i}</span><div><p className="stat-label">{l}</p><p className="an-val">{v}</p></div></div>
        ))}
      </div>

      <div className="an-grid">
        <div className="card an-wide">
          <div className="card-title"><h3>Orders — last 7 days</h3></div>
          <Bars rows={days} valueKey="orders" />
        </div>
        <div className="card">
          <div className="card-title"><h3>Verification status</h3></div>
          <Donut data={d.verification} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Order status</h3></div>
          <Donut data={d.orders.byStatus} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Subsidy applications</h3></div>
          <Donut data={d.subsidyApplications} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Complaints</h3></div>
          <Donut data={d.complaintStatus} />
        </div>
        <div className="card an-wide">
          <div className="card-title"><h3>🏆 Top crops by orders</h3></div>
          {d.topCrops.length === 0 ? <p className="mini">No orders yet.</p> : d.topCrops.map((c) => (
            <div className="an-hrow" key={c.name}>
              <span>{c.name}</span>
              <div className="an-htrack"><div style={{ width: `${(c.orders / maxTop) * 100}%` }} /></div>
              <b>{c.orders}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
