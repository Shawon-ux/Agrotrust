// src/pages/Dashboard/FarmerDashboard.js
import React, { useEffect, useState } from "react";
import api from "../../api";
import DashBanner from "../../components/DashBanner";

const FarmerDashboard = () => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/farmer");
        setData(res.data);
      } catch (e) {
        console.error(e);
        setErr("Failed to load farmer dashboard");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <DashBanner />

      {err && <div className="error">{err}</div>}
      {!data ? (
        <div className="card">Loading dashboard...</div>
      ) : (
        <div className="grid">
          <div className="card stat">
            <div className="card-title">
              <h3>Crops</h3>
              <span className="mini">Your listed items</span>
            </div>
            <p className="stat-value">{data.cropCount}</p>
            <p className="stat-label">Total crops you have added</p>
          </div>

          <div className="card stat">
            <div className="card-title">
              <h3>Orders</h3>
              <span className="mini">Incoming sales</span>
            </div>
            <p className="stat-value">{data.ordersCount}</p>
            <p className="stat-label">Orders placed for your crops</p>
          </div>

          <div className="card stat">
            <div className="card-title">
              <h3>Subsidies</h3>
              <span className="mini">Government support</span>
            </div>
            <p className="stat-value">{data.subsidyCount}</p>
            <p className="stat-label">Applications tracked in system</p>
          </div>

          <div className="card span-8">
            <div className="card-title">
              <h3>Quick Suggestions</h3>
              <span className="mini">Next actions</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)" }}>
              <li>Add a crop listing to start receiving buyer orders.</li>
              <li>Check Market Prices to set competitive pricing.</li>
              <li>Apply for a subsidy if eligible for programs.</li>
            </ul>
          </div>

          <div className="card span-4">
            <div className="card-title">
              <h3>Status</h3>
              <span className="mini">System health</span>
            </div>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              ✅ You are logged in and your dashboard is synced.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
