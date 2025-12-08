// frontend/src/pages/Education/AddCoursePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; 
import { useAuth } from "../../context/AuthContext";

const AddCoursePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "General",
    difficulty: "Beginner",
    published: false,
    // Note: The instructor field is set automatically by the backend using req.user.id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // We submit the data to the NEW backend endpoint: POST /api/courses
      await api.post("/courses", formData);

      setSuccess("Course created successfully!");
      setLoading(false);
      
      // Navigate back to the main education list after a short delay
      setTimeout(() => navigate("/education"), 1500);

    } catch (e) {
      console.error(e.response?.data || e.message);
      setError(e.response?.data?.message || "Failed to create course.");
      setLoading(false);
    }
  };

  // Authorization check (same logic as EducationList)
  const authorizedToManage = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
  if (!user || !authorizedToManage.includes(user.role)) {
    return <div className="container error">You are not authorized to add courses.</div>;
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
        <h2>Create New Course</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input" />

          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required className="input" rows={4} />

          <label>Category:</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} className="input" />

          <label>Price (BDT):</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className="input" />
          
          <label>Difficulty:</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="input">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} />
            Publish Immediately
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </button>
          
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/education")}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCoursePage;
