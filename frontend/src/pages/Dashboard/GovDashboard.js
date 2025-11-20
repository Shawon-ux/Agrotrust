// src/pages/Dashboard/GovDashboard.js
import React, { useEffect, useState } from "react";
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

  if (err) return <div>{err}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Government Dashboard</h2>
      <p>Total Subsidies: {data.totalSubsidies}</p>
      <p>Approved: {data.approved}</p>
      <p>Disbursed: {data.disbursed}</p>
    </div>
  );
};

export default GovDashboard;
