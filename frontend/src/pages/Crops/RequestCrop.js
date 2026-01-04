// src/pages/Crops/RequestCrop.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const RequestCrop = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    cropName: "",
    variety: "",
    location: "",
    pricePerUnit: "",
    quantityAvailable: "",
    unit: "kg",
    description: "",
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.cropName.trim()) return setErr("Crop name is required");
    if (!form.pricePerUnit || Number(form.pricePerUnit) <= 0) return setErr("Valid price is required");
    if (!form.quantityAvailable || Number(form.quantityAvailable) <= 0) return setErr("Valid quantity is required");
    if (!form.location.trim()) return setErr("Location is required");

    try {
      setErr(""); 
      setOk(""); 
      setLoading(true);

      const fd = new FormData();
      
      // Add form data
      fd.append("cropName", form.cropName.trim());
      fd.append("variety", form.variety.trim());
      fd.append("location", form.location.trim());
      fd.append("pricePerUnit", form.pricePerUnit);
      fd.append("quantityAvailable", form.quantityAvailable);
      fd.append("unit", form.unit);
      fd.append("description", form.description.trim());
      
      if (image) fd.append("image", image);

      const res = await api.post("/crops/request", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOk(res.data.message || "Crop request submitted successfully!");
      
      // Clear form
      setForm({
        cropName: "",
        variety: "",
        location: "",
        pricePerUnit: "",
        quantityAvailable: "",
        unit: "kg",
        description: "",
      });
      setImage(null);
      setImagePreview(null);

      setTimeout(() => {
        navigate("/notifications");
      }, 2000);
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.message || "Failed to submit crop request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="hero">
        <h1 className="h1">Request New Crop</h1>
        <p className="subhead">Submit your crop details for admin approval</p>
      </div>

      <div className="card">
        {err && <div className="error">{err}</div>}
        {ok && <div className="success">{ok}</div>}

        <form onSubmit={submit} className="form" style={{ display: "grid", gap: 16 }}>
          <div>
            <label className="mini">Crop Name *</label>
            <input 
              className="input" 
              value={form.cropName} 
              onChange={(e) => onChange("cropName", e.target.value)} 
              required 
              placeholder="e.g., Rice, Wheat, Potato, Tomato"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="mini">Variety *</label>
              <input 
                className="input" 
                value={form.variety} 
                onChange={(e) => onChange("variety", e.target.value)}
                placeholder="e.g., BRRI Dhan-28, Hybrid, Local"
                required
              />
            </div>

            <div>
              <label className="mini">Location *</label>
              <input 
                className="input" 
                value={form.location} 
                onChange={(e) => onChange("location", e.target.value)}
                placeholder="e.g., Bogura, Rajshahi, Dinajpur"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label className="mini">Price per unit (৳) *</label>
              <input 
                className="input" 
                type="number" 
                min="1" 
                step="0.01"
                value={form.pricePerUnit} 
                onChange={(e) => onChange("pricePerUnit", e.target.value)} 
                required 
                placeholder="e.g., 58"
              />
            </div>

            <div>
              <label className="mini">Quantity *</label>
              <input 
                className="input" 
                type="number" 
                min="1" 
                value={form.quantityAvailable} 
                onChange={(e) => onChange("quantityAvailable", e.target.value)} 
                required 
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="mini">Unit</label>
              <select 
                className="input" 
                value={form.unit} 
                onChange={(e) => onChange("unit", e.target.value)}
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="pcs">pcs</option>
                <option value="sack">sack</option>
                <option value="bag">bag</option>
                <option value="maund">maund</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mini">Description *</label>
            <textarea
              className="input"
              rows={4}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Describe your crop quality, harvesting time, storage conditions, etc."
              required
            />
            <p className="mini" style={{ color: "var(--muted)", marginTop: 4 }}>
              Detailed descriptions help buyers make informed decisions
            </p>
          </div>

          <div>
            <label className="mini">Crop Image *</label>
            <input 
              className="input" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              required
            />
            
            {imagePreview && (
              <div style={{ marginTop: 12 }}>
                <p className="mini" style={{ marginBottom: 8 }}>Image Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Crop preview" 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    objectFit: "cover", 
                    borderRadius: 8,
                    border: "1px solid var(--border)"
                  }}
                />
              </div>
            )}
            
            <p className="mini" style={{ color: "var(--muted)", marginTop: 6 }}>
              Upload a clear photo of your crop. JPG/PNG/WebP, max 5MB.
            </p>
          </div>

          <div style={{ 
            padding: 16, 
            background: "#f0f9ff", 
            borderRadius: 8, 
            border: "1px solid #bae6fd",
            marginTop: 10
          }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#0369a1" }}>
              📋 What happens next?
            </h4>
            <ol style={{ margin: 0, paddingLeft: 20, color: "#0c4a6e" }}>
              <li>Your request will be sent to all admins with all details</li>
              <li>Admins will review your crop information</li>
              <li>You'll receive a notification when approved/rejected</li>
              <li>If approved, your crop will appear in the marketplace</li>
              <li>If rejected, you'll get feedback for improvement</li>
            </ol>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Submitting Request..." : "Submit Crop Request"}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => navigate("/crops")}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCrop;