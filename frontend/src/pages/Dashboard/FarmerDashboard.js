// src/pages/Dashboard/FarmerDashboard.js
import React, { useEffect, useState } from "react";
import api from "../../api";

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

  if (err) return <div>{err}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Farmer Dashboard</h2>
      <p>Crops: {data.cropCount}</p>
      <p>Orders: {data.ordersCount}</p>
      <p>Subsidies: {data.subsidyCount}</p>
    </div>
  );
};

export default FarmerDashboard;
