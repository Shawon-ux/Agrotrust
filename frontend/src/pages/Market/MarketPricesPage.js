// src/pages/Market/MarketPricesPage.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const Sparkline = ({ points, up }) => {
  if (points.length < 2) return <div className="mp-spark-empty">—</div>;
  const w = 120, h = 36;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((v, i) => `${i ? "L" : "M"}${(i / (points.length - 1)) * w},${h - 4 - ((v - min) / span) * (h - 8)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const MarketPricesPage = () => {
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [form, setForm] = useState({ cropName: "", region: "", pricePerUnit: "" });
  const [ok, setOk] = useState("");

  const canEdit = ["ADMIN", "GOV_OFFICIAL"].includes(user?.role);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/market-prices");
      setPrices(res.data.prices || []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load prices");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // group by crop+region -> history oldest..newest
  const rows = useMemo(() => {
    const map = new Map();
    [...prices].reverse().forEach((p) => {
      const k = `${p.cropName}|${p.region}`;
      if (!map.has(k)) map.set(k, { cropName: p.cropName, region: p.region, history: [] });
      map.get(k).history.push({ v: p.pricePerUnit, at: p.createdAt });
    });
    return [...map.values()].map((r) => {
      const last = r.history[r.history.length - 1];
      const prev = r.history[r.history.length - 2];
      const change = prev ? ((last.v - prev.v) / prev.v) * 100 : 0;
      return { ...r, latest: last, change, series: r.history.slice(-14).map((h) => h.v) };
    });
  }, [prices]);

  const crops = useMemo(() => [...new Set(rows.map((r) => r.cropName))].sort(), [rows]);
  const regions = useMemo(() => [...new Set(rows.map((r) => r.region))].sort(), [rows]);
  const shown = rows
    .filter((r) => (crop === "ALL" || r.cropName === crop) && (region === "ALL" || r.region === region))
    .sort((a, b) => a.cropName.localeCompare(b.cropName) || a.region.localeCompare(b.region));

  const best = [...shown].sort((a, b) => b.latest.v - a.latest.v)[0];
  const avg = shown.length ? shown.reduce((s, r) => s + r.latest.v, 0) / shown.length : 0;

  const submit = async (e) => {
    e.preventDefault();
    try {
      setOk(""); setError("");
      await api.post("/market-prices", { ...form, pricePerUnit: Number(form.pricePerUnit) });
      setForm({ cropName: "", region: "", pricePerUnit: "" });
      setOk("Price added.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add price");
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">📈 Market Price Tracker</h1>
        <p className="subhead" style={{ marginBottom: 0 }}>Current commodity prices by market, with trend over time.</p>
      </div>

      {error && <div className="error">{error}</div>}
      {ok && <div className="success">{ok}</div>}

      <div className="grid" style={{ marginBottom: 16 }}>
        <div className="card stat" style={{ gridColumn: "span 4" }}>
          <p className="stat-label">Tracked markets</p><p className="stat-value">{shown.length}</p>
        </div>
        <div className="card stat" style={{ gridColumn: "span 4" }}>
          <p className="stat-label">Average price (৳/kg)</p><p className="stat-value">{avg ? avg.toFixed(1) : "—"}</p>
        </div>
        <div className="card stat" style={{ gridColumn: "span 4" }}>
          <p className="stat-label">Highest right now</p>
          <p className="stat-value">{best ? `${best.cropName} ${best.latest.v}` : "—"}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="chips">
          <select className="input" value={crop} onChange={(e) => setCrop(e.target.value)} style={{ width: 180 }}>
            <option value="ALL">All crops</option>
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: 180 }}>
            <option value="ALL">All regions</option>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading prices…</div>
      ) : shown.length === 0 ? (
        <div className="card">
          <b>No prices yet.</b>
          <p className="mini">{canEdit ? "Add the first price below." : "An admin or government official will publish market prices here."}</p>
        </div>
      ) : (
        <div className="mp-grid">
          {shown.map((r) => {
            const up = r.change >= 0;
            return (
              <div className="card mp-card" key={r.cropName + r.region}>
                <div className="mp-top">
                  <div>
                    <h3>{r.cropName}</h3>
                    <span className="mini">📍 {r.region}</span>
                  </div>
                  <span className={`mp-change ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(r.change).toFixed(1)}%</span>
                </div>
                <div className="mp-price">৳{r.latest.v}<small>/kg</small></div>
                <Sparkline points={r.series} up={up} />
                <div className="mini">Updated {new Date(r.latest.at).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {canEdit && (
        <form className="card" onSubmit={submit} style={{ marginTop: 20 }}>
          <div className="card-title"><h3>➕ Publish a price</h3></div>
          <div className="mp-form">
            <input className="input" placeholder="Crop (e.g. Rice)" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} required />
            <input className="input" placeholder="Region / market" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
            <input className="input" type="number" min="0.1" step="0.1" placeholder="Price per kg" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} required />
            <button className="btn btn-primary" type="submit">Publish</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MarketPricesPage;
