// src/pages/Crops/CropList.js
import React, { useEffect, useState } from "react";
import api from "../../api";

const CropList = () => {
  const [crops, setCrops] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await api.get("/crops");
        setCrops(res.data);
      } catch (e) {
        console.error(e);
        setErr("Failed to load crops");
      }
    };
    fetchCrops();
  }, []);

  if (err) return <div>{err}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Crops</h2>
      {crops.length === 0 ? (
        <p>No crops found.</p>
      ) : (
        <ul>
          {crops.map((c) => (
            <li key={c._id}>
              {c.cropName} – {c.quantityAvailable} units @ {c.pricePerUnit}  
              {c.farmer && <> (Farmer: {c.farmer.name})</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CropList;
