import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";

const SearchPage = () => {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("all"); // all | crops | complaints | subsidies | education | orders
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    crops: [],
    complaints: [],
    subsidies: [],
    education: [],
    orders: [],
  });

  const runSearch = async (queryText, selectedScope) => {
    const text = (queryText ?? q).trim();
    if (!text) return;

    try {
      setErr("");
      setLoading(true);

      const res = await api.get("/search", {
        params: { q: text, scope: selectedScope ?? scope },
      });

      setData({
        crops: res.data?.crops || [],
        complaints: res.data?.complaints || [],
        subsidies: res.data?.subsidies || [],
        education: res.data?.education || [],
        orders: res.data?.orders || [],
      });
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // optional: do nothing on mount
  }, []);

  const total = useMemo(() => {
    return (
      (data.crops?.length || 0) +
      (data.complaints?.length || 0) +
      (data.subsidies?.length || 0) +
      (data.education?.length || 0) +
      (data.orders?.length || 0)
    );
  }, [data]);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Search</h1>
            <p className="subhead">Search across crops, complaints, subsidies, education, and orders.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="form" style={{ gridTemplateColumns: "1fr 180px 140px", alignItems: "center" }}>
          <input
            className="input"
            value={q}
            placeholder="Type something like: rice, Bogura, subsidy, late delivery..."
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
          />

          <select className="input" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">All</option>
            <option value="crops">Crops</option>
            <option value="complaints">Complaints</option>
            <option value="subsidies">Subsidies</option>
            <option value="education">Education</option>
            <option value="orders">Orders</option>
          </select>

          <button className="btn btn-primary" onClick={() => runSearch()}>
            Search
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        <div style={{ marginTop: 12, color: "var(--muted)" }}>
          {loading ? "Searching..." : total ? `Found ${total} result(s)` : "No results yet."}
        </div>
      </div>

      {/* RESULTS */}
      {!loading && total > 0 && (
        <div className="grid" style={{ marginTop: 14 }}>
          {data.crops?.length > 0 && (
            <div className="card span-12">
              <div className="card-title">
                <h3>Crops</h3>
                <span className="mini">{data.crops.length} found</span>
              </div>
              {data.crops.map((c) => (
                <div key={c._id} className="tl-item">
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-title">{c.cropName || c.name}</div>
                    <div className="tl-sub">
                      {c.location || "Bangladesh"} • ৳ {c.pricePerUnit ?? c.pricePerKg ?? 0} / {c.unit || "kg"} • Qty{" "}
                      {c.quantityAvailable ?? c.quantityKg ?? 0}
                    </div>
                  </div>
                  <div className="tl-time">{(c.status || "").toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          {data.complaints?.length > 0 && (
            <div className="card span-12">
              <div className="card-title">
                <h3>Complaints</h3>
                <span className="mini">{data.complaints.length} found</span>
              </div>
              {data.complaints.map((x) => (
                <div key={x._id} className="tl-item">
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-title">{x.type || "Complaint"}</div>
                    <div className="tl-sub">{x.description || ""}</div>
                  </div>
                  <div className="tl-time">{(x.status || "").toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          {data.subsidies?.length > 0 && (
            <div className="card span-12">
              <div className="card-title">
                <h3>Subsidies</h3>
                <span className="mini">{data.subsidies.length} found</span>
              </div>
              {data.subsidies.map((x) => (
                <div key={x._id} className="tl-item">
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-title">{x.programName || "Subsidy"}</div>
                    <div className="tl-sub">{x.description || ""}</div>
                  </div>
                  <div className="tl-time">{(x.status || "").toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          {data.education?.length > 0 && (
            <div className="card span-12">
              <div className="card-title">
                <h3>Education</h3>
                <span className="mini">{data.education.length} found</span>
              </div>
              {data.education.map((x) => (
                <div key={x._id} className="tl-item">
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-title">{x.title || "Education"}</div>
                    <div className="tl-sub">{x.summary || x.content || ""}</div>
                  </div>
                  <div className="tl-time">{x.category || ""}</div>
                </div>
              ))}
            </div>
          )}

          {data.orders?.length > 0 && (
            <div className="card span-12">
              <div className="card-title">
                <h3>Orders</h3>
                <span className="mini">{data.orders.length} found</span>
              </div>
              {data.orders.map((x) => (
                <div key={x._id} className="tl-item">
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-title">Order #{String(x._id).slice(-6)}</div>
                    <div className="tl-sub">
                      {x.cropName || x.crop?.cropName || "Crop"} • Qty {x.quantity || 0} • ৳ {x.total || 0}
                    </div>
                  </div>
                  <div className="tl-time">{(x.status || "").toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
