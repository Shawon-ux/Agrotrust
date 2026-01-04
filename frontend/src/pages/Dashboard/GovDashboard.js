// src/pages/Dashboard/GovDashboard.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const GovDashboard = () => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/government");
        setData(res.data);
      } catch (e) {
        console.error(e);
        setErr("Failed to load government dashboard");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Government Overview</h1>
            <p className="subhead">
              Monitor agricultural subsidies and compliance data.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/subsidies">Manage Subsidies</Link>
            <Link className="btn" to="/ledger">Agro Ledger</Link>
          </div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {!data ? (
        <div className="card">Loading dashboard...</div>
      ) : (
        <div className="grid">
          {/* Stats Cards */}
          <div className="card stat">
            <div className="card-title">
              <h3>Total Subsidies</h3>
              <span className="mini">Active & Inactive</span>
            </div>
            <p className="stat-value">{data.totalSubsidies}</p>
            <p className="stat-label">Programs created in system</p>
          </div>

          <div className="card stat">
            <div className="card-title">
              <h3>Approved Grants</h3>
              <span className="mini">Beneficiaries</span>
            </div>
            <p className="stat-value">{data.approved}</p>
            <p className="stat-label">Farmers with approved applications</p>
          </div>

          <div className="card stat">
            <div className="card-title">
              <h3>Disbursed</h3>
              <span className="mini">Funds released</span>
            </div>
            <p className="stat-value">{data.disbursed}</p>
            <p className="stat-label">Total fully processed payments</p>
          </div>

          {/* Quick Actions / Suggestions */}
          <div className="card span-8">
            <div className="card-title">
              <h3>Quick Actions</h3>
              <span className="mini">Management tools</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)" }}>
              <li>
                <Link to="/subsidies" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                  Review Applications
                </Link>
                : Check pending requests from farmers.
              </li>
              <li>
                <Link to="/crops" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                  Monitor Crop Listings
                </Link>
                : Oversee market activity and pricing.
              </li>
              <li>
                <Link to="/courses" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                  Educational Content
                </Link>
                : Manage courses for farmers.
              </li>
            </ul>
          </div>

          <div className="card span-4">
            <div className="card-title">
              <h3>System Status</h3>
              <span className="mini">Health</span>
            </div>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              All systems operational.
              <br />
              Viewing as Government Official.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default GovDashboard;
