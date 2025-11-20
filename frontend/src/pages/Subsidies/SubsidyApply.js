// src/pages/Subsidies/SubsidyApply.js
import React, { useState } from "react";
import api from "../../api";

const SubsidyApply = () => {
  const [programName, setProgramName] = useState("");
  const [message, setMessage] = useState("");

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post("/subsidies/apply", { programName });
      setMessage("Subsidy application submitted successfully.");
      setProgramName("");
    } catch (e) {
      console.error(e);
      setMessage("Failed to submit subsidy application.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Apply for Subsidy</h2>
      <form onSubmit={handleApply}>
        <div>
          <label>Program Name</label><br />
          <input
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Apply
        </button>
      </form>
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default SubsidyApply;
