// src/components/TradeModal.js
import React, { useMemo, useState } from "react";
import api from "../api";

const TradeModal = ({ open, onClose, crop, user, onSuccess }) => {
  const role = user?.role;
  const isBuyer = role === "BUYER";
  const isFarmer = role === "FARMER";
  const isAdmin = role === "ADMIN";

  const defaultUnit = crop?.unit || "kg";

  // Admin can choose mode, others default based on role
  const [mode, setMode] = useState(isFarmer ? "SELL" : "BUY");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState(crop?.pricePerKg ?? "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const maxQty = useMemo(() => Number(crop?.quantityKg ?? 0), [crop]);

  if (!open) return null;

  const submit = async () => {
    try {
      setErr("");
      setLoading(true);

      // BUYER or ADMIN flow -> create order (cash on delivery)
      if (mode === "BUY") {
        const q = Number(qty);
        if (!q || q <= 0) return setErr("Quantity must be greater than 0.");
        if (q > maxQty) return setErr(`Only ${maxQty} ${defaultUnit} available.`);
        
        if (!shippingAddress.trim()) return setErr("Shipping address is required.");
        if (!contactNumber.trim()) return setErr("Contact number is required.");

        await api.post("/orders", {
          cropId: crop._id,
          quantity: q,
          shippingAddress,
          contactNumber,
          notes
        });

        alert("Order placed successfully! Payment: Cash on Delivery.");
        onSuccess?.();
        onClose();
        return;
      }

      // FARMER or ADMIN flow -> create listing (new crop)
      if (mode === "SELL") {
        const q = Number(qty);
        const p = Number(price);

        if (!p || p <= 0) return setErr("Price must be greater than 0.");
        if (!q || q <= 0) return setErr("Quantity must be greater than 0.");

        await api.post("/crops", {
          cropName: crop?.name,
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

  // permissions: buyer OR admin can buy, farmer OR admin can sell
  const canBuy = isBuyer || isAdmin;
  const canSell = isFarmer || isAdmin;

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
        style={{ width: "min(560px, 100%)", borderRadius: 18, padding: 18, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>{crop?.name}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
              {crop?.variety ? `${crop.variety} • ` : ""}
              {crop?.location || "Bangladesh"}
              {isAdmin && <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#666' }}>(Admin)</span>}
            </p>
          </div>

          <button className="btn" onClick={onClose}>✕</button>
        </div>

        {/* Mode switch - show both for ADMIN */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            className={`chip ${mode === "BUY" ? "active" : ""}`}
            onClick={() => canBuy && setMode("BUY")}
            disabled={!canBuy}
            style={{ opacity: canBuy ? 1 : 0.5, cursor: canBuy ? "pointer" : "not-allowed" }}
          >
            🛒 Buy (Cash on Delivery)
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
              <div className="kpi" style={{ background: "var(--surface)", padding: 12, borderRadius: 8 }}>
                <p className="label">Available</p>
                <p className="value">{maxQty} {defaultUnit}</p>
                <p className="mini" style={{ marginTop: 4 }}>
                  Price: ৳{crop?.pricePerKg || crop?.pricePerUnit || 0} per {defaultUnit}
                </p>
                {isAdmin && (
                  <p className="mini" style={{ marginTop: 4, color: '#666', fontStyle: 'italic' }}>
                    You are ordering as an administrator
                  </p>
                )}
              </div>

              <div>
                <label className="mini">Quantity to buy ({defaultUnit})</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max={maxQty}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              <div>
                <label className="mini">Shipping Address *</label>
                <textarea
                  className="input"
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your full shipping address"
                  required
                />
              </div>

              <div>
                <label className="mini">Contact Number *</label>
                <input
                  className="input"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="mini">Notes (Optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes"
                />
              </div>

              <div style={{ padding: 12, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }}>
                <p style={{ margin: 0, fontWeight: 600, color: "#0369a1" }}>
                  💰 Payment Method: Cash on Delivery
                </p>
                <p className="mini" style={{ marginTop: 4, color: "#0c4a6e" }}>
                  Pay when you receive the order
                </p>
              </div>

              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
              </button>
            </>
          )}

          {mode === "SELL" && (
            <>
              {isAdmin && (
                <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8, border: "1px solid #fbbf24" }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#92400e" }}>
                    ⚠️ You are creating a crop listing as an administrator
                  </p>
                </div>
              )}
              
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