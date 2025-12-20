import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import TradeModal from "../../components/TradeModal";
import { useAuth } from "../../context/AuthContext";

// --- Image fallbacks (only used if crop has no image) ---
const FALLBACK_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Agriculture_in_Bangladesh.jpg/1200px-Agriculture_in_Bangladesh.jpg";

const CropList = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | AVAILABLE | SOLD_OUT

  const fetchCrops = async () => {
    try {
      setErr("");
      setLoading(true);

      const res = await api.get("/crops");
      const list = Array.isArray(res.data) ? res.data : res.data?.crops || [];

      // Only show real crops from DB — no fallback demo data
      setCrops(list.map(normalizeCrop));
    } catch (e) {
      console.error("Failed to fetch crops:", e);
      setErr("Could not load crops from server.");
      setCrops([]); // Clear crops on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // normalize DB crop -> UI crop
  const normalizeCrop = (c) => {
    const name = c.name || c.cropName || "Unknown";
    const qty = c.quantityKg ?? c.quantityAvailable ?? c.quantity ?? 0;
    const price = c.pricePerKg ?? c.pricePerUnit ?? c.price ?? 0;
    const unit = c.unit || "kg";
    const statusFromQty = Number(qty) > 0 ? "AVAILABLE" : "SOLD_OUT";
    const status = (c.status || statusFromQty).toUpperCase();

    return {
      ...c,
      name,
      pricePerKg: Number(price),
      quantityKg: Number(qty),
      unit,
      status,
      variety: c.variety || "",
      location: c.location || "Bangladesh",
    };
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return crops.filter((c) => {
      const matchesText =
        !text ||
        (c.name || "").toLowerCase().includes(text) ||
        (c.variety || "").toLowerCase().includes(text) ||
        (c.location || "").toLowerCase().includes(text);

      const status = (c.status || "AVAILABLE").toUpperCase();
      const matchesFilter = filter === "ALL" || status === filter;

      return matchesText && matchesFilter;
    });
  }, [crops, q, filter]);

  const getImageForCrop = (c) => {
    const raw = c.image || c.imageUrl || c.photo;
    if (raw && typeof raw === "string") {
      return raw; // supports both http:// and /uploads/ paths
    }

    // No image → use generic fallback
    return FALLBACK_IMG;
  };

  // ADMIN ONLY: toggle availability
  const toggleAvailability = async (crop) => {
    try {
      if (!isAdmin) return;

      const soldOut = (crop.status || "").toUpperCase() === "SOLD_OUT";
      await api.patch(`/crops/${crop._id}/availability`, {
        available: soldOut, // if currently sold out → make available, and vice versa
      });

      fetchCrops(); // refresh list
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update availability");
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Available Crops</h1>
            <p className="subhead">Browse crops with price and quantity.</p>
          </div>

          <div className="hero-actions" style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={fetchCrops}>Refresh</button>

            {isAdmin && (
              <button className="btn btn-primary" onClick={() => nav("/crops/admin/add")}>
                + Add Crop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            className="input"
            placeholder="Search by crop, variety, or location..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="chips">
          <button className={`chip ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
            All
          </button>
          <button className={`chip ${filter === "AVAILABLE" ? "active" : ""}`} onClick={() => setFilter("AVAILABLE")}>
            Available
          </button>
          <button className={`chip ${filter === "SOLD_OUT" ? "active" : ""}`} onClick={() => setFilter("SOLD_OUT")}>
            Sold Out
          </button>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="card">Loading crops...</div>
      ) : crops.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No crops available</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            {isAdmin ? "Add a new crop to get started." : "Check back later for available crops."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No crops match your filter</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <div className="crop-grid">
          {filtered.map((c) => {
            const status = (c.status || "AVAILABLE").toUpperCase();
            const soldOut = status === "SOLD_OUT" || Number(c.quantityKg ?? 0) <= 0;
            const img = getImageForCrop(c);

            return (
              <div className="crop-card" key={c._id}>
                <div className="crop-media">
                  <img
                    className="crop-img"
                    src={img}
                    alt={c.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="crop-body">
                  <div className="crop-top">
                    <div>
                      <h3 className="crop-name">{c.name}</h3>
                      <p className="crop-meta">
                        {c.variety ? `${c.variety} • ` : ""}
                        {c.location || "Bangladesh"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span className={`badge ${soldOut ? "soldout" : ""}`}>
                        {soldOut ? "SOLD OUT" : "AVAILABLE"}
                      </span>

                      {isAdmin && (
                        <button
                          className="btn"
                          style={{ padding: "6px 10px" }}
                          onClick={() => toggleAvailability(c)}
                        >
                          {soldOut ? "Make Available" : "Mark Sold Out"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="crop-row">
                    <div className="kpi">
                      <p className="label">Price</p>
                      <p className="value">৳ {c.pricePerKg}/{c.unit}</p>
                    </div>
                    <div className="kpi">
                      <p className="label">Qty</p>
                      <p className="value">{c.quantityKg} {c.unit}</p>
                    </div>
                  </div>

                  <div className="crop-actions">
                    <button
                      className="btn btn-primary"
                      disabled={!user || (user?.role === "BUYER" && soldOut)}
                      onClick={() => {
                        setSelectedCrop(c);
                        setTradeOpen(true);
                      }}
                    >
                      {user?.role === "FARMER" ? "💰 Sell" : "🛒 Order"}
                    </button>

                    <button className="btn">Details</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TradeModal
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        crop={selectedCrop}
        user={user}
        onSuccess={fetchCrops}
      />
    </div>
  );
};

export default CropList;