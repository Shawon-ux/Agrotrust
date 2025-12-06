import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import TradeModal from "../../components/TradeModal";
import { useAuth } from "../../context/AuthContext";

const imageMap = {
  rice: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rice_field_in_Bangladesh.jpg/1200px-Rice_field_in_Bangladesh.jpg",
  wheat: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Wheat_field.jpg/1200px-Wheat_field.jpg",
  potato: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Patates.jpg/1200px-Patates.jpg",
  tomato: "https://commons.wikimedia.org/wiki/Special:FilePath/Tomatoes.jpg?width=1200",
  corn: "https://commons.wikimedia.org/wiki/Special:FilePath/Corncobs.jpg?width=1200",
  onion: "https://commons.wikimedia.org/wiki/Special:FilePath/Onions.jpg?width=1200",
};

const FALLBACK_IMG =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Agriculture%20in%20Bangladesh.jpg?width=1200";

const demoCrops = [
  { _id: "demo1", name: "Rice", variety: "BRRI Dhan-28", location: "Bogura", pricePerKg: 58, quantityKg: 1200, status: "AVAILABLE" },
  { _id: "demo2", name: "Wheat", variety: "Shatabdi", location: "Rajshahi", pricePerKg: 52, quantityKg: 800, status: "AVAILABLE" },
  { _id: "demo3", name: "Potato", variety: "Granola", location: "Munshiganj", pricePerKg: 32, quantityKg: 600, status: "AVAILABLE" },
  { _id: "demo4", name: "Tomato", variety: "Hybrid", location: "Jashore", pricePerKg: 70, quantityKg: 0, status: "SOLD_OUT" },
  { _id: "demo5", name: "Corn", variety: "Sweet Corn", location: "Dinajpur", pricePerKg: 45, quantityKg: 500, status: "AVAILABLE" },
  { _id: "demo6", name: "Onion", variety: "Local", location: "Pabna", pricePerKg: 95, quantityKg: 350, status: "AVAILABLE" },
];

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

const CropList = () => {
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

      if (list.length) {
        setCrops(list.map(normalizeCrop));
      } else {
        setCrops(demoCrops.map(normalizeCrop));
        setErr("No crops in database. Showing demo crops.");
      }
    } catch (e) {
      console.error(e);
      setCrops(demoCrops.map(normalizeCrop));
      setErr("Could not load crops from server. Showing demo crops.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (raw && typeof raw === "string" && raw.startsWith("http")) return raw;

    const key = (c.name || c.cropName || "").toLowerCase().trim();
    return imageMap[key] || FALLBACK_IMG;
  };

  // ✅ ADMIN ONLY: toggle availability
  const toggleAvailability = async (crop) => {
    try {
      if (!isAdmin) return;

      const soldOut =
        (crop.status || "").toUpperCase() === "SOLD_OUT" ||
        Number(crop.quantityKg ?? 0) <= 0;

      // if sold out => make available, else => mark sold out
      const makeAvailable = soldOut;

      await api.patch(`/crops/${crop._id}/availability`, {
        available: makeAvailable,
      });

      fetchCrops();
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
          <div className="hero-actions">
            <button className="btn" onClick={fetchCrops}>Refresh</button>
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
      ) : filtered.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No crops found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            Try a different search or filter.
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

                    {/* Badge + Admin toggle */}
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
                      {user?.role === "FARMER" ? "💰 Sell" : "🛒 Buy"}
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
