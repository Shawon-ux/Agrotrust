// src/pages/Farm/FarmPlanPage.js — land details & crop lifecycle (FR-5, FR-10)
import React, { useCallback, useEffect, useState } from "react";
import api from "../../api";
import { useLang } from "../../context/LanguageContext";

const STAGES = ["PLANNED", "SOWN", "GROWING", "HARVESTED"];
const ICON = { PLANNED: "📝", SOWN: "🌱", GROWING: "🌿", HARVESTED: "🧺" };
const empty = { cropName: "", landArea: "", landUnit: "acre", landLocation: "", expectedYieldKg: "", sowingDate: "", expectedHarvestDate: "" };

const FarmPlanPage = () => {
  const { t } = useLang();
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setPlans((await api.get("/farm-plans")).data.plans); } catch (e) { setError(e.response?.data?.message || "Failed to load"); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    try { setError(""); await api.post("/farm-plans", form); setForm(empty); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to save"); }
  };

  const advance = async (p) => {
    const next = STAGES[STAGES.indexOf(p.stage) + 1];
    if (!next) return;
    let actualYieldKg;
    if (next === "HARVESTED") {
      const v = window.prompt("Actual harvest (kg)?");
      if (v === null) return;
      actualYieldKg = Number(v) || undefined;
    }
    try { await api.patch(`/farm-plans/${p._id}/stage`, { stage: next, actualYieldKg }); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to update"); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.cropName} plan?`)) return;
    await api.delete(`/farm-plans/${p._id}`); load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div className="container">
      <div className="hero"><h1 className="h1">{t("farmTitle")}</h1><p className="subhead" style={{ marginBottom: 0 }}>{t("farmSub")}</p></div>
      {error && <div className="error">{error}</div>}

      <form className="card" onSubmit={create} style={{ marginBottom: 20 }}>
        <div className="card-title"><h3>➕ New crop plan</h3></div>
        <div className="fp-form">
          <input className="input" placeholder="Crop (e.g. Rice)" value={form.cropName} onChange={set("cropName")} required />
          <input className="input" type="number" min="0.01" step="0.01" placeholder="Land area" value={form.landArea} onChange={set("landArea")} required />
          <select className="input" value={form.landUnit} onChange={set("landUnit")}>
            {["acre", "hectare", "bigha", "decimal"].map((u) => <option key={u}>{u}</option>)}
          </select>
          <input className="input" placeholder="Land location" value={form.landLocation} onChange={set("landLocation")} />
          <input className="input" type="number" min="0" placeholder="Expected yield (kg)" value={form.expectedYieldKg} onChange={set("expectedYieldKg")} />
          <label className="mini">Sowing date<input className="input" type="date" value={form.sowingDate} onChange={set("sowingDate")} /></label>
          <label className="mini">Expected harvest<input className="input" type="date" value={form.expectedHarvestDate} onChange={set("expectedHarvestDate")} /></label>
          <button className="btn btn-primary" type="submit">{t("save")}</button>
        </div>
      </form>

      {plans.length === 0 ? <div className="card">No crop plans yet — add your first one above.</div> : (
        <div className="fp-grid">
          {plans.map((p) => {
            const idx = STAGES.indexOf(p.stage);
            return (
              <div className="card" key={p._id}>
                <div className="mp-top">
                  <div><h3 style={{ margin: 0 }}>{p.cropName}</h3><span className="mini">📍 {p.landLocation || "—"} · {p.landArea} {p.landUnit}</span></div>
                  <span className="badge">{ICON[p.stage]} {p.stage}</span>
                </div>
                <div className="fp-steps">
                  {STAGES.map((s, i) => (
                    <div key={s} className={`fp-step ${i <= idx ? "done" : ""}`}><span>{ICON[s]}</span><small>{s}</small></div>
                  ))}
                </div>
                <div className="mini">Sown: {fmt(p.sowingDate)} · Harvest due: {fmt(p.expectedHarvestDate)}</div>
                <div className="mini">Expected: {p.expectedYieldKg ?? "—"} kg · Actual: {p.actualYieldKg ?? "—"} kg</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {idx < STAGES.length - 1 && <button className="btn btn-primary" onClick={() => advance(p)}>Move to {STAGES[idx + 1]} →</button>}
                  <button className="btn btn-danger" onClick={() => remove(p)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmPlanPage;
