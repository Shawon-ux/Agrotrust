// src/pages/Complaints/ComplaintForm.js
import React, { useState } from "react";
import api from "../../api";

const ComplaintForm = () => {
  const [againstUser, setAgainstUser] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post("/complaints", {
        againstUser: againstUser || null,
        complaintType,
        description,
      });
      setMessage("Complaint submitted successfully.");
      setAgainstUser("");
      setComplaintType("");
      setDescription("");
    } catch (e) {
      console.error(e);
      setMessage("Failed to submit complaint.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submit Complaint</h2>
      <form onSubmit={submitComplaint}>
        <div>
          <label>Against User (optional user ID)</label><br />
          <input
            value={againstUser}
            onChange={(e) => setAgainstUser(e.target.value)}
          />
        </div>
        <div>
          <label>Complaint Type</label><br />
          <input
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Submit
        </button>
      </form>
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default ComplaintForm;
