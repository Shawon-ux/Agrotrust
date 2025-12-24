import React, { useState } from "react";

export default function LedgerPage() {
  const [view, setView] = useState("HOME");

  const ledger = {
    farmer: { subsidy: 5000, listing: 200, fee: 50 },
    government: { subsidy: 5000, verify: 500, admin: 300 },
    admin: { system: 300, audit: 200, ops: 400 },
    buyer: { purchase: 7000, fee: 200 },
  };

  const daily = [
    ["Farmer", "Subsidy Received", 5000],
    ["Government", "Subsidy Paid", 5000],
    ["Government", "Verification Cost", 500],
    ["Admin", "System Operation Cost", 300],
    ["Buyer", "Crop Purchase", 7000],
    ["Buyer", "Platform Fee", 200],
  ];

  const farmerNet = ledger.farmer.subsidy - ledger.farmer.listing - ledger.farmer.fee;
  const govTotal = ledger.government.subsidy + ledger.government.verify + ledger.government.admin;
  const adminTotal = ledger.admin.system + ledger.admin.audit + ledger.admin.ops;
  const buyerTotal = ledger.buyer.purchase + ledger.buyer.fee;

  const RoleCard = ({ title, color, onClick }) => (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${color}, #000)`,
        padding: 30,
        borderRadius: 20,
        color: "#fff",
        cursor: "pointer",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
      }}
    >
      <h2>{title}</h2>
      <p style={{ opacity: 0.8 }}>View financial ledger</p>
    </div>
  );

  const BackBtn = () => (
    <button
      onClick={() => setView("HOME")}
      style={{
        marginTop: 30,
        padding: "12px 30px",
        borderRadius: 30,
        border: "none",
        background: "linear-gradient(135deg,#3498db,#2ecc71)",
        color: "#fff",
        fontSize: 16,
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      }}
    >
      ⬅ Back to Ledger
    </button>
  );

  const StatBox = ({ label, value, color }) => (
    <div
      style={{
        flex: 1,
        background: color,
        color: "#fff",
        padding: 20,
        borderRadius: 16,
        textAlign: "center",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      }}
    >
      <h4>{label}</h4>
      <h2>৳{value}</h2>
    </div>
  );

  if (view === "HOME")
    return (
      <div className="container">
        <h1 className="h1">Blockchain Financial Ledger</h1>
        <p className="subhead">Smart subsidy & cost tracking system</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 25 }}>
          <RoleCard title="👨‍🌾 Farmer" color="#27ae60" onClick={() => setView("FARMER")} />
          <RoleCard title="🏛 Government" color="#2980b9" onClick={() => setView("GOV")} />
          <RoleCard title="🧑‍💼 Admin" color="#8e44ad" onClick={() => setView("ADMIN")} />
          <RoleCard title="🛒 Buyer" color="#f39c12" onClick={() => setView("BUYER")} />
          <RoleCard title="📅 Daily Ledger" color="#2c3e50" onClick={() => setView("DAILY")} />
        </div>
      </div>
    );

  const FancyCalc = (title, stats, totalLabel, totalValue) => (
    <div className="container">
      <h2>{title}</h2>
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {stats}
      </div>
      <div
        style={{
          marginTop: 30,
          background: "#111",
          color: "#0f0",
          padding: 25,
          borderRadius: 16,
          fontSize: 22,
          textAlign: "center",
        }}
      >
        {totalLabel}: ৳{totalValue}
      </div>
      <BackBtn />
    </div>
  );

  if (view === "FARMER")
    return FancyCalc(
      "👨‍🌾 Farmer Ledger",
      <>
        <StatBox label="Subsidy" value={ledger.farmer.subsidy} color="#2ecc71" />
        <StatBox label="Listing Cost" value={ledger.farmer.listing} color="#e67e22" />
        <StatBox label="Transaction Fee" value={ledger.farmer.fee} color="#e74c3c" />
      </>,
      "Net Farmer Income",
      farmerNet
    );

  if (view === "GOV")
    return FancyCalc(
      "🏛 Government Ledger",
      <>
        <StatBox label="Subsidy Paid" value={ledger.government.subsidy} color="#3498db" />
        <StatBox label="Verification" value={ledger.government.verify} color="#9b59b6" />
        <StatBox label="Admin Cost" value={ledger.government.admin} color="#e74c3c" />
      </>,
      "Total Government Spending",
      govTotal
    );

  if (view === "ADMIN")
    return FancyCalc(
      "🧑‍💼 Admin Ledger",
      <>
        <StatBox label="System" value={ledger.admin.system} color="#1abc9c" />
        <StatBox label="Audit" value={ledger.admin.audit} color="#f39c12" />
        <StatBox label="Daily Ops" value={ledger.admin.ops} color="#e67e22" />
      </>,
      "Total Admin Cost",
      adminTotal
    );

  if (view === "BUYER")
    return FancyCalc(
      "🛒 Buyer Ledger",
      <>
        <StatBox label="Purchase" value={ledger.buyer.purchase} color="#f1c40f" />
        <StatBox label="Platform Fee" value={ledger.buyer.fee} color="#e74c3c" />
      </>,
      "Total Buyer Cost",
      buyerTotal
    );

  if (view === "DAILY")
    return (
      <div className="container">
        <h2>📅 Daily Ledger – 15 March 2025</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead style={{ background: "#000", color: "#fff" }}>
            <tr>
              <th>Role</th>
              <th>Cost Type</th>
              <th>BDT</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((x, i) => (
              <tr key={i} style={{ background: i % 2 ? "#eee" : "#fff" }}>
                <td>{x[0]}</td>
                <td>{x[1]}</td>
                <td><b>{x[2]}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        <BackBtn />
      </div>
    );
}
