import React, { useMemo, useState } from "react";
import api from "../api";

const TradeModal = ({ open, onClose, crop, user, onSuccess }) => {
  const role = user?.role;
  const isBuyer = role === "BUYER";
  const isFarmer = role === "FARMER";

  const defaultUnit = crop?.unit || "kg";

  const [mode, setMode] = useState(isFarmer ? "SELL" : "BUY"); // BUY or SELL
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState(crop?.pricePerKg ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const maxQty = useMemo(() => Number(crop?.quantityKg ?? 0), [crop]);

  if (!open) return null;

  const submit = async () => {
    try {
      setErr("");
      setLoading(true);

      // BUYER flow -> create order
      if (mode === "BUY") {
        const q = Number(qty);
        if (!q || q <= 0) return setErr("Quantity must be greater than 0.");
        if (q > maxQty) return setErr(`Only ${maxQty} ${defaultUnit} available.`);

        await api.post("/orders", {
          cropId: crop._id,
          quantity: q,
        });

        onSuccess?.();
        onClose();
        return;
      }

      // FARMER flow -> create listing (new crop)
      if (mode === "SELL") {
        const q = Number(qty);
        const p = Number(price);

        if (!p || p <= 0) return setErr("Price must be greater than 0.");
        if (!q || q <= 0) return setErr("Quantity must be greater than 0.");

        await api.post("/crops", {
          cropName: crop?.name,        // normalized field name
          variety: crop?.variety,
          location: crop?.location,
          pricePerUnit: p,
          quantityAvailable: q,
          unit: defaultUnit,
          status: "AVAILABLE",
          image: crop?.image,
        });

        onSuccess?.();
        onClose();
      }
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  // permissions: buyer can only buy, farmer can only sell
  const canBuy = isBuyer;
  const canSell = isFarmer;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: "min(560px, 100%)", borderRadius: 18, padding: 18 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>{crop?.name}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
              {crop?.variety ? `${crop.variety} • ` : ""}
              {crop?.location || "Bangladesh"}
            </p>
          </div>

          <button className="btn" onClick={onClose}>✕</button>
        </div>

        {/* Mode switch */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            className={`chip ${mode === "BUY" ? "active" : ""}`}
            onClick={() => canBuy && setMode("BUY")}
            disabled={!canBuy}
            style={{ opacity: canBuy ? 1 : 0.5, cursor: canBuy ? "pointer" : "not-allowed" }}
          >
            🛒 Buy
          </button>

          <button
            className={`chip ${mode === "SELL" ? "active" : ""}`}
            onClick={() => canSell && setMode("SELL")}
            disabled={!canSell}
            style={{ opacity: canSell ? 1 : 0.5, cursor: canSell ? "pointer" : "not-allowed" }}
          >
            💰 Sell
          </button>
        </div>

        {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {mode === "BUY" && (
            <>
              <div className="kpi">
                <p className="label">Available</p>
                <p className="value">{maxQty} {defaultUnit}</p>
              </div>

              <div>
                <label className="mini">Quantity to buy ({defaultUnit})</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? "Buying..." : "Confirm Buy"}
              </button>
            </>
          )}

          {mode === "SELL" && (
            <>
              <div>
                <label className="mini">Price per {defaultUnit}</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="mini">Quantity to sell ({defaultUnit})</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? "Listing..." : "Create Sell Listing"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
