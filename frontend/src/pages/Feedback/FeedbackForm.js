// src/pages/Feedback/FeedbackForm.js
import React, { useState } from "react";
import api from "../../api";

const FeedbackForm = () => {
  const [orderId, setOrderId] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post("/feedback", {
        orderId,
        farmerId,
        ratingValue,
        comment,
      });
      setMessage("Feedback submitted.");
      setOrderId("");
      setFarmerId("");
      setRatingValue(5);
      setComment("");
    } catch (e) {
      console.error(e);
      setMessage("Failed to submit feedback.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Feedback & Rating</h2>
      <form onSubmit={submitFeedback}>
        <div>
          <label>Order ID</label><br />
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Farmer ID</label><br />
          <input
            value={farmerId}
            onChange={(e) => setFarmerId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Rating (1–5)</label><br />
          <input
            type="number"
            min="1"
            max="5"
            value={ratingValue}
            onChange={(e) => setRatingValue(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Comment</label><br />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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

export default FeedbackForm;
