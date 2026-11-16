// src/pages/Dashboard/BuyerDashboard.js
import React from "react";
import { Link } from "react-router-dom";
import DashBanner from "../../components/DashBanner";

const tips = [
  ["🛡️", "Buy from verified farmers", "Look for the ✓ Verified badge before ordering."],
  ["💬", "Chat directly", "Message the farmer to agree on quantity and delivery."],
  ["🧾", "Keep your receipts", "Every order has a printable digital receipt."],
];

const BuyerDashboard = () => (
  <div className="container">
    <DashBanner />
    <div className="grid">
      {tips.map(([i, t, d]) => (
        <div className="card stat" key={t}>
          <div style={{ fontSize: 30 }}>{i}</div>
          <h3 style={{ margin: "8px 0 4px" }}>{t}</h3>
          <p className="stat-label">{d}</p>
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center", marginTop: 22 }}>
      <Link className="btn btn-primary" to="/crops">Start shopping →</Link>
    </div>
  </div>
);

export default BuyerDashboard;
